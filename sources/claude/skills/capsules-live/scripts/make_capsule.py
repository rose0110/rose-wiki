# -*- coding: utf-8 -*-
"""Fabrique une capsule finale : coupe les segments -> concat -> compose.

  python make_capsule.py job_<slug>.json

job_<slug>.json :
{
  "slug": "capsule_exemple",
  "source": "C:/.../live.mp4",
  "preset": "C:/.../presets/rose.json",
  "format": "carre",                       // ou "vertical"
  "titre": "Le titre affiche sur le fond",
  "cta1": null,                            // texte CTA optionnel (bandeau bas)
  "crop": "232:130:6:205",                 // w:h:x:y de la camera dans la source
  "segments": [[304.10, 314.60], [343.95, 375.60]],
  "badge_fix": null                        // ou [largeur, x, y] pour recouvrir un
}                                          //   badge incruste dans le flux

Prerequis dans le dossier courant : sous_titres_<slug>.ass (via ass_karaoke.build,
temps RELATIFS au clip concatene). Le fond et le badge sont generes automatiquement.
Sortie : <slug>.mp4 (le format de la video incrustee est toujours 960x538 ;
le crop doit donc etre en 16:9 pour eviter toute deformation).
"""
import json
import os
import subprocess
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import find_ffmpeg, layout, load_preset


def run(cmd, **kw):
    r = subprocess.run(cmd, capture_output=True, text=True, **kw)
    if r.returncode != 0:
        print(r.stderr[-2000:])
        sys.exit(1)
    return r


def main():
    with open(sys.argv[1], encoding="utf-8") as f:
        job = json.load(f)
    slug, fmt = job["slug"], job.get("format", "carre")
    pr = load_preset(job["preset"])
    L = layout(fmt, pr)
    ff = find_ffmpeg()
    here = os.getcwd()
    sdir = os.path.dirname(os.path.abspath(__file__))

    # 1. fond + badge
    fond, badge = f"fond_{slug}.png", f"badge_{pr['nom']}.png"
    cmd = [sys.executable, os.path.join(sdir, "make_fond.py"), "--preset", job["preset"],
           "--titre", job["titre"], "--out", fond, "--format", fmt]
    if not os.path.exists(badge):
        cmd += ["--badge-out", badge]
    if job.get("cta1"):
        cmd += ["--cta1", job["cta1"]]
    run(cmd, cwd=here)

    # 2. coupes (re-encodage pour des bornes exactes) + concat
    seg_files = []
    for i, (a, b) in enumerate(job["segments"]):
        sf = f"seg_{slug}_{i}.mp4"
        run([ff, "-ss", f"{a:.2f}", "-to", f"{b:.2f}", "-i", job["source"],
             "-c:v", "libx264", "-crf", "18", "-preset", "fast",
             "-c:a", "aac", "-b:a", "160k", "-y", sf])
        seg_files.append(sf)
    if len(seg_files) == 1:
        clip = seg_files[0]
    else:
        with open(f"list_{slug}.txt", "w") as f:
            for sf in seg_files:
                f.write(f"file '{sf}'\n")
        clip = f"clip_{slug}.mp4"
        run([ff, "-f", "concat", "-safe", "0", "-i", f"list_{slug}.txt",
             "-c", "copy", "-y", clip])

    # 3. compose : fond + camera recadree + badge + sous-titres karaoke
    pos = pr["badge"].get("position", "bas-gauche")
    badge_y = L["VY"] + L["VH"] - 27  # a cheval sur le bord bas du cadre video
    if job.get("badge_fix"):
        bw, bx, by = job["badge_fix"]
        badge_part = f"[2:v]scale={bw}:-1[bdg];[a][bdg]overlay={bx}:{by}[b];"
    elif pos == "bas-droite":
        badge_part = f"[a][2:v]overlay=main_w-overlay_w-{L['VX'] + 24}:{badge_y}[b];"
    else:
        badge_part = f"[a][2:v]overlay={L['VX'] + 24}:{badge_y}[b];"
    ass = f"sous_titres_{slug}.ass"
    fc = (f"[1:v]crop={job['crop']},scale={L['VW']}:{L['VH']}:flags=lanczos[cam];"
          f"[0:v][cam]overlay={L['VX']}:{L['VY']}:shortest=1[a];"
          f"{badge_part}[b]subtitles={ass}[v]")
    out = f"{slug}.mp4"
    run([ff, "-loop", "1", "-i", fond, "-i", clip, "-i", badge,
         "-filter_complex", fc, "-map", "[v]", "-map", "1:a",
         "-r", str(pr.get("fps", 16)), "-c:v", "libx264", "-crf", "18",
         "-preset", "medium", "-pix_fmt", "yuv420p",
         "-c:a", "aac", "-b:a", "160k", "-y", out])
    dur = sum(b - a for a, b in job["segments"])
    print(f"OK {out} (~{dur:.1f}s)")


if __name__ == "__main__":
    main()
