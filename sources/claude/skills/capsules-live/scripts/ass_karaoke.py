# -*- coding: utf-8 -*-
"""Generateur de sous-titres ASS karaoke, pilote par preset.

A importer depuis un petit script de cues ecrit A LA MAIN (jamais auto) :

    from ass_karaoke import build
    build("presets/rose.json", {
        "ma_capsule": [
            (0.10, 3.20, "Premiere ligne du sous-titre|deuxieme ligne, mot *accentue*."),
        ],
    })  # -> sous_titres_ma_capsule.ass

Syntaxe des cues : (debut_s, fin_s, "texte") — temps RELATIFS au clip final
(apres concat des segments). `|` = saut de ligne (2 lignes max).
`*mot*` ou `*groupe de mots*` = rempli en couleur accent.
Le remplissage karaoke est reparti proportionnellement a la longueur des mots.
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import hex_ass, layout, load_preset

HEADER = """[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: {play_res_y}
WrapStyle: 2
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Sub,{police},{taille},{c_base_full},&H90{c_base},&H00141A1E,&H00000000,-1,0,0,0,100,100,0,0,1,0,2,8,40,40,{margin_v},1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""


def _ts(t):
    h = int(t // 3600)
    m = int(t % 3600 // 60)
    s = t % 60
    return f"{h}:{m:02d}:{s:05.2f}"


def build(preset_path, capsules, fmt="carre", prefix="sous_titres_"):
    pr = load_preset(preset_path)
    L = layout(fmt, pr)
    base = hex_ass(pr["couleurs"]["sub_base"])   # &HBBGGRR&
    accent = hex_ass(pr["couleurs"]["sub_accent"])
    base_hex = base.strip("&H&")
    header = HEADER.format(play_res_y=L["play_res_y"],
                           police=pr["sous_titres"]["police"],
                           taille=pr["sous_titres"]["taille"],
                           c_base_full=f"&H00{base_hex}",
                           c_base=base_hex,
                           margin_v=L["sub_margin_v"])
    for name, cues in capsules.items():
        lines = [header]
        for start, end, text in cues:
            dur_cs = (end - start) * 100
            words = []
            accent_mode = False
            for li, line in enumerate(text.split("|")):
                for w in line.split(" "):
                    starts = w.startswith("*")
                    ends = "*" in w[1:]
                    if starts and ends:
                        words.append((w.replace("*", ""), True, li))
                    elif starts:
                        accent_mode = True
                        words.append((w.replace("*", ""), True, li))
                    elif ends and accent_mode:
                        accent_mode = False
                        words.append((w.replace("*", ""), True, li))
                    else:
                        words.append((w.replace("*", ""), accent_mode, li))
            total = sum(max(len(w), 2) for w, _, _ in words)
            parts, prev_li = [], 0
            for i, (w, acc, li) in enumerate(words):
                k = int(round(dur_cs * max(len(w), 2) / total))
                col = accent if acc else base
                tags = f"{{\\k{k}\\1c{col}\\2c{col}\\2a&H90&\\1a&H00&}}"
                sep = "" if i == 0 else ("\\N" if li != prev_li else " ")
                parts.append(sep + tags + w)
                prev_li = li
            lines.append(f"Dialogue: 0,{_ts(start)},{_ts(end)},Sub,,0,0,0,,{''.join(parts)}\n")
        with open(f"{prefix}{name}.ass", "w", encoding="utf-8-sig") as f:
            f.writelines(lines)
        print(name, len(cues), "cues")
