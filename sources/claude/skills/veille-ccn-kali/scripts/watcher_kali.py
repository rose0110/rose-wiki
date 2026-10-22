"""
Watcher KALI - telecharge les deltas quotidiens KALI depuis data.gouv.fr (DILA)
et extrait la liste des CCN (IDCC) touchees.

Source : https://echanges.dila.gouv.fr/OPENDATA/KALI/
Format des archives : KALI_YYYYMMDD-HHMMSS.tar.gz
Publication : quasi-quotidienne, generalement vers 21h-22h UTC.

ATTENTION METIER - ETENDU vs NON ETENDU :
  Chaque convention/avenant KALI porte un champ <ETAT> dont les principales valeurs sont :
    - VIGUEUR_ETEN     : ETENDU par arrete ministeriel -> applicable a TOUTES les
                         entreprises du champ d'application (employeurs adherents ET non
                         adherents). C'est l'erga omnes.
    - VIGUEUR_NON_ETEN : NON etendu -> applicable uniquement aux entreprises adherentes
                         d'une organisation patronale signataire.
    - ABROGE / MODIFIE : statuts annexes
  Le watcher capture ces etats :
    - "etat"            = etat de la CONVENTION mere (KALICONT)
    - "etats_articles"  = etats de chaque article modifie (peuvent differer du conteneur)
    - "est_etendu"      = bool derive (True si convention etendue)
    - "a_articles_non_etendus" = bool, signale si un avenant non-etendu vit a cote
  Ces flags sont passes aux phases suivantes pour AFFICHAGE et CONTEXTE, jamais pour
  filtrer (un avenant non etendu peut etre tres pertinent pour les utilisateurs
  OPENPAYE adherents). La distinction doit etre rendue VISIBLE dans la PR finale.

Usage :
    python watcher_kali.py                      # delta des dernieres 24h
    python watcher_kali.py --since 2026-05-10   # depuis une date precise
    python watcher_kali.py --since 2026-05-10 --dry-run   # sans telechargement

Sortie : kali_delta_YYYYMMDD-HHMMSS.json
Format :
    {
      "run_started": ISO,
      "archives_processed": [
        {"name": "KALI_...tar.gz", "size": N, "url": ...}
      ],
      "modifications": [
        {
          "idcc": "0016",
          "kali_id": "KALICONT...",
          "titre": "...",
          "date_modif": "YYYY-MM-DD",
          "source_archive": "KALI_...tar.gz",
          "files": ["TEXT_KALI/.../..."]
        }
      ],
      "stats": {
        "archives_total": N,
        "articles_total": N,
        "idcc_modifies_uniques": N
      }
    }

Le watcher ne touche PAS Airtable. C'est le Gate IDCC (phase 3) qui consomme ce JSON
et filtre selon les CCN presentes dans la base.
"""

import argparse
import io
import json
import os
import re
import sys
import tarfile
import urllib.request
import urllib.error
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta, timezone
from pathlib import Path

KALI_BASE_URL = "https://echanges.dila.gouv.fr/OPENDATA/KALI/"
ARCHIVE_RE = re.compile(r"KALI_(\d{8})-(\d{6})\.tar\.gz")
USER_AGENT = "ccn-openpaye-watcher/1.0 (+contact rose.songue@gmail.com)"


def http_get(url: str, timeout: int = 60) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return resp.read()


def list_kali_archives() -> list[dict]:
    """Liste les archives KALI publiees sur le repertoire ouvert DILA."""
    html = http_get(KALI_BASE_URL).decode("utf-8", errors="replace")
    archives = []
    seen = set()
    for m in re.finditer(
        r'href="(KALI_\d{8}-\d{6}\.tar\.gz)"[^<]*</a>\s*([\d-]+\s+[\d:]+)?\s*([\d.]+[KMG]?)?',
        html,
    ):
        name = m.group(1)
        if name in seen:
            continue
        seen.add(name)
        date_match = ARCHIVE_RE.match(name)
        if not date_match:
            continue
        ymd, hms = date_match.group(1), date_match.group(2)
        dt = datetime.strptime(f"{ymd}{hms}", "%Y%m%d%H%M%S").replace(tzinfo=timezone.utc)
        archives.append({
            "name": name,
            "url": KALI_BASE_URL + name,
            "datetime": dt,
        })
    archives.sort(key=lambda a: a["datetime"])
    return archives


