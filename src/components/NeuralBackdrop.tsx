import React from 'react';

/** Full-screen ambient grid + vignette; keeps screens visually consistent */
export function NeuralBackdrop({ className = '' }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none fixed inset-0 -z-10 overflow-hidden ${className}`}
      aria-hidden
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(0,217,255,0.18),transparent_55%),radial-gradient(ellipse_80%_60%_at_100%_50%,rgba(184,0,255,0.12),transparent_50%),var(--bg-app)]" />
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: `
            linear-gradient(var(--border-subtle) 1px, transparent 1px),
            linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,var(--bg-app)_75%)] opacity-90" />
    </div>
  );
}
