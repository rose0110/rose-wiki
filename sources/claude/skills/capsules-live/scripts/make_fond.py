# -*- coding: utf-8 -*-
"""Fond + badge d'une capsule, pilotes par preset JSON.

Usage :
  python make_fond.py --preset presets/rose.json --titre "Mon titre" --out fond_x.png
Options :
  --format carre|vertical   (defaut carre ; vertical = experimental, verifier une frame)
  --badge-out badge.png     (genere aussi le badge nominatif ; a faire 1 fois par preset)
  --cta1 "Texte gauche"     (bandeau CTA en bas ; --pill et --cta2 pour les autres textes)
"""
import argparse
import os
import sys

from PIL import Image, ImageDraw, ImageFont

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import hex_rgb, layout, load_preset

FONTS = r"C:\Windows\Fonts"


def font(name, size):
    return ImageFont.truetype(os.path.join(FONTS, name), size)


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--preset", required=True)
    p.add_argument("--titre", required=True)
    p.add_argument("--out", required=True)
    p.add_argument("--format", default="carre", choices=["carre", "vertical"])
    p.add_argument("--badge-out", default=None)
    p.add_argument("--cta1", default=None)
    p.add_argument("--pill", default="GRATUIT")
    p.add_argument("--cta2", default="Lien en commentaire")
    a = p.parse_args()

    pr = load_preset(a.preset)
    C = {k: hex_rgb(v) if isinstance(v, str) and v.startswith("#") else v
         for k, v in pr["couleurs"].items()}
    L = layout(a.format, pr)
    W, H = L["W"], L["H"]

    bg = Image.new("RGB", (W, H), C["fond_haut"])
    d = ImageDraw.Draw(bg)
    fac = pr["couleurs"].get("degrade_facteur", 1.0)
    for y in range(H):
        t = y / H * fac
        d.line([(0, y), (W, y)], fill=tuple(
            int(C["fond_haut"][i] + (C["fond_bas"][i] - C["fond_haut"][i]) * t)
            for i in range(3)))

    MX = 60

    def put(y, text, f, fill, align):
        bb = d.textbbox((0, 0), text, font=f)
        x = MX if align == "left" else (W - (bb[2] - bb[0])) / 2 - bb[0]
        d.text((x, y), text, font=f, fill=fill)
        return d.textbbox((x, y), text, font=f)

    kk = pr["kicker"]
    put(26 if a.format == "carre" else 60, kk["texte"],
        font(kk["police"], kk["taille"]), C["accent"], kk["align"])

    tt = pr["titre"]
    size = tt["taille_max"]
    while size > tt["taille_min"]:
        f_t = font(tt["police"], size)
        bb = d.textbbox((0, 0), a.titre, font=f_t)
        if bb[2] - bb[0] <= 960:
            break
        size -= 2
    ty = (66 + (tt["taille_max"] - size) // 2) if a.format == "carre" else 108
    tb = put(ty, a.titre, f_t, C["texte_titre"], tt["align"])
    if tt.get("souligne"):
        d.rectangle([tb[0], tb[3] + 10, tb[0] + 110, tb[3] + 15], fill=C["accent"])

    ep = pr["cadre"]["epaisseur"]
    d.rectangle([L["VX"] - ep, L["VY"] - ep, L["VX"] + L["VW"] + ep, L["VY"] + L["VH"] + ep],
                outline=C["accent"], width=ep)

    if a.cta1:
        BY = H - 96
        d.rectangle([0, BY, W, H], fill=C["accent"])
        f_cta, f_pill = font("segoeuib.ttf", 36), font("segoeuib.ttf", 26)
        bb1 = d.textbbox((0, 0), a.cta1, font=f_cta)
        bb2 = d.textbbox((0, 0), a.cta2, font=f_cta)
        bbp = d.textbbox((0, 0), a.pill, font=f_pill)
        pill_w, pill_h, gap = bbp[2] - bbp[0] + 44, 46, 28
        total = (bb1[2] - bb1[0]) + gap + pill_w + gap + (bb2[2] - bb2[0])
        x, cy = (W - total) / 2, BY + 48
        d.text((x - bb1[0], cy - (bb1[3] - bb1[1]) / 2 - bb1[1]), a.cta1, font=f_cta, fill=C["fond_haut"])
        x += (bb1[2] - bb1[0]) + gap
        d.rounded_rectangle([x, cy - pill_h / 2, x + pill_w, cy + pill_h / 2],
                            radius=pill_h / 2, fill=C["fond_haut"])
        d.text((x + 22 - bbp[0], cy - (bbp[3] - bbp[1]) / 2 - bbp[1]), a.pill,
               font=f_pill, fill=C["texte_titre"])
        x += pill_w + gap
        d.text((x - bb2[0], cy - (bb2[3] - bb2[1]) / 2 - bb2[1]), a.cta2, font=f_cta, fill=C["fond_haut"])

    bg.save(a.out)
    print("ok", a.out, "taille titre", size)

    if a.badge_out:
        b = pr["badge"]
        f_n = font(b["police"], b["taille"])
        tmp = ImageDraw.Draw(Image.new("RGB", (10, 10)))
        bb = tmp.textbbox((0, 0), b["texte"], font=f_n)
        bw, bh = bb[2] - bb[0] + 48, 54
        badge = Image.new("RGBA", (bw, bh), (0, 0, 0, 0))
        db = ImageDraw.Draw(badge)
        db.rounded_rectangle([0, 0, bw - 1, bh - 1], radius=bh / 2, fill=C["accent"] + (255,))
        db.text((24 - bb[0], (bh - (bb[3] - bb[1])) / 2 - bb[1]), b["texte"],
                font=f_n, fill=hex_rgb(b["texte_couleur"]))
        badge.save(a.badge_out)
        print("ok", a.badge_out, bw, bh)


if __name__ == "__main__":
    main()
