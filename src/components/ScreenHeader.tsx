import React from 'react';
import { motion } from 'framer-motion';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  backLabel?: string;
  right?: React.ReactNode;
}

export function ScreenHeader({
  title,
  subtitle,
  onBack,
  backLabel = 'Back',
  right,
}: ScreenHeaderProps) {
  return (
    <header className="relative z-10 mb-6 flex flex-wrap items-start justify-between gap-4">
      <div className="flex flex-col gap-3">
        {onBack && (
          <motion.button
            type="button"
            onClick={onBack}
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-border-subtle bg-bg-elevated/80 px-4 py-2 text-sm font-medium text-text-secondary shadow-[0_0_24px_rgba(0,217,255,0.08)] backdrop-blur-md transition-colors hover:border-neural-blue/40 hover:text-text-primary"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span aria-hidden className="text-neural-blue">
              ←
            </span>
            {backLabel}
          </motion.button>
        )}
        <div>
          <h1 className="bg-gradient-to-r from-text-primary via-neural-blue to-neural-purple bg-clip-text text-3xl font-bold tracking-tight text-transparent md:text-4xl">
            {title}
          </h1>
          {subtitle && <p className="mt-2 max-w-2xl text-sm text-text-secondary md:text-base">{subtitle}</p>}
        </div>
      </div>
      {right ? <div className="flex shrink-0 items-center gap-2">{right}</div> : null}
    </header>
  );
}
