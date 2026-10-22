# -*- coding: utf-8 -*-
"""Capsule « accroche d'abord » déclinée en 3 styles SANS marine/or (Rose, 05/10/2026 :
« ce bleu et ce orange, c'est trop du déjà vu »).

  A = plein cadre (la vidéo fait le fond, accroche en étiquettes blanches, sous-titres blancs contour noir)
  B = fond blanc, texte noir, surligneur jaune (style « fait main » retenu pour les infographies)
  C = fond noir uni, une seule couleur (corail)

  python make_capsule_accroche.py job.json [A|B|C] [carre|vertical]
  (défaut : style A, carré ; choix de Rose du 07/10/2026 — A = plein cadre, accroche en étiquettes blanches)

job.json : {"slug", "source", "segments": [[début, fin, "PLEIN"|"COTE"], ...],
            "accroche": {"carre": ["ligne 1 *mot accentué*", ...], "vertical": [...]},
            "cues": [[début, fin, "ligne 1|ligne 2 *accent*"], ...]}   (temps relatifs au clip, théoriques)
Les clés de "segments" (PLEIN/COTE) choisissent le recadrage ; adapter CROP_* au live si la mise en page diffère.
Recadrage propre au live : "crop_map": {"CAM": "w:h:x:y"} (tous formats), ou "crop_map_carre" / "crop_map_vertical"
(un carré 940×940 et un 6:5 1128×940 centrés sur le visage ne partent pas du même x).
Caméra tenue à la main : "stabiliser": {"CAM": "608:1080:114:0"} (la tuile entière de la caméra, en pixels de la source) —
stabilisation vid.stab en 2 passes avant le recadrage du format.
Bascule de mise en page au milieu d'un segment : "COTE>PLEIN@883.125" (instant de la 1re image en PLEIN).
Au lieu de "cues", on peut donner "cues_abs" : mêmes triplets mais en secondes du LIVE (lues dans words_*.txt),
convertis automatiquement — moins d'erreurs de calcul.

Même montage que make_accroche.py (segments, recalage des sous-titres sur la durée réelle,
remise à zéro de la vidéo pour que la 1re image montre le visage).
"""
import json
import os
import subprocess
import sys

from PIL import Image, ImageDraw, ImageFont

SKILL = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # marche sur le PC comme sur le VPS
sys.path.insert(0, os.path.join(SKILL, "scripts"))
from common import find_ffmpeg, hex_ass  # noqa: E402

FF = find_ffmpeg()
FP = FF[:-len("ffmpeg.exe")] + "ffprobe.exe" if FF.lower().endswith("ffmpeg.exe") else "ffprobe"
FONT = next((p for p in (r"C:\Windows\Fonts\Rubik-Bold.ttf",
                          os.path.expanduser("~/.local/share/fonts/Rubik-Bold.ttf")) if os.path.exists(p)),
            "Rubik-Bold.ttf")
WA_LOGO = next((p for p in (r"C:\Users\roses\Downloads\capsules-live\gabarit\whatsapp_logo.png",
                            os.path.join(SKILL, "assets", "whatsapp_logo.png")) if os.path.exists(p)),
               "whatsapp_logo.png")

# Recadrages (même zone de l'image caméra dans les deux mises en page Teams)
CROP_169 = {"PLEIN": "1280:720:200:120", "COTE": "640:360:100:330"}
CROP_11 = {"PLEIN": "940:940:320:70", "COTE": "470:470:160:305"}
CROP_65 = {"PLEIN": "1128:940:276:70", "COTE": "564:470:138:305"}

NOIR, BLANC, JAUNE, ROUGE, CORAIL, FOND_C = "#111111", "#FFFFFF", "#FFD60A", "#E0301E", "#FF6B4A", "#121212"

