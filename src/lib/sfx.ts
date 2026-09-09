// Small Web Audio helper: water-drop / filling sounds and a win chime.
// No audio files needed — everything is synthesised on the fly.

let ctx: AudioContext | null = null;
let muted = false;

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

export function setMuted(value: boolean) {
  muted = value;
}

export function isMuted() {
  return muted;
}

/** Call once from a user gesture so browsers allow sound. */
export function unlockAudio() {
  audio();
}

/** A single "blip" of water landing in the can. Pitch rises as it fills. */
export function playDrip(progress: number) {
  if (muted) return;
  const ac = audio();
  if (!ac) return;
  const now = ac.currentTime;

  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = "sine";
  const base = 420 + progress * 520;
  osc.frequency.setValueAtTime(base * 0.6, now);
  osc.frequency.exponentialRampToValueAtTime(base, now + 0.09);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.12, now + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
  osc.connect(gain).connect(ac.destination);
  osc.start(now);
  osc.stop(now + 0.24);
}

/** Soft trickle noise while water is running. */
export function playTrickle() {
  if (muted) return;
  const ac = audio();
  if (!ac) return;
  const now = ac.currentTime;
  const length = Math.floor(ac.sampleRate * 0.12);
  const buffer = ac.createBuffer(1, length, ac.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i += 1) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / length);
  }
  const src = ac.createBufferSource();
  src.buffer = buffer;
  const filter = ac.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 1400;
  filter.Q.value = 1.2;
  const gain = ac.createGain();
  gain.gain.value = 0.05;
  src.connect(filter).connect(gain).connect(ac.destination);
  src.start(now);
}

/** Happy arpeggio when the can is full. */
export function playWin() {
  if (muted) return;
  const ac = audio();
  if (!ac) return;
  const now = ac.currentTime;
  [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = "triangle";
    osc.frequency.value = freq;
    const start = now + i * 0.11;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.16, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.5);
    osc.connect(gain).connect(ac.destination);
    osc.start(start);
    osc.stop(start + 0.52);
  });
}

/** Short scrape when digging starts. */
export function playDig() {
  if (muted) return;
  const ac = audio();
  if (!ac) return;
  const now = ac.currentTime;
  const length = Math.floor(ac.sampleRate * 0.08);
  const buffer = ac.createBuffer(1, length, ac.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i += 1) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / length) * 0.6;
  }
  const src = ac.createBufferSource();
  src.buffer = buffer;
  const filter = ac.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 700;
  const gain = ac.createGain();
  gain.gain.value = 0.06;
  src.connect(filter).connect(gain).connect(ac.destination);
  src.start(now);
}
