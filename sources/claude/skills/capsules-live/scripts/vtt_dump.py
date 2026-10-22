# -*- coding: utf-8 -*-
"""Lecture d'un fichier .vtt (Teams, LinkedIn...).

Deux modes :
  python vtt_dump.py live.vtt --minutes > texte_par_minute.txt
      Condense le VTT en blocs d'une minute -> pour LIRE le live en entier et reperer.
  python vtt_dump.py live.vtt --fenetres 250-420 1060-1300 > cues.txt
      Affiche les cues (avec timestamps precis) dans les fenetres demandees
      -> pour poser les bornes de coupe.
"""
import argparse
import re


def parse(path):
    def ts2s(ts):
        p = ts.split(":")
        return int(p[0]) * 3600 + int(p[1]) * 60 + float(p[2])

    cues = []
    with open(path, encoding="utf-8") as f:
        lines = f.read().splitlines()
    i = 0
    while i < len(lines):
        m = re.match(r"(\d+:\d+:\d+\.\d+) --> (\d+:\d+:\d+\.\d+)", lines[i])
        if m:
            start, end = ts2s(m.group(1)), ts2s(m.group(2))
            txt, spk = [], ""
            i += 1
            while i < len(lines) and lines[i].strip():
                sm = re.search(r"<v ([^>]*)>", lines[i])
                if sm:
                    spk = sm.group(1)
                txt.append(re.sub(r"<[^>]+>", "", lines[i]).strip())
                i += 1
            cues.append((start, end, (f"[{spk}] " if spk else "") + " ".join(txt)))
        else:
            i += 1
    return cues


def main():
    p = argparse.ArgumentParser()
    p.add_argument("vtt")
    p.add_argument("--minutes", action="store_true")
    p.add_argument("--fenetres", nargs="*", default=None,
                   help="fenetres en secondes, ex : 250-420 1060-1300")
    a = p.parse_args()
    cues = parse(a.vtt)

    if a.minutes or not a.fenetres:
        blocs = {}
        for s, e, t in cues:
            blocs.setdefault(int(s // 60), []).append(t)
        for m in sorted(blocs):
            print(f"[{m // 60}:{m % 60:02d}] {' '.join(blocs[m])}\n")
    else:
        for win in a.fenetres:
            t1, t2 = (float(x) for x in win.split("-"))
            print(f"\n===== fenetre {win} =====")
            for s, e, t in cues:
                if e >= t1 and s <= t2:
                    print(f"{s:8.2f}-{e:8.2f}  {t}")


if __name__ == "__main__":
    main()
