# -*- coding: utf-8 -*-
"""Alignement Whisper mot a mot sur des fenetres de la video source.

  python align_words.py "live.mp4" --fenetres fenetres.json

fenetres.json : {"slug1": [300, 380], "slug2": [1188, 1264], ...}
(prendre ~3 s de marge de chaque cote de la capsule envisagee)

Sortie : words_<slug>.txt — lignes `debut fin mot` en secondes ABSOLUES de la
video source. Relance sans risque : les fichiers deja produits sont sautes.
"""
import argparse
import json
import os
import subprocess
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import find_ffmpeg


def main():
    p = argparse.ArgumentParser()
    p.add_argument("video")
    p.add_argument("--fenetres", required=True)
    p.add_argument("--modele", default="small")
    p.add_argument("--threads", type=int, default=8)
    a = p.parse_args()

    with open(a.fenetres, encoding="utf-8") as f:
        wins = json.load(f)

    # NB : l'import ci-dessous peut prendre 5-15 min de wall-clock sur le PC de
    # Rose (scan antivirus des DLL ctranslate2) — ce n'est PAS un plantage.
    from faster_whisper import WhisperModel
    model = WhisperModel(a.modele, device="cpu", compute_type="int8",
                         cpu_threads=a.threads)
    ff = find_ffmpeg()

    for name, (t1, t2) in wins.items():
        out = f"words_{name}.txt"
        if os.path.exists(out) and os.path.getsize(out) > 100:
            print(f"SKIP {name}", flush=True)
            continue
        wav = f"_align_{name}.wav"
        subprocess.run([ff, "-ss", str(t1), "-to", str(t2), "-i", a.video,
                        "-vn", "-ac", "1", "-ar", "16000", "-y", wav],
                       check=True, capture_output=True)
        segments, _ = model.transcribe(wav, language="fr", word_timestamps=True,
                                       vad_filter=True)
        with open(out, "w", encoding="utf-8") as f:
            for seg in segments:
                for w in seg.words:
                    f.write(f"{t1 + w.start:8.2f} {t1 + w.end:8.2f} {w.word}\n")
        os.remove(wav)
        print(f"DONE {name}", flush=True)
    print("ALL_DONE", flush=True)


if __name__ == "__main__":
    main()
