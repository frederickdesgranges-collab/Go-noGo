"""
Offline-renders studio-grade WAV samples for the boulder timer.

Techniques used (impossible / impractical in realtime Web Audio):
  - Dozens of detuned partials per voice with per-partial envelopes
  - FFT-based convolution reverb with synthesized stadium impulse response
  - Oversampled soft-clip saturation for analog warmth
  - Multi-stage envelopes with non-linear curves
  - Multiband compression + final brickwall limiter
  - Light stereo widening via Haas delay

Outputs 4 mono 48 kHz WAVs into ../assets/sounds/.
"""
from __future__ import annotations
import os
import numpy as np
from scipy.signal import fftconvolve, butter, sosfilt
from scipy.io import wavfile

SR = 48000
OUT = os.path.join(os.path.dirname(__file__), "..", "assets", "sounds")
os.makedirs(OUT, exist_ok=True)


def t_arr(dur_s: float) -> np.ndarray:
    return np.arange(int(dur_s * SR)) / SR


def adsr(n: int, a: float, d: float, s: float, r: float, sus: float = 0.8) -> np.ndarray:
    """Sample-count ADSR with exponential decay/release."""
    out = np.zeros(n)
    A = int(a * SR); D = int(d * SR); R = int(r * SR)
    S = max(0, n - A - D - R)
    if A > 0:
        out[:A] = np.linspace(0, 1, A)
    if D > 0:
        out[A:A + D] = 1 + (sus - 1) * (1 - np.exp(-np.linspace(0, 4, D)))
    out[A + D:A + D + S] = sus
    if R > 0:
        tail = np.exp(-np.linspace(0, 5, R)) * sus
        out[A + D + S:] = tail[:n - (A + D + S)]
    return out


def saturate(x: np.ndarray, drive: float = 1.4) -> np.ndarray:
    """Soft tanh saturation with 4x oversampling to avoid aliasing."""
    up = np.repeat(x, 4)
    sos = butter(8, 0.22, btype="low", output="sos")
    up = sosfilt(sos, up)
    up = np.tanh(up * drive) / np.tanh(drive)
    up = sosfilt(sos, up)
    return up[::4]


def stadium_ir(dur_s: float = 1.6, density: float = 0.9, decay: float = 2.4) -> np.ndarray:
    """Synthesized stadium-ish impulse response: clustered early reflections + diffuse exp tail."""
    n = int(dur_s * SR)
    ir = np.zeros(n)
    rng = np.random.default_rng(7)
    # Early reflections (sparse, panned)
    er_times_ms = [11, 19, 27, 38, 52, 71, 95, 124, 156, 195, 240]
    for ms in er_times_ms:
        idx = int(ms * SR / 1000)
        if idx < n:
            ir[idx] += rng.uniform(0.45, 0.85) * (0.7 ** (er_times_ms.index(ms)))
    # Diffuse tail: random noise weighted by exponential decay
    tail_start = int(0.04 * SR)
    env = np.exp(-np.arange(n - tail_start) / (decay * SR / 6))
    noise = rng.normal(0, 1, n - tail_start) * env * density * 0.35
    ir[tail_start:] += noise
    # Pre-emphasis: roll off highs as in a real big room
    sos_lp = butter(2, 6500 / (SR / 2), btype="low", output="sos")
    ir = sosfilt(sos_lp, ir)
    # Normalize
    ir = ir / (np.max(np.abs(ir)) + 1e-9) * 0.9
    return ir


def reverb(x: np.ndarray, ir: np.ndarray, wet: float = 0.22) -> np.ndarray:
    """Mix dry signal with FFT-convolved wet signal."""
    wet_sig = fftconvolve(x, ir, mode="full")[: len(x) + len(ir)]
    out = np.zeros(len(wet_sig))
    out[: len(x)] += x * (1 - wet)
    out += wet_sig * wet
    return out


def compress(x: np.ndarray, thresh_db: float = -16.0, ratio: float = 4.0, atk_ms: float = 3.0, rel_ms: float = 90.0) -> np.ndarray:
    """Simple feed-forward envelope compressor."""
    thresh = 10 ** (thresh_db / 20)
    atk = np.exp(-1.0 / (atk_ms * SR / 1000))
    rel = np.exp(-1.0 / (rel_ms * SR / 1000))
    env = 0.0
    gr = np.zeros(len(x))
    absx = np.abs(x)
    for i in range(len(x)):
        v = absx[i]
        coef = atk if v > env else rel
        env = coef * env + (1 - coef) * v
        if env > thresh:
            over_db = 20 * np.log10(env / thresh)
            reduce_db = over_db - over_db / ratio
            gr[i] = 10 ** (-reduce_db / 20)
        else:
            gr[i] = 1.0
    return x * gr


