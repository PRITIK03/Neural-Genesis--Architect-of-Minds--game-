import React from 'react';
import { motion } from 'framer-motion';
import { OptimizerType } from '../stores/networkStore';

interface OptimizerPanelProps {
  optimizer: OptimizerType;
  learningRate: number;
  batchSize: number;
  epochs: number;
  onOptimizerChange: (opt: OptimizerType) => void;
  onLearningRateChange: (lr: number) => void;
  onBatchSizeChange: (batch: number) => void;
  onEpochsChange: (epochs: number) => void;
}

const OPTIMIZER_COLORS: Record<OptimizerType, { border: string; bg: string; text: string }> = {
  adam: { border: 'border-neural-blue', bg: 'bg-neural-blue/10', text: 'text-neural-blue' },
  sgd: { border: 'border-neural-purple', bg: 'bg-neural-purple/10', text: 'text-neural-purple' },
  rmsprop: { border: 'border-neural-green', bg: 'bg-neural-green/10', text: 'text-neural-green' },
  adagrad: { border: 'border-neural-yellow', bg: 'bg-neural-yellow/10', text: 'text-neural-yellow' },
};

export const OptimizerPanel: React.FC<OptimizerPanelProps> = ({
  optimizer,
  learningRate,
  batchSize,
  epochs,
  onOptimizerChange,
  onLearningRateChange,
  onBatchSizeChange,
  onEpochsChange,
}) => {
  const optimizers: { value: OptimizerType; label: string; description: string }[] = [
    { value: 'adam', label: 'Adam', description: 'Adaptive learning rate (default)' },
    { value: 'sgd', label: 'SGD', description: 'Stochastic Gradient Descent' },
    { value: 'rmsprop', label: 'RMSprop', description: 'Adaptive with momentum' },
    { value: 'adagrad', label: 'Adagrad', description: 'Per-parameter adaptive' },
  ];

  return (
    <div className="space-y-5">
      {/* Optimizer Selection */}
      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-text-secondary">
          Optimizer
        </label>
        <div className="grid grid-cols-2 gap-2">
          {optimizers.map((opt) => {
            const colors = OPTIMIZER_COLORS[opt.value];
            const isSelected = optimizer === opt.value;
            return (
              <motion.button
                key={opt.value}
                type="button"
                onClick={() => onOptimizerChange(opt.value)}
                className={`rounded-lg border p-3 text-left transition-all ${
                  isSelected
                    ? `${colors.border} ${colors.bg} ${colors.text}`
                    : 'border-border-subtle bg-bg-elevated hover:border-border-subtle/80'
                }`}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className={`text-sm font-bold ${isSelected ? colors.text : 'text-text-primary'}`}>
                  {opt.label}
                </div>
                <p className="mt-0.5 text-xs text-text-dim">{opt.description}</p>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Learning Rate */}
      <div>
        <label className="mb-1.5 flex justify-between text-xs font-semibold text-text-secondary">
          <span>Learning Rate</span>
          <span className="font-mono text-neural-blue">{learningRate}</span>
        </label>
        <input
          type="range"
          min={0.00001}
          max={0.1}
          step={0.00001}
          value={learningRate}
          onChange={(e) => onLearningRateChange(Number(e.target.value))}
          className="h-2 w-full cursor-pointer accent-neural-blue"
        />
        <div className="mt-1 flex justify-between text-xs text-text-dim">
          <span>1e-5</span>
          <span className="font-mono">{(learningRate).toExponential(1)}</span>
          <span>1e-1</span>
        </div>
        <p className="mt-1.5 text-xs text-text-dim">
          Controls step size during gradient descent. Lower values need more epochs.
        </p>
      </div>

      {/* Batch Size */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-text-secondary">Batch Size</label>
        <div className="grid grid-cols-4 gap-2">
          {[8, 16, 32, 64, 128, 256, 512].map((batch) => (
            <button
              key={batch}
              type="button"
              onClick={() => onBatchSizeChange(batch)}
              className={`rounded-lg border px-2 py-2 text-xs font-medium transition-all ${
                batchSize === batch
                  ? 'border-neural-green bg-neural-green/20 text-neural-green'
                  : 'border-border-subtle bg-bg-elevated text-text-secondary hover:border-neural-green/40'
              }`}
            >
              {batch}
            </button>
          ))}
        </div>
        <p className="mt-1.5 text-xs text-text-dim">
          Larger batches train faster but may generalize worse. Use powers of 2.
        </p>
      </div>

      {/* Epochs */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-text-secondary">Max Epochs</label>
        <input
          type="range"
          min={10}
          max={1000}
          step={10}
          value={epochs}
          onChange={(e) => onEpochsChange(Number(e.target.value))}
          className="h-2 w-full cursor-pointer accent-neural-purple"
        />
        <div className="mt-1 flex justify-between text-xs text-text-dim">
          <span>10</span>
          <span className="font-mono text-neural-purple">{epochs}</span>
          <span>1000</span>
        </div>
      </div>
    </div>
  );
};
