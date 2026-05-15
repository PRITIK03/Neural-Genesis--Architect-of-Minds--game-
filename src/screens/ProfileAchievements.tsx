import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../stores/appStore';
import { NeuralBackdrop } from '../components/NeuralBackdrop';
import { ScreenHeader } from '../components/ScreenHeader';
import { AchievementGrid } from '../components/Achievements/AchievementBadge';
import { loadProgress } from '../lib/playerProgress';

const item = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const ACHIEVEMENTS = [
  {
    id: 'first-level',
    name: 'First Spark',
    description: 'Clear any campaign node',
    icon: '⚡',
    rarity: 'common' as const,
  },
  {
    id: 'accuracy-master',
    name: 'Precision',
    description: 'Reach ≥95% accuracy',
    icon: '🎯',
    rarity: 'rare' as const,
  },
  {
    id: 'deep-network',
    name: 'Deep Stack',
    description: 'Build 5+ layer network',
    icon: '🏗️',
    rarity: 'uncommon' as const,
  },
  {
    id: 'speed-demon',
    name: 'Lightning',
    description: 'Train in under 10 epochs',
    icon: '⚡',
    rarity: 'rare' as const,
  },
  {
    id: 'perfectionist',
    name: 'Perfect',
    description: '100% training accuracy',
    icon: '⭐',
    rarity: 'epic' as const,
  },
  {
    id: 'explorer',
    name: 'Explorer',
    description: 'Try all game modes',
    icon: '🗺️',
    rarity: 'common' as const,
  },
  {
    id: 'architect',
    name: 'Architect',
    description: 'Save 5 custom models',
    icon: '📐',
    rarity: 'rare' as const,
  },
  {
    id: 'persistent',
    name: 'Streak',
    description: '7 day login streak',
    icon: '🔥',
    rarity: 'epic' as const,
  },
  {
    id: 'legend',
    name: 'Neural Legend',
    description: 'Top 10 on leaderboard',
    icon: '👑',
    rarity: 'legendary' as const,
  },
];

const ProfileAchievements: React.FC = () => {
  const setScreen = useAppStore((state) => state.setScreen);
  const stats = useMemo(() => {
    const progress = loadProgress();
    const scores = JSON.parse(localStorage.getItem('neuropuzzle-scores') || '[]') as any[];
    const maxLayers = Number(localStorage.getItem('neuropuzzle-max-layers') || '0');

    return {
      xp: progress.xp,
      stars: progress.stars,
      cleared: Object.keys(progress.completedLevels).length,
      bestAcc: scores.length ? Math.max(...scores.map((s) => s.accuracy)) : 0,
      avgAcc: scores.length ? scores.reduce((sum, s) => sum + s.accuracy, 0) / scores.length : 0,
      maxLayers,
    };
  }, []);

  const level = Math.max(1, Math.floor(stats.xp / 1000) + 1);
  const xpInLevel = stats.xp % 1000;
  const xpPct = (xpInLevel / 1000) * 100;

  const unlockedAchievements = JSON.parse(localStorage.getItem('neuropuzzle-achievements') || '[]') as string[];
  const unlockedCount = unlockedAchievements.length;
  const totalCount = ACHIEVEMENTS.length;

  return (
    <div className="relative min-h-screen px-4 py-10 text-text-primary md:px-10">
      <NeuralBackdrop />

      <div className="relative z-10 mx-auto max-w-6xl">
        <ScreenHeader
          title="Profile"
          subtitle="Track your neural network mastery"
          onBack={() => setScreen('mainMenu')}
          backLabel="Main menu"
        />

        {/* Stats Overview */}
        <motion.div
          className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ staggerChildren: 0.05 }}
        >
          {[
            { label: 'Level', value: `Lv. ${level}`, color: 'neural-blue' },
            { label: 'Total XP', value: stats.xp.toLocaleString(), color: 'neural-purple' },
            { label: 'Cleared', value: `${stats.cleared}`, color: 'neural-green' },
            { label: 'Stars', value: `${stats.stars}`, color: 'neural-yellow' },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              variants={item}
              className="rounded-xl border border-border-subtle bg-bg-elevated/60 p-4 text-center"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-text-dim">{stat.label}</p>
              <p className={`mt-1 text-2xl font-bold ${stat.color === 'neural-blue' ? 'text-neural-blue'
                : stat.color === 'neural-purple' ? 'text-neural-purple'
                : stat.color === 'neural-green' ? 'text-neural-green'
                : 'text-neural-yellow'
              }`}>{stat.value}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* XP Progress */}
        <motion.div
          className="mt-6 rounded-xl border border-border-subtle bg-bg-elevated/60 p-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Progress to next level</span>
            <span className="font-mono text-neural-blue">{xpInLevel} / 1000 XP</span>
          </div>
          <div className="mt-2 h-3 overflow-hidden rounded-full bg-bg-panel">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-neural-green to-neural-blue"
              initial={{ width: 0 }}
              animate={{ width: `${xpPct}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
        </motion.div>

        {/* Achievements Grid */}
        <div className="mt-8">
          <div className="flex items-center justify-between border-b border-border-subtle pb-3">
            <h2 className="text-xl font-semibold text-neural-blue">Achievements</h2>
            <p className="text-sm text-text-dim">
              <span className="font-bold text-neural-green">{unlockedCount}</span> / {totalCount} unlocked
            </p>
          </div>
          <div className="mt-6">
            <AchievementGrid />
          </div>
        </div>

        {/* Best Accuracy & Records */}
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
          <motion.div
            className="panel-card p-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="mb-4 text-lg font-semibold text-neural-purple">Records</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border border-border-subtle bg-bg-elevated/40 p-3">
                <div>
                  <p className="text-xs text-text-dim">Best Accuracy</p>
                  <p className="text-xl font-bold text-neural-green">{(stats.bestAcc * 100).toFixed(1)}%</p>
                </div>
                <span className="text-2xl">🎯</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border-subtle bg-bg-elevated/40 p-3">
                <div>
                  <p className="text-xs text-text-dim">Avg. Accuracy</p>
                  <p className="text-xl font-bold text-neural-blue">{(stats.avgAcc * 100).toFixed(1)}%</p>
                </div>
                <span className="text-2xl">📊</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border-subtle bg-bg-elevated/40 p-3">
                <div>
                  <p className="text-xs text-text-dim">Max Network Size</p>
                  <p className="text-xl font-bold text-neural-yellow">{stats.maxLayers} layers</p>
                </div>
                <span className="text-2xl">🏗️</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="panel-card p-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35 }}
          >
            <h3 className="mb-4 text-lg font-semibold text-neural-purple">Quick Stats</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                { label: 'Campaign Levels', value: stats.cleared, icon: '🗺️' },
                { label: 'Stars Earned', value: stats.stars, icon: '⭐' },
                { label: 'Runs Logged', value: Math.min(5, (() => { try { return JSON.parse(localStorage.getItem('neuropuzzle-scores') || '[]').length } catch { return 0 } })()), icon: '📝' },
                { label: 'Account Age', value: '?', icon: '📅' },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center gap-2 rounded-lg border border-border-subtle bg-bg-elevated/40 p-3">
                  <span className="text-lg">{stat.icon}</span>
                  <div>
                    <p className="text-xs text-text-dim">{stat.label}</p>
                    <p className="font-bold text-text-primary">{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

const item = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default ProfileAchievements;
