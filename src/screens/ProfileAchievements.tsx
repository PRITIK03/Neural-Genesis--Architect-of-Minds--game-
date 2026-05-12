import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../stores/appStore';
import { NeuralBackdrop } from '../components/NeuralBackdrop';
import { ScreenHeader } from '../components/ScreenHeader';
import { loadProgress } from '../lib/playerProgress';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
}

interface ScoreEntry {
  accuracy: number;
  timestamp: number;
  levelId: string;
}

const ProfileAchievements: React.FC = () => {
  const setScreen = useAppStore((state) => state.setScreen);

  const { stats, achievements, activityLines } = useMemo(() => {
    const progress = loadProgress();
    const scores: ScoreEntry[] = (() => {
      try {
        return JSON.parse(localStorage.getItem('neuropuzzle-scores') || '[]') as ScoreEntry[];
      } catch {
        return [];
      }
    })();

    const completed = Object.keys(progress.completedLevels).length;
    const maxAcc = scores.reduce((m, s) => Math.max(m, s.accuracy), 0);
    const maxLayersSaved = Number(localStorage.getItem('neuropuzzle-max-layers') || '0');
    const modes = progress.modesVisited || {};
    const modeCount = ['campaign', 'sandbox', 'daily', 'custom'].filter((k) => modes[k as keyof typeof modes]).length;

    const achievementList: Achievement[] = [
      {
        id: 'first-level',
        name: 'First synapse',
        description: 'Clear any campaign node once.',
        icon: '🎯',
        unlocked: completed >= 1,
        progress: Math.min(completed, 1),
        maxProgress: 1,
      },
      {
        id: 'accuracy-master',
        name: 'Precision pulse',
        description: 'Reach ≥95% accuracy on any logged run.',
        icon: '📈',
        unlocked: maxAcc >= 0.95,
        progress: maxAcc >= 0.95 ? 1 : 0,
        maxProgress: 1,
      },
      {
        id: 'network-architect',
        name: 'Deep stack',
        description: 'Finish a successful run with 5+ layers recorded.',
        icon: '🏗️',
        unlocked: maxLayersSaved >= 5,
        progress: Math.min(maxLayersSaved, 5),
        maxProgress: 5,
      },
      {
        id: 'speed-demon',
        name: 'Campaign marathon',
        description: 'Clear five campaign nodes.',
        icon: '⚡',
        unlocked: completed >= 5,
        progress: Math.min(completed, 5),
        maxProgress: 5,
      },
      {
        id: 'perfectionist',
        name: 'Constellation',
        description: 'Collect 15 cumulative stars from campaign clears.',
        icon: '⭐',
        unlocked: progress.stars >= 15,
        progress: Math.min(progress.stars, 15),
        maxProgress: 15,
      },
      {
        id: 'explorer',
        name: 'Multimodal',
        description: 'Visit Campaign, Sandbox, Daily, and Custom flows.',
        icon: '🗺️',
        unlocked: modeCount >= 4,
        progress: modeCount,
        maxProgress: 4,
      },
    ];

    const sortedScores = [...scores].sort((a, b) => b.timestamp - a.timestamp).slice(0, 4);
    const activityLines = sortedScores.map(
      (s) => `Logged ${(s.accuracy * 100).toFixed(1)}% · ${s.levelId.startsWith('custom-') ? 'Custom' : 'Campaign'} · ${new Date(s.timestamp).toLocaleDateString()}`
    );

    const statsBlock = {
      xp: progress.xp,
      level: Math.max(1, Math.floor(progress.xp / 1000) + 1),
      totalLevelsCompleted: completed,
      averageAccuracy: scores.length ? scores.reduce((sum, s) => sum + s.accuracy, 0) / scores.length : 0,
      bestAccuracy: maxAcc,
      stars: progress.stars,
      unlockedThemes: ['dark neon'],
      unlockedCosmetics: ['core nodes'],
    };

    return { stats: statsBlock, achievements: achievementList, activityLines };
  }, []);

  const nextLevelXp = stats.level * 1000;
  const levelFloorXp = (stats.level - 1) * 1000;
  const withinLevel = Math.min(Math.max(stats.xp - levelFloorXp, 0), nextLevelXp - levelFloorXp);
  const levelSpan = nextLevelXp - levelFloorXp || 1;
  const xpPct = (withinLevel / levelSpan) * 100;

  return (
    <div className="relative min-h-screen px-4 py-10 text-text-primary md:px-10">
      <NeuralBackdrop />

      <div className="relative z-10 mx-auto max-w-6xl">
        <ScreenHeader title="Profile" subtitle="XP accrues from first-time campaign clears. Achievements read local milestones." onBack={() => setScreen('mainMenu')} backLabel="Main menu" />

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <motion.div className="panel-card p-6 lg:col-span-1" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}>
            <div className="flex flex-col items-center text-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-neural-blue to-neural-purple text-3xl shadow-[0_0_40px_rgba(0,217,255,0.35)]">
                🧠
              </div>
              <p className="mt-4 text-sm uppercase tracking-[0.25em] text-text-dim">Neuro rank</p>
              <p className="text-3xl font-bold text-text-primary">Lv. {stats.level}</p>
            </div>

            <div className="mt-6">
              <div className="flex justify-between text-xs text-text-secondary">
                <span>Next breakpoint</span>
                <span className="font-mono text-neural-blue">
                  {stats.xp}/{nextLevelXp} XP
                </span>
              </div>
              <div className="mt-2 h-3 overflow-hidden rounded-full bg-bg-elevated">
                <motion.div className="h-full rounded-full bg-gradient-to-r from-neural-green to-neural-blue" initial={{ width: 0 }} animate={{ width: `${xpPct}%` }} transition={{ duration: 0.9 }} />
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
              <div className="rounded-xl border border-border-subtle bg-bg-elevated/60 p-3">
                <p className="text-xs text-text-dim">Total XP</p>
                <p className="font-bold text-neural-blue">{stats.xp.toLocaleString()}</p>
              </div>
              <div className="rounded-xl border border-border-subtle bg-bg-elevated/60 p-3">
                <p className="text-xs text-text-dim">Stars</p>
                <p className="font-bold text-neural-yellow">{stats.stars}</p>
              </div>
              <div className="rounded-xl border border-border-subtle bg-bg-elevated/60 p-3">
                <p className="text-xs text-text-dim">Clears</p>
                <p className="font-bold text-neural-green">{stats.totalLevelsCompleted}</p>
              </div>
              <div className="rounded-xl border border-border-subtle bg-bg-elevated/60 p-3">
                <p className="text-xs text-text-dim">Best acc.</p>
                <p className="font-bold text-neural-purple">{(stats.bestAccuracy * 100).toFixed(1)}%</p>
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-border-subtle bg-bg-elevated/40 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-text-dim">Avg accuracy (logged)</p>
              <p className="mt-1 text-2xl font-bold text-text-primary">{(stats.averageAccuracy * 100).toFixed(1)}%</p>
              <p className="mt-2 text-xs text-text-secondary">Across debrief entries stored locally.</p>
            </div>
          </motion.div>

          <motion.div className="space-y-6 lg:col-span-2" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}>
            <div className="panel-card p-6 md:p-8">
              <h2 className="text-xl font-semibold text-neural-purple">Achievements</h2>
              <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                {achievements.map((achievement, index) => (
                  <motion.div
                    key={achievement.id}
                    className={`rounded-2xl border p-4 transition-colors ${
                      achievement.unlocked ? 'border-neural-green/60 bg-neural-green/10' : 'border-border-subtle bg-bg-elevated/60'
                    }`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * index }}
                    whileHover={{ scale: 1.01 }}
                  >
                    <div className="flex gap-3">
                      <div className={`text-2xl ${achievement.unlocked ? '' : 'opacity-40 grayscale'}`}>{achievement.icon}</div>
                      <div className="flex-1">
                        <h3 className={`font-semibold ${achievement.unlocked ? 'text-neural-green' : 'text-text-secondary'}`}>{achievement.name}</h3>
                        <p className="text-xs text-text-secondary">{achievement.description}</p>
                        {!achievement.unlocked && (
                          <div className="mt-3">
                            <div className="flex justify-between text-[11px] text-text-dim">
                              <span>Progress</span>
                              <span>
                                {achievement.progress}/{achievement.maxProgress}
                              </span>
                            </div>
                            <div className="mt-1 h-2 overflow-hidden rounded-full bg-bg-panel">
                              <div
                                className="h-full rounded-full bg-neural-blue transition-all duration-500"
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

            <div className="panel-card p-6 md:p-8">
              <h3 className="text-lg font-semibold text-neural-purple">Recent telemetry</h3>
              {activityLines.length === 0 ? (
                <p className="mt-4 text-sm text-text-secondary">No runs logged yet—your debrief history will populate here.</p>
              ) : (
                <ul className="mt-4 space-y-3 text-sm text-text-secondary">
                  {activityLines.map((line, i) => (
                    <li key={i} className="rounded-xl border border-border-subtle bg-bg-elevated/50 px-4 py-3">
                      {line}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProfileAchievements;
