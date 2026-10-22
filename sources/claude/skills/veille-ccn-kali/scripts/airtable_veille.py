"""
airtable_veille.py - Pousse la veille KALI brute dans Airtable.

Composant GENERIQUE et REUTILISABLE : prend la sortie de watcher_kali.py
(la liste des conventions collectives modifiees chez DILA) et ecrit chaque
modification dans une table Airtable. Aucune logique metier specifique a une
application (pas de sections, pas de LLM, pas de PR) : juste la veille brute.

N'importe quelle application peut ensuite LIRE cette table pour savoir quelle
CCN a change, quand, et si la convention est etendue ou non.

ATTENTION METIER - ETENDU vs NON ETENDU :
  Le champ "est_etendu" est ecrit tel quel, JAMAIS utilise pour filtrer.
  VIGUEUR_ETEN     = applicable a TOUTES les entreprises du champ (erga omnes).
  VIGUEUR_NON_ETEN = applicable uniquement aux adherents des orga signataires.
  Chaque application decide elle-meme quoi faire de cette distinction.

Entree  : kali_delta_*.json (produit par watcher_kali.py). Par defaut le plus
          recent du dossier courant ; sinon --input <path>.
Sortie  : 1 record Airtable par CCN modifiee, en UPSERT sur un id deterministe
          (re-detecter le meme avenant ne cree pas de doublon).

Config par variables d'environnement (ou fichier .env a cote du script) :
  AIRTABLE_PAT       (obligatoire) Personal Access Token Airtable.
  AIRTABLE_BASE_ID   (obligatoire) ex. appXXXXXXXXXXXXXX
  AIRTABLE_TABLE     (defaut: veille_ccn) nom OU id de la table cible.

Filtre optionnel : --idcc-file liste.json  (tableau JSON d'IDCC a conserver,
  ex. ["16","1486","2420"]. Si absent : TOUTES les CCN modifiees sont poussees.)

La table Airtable cible doit avoir ces colonnes (l'upsert se fait par NOM de
champ + typecast, donc pas besoin de connaitre les field IDs) :
  id_event                (Single line text)  <- cle d'upsert, garder ce nom
  idcc                    (Single line text)
  titre                   (Single line text)
  etat                    (Single line text)
  est_etendu              (Checkbox)
  a_articles_non_etendus  (Checkbox)
  date_detection          (Date, inclure l'heure)
  date_publi_kali         (Single line text)
  nature                  (Single line text)
  titres_textes           (Long text)
  source_archive          (Single line text)
  nb_fichiers_kali        (Number, entier)

Usage :
  python airtable_veille.py
  python airtable_veille.py --input kali_delta_20260516-101200.json
  python airtable_veille.py --idcc-file mes_idcc.json
  python airtable_veille.py --dry-run
"""

import argparse
import glob
import hashlib
import json
import os
import sys
import time
import urllib.request
import urllib.error
from datetime import datetime, timezone

# Cle d'upsert : ce nom de colonne doit exister tel quel dans la table Airtable.
UPSERT_FIELD = "id_event"


