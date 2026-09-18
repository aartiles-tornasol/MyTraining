/** Small sound and haptic cues for the session player. Silent failure is fine. */

let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const Ctor = window.AudioContext ?? (window as unknown as {
      webkitAudioContext?: typeof AudioContext;
    }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

/** Call once from a real tap: iOS will not make a sound before that. */
export function unlockAudio() {
  const a = audio();
  if (!a) return;
  const g = a.createGain();
  g.gain.value = 0.0001;
  g.connect(a.destination);
  const o = a.createOscillator();
  o.connect(g);
  o.start();
  o.stop(a.currentTime + 0.01);
}

export function beep(freq = 880, ms = 130, volume = 0.18) {
  const a = audio();
  if (!a) return;
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = 'sine';
  o.frequency.value = freq;
  g.gain.setValueAtTime(0, a.currentTime);
  g.gain.linearRampToValueAtTime(volume, a.currentTime + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + ms / 1000);
  o.connect(g).connect(a.destination);
  o.start();
  o.stop(a.currentTime + ms / 1000 + 0.02);
}

export const countdownTick = () => beep(660, 90, 0.12);
export const goBeep = () => beep(1040, 220, 0.2);

export function buzz(pattern: number | number[] = 40) {
  try {
    navigator.vibrate?.(pattern);
  } catch {
    /* Safari on iOS has no vibrate; the sound cue carries it. */
  }
}
