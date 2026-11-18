"""Synthesize Pill Week's two sounds locally (stdlib only): a short low tone and a soft chime."""
import math, struct, wave, sys, os

RATE = 44100
OUT = sys.argv[1] if len(sys.argv) > 1 else "Assets/Audio"


def write(name, samples):
    os.makedirs(OUT, exist_ok=True)
    path = os.path.join(OUT, name)
    with wave.open(path, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(RATE)
        w.writeframes(b"".join(struct.pack("<h", int(max(-1, min(1, s)) * 32767)) for s in samples))
    return path


def wrong_tone(dur=0.28):
    # 180 Hz with a bit of 2nd harmonic so it carries on small speakers; fast attack, short release
    n = int(RATE * dur)
    out = []
    for i in range(n):
        t = i / RATE
        env = min(1, t / 0.01) * min(1, (dur - t) / 0.06)
        out.append(0.5 * env * (math.sin(2 * math.pi * 180 * t) + 0.35 * math.sin(2 * math.pi * 360 * t)))
    return out


def chime(dur=1.6):
    # Two soft bell partials (C6 then E6), exponential decay
    n = int(RATE * dur)
    notes = [(1046.5, 0.0), (1318.5, 0.18)]
    out = [0.0] * n
    for f, start in notes:
        for i in range(int(start * RATE), n):
            t = i / RATE - start
            env = min(1, t / 0.005) * math.exp(-t * 3.2)
            out[i] += 0.22 * env * (math.sin(2 * math.pi * f * t) + 0.3 * math.sin(2 * math.pi * 2.76 * f * t))
    return out


if __name__ == "__main__":
    a, b = wrong_tone(), chime()
    assert max(abs(s) for s in a) <= 1 and max(abs(s) for s in b) <= 1
    print(write("PillWeekWrong.wav", a))
    print(write("PillWeekChime.wav", b))
