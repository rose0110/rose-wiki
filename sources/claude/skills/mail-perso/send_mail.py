# -*- coding: utf-8 -*-
"""
Envoi d'un email perso de Rose YEMELI via Resend, avec signature (3 logos embarqués base64).

Exemples
--------
# Relecture sans envoi (génère un aperçu HTML) :
python send_mail.py --to "kamal@x.fr" --subject "Sujet" --body-file corps.html --dry-run

# Envoi réel :
python send_mail.py --to "kamal@x.fr" --cc "collab@x.fr" --subject "Sujet" --body-file corps.html

Notes
-----
- L'expéditeur par défaut est rose.yemeli@yso-conseils.com (RÈGLE N°0), Reply-To identique.
- La clé Resend est choisie automatiquement selon le domaine de l'expéditeur, lue dans resend.txt.
- Resend est derrière Cloudflare : on force un User-Agent navigateur (sinon HTTP 403 / code 1010).
- --body-file = fragment HTML du corps (paragraphes <p>…</p>). La signature est ajoutée automatiquement.
"""
import argparse, base64, json, os, re, sys, urllib.request, urllib.error

HERE = os.path.dirname(os.path.abspath(__file__))
LOGOS = os.path.join(HERE, "logos")
ROSE_BCC = "rose.yemeli@yso-conseils.com"
DEFAULT_KEYS_FILE = os.environ.get("RESEND_KEYS_FILE", r"C:\Users\roses\Downloads\Python\resend.txt")


def load_key(sender, path):
    domain = sender.split("@")[-1].strip().lower()      # ex: yso-conseils.com
    label = domain.split(".")[0]                          # ex: yso-conseils
    if not os.path.exists(path):
        sys.exit(f"[ERREUR] Fichier de clés introuvable : {path}")
    for line in open(path, encoding="utf-8"):
        if "re_" not in line:
            continue
        name, _, rest = line.partition("re_")
        key = "re_" + rest.strip().split()[0]
        norm = name.lower()
        if label in norm or domain in norm:
            return key
    sys.exit(f"[ERREUR] Aucune clé Resend pour le domaine '{domain}' dans {path}")


def b64_logo(name):
    with open(os.path.join(LOGOS, name), "rb") as f:
        return "data:image/png;base64," + base64.b64encode(f.read()).decode()


def signature_html():
    sdp, innov, data = b64_logo("smartdatapay_sig.png"), b64_logo("innovpaie_sig.png"), b64_logo("datapaie_sig.png")
    h = 30
    return f"""<table cellpadding="0" cellspacing="0" border="0" style="font-family:Arial,Helvetica,sans-serif;color:#222222;font-size:13px;line-height:1.5;">
  <tr><td style="padding-bottom:8px;">
    <div style="font-weight:bold;">Rose YEMELI</div>
    <div>Présidente – Experte paie, IA &amp; automatisation</div>
    <div>06 16 82 40 71 · <a href="https://roseyemeli.com" style="color:#1a5fb4;">roseyemeli.com</a></div>
  </td></tr>
  <tr><td>
    <table cellpadding="0" cellspacing="0" border="0"><tr>
      <td style="padding-right:18px;vertical-align:middle;"><img src="{sdp}" height="{h}" alt="Smart Data Pay" style="display:block;"></td>
      <td style="padding-right:18px;vertical-align:middle;"><img src="{innov}" height="{h}" alt="Innov'Paie" style="display:block;"></td>
      <td style="vertical-align:middle;"><img src="{data}" height="{h}" alt="DataPaie" style="display:block;"></td>
    </tr></table>
  </td></tr>
</table>"""


def signature_html_text():
    """Signature sans la rangée de logos (texte seul)."""
    return """<div style="font-family:Arial,Helvetica,sans-serif;color:#222222;font-size:13px;line-height:1.5;">
  <div style="font-weight:bold;">Rose YEMELI</div>
  <div>Présidente – Experte paie, IA &amp; automatisation</div>
  <div>06 16 82 40 71 · <a href="https://roseyemeli.com" style="color:#1a5fb4;">roseyemeli.com</a></div>
</div>"""


def wrap_html(body_html, sig_html):
    # Rendu « mail normal » (décision Rose du 07/10/2026) : pas de fond gris, pas de carte
    # centrée ni de largeur fixe — le texte s'affiche comme un mail écrit à la main.
    return f"""<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"></head>
<body>
<div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#222222;">
{body_html}
<div style="margin-top:20px;">{sig_html}</div>
</div>
</body></html>"""


