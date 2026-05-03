import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../stores/appStore';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
}

interface PlayerStats {
  xp: number;
  level: number;
  totalLevelsCompleted: number;
  averageAccuracy: number;
  bestAccuracy: number;
  totalTrainingTime: number;
  unlockedThemes: string[];
  unlockedCosmetics: string[];
}

const ProfileAchievements: React.FC = () => {
  const setScreen = useAppStore((state) => state.setScreen);
  const [stats, setStats] = useState<PlayerStats>({
    xp: 0,
    level: 1,
    totalLevelsCompleted: 0,
    averageAccuracy: 0,
    bestAccuracy: 0,
    totalTrainingTime: 0,
    unlockedThemes: ['default'],
    unlockedCosmetics: ['default'],
  });

  const [achievements] = useState<Achievement[]>([
    {
      id: 'first-level',
      name: 'First Steps',
      description: 'Complete your first level',
      icon: '🎯',
      unlocked: false,
      progress: 0,
      maxProgress: 1,
    },
    {
      id: 'accuracy-master',
      name: 'Accuracy Master',
      description: 'Achieve 95% accuracy on any level',
      icon: '🎯',
      unlocked: false,
      progress: 0,
      maxProgress: 1,
    },
    {
      id: 'network-architect',
      name: 'Network Architect',
      description: 'Build networks with 5+ layers',
      icon: '🏗️',
      unlocked: false,
      progress: 0,
      maxProgress: 1,
    },
    {
      id: 'speed-demon',
      name: 'Speed Demon',
      description: 'Complete 10 levels',
      icon: '⚡',
      unlocked: false,
      progress: 0,
      maxProgress: 10,
    },
    {
      id: 'perfectionist',
      name: 'Perfectionist',
      description: 'Get 3 stars on 5 levels',
      icon: '⭐',
      unlocked: false,
      progress: 0,
      maxProgress: 5,
    },
    {
      id: 'explorer',
      name: 'Explorer',
      description: 'Try all game modes',
      icon: '🗺️',
      unlocked: false,
      progress: 0,
      maxProgress: 4, // Campaign, Sandbox, Daily, Custom
    },
  ]);

  useEffect(() => {
    // Load stats from localStorage
    const storedStats = localStorage.getItem('neuropuzzle-player-stats');
    if (storedStats) {
      setStats(JSON.parse(storedStats));
    }
  }, []);

  const getXpForNextLevel = (currentLevel: number) => currentLevel * 1000;
  const currentLevelXp = stats.xp - ((stats.level - 1) * 1000);
  const nextLevelXp = getXpForNextLevel(stats.level);

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-b from-bg-app to-bg-panel text-text-primary p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="max-w-6xl mx-auto"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <motion.button
          onClick={() => setScreen('main')}
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
          👤 Player Profile 👤
        </motion.h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Player Stats */}
          <motion.div
            className="lg:col-span-1"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <div className="glass p-6 rounded-lg mb-6">
              <h2 className="text-2xl font-semibold mb-4 text-neural-purple">Player Stats</h2>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="w-20 h-20 bg-neural-blue rounded-full mx-auto flex items-center justify-center text-2xl mb-2">
                    🧠
                  </div>
                  <p className="text-lg font-semibold">Level {stats.level}</p>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>XP Progress</span>
                    <span>{currentLevelXp}/{nextLevelXp}</span>
                  </div>
                  <div className="w-full bg-bg-elevated rounded-full h-3">
                    <motion.div
                      className="bg-neural-green h-3 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${(currentLevelXp / nextLevelXp) * 100}%` }}
                      transition={{ delay: 0.8, duration: 1 }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-text-secondary">Total XP</p>
                    <p className="font-bold text-neural-blue">{stats.xp.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-text-secondary">Levels Completed</p>
                    <p className="font-bold text-neural-green">{stats.totalLevelsCompleted}</p>
                  </div>
                  <div>
                    <p className="text-text-secondary">Best Accuracy</p>
                    <p className="font-bold text-neural-yellow">{(stats.bestAccuracy * 100).toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-text-secondary">Avg Accuracy</p>
                    <p className="font-bold text-neural-purple">{(stats.averageAccuracy * 100).toFixed(1)}%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Unlocked Cosmetics */}
            <div className="glass p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 text-neural-purple">Unlocked Cosmetics</h3>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-text-secondary mb-2">Themes</p>
                  <div className="flex flex-wrap gap-2">
                    {stats.unlockedThemes.map((theme) => (
                      <span key={theme} className="px-2 py-1 bg-neural-blue text-bg-app text-xs rounded-full">
                        {theme}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-text-secondary mb-2">Node Styles</p>
                  <div className="flex flex-wrap gap-2">
                    {stats.unlockedCosmetics.map((cosmetic) => (
                      <span key={cosmetic} className="px-2 py-1 bg-neural-purple text-bg-app text-xs rounded-full">
                        {cosmetic}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Achievements */}
          <motion.div
            className="lg:col-span-2"
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <div className="glass p-6 rounded-lg">
              <h2 className="text-2xl font-semibold mb-6 text-neural-purple">🏆 Achievements</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achievements.map((achievement, index) => (
                  <motion.div
                    key={achievement.id}
                    className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                      achievement.unlocked
                        ? 'border-neural-green bg-neural-green/10'
                        : 'border-border-subtle bg-bg-elevated'
                    }`}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`text-2xl ${achievement.unlocked ? '' : 'grayscale opacity-50'}`}>
                        {achievement.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className={`font-semibold ${achievement.unlocked ? 'text-neural-green' : 'text-text-secondary'}`}>
                          {achievement.name}
                        </h3>
                        <p className="text-sm text-text-secondary mb-2">{achievement.description}</p>
                        {!achievement.unlocked && (
                          <div>
                            <div className="flex justify-between text-xs text-text-secondary mb-1">
                              <span>Progress</span>
                              <span>{achievement.progress}/{achievement.maxProgress}</span>
                            </div>
                            <div className="w-full bg-bg-panel rounded-full h-2">
                              <div
                                className="bg-neural-blue h-2 rounded-full transition-all duration-300"
                                style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <motion.div
              className="glass p-6 rounded-lg mt-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
            >
              <h3 className="text-lg font-semibold mb-4 text-neural-purple">Recent Activity</h3>
              <div className="space-y-2 text-sm text-text-secondary">
                <p>🎯 Completed Level 3: Three-Way Classification</p>
                <p>🏆 Earned "First Steps" achievement</p>
                <p>⭐ Got 3 stars on XOR Gate</p>
                <p>⚡ Fastest training time: 45 seconds</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ProfileAchievements;