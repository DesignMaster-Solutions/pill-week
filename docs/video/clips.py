#!/usr/bin/env python3
"""Turn Preview-panel frame bursts (docs/video/frames/<scene>/, from capture_preview.ts) into the
1920x1080 clips that demo.json plays.

Each frame stays on screen for exactly the time until the next grab (times.txt holds the real grab
times), re-timed to 30 fps by holding frames: nothing is interpolated or sped up. A clip lasts as
long as its narration (+0.6 s, the pad demo_slides.py adds), so demo_slides plays it at 1.0x.

Usage: python3 docs/video/clips.py [scene-substring]   then: demo_slides.py docs/video/demo.json
"""
import json, pathlib, subprocess, sys, tempfile
from PIL import Image, ImageDraw, ImageFont

HERE = pathlib.Path(__file__).resolve().parent
W, H = 1920, 1080
BOLD, REG, MONO = ("/System/Library/Fonts/HelveticaNeue.ttc", 1), ("/System/Library/Fonts/HelveticaNeue.ttc", 0), \
    ("/System/Library/Fonts/Menlo.ttc", 0)
BOX = (90, 170, 1420, 710)  # where the cropped preview sits on the 1920x1080 frame (x, y, w, h)


def font(spec, size):
    return ImageFont.truetype(spec[0], size, index=spec[1])


def say_seconds(cfg, text, tmp):
    aiff = tmp / "say.aiff"
    subprocess.run(["say", "-v", cfg["voice"], "-r", str(cfg["rate"]), "-o", str(aiff), text], check=True)
    out = subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                                   "-of", "csv=p=0", str(aiff)], text=True)
    return float(out) + 0.6


def frame_card(cfg, sc, path):
    im = Image.new("RGB", (W, H), cfg["bg"])
    d = ImageDraw.Draw(im)
    d.rectangle([0, 0, W, 8], fill=cfg["accent"])
    d.text((110, 40), sc["title"], font=font(BOLD, 56), fill="white")
    d.text((110, 112), sc["rec_note"], font=font(REG, 32), fill="#e4ecf5")
    x, y, w, h = BOX
    d.rectangle([x - 3, y - 3, x + w + 2, y + h + 2], outline="#3d5573", width=3)
    side = sc.get("side") or []
    for i, line in enumerate(side):
        d.text((x + w + 40, y + 20 + i * 46), line, font=font(REG, 30), fill="#e4ecf5")
    foot = f"Lens Studio Interactive Preview, real-time screen recording · {sc['rec_leaf']} · {cfg['footer']}"
    d.text((110, H - 52), foot, font=font(MONO, 22), fill="#8aa0bd")
    im.save(path)


def build(cfg, sc, tmp):
    frames = HERE / sc["rec"]
    times = frames / "times.txt"
    if times.exists():
        rows = [line.split() for line in times.read_text().splitlines() if line.strip()]
        pts = [(frames / name, float(t)) for name, t in rows]
    else:  # the grab time of each frame is when it was written to disk
        jpgs = sorted(frames.glob("*.jpg"))
        t0 = jpgs[0].stat().st_mtime
        pts = [(p, p.stat().st_mtime - t0) for p in jpgs]
    start = float(sc.get("rec_from", 0))
    length = say_seconds(cfg, sc["say"], tmp)
    end = start + length
    idx = [i for i, (_, t) in enumerate(pts) if start <= t < end]
    if not idx or pts[-1][1] + 0.5 < end:
        sys.exit(f"{sc['rec']}: frames cover {pts[0][1]:.1f}-{pts[-1][1]:.1f} s, narration needs {start:.1f}-{end:.1f} s")
    if idx[0] > 0:
        idx.insert(0, idx[0] - 1)  # the frame already on screen at `start`
    concat = tmp / "frames.txt"
    with concat.open("w") as f:
        for n, i in enumerate(idx):
            shown_from = max(pts[i][1], start)
            shown_to = pts[idx[n + 1]][1] if n + 1 < len(idx) else end
            f.write(f"file '{pts[i][0]}'\nduration {shown_to - shown_from:.4f}\n")
        f.write(f"file '{pts[idx[-1]][0]}'\n")
    card = tmp / "card.png"
    frame_card(cfg, sc, card)
    x, y, w, h = BOX
    cx, cy, cw, ch = sc.get("crop", cfg["crop"])
    graph = (f"[1:v]crop={cw}:{ch}:{cx}:{cy},scale={w}:{h}:force_original_aspect_ratio=decrease,"
             f"pad={w}:{h}:(ow-iw)/2:(oh-ih)/2,fps=30[p];[0:v][p]overlay={x}:{y},format=yuv420p[v]")
    out = HERE / sc["clip"]
    out.parent.mkdir(exist_ok=True)
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-loop", "1", "-i", str(card), "-f", "concat", "-safe", "0",
                    "-i", str(concat), "-filter_complex", graph, "-map", "[v]", "-t", f"{length:.3f}", "-r", "30",
                    "-c:v", "libx264", "-crf", "18", "-pix_fmt", "yuv420p", str(out)], check=True)
    span = pts[idx[-1]][1] - pts[idx[0]][1]
    print(f"{out.name}: {len(idx)} real frames in {length:.1f} s ({(len(idx) - 1) / max(span, 1e-6):.1f} fps captured)")


if __name__ == "__main__":
    cfg = json.loads((HERE / "demo.json").read_text())
    only = sys.argv[1] if len(sys.argv) > 1 else ""
    with tempfile.TemporaryDirectory() as t:
        for sc in cfg["scenes"]:
            if sc.get("rec") and only in sc["rec"]:
                build(cfg, sc, pathlib.Path(t))
