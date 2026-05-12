import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../stores/appStore';
import { NeuralBackdrop } from '../components/NeuralBackdrop';
import { ScreenHeader } from '../components/ScreenHeader';

interface ScoreEntry {
  playerName: string;
  levelId: string;
  accuracy: number;
  loss: number;
  timestamp: number;
  networkSize: number;
}

function formatLevelLabel(levelId: string): string {
  if (levelId.startsWith('custom-')) return 'Custom puzzle';
  const m = /^level-(\d+)$/.exec(levelId);
  if (m) return `Campaign · Stage ${m[1]}`;
  return levelId;
}

const Leaderboard: React.FC = () => {
  const setScreen = useAppStore((state) => state.setScreen);
  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [filter, setFilter] = useState<'all' | 'personal'>('all');

  useEffect(() => {
    const storedScores = localStorage.getItem('neuropuzzle-scores');
    if (storedScores) {
      try {
        setScores(JSON.parse(storedScores) as ScoreEntry[]);
      } catch {
        setScores([]);
      }
    }
  }, []);

  const filteredScores = useMemo(() => {
    return scores
      .filter((score) => (filter === 'personal' ? score.playerName === 'Player' : true))
      .sort((a, b) => b.accuracy - a.accuracy || b.timestamp - a.timestamp)
      .slice(0, 50);
  }, [scores, filter]);

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return '🥇';
      case 1:
        return '🥈';
      case 2:
        return '🥉';
      default:
        return `#${index + 1}`;
    }
  };

  return (
    <div className="relative min-h-screen px-4 py-10 text-text-primary md:px-10">
      <NeuralBackdrop />

      <div className="relative z-10 mx-auto max-w-3xl">
        <ScreenHeader title="Leaderboard" subtitle="Runs saved locally after a successful debrief." onBack={() => setScreen('mainMenu')} backLabel="Main menu" />

        <motion.div className="mt-6 flex justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          <div className="flex rounded-2xl border border-border-subtle bg-bg-elevated/70 p-1 backdrop-blur-md">
            {(['all', 'personal'] as const).map((option) => (
              <motion.button
                key={option}
                type="button"
                onClick={() => setFilter(option)}
                className={`rounded-xl px-5 py-2 text-sm font-semibold capitalize transition-colors ${
                  filter === option ? 'bg-neural-blue text-bg-app shadow-[0_0_24px_rgba(0,217,255,0.25)]' : 'text-text-secondary hover:text-text-primary'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {option === 'all' ? 'All runs' : 'You'}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {filteredScores.length === 0 ? (
          <motion.div
            className="panel-card mt-8 p-10 text-center"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <p className="text-lg text-text-secondary">No logged runs yet.</p>
            <p className="mt-2 text-sm text-text-dim">Beat a campaign puzzle (threshold met) to record an entry.</p>
          </motion.div>
        ) : (
          <motion.ul className="mt-8 space-y-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
            {filteredScores.map((score, index) => (
              <motion.li
                key={`${score.levelId}-${score.timestamp}-${index}`}
                className="panel-card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                initial={{ x: -16, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.05 * Math.min(index, 12) }}
                whileHover={{ scale: 1.01 }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 text-center text-xl font-bold text-neural-purple">{getRankIcon(index)}</div>
                  <div>
                    <p className="font-semibold text-neural-blue">{score.playerName}</p>
                    <p className="text-xs text-text-secondary">{formatLevelLabel(score.levelId)}</p>
                  </div>
                </div>
                <div className="flex flex-1 flex-wrap items-end justify-between gap-4 sm:justify-end">
                  <div className="text-right">
                    <p className="text-lg font-bold text-neural-green">{(score.accuracy * 100).toFixed(2)}%</p>
                    <p className="text-xs text-text-secondary">Loss {score.loss.toFixed(4)}</p>
                  </div>
                  <div className="text-right text-xs text-text-dim">
                    <p>Units/filters: {score.networkSize}</p>
                    <p>{new Date(score.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              </motion.li>
            ))}
          </motion.ul>
        )}

        <motion.div className="panel-card mt-10 p-6 text-sm text-text-secondary" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}>
          <h2 className="text-base font-semibold text-neural-purple">How this board works</h2>
          <p className="mt-2 leading-relaxed">
            Entries appear after a successful debrief. Rankings sort by accuracy (ties favor newer runs). Everything stays in your browser—clear site data resets it.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Leaderboard;
