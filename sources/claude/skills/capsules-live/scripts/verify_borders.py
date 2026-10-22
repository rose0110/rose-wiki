# -*- coding: utf-8 -*-
"""Verification OBLIGATOIRE des capsules finales : retranscrit les 4 premieres
et 4 dernieres secondes de chaque fichier pour detecter un mot coupe, une voix
parasite ou un debordement de borne.

  python verify_borders.py capsule_a.mp4 capsule_b.mp4 ...

Lire la sortie et verifier que chaque DEBUT commence sur un debut de phrase et
que chaque FIN se termine sur une phrase complete du BON locuteur. (Whisper sur
4 s peut ecorcher des mots — ce qui compte, ce sont les bordures, pas
l'orthographe.)
"""
import os
import subprocess
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import find_ffmpeg, find_ffprobe


def main():
    from faster_whisper import WhisperModel
    model = WhisperModel("small", device="cpu", compute_type="int8")
    ff, fp = find_ffmpeg(), find_ffprobe()

    for f in sys.argv[1:]:
        dur = float(subprocess.run([fp, "-v", "error", "-show_entries",
                                    "format=duration", "-of", "csv=p=0", f],
                                   capture_output=True, text=True).stdout.strip())
        for tag, ss in (("DEBUT", 0), ("FIN", max(0, dur - 4))):
            wav = "_chk.wav"
            subprocess.run([ff, "-ss", str(ss), "-t", "4", "-i", f, "-vn", "-ac", "1",
                            "-ar", "16000", "-y", wav], check=True, capture_output=True)
            segs, _ = model.transcribe(wav, language="fr")
            txt = " ".join(s.text.strip() for s in segs)
            print(f"{f} [{dur:.1f}s] {tag}: {txt}", flush=True)
        os.remove("_chk.wav")
    print("VERIF_DONE", flush=True)


if __name__ == "__main__":
    main()
