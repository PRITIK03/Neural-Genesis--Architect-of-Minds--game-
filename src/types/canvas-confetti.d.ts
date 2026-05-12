declare module 'canvas-confetti' {
  export interface Options {
    particleCount?: number;
    spread?: number;
    origin?: { x?: number; y?: number };
    colors?: string[];
    angle?: number;
    startVelocity?: number;
    decay?: number;
    ticks?: number;
    zIndex?: number;
  }

  export default function confetti(options?: Options): void;
}