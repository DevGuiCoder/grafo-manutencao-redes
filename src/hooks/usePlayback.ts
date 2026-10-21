import { useEffect, useState } from "react";
export function usePlayback(total: number) {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  useEffect(() => {
    if (!playing) return;
    if (step >= total) {
      setPlaying(false);
      return;
    }
    const timer = window.setTimeout(
      () => setStep((s) => Math.min(total, s + 1)),
      1100 / speed,
    );
    return () => window.clearTimeout(timer);
  }, [playing, step, speed, total]);
  return {
    step,
    playing,
    speed,
    setSpeed,
    reset: () => {
      setPlaying(false);
      setStep(0);
    },
    toggle: () => {
      if (step >= total) setStep(0);
      setPlaying((p) => !p);
    },
    seek: (next: number) => {
      setPlaying(false);
      setStep(Math.max(0, Math.min(total, next)));
    },
  };
}
export type Playback = ReturnType<typeof usePlayback>;