def parse_kali_xml(xml_bytes: bytes, filename: str) -> dict | None:
    """Extrait IDCC + titre depuis un fichier KALICONT ou KALIARTI.

    KALICONT_XXXXXX.xml : conteneur de convention. IDCC dans META_CONTENEUR/NUM.
    KALIARTI_XXXXXX.xml : article individuel. IDCC dans CONTEXTE/CONTENEUR/@num.
    KALITEXT_XXXXXX.xml : texte/version. Pas d'IDCC direct, on l'ignore (les KALICONT
        et KALIARTI de la meme archive couvrent deja les conventions touchees).
    """
    fname = filename.split("/")[-1]
    if not (fname.startswith("KALICONT") or fname.startswith("KALIARTI")):
        return None
    try:
        root = ET.fromstring(xml_bytes)
    except ET.ParseError:
        return None

    info: dict = {}
    if fname.startswith("KALICONT"):
        num = root.find("./META/META_SPEC/META_CONTENEUR/NUM")
        if num is None or not num.text or not num.text.strip():
            return None
        info["idcc"] = num.text.strip()
        info["kind"] = "CONT"
        titre = root.find("./META/META_SPEC/META_CONTENEUR/TITRE")
        if titre is not None and titre.text:
            info["titre"] = titre.text.strip()
        etat = root.find("./META/META_SPEC/META_CONTENEUR/ETAT")
        if etat is not None and etat.text:
            info["etat"] = etat.text.strip()
        cid = root.find("./META/META_COMMUN/ID")
        if cid is not None and cid.text:
            info["kalicont_id"] = cid.text.strip()
    else:  # KALIARTI
        conteneur = root.find("./CONTEXTE/CONTENEUR")
        if conteneur is None:
            return None
        idcc = conteneur.get("num")
        if not idcc:
            return None
        info["idcc"] = idcc.strip()
        info["kind"] = "ARTI"
        info["titre"] = (conteneur.get("titre") or "").strip()
        info["kalicont_id"] = conteneur.get("cid", "").strip()
        # IMPORTANT : etat de la CONVENTION mere (etendue ou non).
        # VIGUEUR_ETEN = applicable a TOUTES les entreprises du champ (arrete d'extension).
        # VIGUEUR_NON_ETEN = applicable uniquement aux adherents des orga signataires.
        # Cette distinction est METIER, NE PAS l'utiliser pour filtrer mais pour informer.
        info["etat_conteneur"] = (conteneur.get("etat") or "").strip()
        date_publi = conteneur.get("date_publi", "")
        if date_publi:
            info["date_publi"] = date_publi
        # Etat propre a l'article modifie (peut differer de celui de la convention)
        etat_art = root.find("./META/META_SPEC/META_ARTICLE/ETAT")
        if etat_art is not None and etat_art.text:
            info["etat_article"] = etat_art.text.strip()
        texte = root.find("./CONTEXTE/TEXTE")
        if texte is not None:
            ds = texte.get("date_signature")
            if ds:
                info["date_signature"] = ds
            nature = texte.get("nature")
            if nature:
                info["nature"] = nature
            # Titre du texte/avenant modifie (l'info la plus utile pour classifier)
            titre_txt = texte.find("./TITRE_TXT")
            if titre_txt is not None:
                titre_court = titre_txt.get("c_titre_court", "").strip()
                titre_full = (titre_txt.text or "").strip()
                info["titre_texte"] = titre_court or titre_full
    # Filtre defensif : on rejette les IDCC manifestement aberrants
    # (les vrais IDCC sont des entiers >= 1, generalement <= ~10000)
    try:
        n = int(info["idcc"])
        if n < 1 or n > 99999:
            return None
    except (ValueError, KeyError):
        return None
    return info


