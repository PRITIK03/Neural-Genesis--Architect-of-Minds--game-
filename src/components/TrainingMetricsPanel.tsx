import React from 'react';
import { motion } from 'framer-motion';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { useNetworkStore } from '../stores/networkStore';

interface TrainingMetricsPanelProps {
  showControls?: boolean;
  showChart?: boolean;
  height?: string;
}

export const TrainingMetricsPanel: React.FC<TrainingMetricsPanelProps> = ({
  showControls = true,
  showChart = true,
  height = 'h-48',
}) => {
  const {
    trainingStatus,
    currentMetrics,
    trainingHistory,
    startTraining,
    stopTraining,
    pauseTraining,
    trainingSession,
  } = useNetworkStore();

  const isTraining = trainingStatus === 'training';

  const getStatusColor = () => {
    switch (trainingStatus) {
      case 'training':
        return 'text-neural-green';
      case 'paused':
        return 'text-neural-yellow';
      case 'completed':
        return 'text-neural-blue';
      case 'stopped':
        return 'text-neural-red';
      default:
        return 'text-text-secondary';
    }
  };

  const getStatusLabel = () => {
    switch (trainingStatus) {
      case 'training':
        return 'Training in progress';
      case 'paused':
        return 'Paused';
      case 'completed':
        return 'Training complete';
      case 'stopped':
        return 'Stopped';
      default:
        return 'Ready';
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border border-border-subtle bg-bg-elevated/95 p-3 shadow-xl backdrop-blur-sm">
          <p className="text-xs font-semibold text-text-primary">Epoch {label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-xs" style={{ color: entry.color }}>
              {entry.name === 'loss' ? 'Loss' : 'Accuracy'}: {entry.value.toFixed(4)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between rounded-lg border border-border-subtle bg-bg-elevated/60 p-3">
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${
            isTraining ? 'animate-pulse bg-neural-green' :
            trainingStatus === 'paused' ? 'bg-neural-yellow' :
            trainingStatus === 'completed' ? 'bg-neural-blue' :
            'bg-text-dim'
          }`} />
          <span className={`text-sm font-medium ${getStatusColor()}`}>
            {getStatusLabel()}
          </span>
        </div>
        {trainingSession && (
          <div className="flex gap-2 text-xs text-text-dim">
            <span>LR: {trainingSession.learningRate}</span>
            <span>Batch: {trainingSession.batchSize}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg border border-neural-red/30 bg-neural-red/5 p-3"
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-neural-red">Loss</p>
          <p className="mt-1 font-mono text-2xl font-bold text-neural-red">
            {currentMetrics.loss.toFixed(4)}
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-lg border border-neural-green/30 bg-neural-green/5 p-3"
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-neural-green">Accuracy</p>
          <p className="mt-1 font-mono text-2xl font-bold text-neural-green">
            {(currentMetrics.accuracy * 100).toFixed(2)}%
          </p>
        </motion.div>
      </div>

      {showControls && (
        <div className="flex gap-2">
          {!isTraining ? (
            <motion.button
              type="button"
              onClick={() => startTraining?.({ inputs: [], outputs: [] })}
              className="flex-1 rounded-xl bg-neural-green py-2.5 text-sm font-bold text-bg-app shadow-lg shadow-neural-green/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Train
            </motion.button>
          ) : (
            <>
              <motion.button
                type="button"
                onClick={pauseTraining}
                className="flex-1 rounded-xl bg-neural-yellow py-2.5 text-sm font-bold text-bg-app"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Pause
              </motion.button>
              <motion.button
                type="button"
                onClick={stopTraining}
                className="flex-1 rounded-xl bg-neural-red py-2.5 text-sm font-bold text-bg-app"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Stop
              </motion.button>
            </>
          )}
        </div>
      )}

      {showChart && trainingHistory.length > 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className={`${height} w-full rounded-xl border border-border-subtle bg-bg-elevated/40 p-3`}
        >
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-dim">Training Curves</p>
          <ResponsiveContainer width="100%" height="85%">
            <AreaChart data={trainingHistory}>
              <defs>
                <linearGradient id="lossGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF3366" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#FF3366" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="accGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00FF88" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#00FF88" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" opacity={0.3} />
              <XAxis
                dataKey="epoch"
                stroke="var(--text-secondary)"
                tick={{ fontSize: 10 }}
                tickLine={false}
              />
              <YAxis
                stroke="var(--text-secondary)"
                tick={{ fontSize: 10 }}
                tickLine={false}
                width={40}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="loss"
                stroke="#FF3366"
                strokeWidth={2}
                fill="url(#lossGradient)"
                name="loss"
              />
              <Area
                type="monotone"
                dataKey="accuracy"
                stroke="#00FF88"
                strokeWidth={2}
                fill="url(#accGradient)"
                name="accuracy"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {trainingHistory.length > 0 && trainingStatus === 'completed' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg border border-neural-blue/30 bg-neural-blue/5 p-3 text-center"
        >
          <p className="text-sm text-neural-blue">
            Training complete after {trainingHistory.length} epochs
          </p>
        </motion.div>
      )}
    </div>
  );
};