def load_env(env_path):
    """Charge un .env minimaliste (KEY=VALUE par ligne)."""
    env = {}
    if os.path.exists(env_path):
        with open(env_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    k, v = line.split("=", 1)
                    env[k.strip()] = v.strip().strip('"').strip("'")
    return env


def latest(pattern, here):
    files = sorted(glob.glob(os.path.join(here, pattern)))
    return files[-1] if files else None


def load_json(path):
    if not path or not os.path.exists(path):
        return None
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def normalize_idcc(idcc):
    """'0016' -> '16', '16' -> '16'."""
    return (idcc or "").strip().lstrip("0") or "0"


def airtable_request(method, url, pat, body=None):
    data = json.dumps(body).encode("utf-8") if body is not None else None
    req = urllib.request.Request(
        url, data=data, method=method,
        headers={"Authorization": f"Bearer {pat}", "Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        raise RuntimeError(f"HTTP {e.code} : {e.read().decode('utf-8', 'replace')[:400]}")


def deterministic_event_id(idcc, kalicont_id, archive):
    """ID stable : meme CCN re-detectee dans la meme archive -> meme record."""
    raw = f"{idcc}|{kalicont_id or ''}|{archive or ''}"
    return "veille_" + hashlib.sha256(raw.encode("utf-8")).hexdigest()[:20]


def build_records(delta, idcc_filter):
    """Transforme les modifications du kali_delta en records Airtable."""
    now = datetime.now(timezone.utc).isoformat()
    records = []
    for m in delta.get("modifications", []):
        idcc = normalize_idcc(m.get("idcc", ""))
        if not idcc or idcc == "0":
            continue
        if idcc_filter is not None and idcc not in idcc_filter:
            continue
        kalicont = m.get("kalicont_id", "")
        archive = m.get("source_archive", "")
        titres = m.get("titres_textes") or []
        fields = {
            UPSERT_FIELD: deterministic_event_id(idcc, kalicont, archive),
            "idcc": idcc,
            "titre": (m.get("titre") or "")[:250],
            "etat": m.get("etat", ""),
            "est_etendu": bool(m.get("est_etendu")),
            "a_articles_non_etendus": bool(m.get("a_articles_non_etendus")),
            "date_detection": now,
            "date_publi_kali": m.get("date_publi", ""),
            "nature": m.get("nature", ""),
            "titres_textes": "\n".join(titres)[:90000],
            "source_archive": archive,
            "nb_fichiers_kali": len(m.get("files", [])),
        }
        records.append({"fields": fields})
    return records


def upsert_records(records, pat, base_id, table):
    """Upsert par batch de 10, merge sur le champ id_event."""
    if not records:
        print("Aucune modification a pousser.")
        return 0
    url = f"https://api.airtable.com/v0/{base_id}/{table}"
    pushed = 0
    for i in range(0, len(records), 10):
        chunk = records[i : i + 10]
        body = {
            "performUpsert": {"fieldsToMergeOn": [UPSERT_FIELD]},
            "records": chunk,
            "typecast": True,
        }
        resp = airtable_request("PATCH", url, pat, body)
        pushed += len(resp.get("records", []))
        print(f"  batch {i // 10 + 1} : {len(chunk)} pousses (total {pushed})")
        time.sleep(0.25)
    return pushed


def main():
    here = os.path.dirname(os.path.abspath(__file__))
    parser = argparse.ArgumentParser(description="Push veille KALI -> Airtable")
    parser.add_argument("--input", help="kali_delta_*.json. Defaut : le plus recent.")
    parser.add_argument("--idcc-file", help="JSON : tableau d'IDCC a conserver (filtre).")
    parser.add_argument("--dry-run", action="store_true", help="Aucune ecriture Airtable.")
    args = parser.parse_args()

    env = load_env(os.path.join(here, ".env"))
    pat = env.get("AIRTABLE_PAT") or os.environ.get("AIRTABLE_PAT")
    base_id = env.get("AIRTABLE_BASE_ID") or os.environ.get("AIRTABLE_BASE_ID")
    table = (env.get("AIRTABLE_TABLE") or os.environ.get("AIRTABLE_TABLE")
             or "veille_ccn")

    if not args.dry_run and (not pat or not base_id):
        print("ERREUR : AIRTABLE_PAT et AIRTABLE_BASE_ID sont obligatoires.")
        print("Definis-les dans .env ou en variables d'environnement.")
        print("(ou lance avec --dry-run pour tester sans ecrire)")
        sys.exit(2)

    delta_path = args.input or latest("kali_delta_*.json", here)
    if not delta_path or not os.path.exists(delta_path):
        print("ERREUR : aucun kali_delta_*.json. Lance watcher_kali.py d'abord.")
        sys.exit(1)
    delta = load_json(delta_path)

    idcc_filter = None
    if args.idcc_file:
        raw = load_json(args.idcc_file)
        if not isinstance(raw, list):
            print(f"ERREUR : {args.idcc_file} doit contenir un tableau JSON d'IDCC.")
            sys.exit(1)
        idcc_filter = {normalize_idcc(str(x)) for x in raw}
        print(f"Filtre IDCC : {len(idcc_filter)} conventions suivies")

    print(f"=== Push veille KALI -> Airtable ===")
    print(f"Input  : {os.path.basename(delta_path)}")
    print(f"Base   : {base_id}  Table : {table}")

    records = build_records(delta, idcc_filter)
    print(f"Modifications a pousser : {len(records)}")

    if args.dry_run:
        print("\n[DRY-RUN] Apercu des 10 premieres :")
        for r in records[:10]:
            f = r["fields"]
            tag = "ETENDU" if f["est_etendu"] else "non etendu"
            print(f"  IDCC {f['idcc']:>6} | {tag:<10} | {f['titre'][:55]}")
        print(f"\n[DRY-RUN] {len(records)} records, aucune ecriture Airtable.")
        return

    pushed = upsert_records(records, pat, base_id, table)
    print(f"\nVeille poussee : {pushed} modifications")
    print(f"Base Airtable  : https://airtable.com/{base_id}")


if __name__ == "__main__":
    main()
