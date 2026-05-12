import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useAppStore } from '../stores/appStore';
import { useNetworkStore } from '../stores/networkStore';
import levels from '../lib/levels';
import { NeuralBackdrop } from '../components/NeuralBackdrop';
import { recordLevelComplete } from '../lib/playerProgress';

const ResultsScreen: React.FC = () => {
  const setScreen = useAppStore((state) => state.setScreen);
  const { currentLevelId, customPuzzle, loss, accuracy, layers } = useNetworkStore();

  const level = levels.find((l) => l.id === currentLevelId) ?? null;
  const threshold = level?.puzzleData.accuracyThreshold ?? customPuzzle?.accuracyThreshold ?? 0;
  const title = level?.name ?? customPuzzle?.name ?? 'Puzzle';
  const description = level?.description ?? customPuzzle?.description ?? '';

  const isSuccess = accuracy >= threshold;
  const stars = isSuccess ? Math.min(3, Math.max(1, Math.ceil((accuracy / Math.max(threshold, 1e-6)) * 3))) : 0;

  const persistedRef = useRef(false);

  useEffect(() => {
    if (!isSuccess || persistedRef.current) return;
    persistedRef.current = true;

    confetti({ particleCount: 120, spread: 72, origin: { y: 0.65 }, colors: ['#00D9FF', '#B800FF', '#00FF88'] });

    const progressKey = currentLevelId ?? 'unknown';
    const rewards = level?.rewards ?? { xp: 50, stars: Math.max(stars, 1) };
    recordLevelComplete(progressKey, accuracy, rewards);

    const scoreEntry = {
      playerName: 'Player',
      levelId: progressKey,
      accuracy,
      loss,
      timestamp: Date.now(),
      networkSize: layers.reduce((sum, l) => sum + (l.config.units || l.config.filters || 0), 0),
    };
    const existingScores = JSON.parse(localStorage.getItem('neuropuzzle-scores') || '[]') as typeof scoreEntry[];
    existingScores.push(scoreEntry);
    localStorage.setItem('neuropuzzle-scores', JSON.stringify(existingScores));

    const prevMax = Number(localStorage.getItem('neuropuzzle-max-layers') || '0');
    localStorage.setItem('neuropuzzle-max-layers', String(Math.max(prevMax, layers.length)));
  }, [accuracy, currentLevelId, isSuccess, layers, level?.rewards, loss, stars]);

  const neuronCount = layers.reduce((sum, l) => sum + (l.config.units || l.config.filters || 0), 0);
  const complexity =
    layers.length <= 2 ? 'Light' : layers.length <= 4 ? 'Medium' : layers.length <= 6 ? 'Heavy' : 'Deep';

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-12 text-text-primary">
      <NeuralBackdrop />

      <motion.div
        className="relative z-10 panel-card w-full max-w-2xl p-8 text-center md:p-10"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.h1
          className={`mb-2 text-3xl font-bold md:text-4xl ${isSuccess ? 'text-neural-green' : 'text-neural-red'}`}
          initial={{ y: -12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          {isSuccess ? 'Signal aligned' : 'Not quite there'}
        </motion.h1>
        <p className="mb-8 text-sm text-text-secondary md:text-base">
          {isSuccess ? 'Your network hit the accuracy target. Onto the next puzzle.' : 'Tweak layers or training, then run again.'}
        </p>

        <motion.div className="mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
          <h2 className="text-xl font-semibold text-neural-blue">{title}</h2>
          {description && <p className="mt-2 text-sm text-text-secondary">{description}</p>}
        </motion.div>

        <motion.div
          className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="rounded-xl border border-border-subtle bg-bg-elevated/60 p-4 text-left">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neural-purple">Performance</h3>
            <p className="text-sm text-text-secondary">
              Accuracy:{' '}
              <span className="font-bold text-neural-green">{(accuracy * 100).toFixed(2)}%</span>
            </p>
            <p className="text-sm text-text-secondary">
              Loss: <span className="font-bold text-neural-red">{loss.toFixed(4)}</span>
            </p>
            <p className="text-sm text-text-secondary">
              Target:{' '}
              <span className="font-bold text-text-primary">{(threshold * 100).toFixed(0)}%+</span>
            </p>
          </div>
          <div className="rounded-xl border border-border-subtle bg-bg-elevated/60 p-4 text-left">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neural-purple">Architecture</h3>
            <p className="text-sm text-text-secondary">
              Layers: <span className="font-bold text-text-primary">{layers.length}</span>
            </p>
            <p className="text-sm text-text-secondary">
              Parameters (approx. units/filters): <span className="font-bold text-text-primary">{neuronCount}</span>
            </p>
            <p className="text-sm text-text-secondary">
              Footprint: <span className="font-bold text-text-primary">{complexity}</span>
            </p>
          </div>
        </motion.div>

        {isSuccess && (
          <motion.div
            className="mb-8"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.25, type: 'spring', stiffness: 220 }}
          >
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neural-yellow">Rating</h3>
            <div className="flex justify-center gap-3">
              {[1, 2, 3].map((star) => (
                <motion.span
                  key={star}
                  className={`text-4xl ${star <= stars ? 'text-neural-yellow drop-shadow-[0_0_12px_rgba(255,215,0,0.45)]' : 'text-text-dim grayscale'}`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3 + star * 0.06, type: 'spring' }}
                  aria-hidden
                >
                  ★
                </motion.span>
              ))}
            </div>
            <p className="mt-3 text-xs text-text-secondary">
              Reward (first clear): +{level?.rewards.xp ?? 75} XP · +{level?.rewards.stars ?? Math.max(stars, 1)} stars
            </p>
          </motion.div>
        )}

        <motion.div
          className="flex flex-wrap justify-center gap-3"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <motion.button
            type="button"
            onClick={() => setScreen(customPuzzle ? 'custom' : level ? 'campaign' : 'mainMenu')}
            className="rounded-xl bg-neural-blue px-6 py-3 text-sm font-semibold text-bg-app neon-glow"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            {customPuzzle ? 'Custom puzzles' : level ? 'Campaign map' : 'Main menu'}
          </motion.button>
          <motion.button
            type="button"
            onClick={() => setScreen('network')}
            className="rounded-xl border border-border-subtle bg-bg-elevated px-6 py-3 text-sm font-semibold text-text-primary hover:border-neural-blue/40"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            Refine network
          </motion.button>
          <motion.button
            type="button"
            onClick={() => setScreen('mainMenu')}
            className="rounded-xl px-6 py-3 text-sm font-medium text-text-secondary hover:text-text-primary"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            Home
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ResultsScreen;
