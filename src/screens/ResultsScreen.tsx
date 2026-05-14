import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import confetti from 'canvas-confetti';
import { useAppStore } from '../stores/appStore';
import { useNetworkStore } from '../stores/networkStore';
import levels from '../lib/levels';
import { NeuralBackdrop } from '../components/NeuralBackdrop';
import { recordLevelComplete } from '../lib/playerProgress';
import { WeightVisualization } from '../components/WeightVisualization';

type ResultsTab = 'summary' | 'weights' | 'history';

const ResultsScreen: React.FC = () => {
  const setScreen = useAppStore((state) => state.setScreen);
  const { currentLevelId, customPuzzle, currentMetrics, layers, trainingHistory, trainingSession } = useNetworkStore();
  const [activeTab, setActiveTab] = useState<ResultsTab>('summary');

  const level = levels.find((l) => l.id === currentLevelId) ?? null;
  const threshold = level?.puzzleData.accuracyThreshold ?? customPuzzle?.accuracyThreshold ?? 0;
  const accuracy = currentMetrics.accuracy;
  const loss = currentMetrics.loss;
  const title = level?.name ?? customPuzzle?.name ?? 'Puzzle';
  const description = level?.description ?? customPuzzle?.description ?? '';

  const isSuccess = accuracy >= threshold;
  const stars = isSuccess
    ? Math.min(3, Math.max(1, Math.ceil((accuracy / Math.max(threshold, 1e-6)) * 3)))
    : 0;

  const persistedRef = useRef(false);

  useEffect(() => {
    if (!isSuccess || persistedRef.current) return;
    persistedRef.current = true;

    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#00D9FF', '#B800FF', '#00FF88', '#FFD700'],
    });

    const progressKey = currentLevelId ?? 'unknown';
    const rewards = level?.rewards ?? { xp: 50, stars: Math.max(stars, 1) };
    recordLevelComplete(progressKey, accuracy, rewards);

    // Save to local leaderboard
    const scoreEntry = {
      playerName: 'Player',
      levelId: progressKey,
      accuracy,
      loss,
      timestamp: Date.now(),
      networkSize: layers.reduce((sum, l) => sum + (l.config.units || l.config.filters || 0), 0),
      layersCount: layers.length,
    };
    const existingScores = JSON.parse(localStorage.getItem('neuropuzzle-scores') || '[]') as typeof scoreEntry[];
    existingScores.push(scoreEntry);
    localStorage.setItem('neuropuzzle-scores', JSON.stringify(existingScores));

    const prevMax = Number(localStorage.getItem('neuropuzzle-max-layers') || '0');
    localStorage.setItem('neuropuzzle-max-layers', String(Math.max(prevMax, layers.length)));
  }, [accuracy, currentLevelId, isSuccess, layers, level?.rewards, loss, stars]);

  const neuronCount = layers.reduce((sum, l) => sum + (l.config.units || l.config.filters || 0), 0);
  const paramCount = estimateTotalParams(layers);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-12 text-text-primary">
      <NeuralBackdrop />

      <motion.div
        className="relative z-10 panel-card w-full max-w-3xl overflow-hidden"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Header */}
        <div className="border-b border-border-subtle p-6 text-center md:p-8">
          <motion.h1
            className={`mb-2 text-3xl font-bold md:text-4xl ${isSuccess ? 'text-neural-green' : 'text-neural-red'}`}
            initial={{ y: -12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            {isSuccess ? 'Signal Aligned' : 'Not Quite There'}
          </motion.h1>
          <p className="text-sm text-text-secondary md:text-base">
            {isSuccess
              ? 'Your network achieved the required accuracy.'
              : 'Network did not meet the accuracy threshold. Try adjusting architecture or training parameters.'}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border-subtle">
          {(['summary', 'weights', 'history'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`flex-1 border-b-2 px-4 py-3 text-sm font-semibold uppercase tracking-wider transition-colors ${
                activeTab === tab
                  ? 'border-neural-blue text-neural-blue'
                  : 'border-transparent text-text-dim hover:text-text-secondary'
              }`}
            >
              {tab === 'summary' ? 'Summary' : tab === 'weights' ? 'Weights' : 'History'}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'summary' && (
            <motion.div
              key="summary"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-6"
            >
              {/* Title */}
              <div className="mb-6">
                <h2 className="text-xl font-bold text-neural-blue">{title}</h2>
                {description && <p className="mt-1 text-sm text-text-secondary">{description}</p>}
              </div>

              {/* Metrics Grid */}
              <div className="mb-6 grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-neural-green/30 bg-neural-green/10 p-4 text-center">
                  <p className="text-xs font-semibold uppercase tracking-wide text-neural-green">Accuracy</p>
                  <p className="mt-1 text-3xl font-bold text-neural-green">{(accuracy * 100).toFixed(2)}%</p>
                  <p className="mt-1 text-xs text-text-dim">Target: {(threshold * 100).toFixed(0)}%</p>
                </div>
                <div className="rounded-xl border border-neural-red/30 bg-neural-red/10 p-4 text-center">
                  <p className="text-xs font-semibold uppercase tracking-wide text-neural-red">Loss</p>
                  <p className="mt-1 text-3xl font-bold text-neural-red">{loss.toFixed(4)}</p>
                </div>
              </div>

              {/* Network Stats */}
              <div className="mb-6 grid grid-cols-2 gap-4">
                <div className="rounded-lg border border-border-subtle bg-bg-elevated/40 p-4">
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-dim">Architecture</h3>
                  <div className="space-y-1 text-sm">
                    <p>Layers: <span className="font-mono text-text-primary">{layers.length}</span></p>
                    <p>Neurons: <span className="font-mono text-text-primary">{neuronCount}</span></p>
                    <p>Params (est.): <span className="font-mono text-text-primary">{paramCount.toLocaleString()}</span></p>
                  </div>
                </div>
                <div className="rounded-lg border border-border-subtle bg-bg-elevated/40 p-4">
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-dim">Training</h3>
                  <div className="space-y-1 text-sm">
                    <p>Epochs: <span className="font-mono text-text-primary">{trainingHistory.length}</span></p>
                    <p>Optimizer: <span className="font-mono text-neural-blue">{trainingSession?.optimizer?.toUpperCase() || 'N/A'}</span></p>
                    <p>LR: <span className="font-mono text-neural-blue">{trainingSession?.learningRate || 'N/A'}</span></p>
                  </div>
                </div>
              </div>

              {/* Stars & Rewards */}
              {isSuccess && (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="rounded-xl border border-neural-yellow/30 bg-neural-yellow/10 p-4 text-center"
                >
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neural-yellow">Rating</h3>
                  <div className="flex justify-center gap-4">
                    {[1, 2, 3].map((star) => (
                      <motion.span
                        key={star}
                        className={`text-4xl ${star <= stars ? 'text-neural-yellow drop-shadow-[0_0_12px_rgba(255,215,0,0.5)]' : 'text-text-dim grayscale'}`}
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 0.2 + star * 0.1, type: 'spring' }}
                      >
                        ★
                      </motion.span>
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-text-secondary">
                    +{level?.rewards.xp ?? 100} XP · +{level?.rewards.stars ?? stars} stars earned
                  </p>
                </motion.div>
              )}
            </motion.div>
          )}

          {activeTab === 'weights' && (
            <motion.div
              key="weights"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-6"
            >
              <WeightVisualization
                layers={layers}
                weights={[new Float32Array([0.1, -0.2, 0.3]), new Float32Array([0.5, -0.1])]} // TODO: capture actual weights from training
                onClose={() => setActiveTab('summary')}
              />
            </motion.div>
          )}

          {activeTab === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-6"
            >
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-neural-blue">Training History</h3>
              {trainingHistory.length > 0 ? (
                <div className="h-80 w-full rounded-xl border border-border-subtle bg-bg-elevated/40 p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trainingHistory}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" opacity={0.3} />
                      <XAxis dataKey="epoch" stroke="var(--text-secondary)" tick={{ fontSize: 11 }} />
                      <YAxis stroke="var(--text-secondary)" tick={{ fontSize: 11 }} yAxisId="loss" />
                      <YAxis stroke="var(--text-secondary)" tick={{ fontSize: 11 }} yAxisId="acc" orientation="right" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'var(--bg-elevated)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: '8px',
                        }}
                      />
                      <Line
                        yAxisId="loss"
                        type="monotone"
                        dataKey="loss"
                        stroke="var(--neural-red)"
                        strokeWidth={2}
                        dot={false}
                        name="Loss"
                      />
                      <Line
                        yAxisId="acc"
                        type="monotone"
                        dataKey="accuracy"
                        stroke="var(--neural-green)"
                        strokeWidth={2}
                        dot={false}
                        name="Accuracy"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="py-10 text-center text-text-dim">No training history available</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-3 border-t border-border-subtle p-6">
          {isSuccess && (
            <motion.button
              type="button"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              onClick={() => setScreen('sandbox')}
              className="rounded-xl bg-neural-purple px-6 py-2.5 text-sm font-semibold text-bg-app shadow-lg shadow-neural-purple/20 hover:scale-[1.03] active:scale-[0.97]"
            >
              Play in Sandbox
            </motion.button>
          )}
          <motion.button
            type="button"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            onClick={() => {
              useNetworkStore.getState().clearWorkspace();
              setScreen(customPuzzle ? 'custom' : level ? 'campaign' : 'mainMenu');
            }}
            className="rounded-xl border border-border-subtle bg-bg-elevated px-6 py-2.5 text-sm font-semibold text-text-primary hover:border-neural-blue/40"
          >
            {customPuzzle ? 'Custom Puzzles' : level ? 'Campaign' : 'Main Menu'}
          </motion.button>
          <motion.button
            type="button"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            onClick={() => setScreen('network')}
            className="rounded-xl border border-border-subtle bg-bg-elevated px-6 py-2.5 text-sm font-semibold text-text-primary hover:border-neural-blue/40"
          >
            Refine Network
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

function estimateTotalParams(layers: any[]): number {
  let total = 0;
  let prevOutputs = 0;

  for (const layer of layers) {
    if (layer.type === 'dense') {
      const units = layer.config.units || 0;
      total += (prevOutputs || (layer === layers[0] ? 2 : 0)) * units + units;
      prevOutputs = units;
    } else if (layer.type === 'conv2d') {
      const filters = layer.config.filters || 0;
      const kernel = layer.config.kernelSize || 3;
      const inputChannels = layer === layers[0] ? 1 : prevOutputs;
      total += kernel * kernel * inputChannels * filters + filters;
      prevOutputs = filters;
    } else if (layer.type === 'dropout' || layer.type === 'batchNorm' || layer.type === 'flatten') {
      // No parameters
    } else if (layer.type === 'pooling') {
      // No trainable parameters
    }
  }

  return total;
}

export default ResultsScreen;
