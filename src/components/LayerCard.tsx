import React from 'react';
import { motion } from 'framer-motion';
import { useNetworkStore, Layer } from '../stores/networkStore';

interface LayerCardProps {
  layer: Layer;
  index: number;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onMove?: (id: string, direction: 'up' | 'down') => void;
  maxNeurons?: number;
  showActions?: boolean;
}

export const LayerCard: React.FC<LayerCardProps> = ({
  layer,
  index,
  isSelected,
  onSelect,
  onRemove,
  onDuplicate,
  onMove,
  maxNeurons = 999,
  showActions = true,
}) => {
  const getSummary = () => {
    switch (layer.type) {
      case 'dense':
        return `${layer.config.units ?? '?'} units · ${layer.config.activation ?? 'relu'}`;
      case 'conv2d':
        return `${layer.config.filters ?? '?'}×${layer.config.kernelSize ?? '?'} kern · ${layer.config.activation ?? 'relu'}`;
      case 'dropout':
        return `rate ${(layer.config as any).rate ?? '?'}`;
      case 'batchNorm':
        return `momentum ${(layer.config as any).momentum ?? 0.99}`;
      case 'pooling':
        const poolType = (layer.config as any).type || 'max';
        return `${poolType} pool ${(layer.config as any).poolSize ?? 2}×${(layer.config as any).poolSize ?? 2}`;
      case 'flatten':
        return 'flatten layer';
      default:
        return layer.type;
    }
  };

  const getColorClass = () => {
    switch (layer.type) {
      case 'dense':
        return 'border-neural-blue/50 bg-neural-blue/5 hover:border-neural-blue';
      case 'conv2d':
        return 'border-neural-purple/50 bg-neural-purple/5 hover:border-neural-purple';
      case 'dropout':
        return 'border-neural-green/50 bg-neural-green/5 hover:border-neural-green';
      case 'batchNorm':
        return 'border-neural-yellow/50 bg-neural-yellow/5 hover:border-neural-yellow';
      case 'pooling':
        return 'border-neural-orange/50 bg-neural-orange/5 hover:border-neural-orange';
      case 'flatten':
        return 'border-gray-500/50 bg-gray-500/5 hover:border-gray-400';
      default:
        return 'border-border-subtle bg-bg-elevated/70';
    }
  };

  const sizeBoost = (layer.config.units || layer.config.filters || 4) / 24;
  const radius = 0.55 + Math.min(sizeBoost, 1.2);

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`rounded-xl border p-3 transition-all ${getColorClass()} ${
        isSelected ? 'ring-2 ring-neural-blue ring-offset-2 ring-offset-bg-app' : ''
      }`}
    >
      <button
        type="button"
        className="w-full text-left"
        onClick={() => onSelect(layer.id)}
      >
        <div className="flex items-start justify-between">
          <div>
            <span className="text-xs font-mono text-text-dim">#{index + 1}</span>
            <span className="ml-2 text-sm font-bold capitalize text-text-primary">{layer.type}</span>
          </div>
          <div className={`w-3 h-3 rounded-full ${
            layer.type === 'dense' ? 'bg-neural-blue' :
            layer.type === 'conv2d' ? 'bg-neural-purple' :
            layer.type === 'dropout' ? 'bg-neural-green' :
            layer.type === 'batchNorm' ? 'bg-neural-yellow' :
            layer.type === 'pooling' ? 'bg-neural-orange' : 'bg-gray-500'
          }`} />
        </div>
        <p className="mt-1 text-xs text-text-secondary">{getSummary()}</p>
      </button>

      {showActions && (
        <div className="mt-3 flex gap-1.5">
          <button
            type="button"
            className="flex-1 rounded-lg border border-border-subtle py-1.5 text-xs font-medium text-text-secondary transition-colors hover:border-neural-blue/60 hover:text-text-primary"
            onClick={() => onSelect(layer.id)}
          >
            Edit
          </button>
          {onDuplicate && (
            <button
              type="button"
              className="rounded-lg border border-border-subtle px-2 py-1.5 text-xs text-text-secondary transition-colors hover:border-neural-blue/60 hover:text-text-primary"
              onClick={() => onDuplicate(layer.id)}
              title="Duplicate layer"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="8" y="8" width="12" height="12" rx="1" />
                <path d="M16 8V6a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2h2" />
              </svg>
            </button>
          )}
          {onMove && index > 0 && (
            <button
              type="button"
              className="rounded-lg border border-border-subtle px-2 py-1.5 text-xs text-text-secondary transition-colors hover:border-neural-blue/60 hover:text-text-primary"
              onClick={() => onMove(layer.id, 'up')}
              title="Move up"
            >
              ↑
            </button>
          )}
          {onMove && index < get().layers.length - 1 && (
            <button
              type="button"
              className="rounded-lg border border-border-subtle px-2 py-1.5 text-xs text-text-secondary transition-colors hover:border-neural-blue/60 hover:text-text-primary"
              onClick={() => onMove(layer.id, 'down')}
              title="Move down"
            >
              ↓
            </button>
          )}
          <button
            type="button"
            className="rounded-lg border border-neural-red/40 py-1.5 px-3 text-xs font-medium text-neural-red transition-colors hover:bg-neural-red/10"
            onClick={() => onRemove(layer.id)}
          >
            Remove
          </button>
        </div>
      )}
    </motion.li>
  );
};