STYLES = {
    ("A", "carre"): dict(W=1080, H=1080, crop=CROP_11, VW=1080, VH=1080, VX=0, VY=0, bg=None,
                         hook="label", hook_y=46, hook_max=48, hook_txt=NOIR, hook_acc=ROUGE,
                         badge=(36, 1000, NOIR, BLANC),
                         sub=dict(base=BLANC, acc=JAUNE, size=60, align=8, mv=790, bord=6, shad=0)),
    ("A", "vertical"): dict(W=1080, H=1920, crop=CROP_65, VW=1080, VH=900, VX=0, VY=470, bg=NOIR,  # fond flouté refusé par Rose le 08/10/2026
                            hook="label", hook_y=170, hook_max=62, hook_txt=NOIR, hook_acc=ROUGE,
                            badge=(24, 490, NOIR, BLANC), cta=(1392, BLANC, NOIR),
                            sub=dict(base=BLANC, acc=JAUNE, size=62, align=2, mv=570, bord=6, shad=0)),
    ("B", "carre"): dict(W=1080, H=1080, crop=CROP_169, VW=1000, VH=562, VX=40, VY=210, bg=BLANC, rond=28,
                         hook="marker", hook_y=44, hook_max=56, hook_txt=NOIR, hook_acc=NOIR,
                         badge=(64, 745, NOIR, BLANC),
                         sub=dict(base=NOIR, acc=NOIR, size=50, align=8, mv=830, bord=0, shad=0,
                                  marker=JAUNE)),
    ("B", "vertical"): dict(W=1080, H=1920, crop=CROP_65, VW=900, VH=750, VX=90, VY=470, bg=BLANC, rond=32,
                            hook="marker", hook_y=160, hook_max=76, hook_txt=NOIR, hook_acc=NOIR,
                            badge=(110, 490, NOIR, BLANC), cta=(1392, NOIR, BLANC),
                            sub=dict(base=NOIR, acc=NOIR, size=52, align=8, mv=1240, bord=0, shad=0,
                                     marker=JAUNE)),
    ("C", "carre"): dict(W=1080, H=1080, crop=CROP_169, VW=1080, VH=608, VX=0, VY=210, bg=FOND_C,
                         hook="plain", hook_y=44, hook_max=56, hook_txt=BLANC, hook_acc=CORAIL,
                         badge=(36, 791, CORAIL, FOND_C),
                         sub=dict(base=BLANC, acc=CORAIL, size=50, align=8, mv=862, bord=0, shad=0)),
    ("C", "vertical"): dict(W=1080, H=1920, crop=CROP_65, VW=1080, VH=900, VX=0, VY=470, bg=FOND_C,
                            hook="plain", hook_y=160, hook_max=76, hook_txt=BLANC, hook_acc=CORAIL,
                            badge=(24, 490, CORAIL, FOND_C), cta=(1392, CORAIL, FOND_C),
                            sub=dict(base=BLANC, acc=CORAIL, size=62, align=2, mv=570, bord=4, shad=0)),
    # A16 = style A quand la caméra source n'est qu'une petite vignette (ex. 232×130 en partage d'écran) :
    # recadrer en plein cadre grossirait l'image ×8 (flou). On garde l'image caméra ENTIÈRE en 16:9,
    # posée sur un fond NOIR uni (le fond flouté a été refusé par Rose le 08/10/2026 : « ça ne rend pas
    # bien ») ; accroche en étiquettes blanches, sous-titres blancs contour noir sous la vidéo.
    ("A16", "carre"): dict(W=1080, H=1080, crop=CROP_169, VW=1080, VH=608, VX=0, VY=236, bg=NOIR,
                           hook="label", hook_y=40, hook_max=48, hook_txt=NOIR, hook_acc=ROUGE,
                           badge=(24, 236 + 608 - 27, NOIR, BLANC),
                           sub=dict(base=BLANC, acc=JAUNE, size=54, align=8, mv=866, bord=5, shad=0)),
    ("A16", "vertical"): dict(W=1080, H=1920, crop=CROP_169, VW=1080, VH=608, VX=0, VY=560, bg=NOIR,
                              hook="label", hook_y=170, hook_max=62, hook_txt=NOIR, hook_acc=ROUGE,
                              badge=(24, 560 - 27, NOIR, BLANC), cta=(1392, BLANC, NOIR),
                              sub=dict(base=BLANC, acc=JAUNE, size=58, align=8, mv=1192, bord=5, shad=0)),
    # AP = style A quand la caméra de Rose est un TÉLÉPHONE tenu droit (portrait 9:16, ex. live du 08/10/2026,
    # tuile 608×1080) : en vertical, la vidéo remplit tout l'écran (plein cadre, son vrai fond visible),
    # accroche en haut, sous-titres au-dessus du bandeau « Lien en bio ». Le carré se fait en style A
    # avec "crop_map_carre" (carré 608×608 pris dans la tuile).
    ("AP", "vertical"): dict(W=1080, H=1920, crop={}, VW=1080, VH=1920, VX=0, VY=0, bg=None,
                             hook="label", hook_y=150, hook_max=62, hook_txt=NOIR, hook_acc=ROUGE,
                             badge=(36, 1328, NOIR, BLANC), cta=(1392, BLANC, NOIR),
                             sub=dict(base=BLANC, acc=JAUNE, size=62, align=2, mv=616, bord=6, shad=0)),
}


