import { useCallback } from "react";
import Particles from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import type { Engine } from "@tsparticles/engine";

interface ConfettiProps {
  active: boolean;
  duration?: number;
}

export function ConfettiBurst({ active, duration = 3000 }: ConfettiProps) {
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

  if (!active) return null;

  return (
    <Particles
      id="confetti-burst"
      className="fixed inset-0 pointer-events-none z-50"
      options={{
        fullScreen: false,
        duration,
        particles: {
          number: { value: 80 },
          color: { value: ["#8b5cf6", "#6366f1", "#f59e0b", "#10b981", "#ef4444", "#ec4899"] },
          shape: { type: ["circle", "square"] },
          opacity: { value: { min: 0.4, max: 1 }, animation: { enable: true, speed: 1, minimumValue: 0 } },
          size: { value: { min: 4, max: 10 } },
          move: {
            enable: true,
            speed: { min: 15, max: 35 },
            direction: "top",
            outModes: "out",
            gravity: { enable: true, acceleration: 30 },
          },
          rotate: { value: { min: 0, max: 360 }, animation: { enable: true, speed: 10 } },
          tilt: { enable: true, value: { min: 0, max: 360 } },
          wobble: { enable: true, distance: 10, speed: { min: -5, max: 5 } },
        },
        emitters: {
          position: { x: 50, y: 50 },
          rate: { quantity: 0 },
          burst: 80,
        },
      }}
    />
  );
}

export function FloatingParticles() {
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

  return (
    <Particles
      id="floating-particles"
      className="absolute inset-0 pointer-events-none"
      options={{
        fullScreen: false,
        particles: {
          number: { value: 30 },
          color: { value: "#8b5cf6" },
          opacity: { value: { min: 0.05, max: 0.15 } },
          size: { value: { min: 2, max: 6 } },
          move: {
            enable: true,
            speed: 0.5,
            direction: "none",
            outModes: "out",
          },
          shape: { type: "circle" },
        },
      }}
    />
  );
}
