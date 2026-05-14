import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../stores/appStore';
import { NeuralBackdrop } from '../components/NeuralBackdrop';
import { ScreenHeader } from '../components/ScreenHeader';
import confetti from 'canvas-confetti';

interface ScoreEntry {
  playerName: string;
  levelId: string;
  accuracy: number;
  loss: number;
  timestamp: number;
  networkSize: number;
  layersCount: number;
}

const allLevels = [
  { id: 'level-1', name: 'XOR Gate', act: 1 },
  { id: 'level-2', name: 'AND Gate', act: 1 },
  { id: 'level-3', name: 'Three-Way Classification', act: 1 },
  { id: 'level-4', name: 'Circle vs Square', act: 1 },
  { id: 'level-5', name: 'Overfitting Prevention', act: 1 },
  { id: 'level-6', name: 'Noisy Signals', act: 1 },
  { id: 'level-7', name: 'Pattern Recognition', act: 2 },
];

const Leaderboard: React.FC = () => {
  const setScreen = useAppStore((state) => state.setScreen);
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'accuracy' | 'loss' | 'date'>('accuracy');

  const [scores, setScores] = useState<ScoreEntry[]>(() => {
    const stored = localStorage.getItem('neuropuzzle-scores');
    return stored ? JSON.parse(stored) : [];
  });

  const filteredScores = useMemo(() => {
    let filtered = selectedLevel === 'all'
      ? scores
      : scores.filter((s) => s.levelId === selectedLevel);

    return [...filtered].sort((a, b) => {
      if (sortBy === 'accuracy') return b.accuracy - a.accuracy;
      if (sortBy === 'loss') return a.loss - b.loss;
      return b.timestamp - a.timestamp;
    });
  }, [scores, selectedLevel, sortBy]);

  const getLevelName = (levelId: string) => {
    const level = allLevels.find((l) => l.id === levelId);
    return level ? level.name : levelId.replace('level-', 'Level ');
  };

  return (
    <div className="relative min-h-screen text-text-primary">
      <NeuralBackdrop />

      <motion.div
        className="relative z-10 mx-auto max-w-4xl px-4 py-8 md:px-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <ScreenHeader
          title="Leaderboard"
          subtitle="Global rankings by accuracy"
          onBack={() => setScreen('mainMenu')}
          backLabel="Main Menu"
        />

        {/* Filters */}
        <div className="mt-6 flex flex-wrap gap-3">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-dim">Level</label>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="rounded-lg border border-border-subtle bg-bg-app px-3 py-2 text-sm text-text-primary focus:border-neural-blue focus:outline-none"
            >
              <option value="all">All Levels</option>
              {allLevels.map((lvl) => (
                <option key={lvl.id} value={lvl.id}>
                  {lvl.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-dim">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'accuracy' | 'loss' | 'date')}
              className="rounded-lg border border-border-subtle bg-bg-app px-3 py-2 text-sm text-text-primary focus:border-neural-blue focus:outline-none"
            >
              <option value="accuracy">Accuracy</option>
              <option value="loss">Loss</option>
              <option value="date">Date</option>
            </select>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="mt-6 overflow-hidden rounded-xl border border-border-subtle bg-bg-elevated/60">
          {filteredScores.length === 0 ? (
            <div className="py-12 text-center">
              <svg className="mx-auto mb-3 h-12 w-12 text-text-dim" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 15v3m0 0l-3-3m3 3l3-3M12 3v7m0 0l-3 3m3-3l3 3" />
              </svg>
              <p className="text-sm text-text-secondary">No scores recorded yet. Complete a puzzle to appear here!</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-bg-panel">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-neural-yellow">Rank</th>
                  <th className="px-4 py-3 text-left font-semibold text-neural-blue">Player</th>
                  <th className="px-4 py-3 text-left font-semibold text-neural-green">Level</th>
                  <th className="px-4 py-3 text-left font-semibold text-text-secondary">Accuracy</th>
                  <th className="px-4 py-3 text-left font-semibold text-neural-red">Loss</th>
                  <th className="px-4 py-3 text-left font-semibold text-text-dim">Architecture</th>
                </tr>
              </thead>
              <tbody>
                {filteredScores.slice(0, 50).map((entry, index) => (
                  <motion.tr
                    key={`${entry.levelId}-${entry.timestamp}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className={`border-t border-border-subtle/50 transition-colors hover:bg-neural-blue/5 ${
                      index < 3 ? 'bg-neural-yellow/5' : ''
                    }`}
                  >
                    <td className="px-4 py-3">
                      <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                        index === 0 ? 'bg-neural-yellow/20 text-neural-yellow' :
                        index === 1 ? 'bg-gray-300/20 text-gray-300' :
                        index === 2 ? 'bg-neural-orange/20 text-neural-orange' :
                        'bg-border-subtle text-text-dim'
                      }`}>
                        {index + 1}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-text-primary">{entry.playerName}</td>
                    <td className="px-4 py-3 text-text-secondary">{getLevelName(entry.levelId)}</td>
                    <td className="px-4 py-3 font-mono text-neural-green">{(entry.accuracy * 100).toFixed(2)}%</td>
                    <td className="px-4 py-3 font-mono text-neural-red">{entry.loss.toFixed(4)}</td>
                    <td className="px-4 py-3 text-xs text-text-dim">
                      {entry.layersCount} layers · {entry.networkSize} params
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Stats */}
        {filteredScores.length > 0 && (
          <div className="mt-6 grid grid-cols-3 gap-4 text-center">
            <div className="rounded-lg border border-border-subtle bg-bg-elevated/40 p-3">
              <p className="text-2xl font-bold text-neural-blue">{scores.length}</p>
              <p className="text-xs text-text-dim">Total Attempts</p>
            </div>
            <div className="rounded-lg border border-border-subtle bg-bg-elevated/40 p-3">
              <p className="text-2xl font-bold text-neural-green">
                {scores.filter((s) => s.accuracy >= 0.9).length}
              </p>
              <p className="text-xs text-text-dim">90%+ Accuracy Runs</p>
            </div>
            <div className="rounded-lg border border-border-subtle bg-bg-elevated/40 p-3">
              <p className="text-2xl font-bold text-neural-purple">
                {scores.reduce((max, s) => Math.max(max, s.networkSize), 0)}
              </p>
              <p className="text-xs text-text-dim">Max Network Size</p>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Leaderboard;