def run(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        print(r.stderr[-2500:])
        sys.exit(1)
    return r


def parse_accents(line):
    out, acc = [], False
    for w in line.split(" "):
        st, en = w.startswith("*"), "*" in w[1:]
        if st and en:
            out.append((w.replace("*", ""), True))
        elif st:
            acc = True
            out.append((w.replace("*", ""), True))
        elif en and acc:
            acc = False
            out.append((w.replace("*", ""), True))
        else:
            out.append((w.replace("*", ""), acc))
    return out


def font(s):
    return ImageFont.truetype(FONT, s)


def overlay_png(st, lignes, out):
    """Calque transparent : accroche + badge + bandeau CTA éventuel."""
    W, H = st["W"], st["H"]
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    parsed = [parse_accents(l) for l in lignes]
    maxw = 990 if W == H else 920
    size = st["hook_max"]
    while True:
        f = font(size)
        sp = d.textlength(" ", font=f)
        widths = [sum(d.textlength(w, font=f) for w, _ in p) + sp * (len(p) - 1) for p in parsed]
        if max(widths) <= maxw - (52 if st["hook"] == "label" else 0) or size <= 30:
            break
        size -= 2
    lh = int(size * (1.45 if st["hook"] == "label" else 1.28))
    y = st["hook_y"]
    for p, wl in zip(parsed, widths):
        x0 = (W - wl) / 2
        if st["hook"] == "label":
            d.rounded_rectangle([x0 - 26, y - int(size * 0.17), x0 + wl + 26, y + int(size * 1.3)], 16, fill=BLANC)
        x = x0
        for w, acc in p:
            ww = d.textlength(w, font=f)
            if acc and st["hook"] == "marker":
                bb = d.textbbox((x, y), w, font=f)
                d.polygon([(bb[0] - 8, bb[1] + 10), (bb[2] + 8, bb[1] + 4), (bb[2] + 6, bb[3] + 8),
                           (bb[0] - 6, bb[3] + 12)], fill=JAUNE)
            d.text((x, y), w, font=f, fill=st["hook_acc"] if acc else st["hook_txt"])
            x += ww + sp
        y += lh
    hook_bottom = y
    # badge
    bx, by, bfond, btxt = st["badge"]
    fb = font(28)
    bw = d.textlength("Rose YEMELI", font=fb)
    d.rounded_rectangle([bx, by, bx + bw + 40, by + 50], 25, fill=bfond)
    d.text((bx + 20, by + 9), "Rose YEMELI", font=fb, fill=btxt)
    # bandeau CTA (vertical : décision du 31/07, promesse d'abord)
    if st.get("cta"):
        cy, cfond, ctxt = st["cta"]
        d.rectangle([0, cy, W, cy + 96], fill=cfond)
        f1, f2 = font(34), font(24)
        l1, l2 = "Plus de ressources IA & paie ?", "Rejoignez la communauté gratuite  ·  Lien en bio"
        logo = Image.open(WA_LOGO).convert("RGBA")
        logo = logo.resize((54, int(54 * logo.height / logo.width)), Image.LANCZOS)
        tw = max(d.textlength(l1, font=f1), d.textlength(l2, font=f2))
        x = (W - (tw + 24 + logo.width)) / 2
        d.text((x + (tw - d.textlength(l1, font=f1)) / 2, cy + 10), l1, font=f1, fill=ctxt)
        d.text((x + (tw - d.textlength(l2, font=f2)) / 2, cy + 56), l2, font=f2, fill=ctxt)
        im.alpha_composite(logo, (int(x + tw + 24), int(cy + (96 - logo.height) / 2)))
    im.save(out)
    return size, hook_bottom


def ass_karaoke(st, cues, out):
    s = st["sub"]
    base = hex_ass(s["base"]).strip("&H&")
    acc = hex_ass(s["acc"])
    basec = f"&H{base}&"
    marker = f"\\3c{hex_ass(s['marker'])}\\bord9" if s.get("marker") else ""
    head = f"""[Script Info]
ScriptType: v4.00+
PlayResX: {st['W']}
PlayResY: {st['H']}
WrapStyle: 2
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Sub,Rubik,{s['size']},&H00{base},&H90{base},&H00000000,&H64000000,-1,0,0,0,100,100,0,0,1,{s['bord']},{s['shad']},{s['align']},60,60,{s['mv']},1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""

    def ts(t):
        return f"{int(t // 3600)}:{int(t % 3600 // 60):02d}:{t % 60:05.2f}"

    lines = [head]
    for start, end, text in cues:
        dur = (end - start) * 100
        words = [(w, a, li) for li, line in enumerate(text.split("|")) for w, a in parse_accents(line)]
        total = sum(max(len(w), 2) for w, _, _ in words)
        parts, prev = [], 0
        for i, (w, a, li) in enumerate(words):
            k = int(round(dur * max(len(w), 2) / total))
            col = acc if a else basec
            extra = marker if (a and marker) else (f"\\bord{s['bord']}" if marker else "")
            tags = f"{{\\k{k}\\1c{col}\\2c{col}\\2a&H90&\\1a&H00&{extra}}}"
            parts.append(("" if i == 0 else ("\\N" if li != prev else " ")) + tags + w)
            prev = li
        lines.append(f"Dialogue: 0,{ts(start)},{ts(end)},Sub,,0,0,0,,{''.join(parts)}\n")
    with open(out, "w", encoding="utf-8-sig") as f:
        f.writelines(lines)


def main():
    with open(sys.argv[1], encoding="utf-8") as f:
        job = json.load(f)
    sty = sys.argv[2] if len(sys.argv) > 2 else "A"
    fmt = sys.argv[3] if len(sys.argv) > 3 else "carre"
    st = dict(STYLES[(sty, fmt)])
    if job.get("crop_map"):  # recadrages mesurés pour CE live (prioritaires sur ceux du style)
        st["crop"] = {**st["crop"], **job["crop_map"]}
    if job.get(f"crop_map_{fmt}"):  # variante par format (carré 1:1 et vertical 6:5 ne cadrent pas pareil)
        st["crop"] = {**st["crop"], **job[f"crop_map_{fmt}"]}
    slug = f"{job['slug']}_{sty}_{fmt}"

    # 1. segments recadrés, mis à l'échelle, micro-fondus audio
    segs = []
    for i, (a, b, lay) in enumerate(job["segments"]):
        sf = f"seg_{slug}_{i}.mp4"
        af = f"afade=t=in:st=0:d=0.02,afade=t=out:st={b - a - 0.025:.3f}:d=0.025"
        sc = f"scale={st['VW']}:{st['VH']}:flags=lanczos,setsar=1"
        if "@" in lay:
            # la mise en page Teams change au milieu d'une phrase : « COTE>PLEIN@883.125 ».
            # Deux recadrages bout à bout pour l'image, un seul morceau de son (aucune coupure audible).
            l1, rest = lay.split(">")
            l2, t = rest.split("@")
            k = float(t) - a
            fc = (f"[0:v]split[x][y];[x]trim=0:{k:.3f},setpts=PTS-STARTPTS,crop={st['crop'][l1]},{sc}[v1];"
                  f"[y]trim={k:.3f},setpts=PTS-STARTPTS,crop={st['crop'][l2]},{sc}[v2];"
                  f"[v1][v2]concat=n=2:v=1:a=0[v];[0:a]{af}[a]")
            run([FF, "-ss", f"{a:.2f}", "-to", f"{b:.2f}", "-i", job["source"], "-filter_complex", fc,
                 "-map", "[v]", "-map", "[a]", "-r", "16", "-c:v", "libx264", "-crf", "17", "-preset", "fast",
                 "-c:a", "aac", "-b:a", "160k", "-ar", "48000", "-ac", "1", "-y", sf])
        else:
            vf = f"crop={st['crop'][lay]},{sc}"
            tuile = (job.get("stabiliser") or {}).get(lay)
            if tuile:
                # Caméra tenue à la main (téléphone, 08/10/2026) : stabilisation en 2 passes (vid.stab) sur la
                # tuile ENTIÈRE, puis recadrage du format exprimé par rapport à la tuile. optzoom=1 : léger zoom
                # fixe qui masque les bords noirs créés par la compensation du mouvement.
                tw, th, tx, ty = (int(v) for v in tuile.split(":"))
                cw, ch, cx, cy = (int(v) for v in st["crop"][lay].split(":"))
                trf = f"stab_{slug}_{i}.trf"
                run([FF, "-ss", f"{a:.2f}", "-to", f"{b:.2f}", "-i", job["source"], "-an",
                     "-vf", f"crop={tuile},vidstabdetect=shakiness=6:accuracy=15:stepsize=6:result={trf}",
                     "-f", "null", "-"])
                vf = (f"crop={tuile},vidstabtransform=input={trf}:smoothing={job.get('lissage', 30)}:optzoom=1:interpol=bicubic,"
                      f"crop={cw}:{ch}:{cx - tx}:{cy - ty},{sc}")
            run([FF, "-ss", f"{a:.2f}", "-to", f"{b:.2f}", "-i", job["source"], "-af", af,
                 "-vf", vf,
                 "-r", "16", "-c:v", "libx264", "-crf", "17", "-preset", "fast",
                 "-c:a", "aac", "-b:a", "160k", "-ar", "48000", "-ac", "1", "-y", sf])
        segs.append(sf)
    nominal = [b - a for a, b, _ in job["segments"]]
    if "cues_abs" in job:
        # Sous-titres écrits directement sur l'horloge du live (temps lus dans words_<slug>.txt) :
        # conversion automatique en temps du clip, segment par segment.
        n_off0 = [sum(nominal[:i]) for i in range(len(nominal))]
        job["cues"] = []
        for ca, cb, txt in job["cues_abs"]:
            for k, (sa, sb, _) in enumerate(job["segments"]):
                if sa - 0.05 <= ca <= sb:
                    rel = max(ca, sa) - sa + n_off0[k]
                    job["cues"].append((rel, rel + min(cb, sb) - max(ca, sa), txt))
                    break
            else:
                sys.exit(f"Sous-titre hors des segments : {ca} « {txt} »")
    reel = [float(run([FP, "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", sf]).stdout)
            for sf in segs]
    n_off = [sum(nominal[:i]) for i in range(len(nominal))]
    r_off = [sum(reel[:i]) for i in range(len(reel))]

    def recale(t):
        i = max(k for k in range(len(n_off)) if t >= n_off[k] - 1e-6)
        return t - n_off[i] + r_off[i]

    cues = [(recale(a), recale(a) + (b - a), t) for a, b, t in job["cues"]]
    with open(f"list_{slug}.txt", "w") as f:
        f.writelines(f"file '{sf}'\n" for sf in segs)
    clip = f"clip_{slug}.mp4"
    run([FF, "-f", "concat", "-safe", "0", "-i", f"list_{slug}.txt", "-c", "copy", "-y", clip])

    # 2. calque accroche/badge/CTA, sous-titres, éventuel fond uni et masque à coins arrondis
    over = f"over_{slug}.png"
    size, hb = overlay_png(st, job["accroche"][fmt], over)
    print(f"accroche {size}px, bas du texte y={hb}, haut vidéo y={st['VY']}")
    ass = f"st_{slug}.ass"
    ass_karaoke(st, cues, ass)
    W, H = st["W"], st["H"]
    inputs = ["-i", clip, "-loop", "1", "-i", over]
    cam = "[0:v]setpts=PTS-STARTPTS"
    if st["bg"] is None:  # plein cadre : la vidéo est le fond
        fc = f"{cam}[a];[a][1:v]overlay=0:0[b];[b]subtitles={ass}[v]"
    elif st["bg"] == "flou":  # vertical plein cadre : fond = la même vidéo agrandie et floutée
        fc = (f"{cam},split[c1][c2];[c1]scale=-2:{H},crop={W}:{H},boxblur=40:3,eq=brightness=-0.28:saturation=0.55[f];"
              f"[f][c2]overlay={st['VX']}:{st['VY']}[a];[a][1:v]overlay=0:0[b];[b]subtitles={ass}[v]")
    else:
        Image.new("RGB", (W, H), st["bg"]).save(f"bg_{slug}.png")
        inputs += ["-loop", "1", "-i", f"bg_{slug}.png"]
        if st.get("rond"):
            m = Image.new("L", (st["VW"], st["VH"]), 0)
            ImageDraw.Draw(m).rounded_rectangle([0, 0, st["VW"] - 1, st["VH"] - 1], st["rond"], fill=255)
            m.save(f"mask_{slug}.png")
            inputs += ["-loop", "1", "-i", f"mask_{slug}.png"]
            camf = f"{cam},format=rgba[c0];[3:v]format=gray[m];[c0][m]alphamerge[c]"
        else:
            camf = f"{cam}[c]"
        fc = (f"{camf};[2:v][c]overlay={st['VX']}:{st['VY']}:shortest=1[a];"
              f"[a][1:v]overlay=0:0[b];[b]subtitles={ass}[v]")
    out = f"capsule_{slug}.mp4"
    run([FF, *inputs, "-filter_complex", fc, "-map", "[v]", "-map", "0:a", "-r", "16",
         "-c:v", "libx264", "-crf", "18", "-preset", "medium", "-pix_fmt", "yuv420p",
         "-c:a", "aac", "-b:a", "160k", "-movflags", "+faststart", "-shortest", "-y", out])
    print("OK", out)


if __name__ == "__main__":
    main()
