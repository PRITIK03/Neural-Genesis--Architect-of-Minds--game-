import React from 'react';
import { motion } from 'framer-motion';
import * as Tooltip from '@radix-ui/react-tooltip';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, ZAxis, Cell } from 'recharts';
import { useAppStore } from '../stores/appStore';
import { useNetworkStore } from '../stores/networkStore';
import levels from '../lib/levels';
import { NeuralBackdrop } from '../components/NeuralBackdrop';
import { ScreenHeader } from '../components/ScreenHeader';
import { isLevelUnlocked, loadProgress, visitMode } from '../lib/playerProgress';

const CampaignMap: React.FC = () => {
  const setScreen = useAppStore((state) => state.setScreen);
  const setCurrentLevel = useNetworkStore((state) => state.setCurrentLevel);
  const progress = loadProgress();

  const rows = [['level-1'], ['level-2', 'level-3'], ['level-4', 'level-5'], ['level-6', 'level-7']];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const itemVariants = {
    hidden: { scale: 0.85, opacity: 0 },
    visible: { scale: 1, opacity: 1 },
  };

  return (
    <Tooltip.Provider delayDuration={200}>
      <div className="relative min-h-screen overflow-hidden px-4 py-8 text-text-primary md:px-10 md:py-10">
        <NeuralBackdrop />

        <div className="relative z-10 mx-auto max-w-4xl">
          <ScreenHeader
            title="Campaign"
            subtitle="Clear nodes in order. Each puzzle teaches a neural network idea—from gates to convolutions."
            onBack={() => setScreen('mainMenu')}
            backLabel="Main menu"
            right={
              <div className="rounded-xl border border-border-subtle bg-bg-elevated/80 px-4 py-2 text-right text-xs backdrop-blur-md">
                <div className="text-text-secondary">XP</div>
                <div className="text-lg font-bold text-neural-blue">{progress.xp}</div>
              </div>
            }
          />

          <motion.div
            className="panel-card p-6 md:p-8"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <motion.div className="space-y-10" variants={containerVariants} initial="hidden" animate="visible">
              {rows.map((row, rowIndex) => (
                <div key={rowIndex}>
                  <p className="mb-4 text-center text-xs font-semibold uppercase tracking-widest text-text-dim">
                    Stage {rowIndex + 1}
                  </p>
                  <div className="flex flex-wrap justify-center gap-8 md:gap-12">
                    {row.map((levelId) => {
                      const level = levels.find((l) => l.id === levelId);
                      const levelNumber = level ? parseInt(level.id.split('-')[1], 10) : 0;
                      const unlocked = level ? isLevelUnlocked(level) : false;
                      const done = !!progress.completedLevels[levelId];

                      return (
                        <Tooltip.Root key={levelId}>
                          <Tooltip.Trigger asChild>
                            <motion.button
                              type="button"
                              disabled={!unlocked}
                              className={`relative flex h-20 w-20 items-center justify-center rounded-2xl border-2 text-lg font-bold shadow-lg transition-all md:h-[5.25rem] md:w-[5.25rem] ${
                                unlocked
                                  ? done
                                    ? 'border-neural-green/60 bg-neural-green/15 text-neural-green neon-glow'
                                    : 'border-neural-blue/50 bg-bg-elevated text-neural-blue neon-glow hover:border-neural-blue'
                                  : 'cursor-not-allowed border-border-subtle bg-bg-panel/80 text-text-dim opacity-60'
                              }`}
                              variants={itemVariants}
                              whileHover={unlocked ? { scale: 1.06 } : {}}
                              whileTap={unlocked ? { scale: 0.94 } : {}}
                              onClick={() => {
                                if (!unlocked || !level) return;
                                visitMode('campaign');
                                setCurrentLevel(levelId);
                                setScreen('network');
                              }}
                              aria-label={
                                unlocked
                                  ? `Level ${levelNumber} ${level?.name ?? ''}`
                                  : `Level ${levelNumber} locked`
                              }
                            >
                              {!unlocked && (
                                <span className="absolute inset-0 flex items-center justify-center text-2xl" aria-hidden>
                                  🔒
                                </span>
                              )}
                              <span className={unlocked ? '' : 'opacity-30'}>{levelNumber}</span>
                              {done && unlocked && (
                                <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-neural-green text-xs text-bg-app">
                                  ✓
                                </span>
                              )}
                            </motion.button>
                          </Tooltip.Trigger>
                          <Tooltip.Portal>
                            <Tooltip.Content
                              className="panel-card z-50 max-w-xs border-neural-blue/20 p-4 text-left shadow-2xl"
                              sideOffset={8}
                            >
                              <h3 className="text-base font-bold text-text-primary">{level?.name ?? levelId}</h3>
                              <p className="mt-1 text-xs text-text-secondary">{level?.description ?? 'No description'}</p>
                              {!unlocked && (
                                <p className="mt-2 text-xs font-medium text-neural-red">Complete prerequisites to unlock.</p>
                              )}
                              {level?.puzzleData && (
                                <div className="mt-3 space-y-2 border-t border-border-subtle pt-3">
                                  <div className="text-xs text-text-secondary">
                                    Tensor: {level.puzzleData.inputShape.join('×')} → {level.puzzleData.outputShape.join('×')}
                                  </div>
                                  <div className="text-xs text-text-secondary">
                                    Samples: {level.puzzleData.trainingData.length} · Target:{' '}
                                    {(level.puzzleData.accuracyThreshold * 100).toFixed(0)}%+ accuracy
                                  </div>
                                  {level.puzzleData.inputShape[0] === 2 &&
                                    level.puzzleData.outputShape[0] === 1 &&
                                    level.puzzleData.trainingData.length > 0 && (
                                      <div className="h-20 w-full pt-1">
                                        <ResponsiveContainer width="100%" height="100%">
                                          <ScatterChart margin={{ top: 4, right: 4, left: 4, bottom: 4 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                                            <XAxis type="number" dataKey="x" domain={[0, 1]} stroke="var(--text-secondary)" tick={{ fontSize: 10 }} />
                                            <YAxis type="number" dataKey="y" domain={[0, 1]} stroke="var(--text-secondary)" tick={{ fontSize: 10 }} />
                                            <ZAxis type="number" dataKey="z" range={[60, 60]} />
                                            <Scatter
                                              name="samples"
                                              data={level.puzzleData.trainingData.map((d) => ({
                                                x: d.input[0],
                                                y: d.input[1],
                                                z: d.output[0],
                                              }))}
                                              dataKey="y"
                                            >
                                              {level.puzzleData.trainingData.map((d, i) => (
                                                <Cell
                                                  key={i}
                                                  fill={d.output[0] > 0.5 ? 'var(--neural-green)' : 'var(--neural-red)'}
                                                />
                                              ))}
                                            </Scatter>
                                          </ScatterChart>
                                        </ResponsiveContainer>
                                      </div>
                                    )}
                                </div>
                              )}
                              <Tooltip.Arrow className="fill-bg-elevated" />
                            </Tooltip.Content>
                          </Tooltip.Portal>
                        </Tooltip.Root>
                      );
                    })}
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </Tooltip.Provider>
  );
};

export default CampaignMap;
