import { useCallback, useRef, useState } from 'react';

/** Plays a short synthesized brass "pouet" and exposes a brief `hit` flag for a bump animation. */
export function usePouet() {
  const ctxRef = useRef<AudioContext | null>(null);
  const [hit, setHit] = useState(false);

  const play = useCallback(() => {
    setHit(true);
    window.setTimeout(() => setHit(false), 140);
    try {
      const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AC) return;
      const ctx = (ctxRef.current ??= new AC());
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();
      const base = [196, 220, 262][Math.floor(Math.random() * 3)];
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(base * 0.9, t);
      osc.frequency.exponentialRampToValueAtTime(base, t + 0.08);
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(500, t);
      filter.frequency.exponentialRampToValueAtTime(2200, t + 0.1);
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.35, t + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
      osc.connect(filter).connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.5);
    } catch {
      /* audio not available: the button still animates */
    }
  }, []);

  return { play, hit };
}
