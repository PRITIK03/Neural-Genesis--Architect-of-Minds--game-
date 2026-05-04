import React from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../stores/appStore';
import { NeuralBackdrop } from '../components/NeuralBackdrop';
import { loadProgress } from '../lib/playerProgress';

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.15 },
  },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
};

const MainMenu: React.FC = () => {
  const setScreen = useAppStore((state) => state.setScreen);
  const prog = loadProgress();
  const completed = Object.keys(prog.completedLevels).length;

  const navItems = [
    { label: 'Campaign', screen: 'campaign' as const, hint: 'Unlock puzzles in order', accent: 'from-neural-blue to-cyan-400' },
    { label: 'Sandbox', screen: 'sandbox' as const, hint: 'Experiment freely', accent: 'from-neural-purple to-fuchsia-500' },
    { label: 'Daily Challenge', screen: 'daily' as const, hint: 'Beat the clock', accent: 'from-neural-green to-emerald-400' },
    { label: 'Custom Puzzles', screen: 'custom' as const, hint: 'CSV → your dataset', accent: 'from-neural-yellow to-amber-400' },
    { label: 'Leaderboard', screen: 'leaderboard' as const, hint: 'Local high scores', accent: 'from-neural-purple to-neural-blue' },
    { label: 'Profile & Achievements', screen: 'profile' as const, hint: 'XP & milestones', accent: 'from-neural-green to-neural-yellow' },
    { label: 'Settings', screen: 'settings' as const, hint: 'Audio & accessibility', accent: 'from-rose-500 to-neural-red' },
  ];

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-16 text-text-primary">
      <NeuralBackdrop />

      <div className="pointer-events-none absolute left-1/2 top-[18%] h-64 w-64 -translate-x-1/2 rounded-full bg-neural-blue/20 blur-[100px]" />
      <div className="pointer-events-none absolute bottom-[10%] right-[15%] h-48 w-48 rounded-full bg-neural-purple/25 blur-[90px]" />

      <motion.div
        className="relative z-10 mb-12 text-center"
        initial={{ opacity: 0, y: -24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.35em] text-neural-blue/90">Train · Puzzle · Master</p>
        <h1 className="mb-4 text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl">
          <span className="bg-gradient-to-r from-neural-blue via-text-primary to-neural-purple bg-clip-text text-transparent">
            NeuroPuzzle
          </span>
        </h1>
        <p className="mx-auto max-w-lg text-sm text-text-secondary sm:text-base">
          Build small networks, watch them learn, and clear logic challenges—from XOR to convolutions.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs text-text-dim sm:text-sm">
          <span className="rounded-full border border-border-subtle bg-bg-elevated/60 px-3 py-1 backdrop-blur-sm">
            Progress: <strong className="text-neural-green">{completed}</strong> levels cleared
          </span>
          <span className="rounded-full border border-border-subtle bg-bg-elevated/60 px-3 py-1 backdrop-blur-sm">
            <strong className="text-neural-yellow">{prog.xp}</strong> XP ·{' '}
            <strong className="text-neural-blue">{prog.stars}</strong> stars
          </span>
        </div>
      </motion.div>

      <motion.nav
        className="relative z-10 grid w-full max-w-md grid-cols-1 gap-3 sm:max-w-lg"
        variants={container}
        initial="hidden"
        animate="visible"
      >
        {navItems.map(({ label, screen, hint, accent }) => (
          <motion.button
            key={screen}
            type="button"
            variants={item}
            onClick={() => setScreen(screen)}
            className="group relative overflow-hidden rounded-2xl border border-border-subtle bg-bg-elevated/70 p-px text-left shadow-[0_16px_40px_rgba(0,0,0,0.35)] backdrop-blur-md transition-colors hover:border-neural-blue/35"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div
              className={`absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-gradient-to-r ${accent}`}
              style={{ opacity: 0.12 }}
            />
            <div className="relative flex items-center justify-between gap-4 rounded-[15px] bg-bg-panel/80 px-5 py-4">
              <div>
                <span className="block text-base font-semibold text-text-primary">{label}</span>
                <span className="mt-0.5 block text-xs text-text-secondary">{hint}</span>
              </div>
              <span className="text-neural-blue opacity-60 transition-transform group-hover:translate-x-1 group-hover:opacity-100" aria-hidden>
                →
              </span>
            </div>
          </motion.button>
        ))}
      </motion.nav>

      <motion.p
        className="relative z-10 mt-12 max-w-md text-center text-xs text-text-dim"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
      >
        Tip: start with Campaign level 1 (XOR)—you’ll need a hidden layer.
      </motion.p>
    </div>
  );
};

export default MainMenu;