def process_archive(archive_url: str, archive_name: str) -> tuple[list[dict], int]:
    """Telecharge et parse une archive KALI. Retourne (modifs, articles_total)."""
    raw = http_get(archive_url, timeout=180)
    modifs_by_idcc: dict[str, dict] = {}
    articles_total = 0

    with tarfile.open(fileobj=io.BytesIO(raw), mode="r:gz") as tar:
        for member in tar:
            if not member.isfile() or not member.name.endswith(".xml"):
                continue
            fname = member.name.split("/")[-1]
            if not (fname.startswith("KALICONT") or fname.startswith("KALIARTI")):
                continue
            articles_total += 1
            f = tar.extractfile(member)
            if f is None:
                continue
            data = f.read()
            info = parse_kali_xml(data, member.name)
            if not info:
                continue
            idcc = info["idcc"]
            if idcc not in modifs_by_idcc:
                modifs_by_idcc[idcc] = {
                    "idcc": idcc,
                    "titre": info.get("titre", ""),
                    "etat": info.get("etat", ""),  # etat du KALICONT (convention entiere)
                    "kalicont_id": info.get("kalicont_id", ""),
                    "source_archive": archive_name,
                    "files": [],
                    "kinds": set(),
                    "titres_textes": set(),
                    "etats_articles": set(),  # etats des articles modifies (peuvent differer)
                }
            entry = modifs_by_idcc[idcc]
            entry["files"].append(member.name)
            entry["kinds"].add(info["kind"])
            if info.get("titre") and not entry["titre"]:
                entry["titre"] = info["titre"]
            # etat KALICONT prioritaire ; sinon prendre celui du conteneur depuis un ARTI
            if info.get("etat") and not entry["etat"]:
                entry["etat"] = info["etat"]
            elif info.get("etat_conteneur") and not entry["etat"]:
                entry["etat"] = info["etat_conteneur"]
            if info.get("kalicont_id") and not entry["kalicont_id"]:
                entry["kalicont_id"] = info["kalicont_id"]
            if info.get("titre_texte"):
                entry["titres_textes"].add(info["titre_texte"])
            if info.get("etat_article"):
                entry["etats_articles"].add(info["etat_article"])
            for k in ("date_publi", "date_signature", "nature"):
                if info.get(k) and not entry.get(k):
                    entry[k] = info[k]
    # serialise sets -> sorted list + flag derive d'extension
    for e in modifs_by_idcc.values():
        e["kinds"] = sorted(e["kinds"])
        e["titres_textes"] = sorted(e["titres_textes"])
        e["etats_articles"] = sorted(e["etats_articles"])
        # Flag derive : convention etendue ou non ?
        etat_cnt = e.get("etat", "")
        e["est_etendu"] = etat_cnt.startswith("VIGUEUR_ETEN")
        # Si au moins un article modifie n'est PAS etendu, on le signale aussi
        non_etendus = [s for s in e["etats_articles"] if s and not s.startswith("VIGUEUR_ETEN")]
        e["a_articles_non_etendus"] = bool(non_etendus)
    return list(modifs_by_idcc.values()), articles_total


