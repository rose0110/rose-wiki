# -*- coding: utf-8 -*-
"""Outils communs du skill capsules-live : localisation ffmpeg, presets, couleurs."""
import glob
import json
import os
import shutil


def find_ffmpeg():
    p = shutil.which("ffmpeg")
    if p:
        return p
    hits = glob.glob(os.path.expandvars(
        r"%LOCALAPPDATA%\Microsoft\WinGet\Packages\Gyan.FFmpeg*\ffmpeg-*\bin\ffmpeg.exe"))
    if hits:
        return hits[0]
    raise FileNotFoundError(
        "ffmpeg introuvable : installer via `winget install Gyan.FFmpeg` ou l'ajouter au PATH")


def find_ffprobe():
    p = find_ffmpeg()
    if p.endswith("ffmpeg.exe"):
        return p[:-len("ffmpeg.exe")] + "ffprobe.exe"
    return shutil.which("ffprobe") or p.replace("ffmpeg", "ffprobe")


def load_preset(path):
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def hex_rgb(h):
    h = h.lstrip("#")
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def hex_ass(h):
    """#RRGGBB -> &HBBGGRR& (format couleur ASS)."""
    r, g, b = hex_rgb(h)
    return f"&H{b:02X}{g:02X}{r:02X}&"


def layout(fmt, preset):
    """Geometrie par format. La video incrustee fait toujours 960x538 (16:9)."""
    video_y = preset.get("video_y", 130)
    # Sous-titres ancres en HAUT (Alignment 8) : sub_margin_v = distance depuis le
    # haut de l'image -> les sous-titres commencent juste sous le cadre video
    # (decision Rose 31/07/2026 : plus de vide entre la video et les sous-titres).
    if fmt == "carre":
        return dict(W=1080, H=1080, VX=60, VY=video_y, VW=960, VH=538,
                    sub_margin_v=video_y + 562, play_res_y=1080)
    if fmt == "vertical":  # experimental : valider visuellement au premier usage
        return dict(W=1080, H=1920, VX=60, VY=260, VW=960, VH=538,
                    sub_margin_v=260 + 562, play_res_y=1920)
    raise ValueError(f"format inconnu : {fmt} (attendu : carre | vertical)")
