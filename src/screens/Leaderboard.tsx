import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../stores/appStore';

interface ScoreEntry {
  playerName: string;
  levelId: string;
  accuracy: number;
  loss: number;
  timestamp: number;
  networkSize: number;
}

const Leaderboard: React.FC = () => {
  const setScreen = useAppStore((state) => state.setScreen);
  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [filter, setFilter] = useState<'all' | 'global' | 'personal'>('all');

  useEffect(() => {
    // Load scores from localStorage (in a real app, this would be from a backend)
    const storedScores = localStorage.getItem('neuropuzzle-scores');
    if (storedScores) {
      setScores(JSON.parse(storedScores));
    }
  }, []);

  const filteredScores = scores
    .filter(score => {
      if (filter === 'personal') {
        return score.playerName === 'Player'; // In a real app, get from user auth
      }
      return true;
    })
    .sort((a, b) => b.accuracy - a.accuracy)
    .slice(0, 50); // Top 50

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0: return '🥇';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return `#${index + 1}`;
    }
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-b from-bg-app to-bg-panel text-text-primary p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="max-w-4xl mx-auto"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <motion.button
          onClick={() => setScreen('mainMenu')}
          className="mb-6 bg-neural-blue hover:bg-neural-blue text-bg-app px-4 py-2 rounded-lg neon-glow transition-all duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          ← Back to Main Menu
        </motion.button>

        <motion.h1
          className="text-4xl font-bold mb-8 text-center text-neural-blue"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          🏆 Leaderboard 🏆
        </motion.h1>

        <motion.div
          className="flex justify-center mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex space-x-2 glass p-2 rounded-lg">
            {(['all', 'global', 'personal'] as const).map((filterOption) => (
              <motion.button
                key={filterOption}
                onClick={() => setFilter(filterOption)}
                className={`px-4 py-2 rounded-lg capitalize transition-all duration-300 ${
                  filter === filterOption
                    ? 'bg-neural-blue text-bg-app'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {filterOption === 'all' ? 'All Time' : filterOption === 'global' ? 'Global' : 'Personal'}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {filteredScores.length === 0 ? (
          <motion.div
            className="glass p-8 rounded-lg text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <p className="text-xl text-text-secondary">No scores yet!</p>
            <p className="text-sm text-text-secondary mt-2">Complete some levels to see your rankings here.</p>
          </motion.div>
        ) : (
          <motion.div
            className="space-y-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            {filteredScores.map((score, index) => (
              <motion.div
                key={`${score.playerName}-${score.timestamp}`}
                className="glass p-4 rounded-lg flex items-center justify-between"
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.8 + index * 0.05 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center space-x-4">
                  <div className="text-2xl font-bold text-neural-purple w-12 text-center">
                    {getRankIcon(index)}
                  </div>
                  <div>
                    <p className="font-semibold text-neural-blue">{score.playerName}</p>
                    <p className="text-sm text-text-secondary">Level {score.levelId.split('-')[1]}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-neural-green">{(score.accuracy * 100).toFixed(1)}% Accuracy</p>
                  <p className="text-sm text-text-secondary">Loss: {score.loss.toFixed(4)}</p>
                  <p className="text-sm text-text-secondary">Network: {score.networkSize} neurons</p>
                </div>
                <div className="text-sm text-text-secondary">
                  {new Date(score.timestamp).toLocaleDateString()}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        <motion.div
          className="mt-8 glass p-6 rounded-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <h2 className="text-xl font-semibold mb-4 text-neural-purple">How Rankings Work</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <h3 className="font-semibold text-neural-blue mb-2">🏆 Top Performers</h3>
              <p className="text-text-secondary">Ranked by highest accuracy achieved on each level.</p>
            </div>
            <div>
              <h3 className="font-semibold text-neural-blue mb-2">🧠 Network Efficiency</h3>
              <p className="text-text-secondary">Bonus points for smaller, more efficient networks.</p>
            </div>
            <div>
              <h3 className="font-semibold text-neural-blue mb-2">⚡ Speed Bonus</h3>
              <p className="text-text-secondary">Faster training times earn additional ranking points.</p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default Leaderboard;