def main():
    parser = argparse.ArgumentParser(description="Watcher KALI (DILA)")
    parser.add_argument("--since", help="Date min ISO (YYYY-MM-DD). Defaut : hier 00:00 UTC.")
    parser.add_argument("--until", help="Date max ISO (YYYY-MM-DD) exclusive. Defaut : maintenant.")
    parser.add_argument("--max-archives", type=int, default=10,
                        help="Nombre max d'archives a traiter (securite). Defaut : 10.")
    parser.add_argument("--dry-run", action="store_true",
                        help="Liste les archives sans les telecharger.")
    parser.add_argument("--output-dir", default=os.path.dirname(__file__) or ".",
                        help="Dossier de sortie pour le JSON.")
    args = parser.parse_args()

    if args.since:
        try:
            since_dt = datetime.fromisoformat(args.since).replace(tzinfo=timezone.utc)
        except ValueError:
            print(f"ERREUR : --since doit etre au format YYYY-MM-DD (recu : {args.since})")
            sys.exit(1)
    else:
        since_dt = (datetime.now(timezone.utc) - timedelta(days=1)).replace(
            hour=0, minute=0, second=0, microsecond=0
        )

    until_dt = None
    if args.until:
        try:
            until_dt = datetime.fromisoformat(args.until).replace(tzinfo=timezone.utc)
        except ValueError:
            print(f"ERREUR : --until doit etre au format YYYY-MM-DD (recu : {args.until})")
            sys.exit(1)

    print(f"Watcher KALI - lance le {datetime.now(timezone.utc).isoformat()}")
    print(f"Recherche d'archives depuis : {since_dt.isoformat()}")
    print(f"Source : {KALI_BASE_URL}")

    try:
        archives = list_kali_archives()
    except urllib.error.URLError as e:
        print(f"ERREUR reseau : {e}")
        sys.exit(2)
    print(f"Total archives publiees : {len(archives)}")

    todo = [a for a in archives if a["datetime"] >= since_dt
            and (until_dt is None or a["datetime"] < until_dt)]
    if len(todo) > args.max_archives:
        print(f"!! {len(todo)} archives candidates, limitees a {args.max_archives}")
        todo = todo[-args.max_archives:]
    print(f"Archives a traiter : {len(todo)}")
    for a in todo:
        print(f"  - {a['name']}  ({a['datetime'].isoformat()})")

    if args.dry_run:
        print("\nDry-run : pas de telechargement.")
        return

    all_modifs: dict[str, dict] = {}
    archives_meta = []
    articles_total = 0
    for a in todo:
        print(f"\n>>> Traitement {a['name']}...")
        try:
            modifs, n_articles = process_archive(a["url"], a["name"])
            print(f"    {n_articles} XML parses, {len(modifs)} IDCC distincts touches")
            articles_total += n_articles
            archives_meta.append({
                "name": a["name"],
                "url": a["url"],
                "datetime": a["datetime"].isoformat(),
                "idcc_touched": len(modifs),
            })
            for m in modifs:
                key = m["idcc"]
                if key in all_modifs:
                    all_modifs[key]["files"].extend(m["files"])
                    if not all_modifs[key]["titre"]:
                        all_modifs[key]["titre"] = m["titre"]
                else:
                    all_modifs[key] = m
        except Exception as e:
            print(f"    ERREUR : {e}")
            archives_meta.append({
                "name": a["name"],
                "url": a["url"],
                "datetime": a["datetime"].isoformat(),
                "error": str(e),
            })

    out = {
        "run_started": datetime.now(timezone.utc).isoformat(),
        "since": since_dt.isoformat(),
        "archives_processed": archives_meta,
        "modifications": list(all_modifs.values()),
        "stats": {
            "archives_total": len(todo),
            "articles_total": articles_total,
            "idcc_modifies_uniques": len(all_modifs),
        },
    }

    stamp = datetime.now(timezone.utc).strftime("%Y%m%d-%H%M%S")
    out_path = os.path.join(args.output_dir, f"kali_delta_{stamp}.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=2)
    print(f"\n=== Resume ===")
    print(f"Archives traitees    : {len(todo)}")
    print(f"Articles XML parses  : {articles_total}")
    print(f"IDCC modifies uniques: {len(all_modifs)}")
    print(f"Sortie : {out_path}")


if __name__ == "__main__":
    main()
