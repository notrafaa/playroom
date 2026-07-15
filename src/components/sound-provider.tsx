"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

type SoundName = "click" | "buzzer" | "success" | "life" | "start";
const SoundContext = createContext({ enabled: true, play: (() => undefined) as (name: SoundName) => void, toggle: () => {} });

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabled] = useState(true);
  const play = useCallback((name: SoundName) => {
    if (!enabled || typeof window === "undefined") return;
    const Context = window.AudioContext ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Context) return;
    const context = new Context();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const frequencies: Record<SoundName, number> = { click: 440, buzzer: 120, success: 660, life: 180, start: 520 };
    oscillator.type = name === "buzzer" ? "sawtooth" : "sine";
    oscillator.frequency.setValueAtTime(frequencies[name], context.currentTime);
    gain.gain.setValueAtTime(name === "buzzer" ? .16 : .08, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(.001, context.currentTime + (name === "buzzer" ? .45 : .18));
    oscillator.connect(gain).connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + (name === "buzzer" ? .45 : .18));
  }, [enabled]);
  return <SoundContext.Provider value={{ enabled, play, toggle: () => setEnabled((value) => !value) }}>{children}</SoundContext.Provider>;
}

export function useSound() { return useContext(SoundContext); }

export function SoundToggle() {
  const { enabled, toggle } = useSound();
  return <button type="button" onClick={toggle} className="button button-ghost" aria-label={enabled ? "Couper les sons" : "Activer les sons"}>{enabled ? <Volume2 size={18} /> : <VolumeX size={18} />}</button>;
}
