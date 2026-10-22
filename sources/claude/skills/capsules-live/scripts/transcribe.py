# -*- coding: utf-8 -*-
"""Transcription complete d'une video SANS .vtt (secours, plus long : ~15-30 min pour 1h30).

  python transcribe.py "live.mp4" --out transcript.txt

Produit un fichier au meme format que vtt_dump --fenetres :
lignes `debut fin  texte` (segments Whisper), utilisable pour le reperage
et pour poser les bornes.
"""
import argparse
import os
import subprocess
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import find_ffmpeg


def main():
    p = argparse.ArgumentParser()
    p.add_argument("video")
    p.add_argument("--out", required=True)
    p.add_argument("--modele", default="small")
    a = p.parse_args()

    wav = a.out + ".wav"
    subprocess.run([find_ffmpeg(), "-i", a.video, "-vn", "-ac", "1", "-ar", "16000",
                    "-y", wav], check=True, capture_output=True)
    from faster_whisper import WhisperModel
    model = WhisperModel(a.modele, device="cpu", compute_type="int8")
    segments, _ = model.transcribe(wav, language="fr", vad_filter=True)
    with open(a.out, "w", encoding="utf-8") as f:
        for s in segments:
            f.write(f"{s.start:8.2f} {s.end:8.2f}  {s.text.strip()}\n")
            print(f"{s.start:8.2f} {s.text.strip()[:70]}", flush=True)
    os.remove(wav)
    print("OK", a.out)


if __name__ == "__main__":
    main()