def html_to_text(body_html):
    t = re.sub(r"(?i)<br\s*/?>", "\n", body_html)
    t = re.sub(r"(?i)</p>", "\n\n", t)
    t = re.sub(r"<[^>]+>", "", t)
    for a, b in [("&nbsp;", " "), ("&amp;", "&"), ("&laquo;", "«"), ("&raquo;", "»"),
                 ("&middot;", "·"), ("&mdash;", "—"), ("&rarr;", "→"), ("&bull;", "•")]:
        t = t.replace(a, b)
    t = re.sub(r"\n{3,}", "\n\n", t).strip()
    sig = ("\n\n--\nRose YEMELI\nPrésidente — Experte paie, IA & automatisation\n"
           "06 16 82 40 71 · https://roseyemeli.com\n"
           "Smart Data Pay · Innov'Paie · DataPaie")
    return t + sig


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--to", required=True, help="destinataires, séparés par des virgules")
    p.add_argument("--cc", default="")
    p.add_argument("--bcc", default="")
    p.add_argument("--subject", required=True)
    p.add_argument("--body", default=None, help="fragment HTML du corps (inline)")
    p.add_argument("--body-file", default=None, help="fichier contenant le fragment HTML du corps")
    p.add_argument("--text", default=None, help="version texte (sinon dérivée du HTML)")
    p.add_argument("--sender", default="rose.yemeli@yso-conseils.com")
    p.add_argument("--from-name", default="Rose YEMELI")
    p.add_argument("--reply-to", default=None)
    p.add_argument("--keys-file", default=DEFAULT_KEYS_FILE)
    p.add_argument("--attach", default="", help="fichiers à joindre, séparés par des virgules")
    p.add_argument("--dry-run", action="store_true", help="compose et écrit un aperçu, n'envoie pas")
    p.add_argument("--no-self-bcc", action="store_true", help="ne pas mettre Rose en copie cachée")
    p.add_argument("--no-logos", action="store_true", help="signature texte, sans la rangée de logos")
    p.add_argument("--scheduled-at", default=None, help="envoi programmé par Resend, ISO 8601 avec fuseau (ex. 2026-09-28T09:00:00+02:00)")
    a = p.parse_args()

    if a.body_file:
        body_html = open(a.body_file, encoding="utf-8").read()
    elif a.body:
        body_html = a.body
    else:
        sys.exit("[ERREUR] Fournir --body ou --body-file")

    sig_html = signature_html_text() if a.no_logos else signature_html()
    full_html = wrap_html(body_html, sig_html)
    text = a.text if a.text is not None else html_to_text(body_html)
    to = [x.strip() for x in a.to.split(",") if x.strip()]
    cc = [x.strip() for x in a.cc.split(",") if x.strip()]
    bcc = [x.strip() for x in a.bcc.split(",") if x.strip()]
    # Copie cachée systématique à Rose (décision du 07/10/2026) : Resend ne garde pas de
    # « Envoyés », la copie lui sert d'archive de ce qui est parti.
    if not a.no_self_bcc and ROSE_BCC.lower() not in [x.lower() for x in to + cc + bcc]:
        bcc.append(ROSE_BCC)

    attach_files = [x.strip() for x in a.attach.split(",") if x.strip()]
    attachments = []
    for fp in attach_files:
        if not os.path.exists(fp):
            sys.exit(f"[ERREUR] Pièce jointe introuvable : {fp}")
        with open(fp, "rb") as fh:
            attachments.append({"filename": os.path.basename(fp),
                                "content": base64.b64encode(fh.read()).decode()})

    if a.dry_run:
        out = os.path.join(HERE, "_last_preview.html")
        with open(out, "w", encoding="utf-8") as f:
            f.write(full_html)
        print("[DRY-RUN] Aperçu écrit ->", out)
        print("  De     :", f"{a.from_name} <{a.sender}>")
        print("  À      :", to, "| Cc:", cc, "| Bcc:", bcc)
        print("  Objet  :", a.subject)
        print("  PJ     :", [x["filename"] for x in attachments] or "(aucune)")
        print("  Envoi  :", a.scheduled_at or "immédiat")
        return

    key = load_key(a.sender, a.keys_file)
    payload = {
        "from": f"{a.from_name} <{a.sender}>",
        "to": to,
        "reply_to": a.reply_to or a.sender,
        "subject": a.subject,
        "html": full_html,
        "text": text,
    }
    if cc:
        payload["cc"] = cc
    if bcc:
        payload["bcc"] = bcc
    if attachments:
        payload["attachments"] = attachments
    if a.scheduled_at:
        payload["scheduled_at"] = a.scheduled_at

    req = urllib.request.Request(
        "https://api.resend.com/emails",
        data=json.dumps(payload).encode("utf-8"),
        headers={"Authorization": "Bearer " + key, "Content-Type": "application/json",
                 "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"},
        method="POST",
    )
    try:
        resp = json.load(urllib.request.urlopen(req, timeout=30))
        if a.scheduled_at:
            print("[OK] Email programmé pour", a.scheduled_at, "- Resend id =", resp.get("id"))
        else:
            print("[OK] Email envoyé. Resend id =", resp.get("id"))
    except urllib.error.HTTPError as e:
        print("[ECHEC] HTTP", e.code, "->", e.read().decode()[:500])
        sys.exit(1)


if __name__ == "__main__":
    main()