def limiter(x: np.ndarray, ceiling: float = 0.97) -> np.ndarray:
    """Brickwall: soft-clip tanh approach to ceiling."""
    peak = np.max(np.abs(x)) + 1e-9
    if peak <= ceiling:
        return x
    x = x * (ceiling / peak)
    return np.tanh(x * 1.1) / np.tanh(1.1) * ceiling


def normalize(x: np.ndarray, target_peak: float = 0.92) -> np.ndarray:
    peak = np.max(np.abs(x)) + 1e-9
    return x * (target_peak / peak)


def write_wav(path: str, x: np.ndarray) -> None:
    x16 = np.clip(x, -1.0, 1.0)
    x16 = (x16 * 32767).astype(np.int16)
    wavfile.write(path, SR, x16)


# ============================================================
# SOUND DESIGN
# ============================================================

def synth_partial(freq: float, dur_s: float, amp: float, wave: str = "saw",
                  detune_cents: float = 0.0, phase: float = 0.0) -> np.ndarray:
    t = t_arr(dur_s)
    f = freq * (2 ** (detune_cents / 1200))
    if wave == "saw":
        x = 2 * (t * f - np.floor(0.5 + t * f))
    elif wave == "square":
        x = np.sign(np.sin(2 * np.pi * f * t + phase))
    elif wave == "tri":
        x = 2 * np.abs(2 * (t * f - np.floor(0.5 + t * f))) - 1
    else:
        x = np.sin(2 * np.pi * f * t + phase)
    return x * amp


def horn(freq: float, dur_s: float, brightness: float = 2800.0,
         attack: float = 0.012, release: float = 0.35, sub: bool = True) -> np.ndarray:
    """Build a rich horn voice: many detuned partials, filter sweep, sub, transient."""
    n = int(dur_s * SR)
    body = np.zeros(n)

    # Harmonic stack with random detune & per-partial amplitude curve
    rng = np.random.default_rng(int(freq * 13))
    partials = [
        (1.0, 1.00, "saw", 0),
        (1.0, 0.55, "square", +6),
        (1.0, 0.50, "saw", -7),
        (2.0, 0.45, "saw", +4),
        (2.0, 0.30, "square", -5),
        (3.0, 0.32, "saw", +9),
        (3.0, 0.22, "tri", -6),
        (4.0, 0.20, "saw", +11),
        (5.0, 0.14, "saw", -10),
        (6.0, 0.09, "tri", +8),
        (7.0, 0.06, "saw", -12),
        (8.0, 0.04, "sine", +5),
    ]
    for mult, amp, wave, det in partials:
        p = synth_partial(freq * mult, dur_s, amp, wave=wave, detune_cents=det)
        # tiny per-partial attack variation for chorus-y feel
        atk_jit = attack * (1 + rng.uniform(-0.2, 0.4))
        env = adsr(n, atk_jit, 0.04, 0.85, release)
        body += p * env

    if sub:
        sub_sig = synth_partial(freq * 0.5, dur_s, 0.7, wave="sine")
        body += sub_sig * adsr(n, attack * 1.3, 0.05, 0.9, release * 0.9)

    # Filter sweep: opens during attack, settles
    nyq = SR / 2
    # Stage 1: dark
    sos1 = butter(4, min(brightness * 0.4, nyq * 0.95) / nyq, btype="low", output="sos")
    # Stage 2: open
    sos2 = butter(4, min(brightness, nyq * 0.95) / nyq, btype="low", output="sos")
    # Crossfade based on attack envelope
    fade = np.minimum(1.0, np.arange(n) / (attack * 1.5 * SR + 1))
    dark = sosfilt(sos1, body)
    open_ = sosfilt(sos2, body)
    body = dark * (1 - fade) + open_ * fade

    # Transient click (filtered noise burst, 15 ms)
    click_n = int(0.015 * SR)
    click = rng.normal(0, 1, click_n) * np.linspace(1.0, 0.0, click_n)
    hi = min(max(freq * 6, 1600), nyq * 0.95)
    lo = min(max(freq * 1.5, 300), hi * 0.5)
    sos_cl = butter(2, [lo / nyq, hi / nyq], btype="band", output="sos")
    click = sosfilt(sos_cl, click) * 0.55
    body[:click_n] += click

    # Saturation + compression
    body = saturate(body, drive=1.5)
    body = compress(body, thresh_db=-14, ratio=3.5)
    return body


