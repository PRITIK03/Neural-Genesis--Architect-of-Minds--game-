import React from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../stores/appStore';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-train',
    name: 'First Spark',
    description: 'Train your first neural network',
    icon: '⚡',
    rarity: 'common',
  },
  {
    id: 'sharp-mind',
    name: 'Sharp Mind',
    description: 'Complete a level with 100% accuracy',
    icon: '🎯',
    rarity: 'rare',
  },
  {
    id: 'layer-stack',
    name: 'Deep Stack',
    description: 'Build a network with 10+ layers',
    icon: '🏗️',
    rarity: 'uncommon',
  },
  {
    id: 'conqueror',
    name: 'Act I Conqueror',
    description: 'Complete all Foundation levels',
    icon: '🏆',
    rarity: 'epic',
  },
  {
    id: 'speed-demon',
    name: 'Lightning Fast',
    description: 'Train a network in under 10 epochs',
    icon: '⚡',
    rarity: 'rare',
  },
  {
    id: 'overfitter',
    name: 'Overfitting Expert',
    description: 'Achieve 100% training accuracy',
    icon: '🎓',
    rarity: 'uncommon',
  },
  {
    id: 'explorer',
    name: 'Curious Explorer',
    description: 'Try all datasets in Sandbox mode',
    icon: '🧭',
    rarity: 'common',
  },
  {
    id: 'architect',
    name: 'Master Architect',
    description: 'Create and save 5 custom models',
    icon: '📐',
    rarity: 'rare',
  },
  {
    id: 'persistent',
    name: 'Persistent Learner',
    description: 'Log in 7 days in a row',
    icon: '🔥',
    rarity: 'epic',
  },
  {
    id: 'legend',
    name: 'Neural Legend',
    description: 'Top 10 on the leaderboard',
    icon: '👑',
    rarity: 'legendary',
  },
];

export const AchievementBadge: React.FC<{ achievement: Achievement; size?: 'sm' | 'md' | 'lg' }> = ({
  achievement,
  size = 'md',
}) => {
  const isUnlocked = !!achievement.unlockedAt;

  const rarityColors = {
    common: 'border-gray-500 bg-gray-500/20',
    uncommon: 'border-neural-green bg-neural-green/20',
    rare: 'border-neural-blue bg-neural-blue/20',
    epic: 'border-neural-purple bg-neural-purple/20',
    legendary: 'border-neural-yellow bg-neural-yellow/20',
  };

  const sizeClasses = {
    sm: 'w-12 h-12 text-lg',
    md: 'w-16 h-16 text-2xl',
    lg: 'w-20 h-20 text-3xl',
  };

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.05 }}
      className={`relative flex flex-col items-center gap-1 rounded-xl border-2 ${
        isUnlocked ? rarityColors[achievement.rarity] : 'border-border-subtle bg-bg-elevated/40 opacity-60 grayscale'
      } p-2 text-center transition-all`}
      title={`${achievement.name}: ${achievement.description}`}
    >
      <span className={sizeClasses[size]}>{achievement.icon}</span>
      <span className="text-[10px] leading-tight font-medium text-text-secondary">{achievement.name}</span>
      {isUnlocked && (
        <div className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-neural-green animate-pulse" />
      )}
    </motion.div>
  );
};

export const AchievementGrid: React.FC = () => {
  // In real app, load from localStorage
  const unlockedAchievements = JSON.parse(localStorage.getItem('neuropuzzle-achievements') || '[]') as string[];

  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
      {ACHIEVEMENTS.map((achievement) => (
        <AchievementBadge
          key={achievement.id}
          achievement={{
            ...achievement,
            unlockedAt: unlockedAchievements.includes(achievement.id) ? Date.now() : undefined,
          }}
          size="md"
        />
      ))}
    </div>
  );
};
