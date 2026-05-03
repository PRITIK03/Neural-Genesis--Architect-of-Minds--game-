import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useAppStore } from '../stores/appStore';
import { useNetworkStore } from '../stores/networkStore';
import levels from '../lib/levels';

const ResultsScreen: React.FC = () => {
  const setScreen = useAppStore((state) => state.setScreen);
  const { currentLevelId, customPuzzle, loss, accuracy, layers } = useNetworkStore();

  const level = levels.find(l => l.id === currentLevelId) || null;
  const threshold = level?.puzzleData.accuracyThreshold ?? customPuzzle?.accuracyThreshold ?? 0;
  const title = level?.name ?? customPuzzle?.name ?? 'Puzzle';
  const description = level?.description ?? customPuzzle?.description ?? '';

  useEffect(() => {
    if (accuracy >= threshold) {
      // Trigger confetti celebration
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      // Save score to leaderboard
      const scoreEntry = {
        playerName: 'Player', // In a real app, get from user auth
        levelId: currentLevelId,
        accuracy,
        loss,
        timestamp: Date.now(),
        networkSize: layers.reduce((sum, l) => sum + (l.config.units || l.config.filters || 0), 0),
      };

      const existingScores = JSON.parse(localStorage.getItem('neuropuzzle-scores') || '[]');
      existingScores.push(scoreEntry);
      localStorage.setItem('neuropuzzle-scores', JSON.stringify(existingScores));
    }
  }, [accuracy, threshold, currentLevelId, loss, layers]);

  const isSuccess = accuracy >= threshold;
  const stars = isSuccess ? Math.min(3, Math.floor((accuracy * 3) / Math.max(threshold, 1e-6))) : 0;

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-b from-bg-app to-bg-panel text-text-primary flex flex-col items-center justify-center p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="glass p-8 rounded-lg max-w-2xl w-full text-center"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <motion.h1
          className={`text-4xl font-bold mb-4 ${isSuccess ? 'text-neural-green' : 'text-neural-red'}`}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {isSuccess ? '🎉 Level Complete! 🎉' : '❌ Level Failed'}
        </motion.h1>

        <motion.div
          className="mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <h2 className="text-2xl font-semibold text-neural-blue mb-2">{title}</h2>
          <p className="text-text-secondary">{description}</p>
        </motion.div>

        <motion.div
          className="grid grid-cols-2 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <div className="glass p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-neural-purple mb-2">Performance</h3>
            <p className="text-sm text-text-secondary">Accuracy: <span className="text-neural-green font-bold">{accuracy.toFixed(4)}</span></p>
            <p className="text-sm text-text-secondary">Loss: <span className="text-neural-red font-bold">{loss.toFixed(4)}</span></p>
            <p className="text-sm text-text-secondary">Threshold: <span className="font-bold">{threshold}</span></p>
          </div>
          <div className="glass p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-neural-purple mb-2">Network Stats</h3>
            <p className="text-sm text-text-secondary">Layers: <span className="font-bold">{layers.length}</span></p>
            <p className="text-sm text-text-secondary">Total Neurons: <span className="font-bold">{layers.reduce((sum, l) => sum + (l.config.units || l.config.filters || 0), 0)}</span></p>
            <p className="text-sm text-text-secondary">Complexity: <span className="font-bold">Medium</span></p>
          </div>
        </motion.div>

        {isSuccess && (
          <motion.div
            className="mb-8"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1, type: 'spring', stiffness: 200 }}
          >
            <h3 className="text-xl font-semibold text-neural-yellow mb-4">Stars Earned</h3>
            <div className="flex justify-center space-x-2">
              {[1, 2, 3].map((star) => (
                <motion.div
                  key={star}
                  className={`text-4xl ${star <= stars ? 'text-neural-yellow' : 'text-text-secondary'}`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1 + star * 0.1, type: 'spring' }}
                >
                  ⭐
                </motion.div>
              ))}
            </div>
            <p className="text-sm text-text-secondary mt-2">
              XP Earned: +{level?.rewards.xp || 0} | Stars: +{level?.rewards.stars || 0}
            </p>
          </motion.div>
        )}

        <motion.div
          className="flex space-x-4 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
        >
          <motion.button
            onClick={() => setScreen('campaign')}
            className="bg-neural-blue hover:bg-neural-blue text-bg-app px-6 py-3 rounded-lg neon-glow transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Back to Campaign
          </motion.button>
          {!isSuccess && (
            <motion.button
              onClick={() => setScreen('network')}
              className="bg-neural-green hover:bg-neural-green text-bg-app px-6 py-3 rounded-lg transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Try Again
            </motion.button>
          )}
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default ResultsScreen;