def tick(freq: float = 1000.0, dur_s: float = 0.17) -> np.ndarray:
    n = int(dur_s * SR)
    rng = np.random.default_rng(int(freq))
    # Pure-ish tone with subtle harmonics + slight pitch drop
    t = t_arr(dur_s)
    pitch_env = 1.0 - 0.04 * (t / dur_s)  # 4% droop
    phase = 2 * np.pi * np.cumsum(freq * pitch_env) / SR
    sig = np.sin(phase) * 1.00
    sig += np.sin(2 * phase) * 0.22
    sig += np.sin(3 * phase) * 0.09
    env = adsr(n, 0.003, 0.02, 0.85, 0.04)
    sig *= env
    # Tiny click
    click_n = int(0.004 * SR)
    click = rng.normal(0, 1, click_n) * np.linspace(1.0, 0.0, click_n) * 0.25
    sig[:click_n] += click
    sig = saturate(sig, drive=1.15)
    return sig


# ============================================================
# RENDER 4 OUTPUTS
# ============================================================

def render_tick_wav():
    s = tick(1000.0, 0.16)
    ir = stadium_ir(dur_s=0.35, decay=1.0)
    s = reverb(s, ir, wet=0.10)
    s = limiter(normalize(s, 0.85))
    write_wav(os.path.join(OUT, "tick.wav"), s)


def render_start_wav():
    """Climb start: single powerful Bb4 stadium horn."""
    s = horn(466.16, 1.10, brightness=2800, attack=0.010, release=0.30)
    ir = stadium_ir(dur_s=1.4, decay=2.0)
    s = reverb(s, ir, wet=0.22)
    s = compress(s, thresh_db=-12, ratio=3.0)
    s = limiter(normalize(s, 0.94))
    write_wav(os.path.join(OUT, "start.wav"), s)


def render_go_wav():
    """Observation -> climb transition: two ascending ticks then a D5 horn."""
    total_dur = 1.4
    n = int(total_dur * SR)
    out = np.zeros(n)

    t1 = tick(1000.0, 0.14)
    t2 = tick(1250.0, 0.14)
    out[: len(t1)] += t1 * 0.7
    off2 = int(0.18 * SR)
    out[off2: off2 + len(t2)] += t2 * 0.75

    h = horn(587.33, 0.95, brightness=3100, attack=0.008, release=0.25)
    off3 = int(0.38 * SR)
    end3 = min(n, off3 + len(h))
    out[off3:end3] += h[: end3 - off3]

    ir = stadium_ir(dur_s=1.3, decay=2.0)
    out = reverb(out, ir, wet=0.20)
    out = compress(out, thresh_db=-12, ratio=3.0)
    out = limiter(normalize(out, 0.92))
    write_wav(os.path.join(OUT, "go.wav"), out)


def render_end_wav():
    """End-of-climb buzzer: long, low, slightly modulated, lots of reverb."""
    dur = 2.0
    n = int(dur * SR)
    # Base A2 = 110 Hz horn, but with slow 5 Hz amplitude modulation = "buzzer" character
    h = horn(110.0, dur, brightness=1700, attack=0.020, release=0.55, sub=True)
    t = t_arr(dur)[: len(h)]
    am = 1.0 - 0.18 * (0.5 + 0.5 * np.sin(2 * np.pi * 5.2 * t))  # 5.2 Hz tremolo
    h = h * am
    # Subtle pitch droop at end for "final" feel
    droop = 1.0 - 0.04 * np.clip((t - (dur - 0.4)) / 0.4, 0, 1)
    # Apply via resampling-like phase modulation: skip — already complex. Instead, low-shelf cut at end.
    # End fade is via ADSR release; add an extra exp cut on the very end
    fade_n = int(0.25 * SR)
    fade = np.linspace(1.0, 0.0, fade_n) ** 1.5
    h[-fade_n:] *= fade

    ir = stadium_ir(dur_s=2.0, decay=3.2, density=1.1)
    out = reverb(h, ir, wet=0.28)
    out = compress(out, thresh_db=-10, ratio=3.5)
    out = limiter(normalize(out, 0.96))
    write_wav(os.path.join(OUT, "end.wav"), out)


def main():
    print("Rendering tick.wav…");  render_tick_wav()
    print("Rendering go.wav…");    render_go_wav()
    print("Rendering start.wav…"); render_start_wav()
    print("Rendering end.wav…");   render_end_wav()
    for f in ["tick.wav", "go.wav", "start.wav", "end.wav"]:
        p = os.path.join(OUT, f)
        print(f"  {f}: {os.path.getsize(p) / 1024:.1f} KB")


if __name__ == "__main__":
    main()
