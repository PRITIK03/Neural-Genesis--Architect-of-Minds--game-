import React from 'react';
import { motion } from 'framer-motion';
import { useNetworkStore, Layer } from '../stores/networkStore';
import { NumberInput, OptionButtons } from './ui/NumberInput';
import { LAYER_LIMITS, ACTIVATIONS, ACTIVATIONS_CONV, POOLING_TYPES } from '../lib/constants';

interface LayerConfigEditorProps {
  layerId: string;
  onClose?: () => void;
}

export const LayerConfigEditor: React.FC<LayerConfigEditorProps> = ({ layerId, onClose }) => {
  const { layers, updateLayer } = useNetworkStore();
  const layer = layers.find((l) => l.id === layerId);

  if (!layer) return null;

  const handleChange = <K extends keyof Layer['config']>(
    key: K,
    value: Layer['config'][K]
  ) => {
    updateLayer(layerId, { [key]: value } as any);
  };

  const renderDenseConfig = () => (
    <div className="space-y-4">
      <NumberInput
        label="Units"
        value={(layer.config as any).units || 10}
        min={LAYER_LIMITS.minUnits}
        max={LAYER_LIMITS.maxUnits}
        step={1}
        onChange={(v) => handleChange('units', v)}
        color="neural-blue"
      />
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-text-secondary">Activation</label>
        <OptionButtons
          options={ACTIVATIONS}
          value={((layer.config as any).activation || 'relu') as 'relu' | 'sigmoid' | 'tanh' | 'linear'}
          onChange={(v) => handleChange('activation', v)}
          color="neural-blue"
        />
      </div>
    </div>
  );

  const renderConv2DConfig = () => (
    <div className="space-y-4">
      <NumberInput
        label="Filters"
        value={(layer.config as any).filters || 16}
        min={LAYER_LIMITS.minFilters}
        max={LAYER_LIMITS.maxFilters}
        step={1}
        onChange={(v) => handleChange('filters', v)}
        color="neural-purple"
      />
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-text-secondary">Kernel Size</label>
        <div className="flex gap-2">
          {LAYER_LIMITS.kernelSizes.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => handleChange('kernelSize', size)}
              className={`flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
                (layer.config as any).kernelSize === size
                  ? 'border-neural-purple bg-neural-purple/20 text-neural-purple'
                  : 'border-border-subtle bg-bg-elevated text-text-secondary hover:border-neural-purple/40'
              }`}
            >
              {size}×{size}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-text-secondary">Activation</label>
        <OptionButtons
          options={ACTIVATIONS_CONV}
          value={((layer.config as any).activation || 'relu') as 'relu' | 'sigmoid' | 'tanh'}
          onChange={(v) => handleChange('activation', v)}
          color="neural-purple"
          className="grid grid-cols-3 gap-2"
        />
      </div>
    </div>
  );

  const renderDropoutConfig = () => (
    <div className="space-y-4">
      <NumberInput
        label="Dropout Rate"
        value={(layer.config as any).rate || 0.2}
        min={LAYER_LIMITS.minDropoutRate}
        max={LAYER_LIMITS.maxDropoutRate}
        step={0.05}
        onChange={(v) => handleChange('rate', v)}
        color="neural-green"
        formatValue={(v) => `${Math.round(v * 100)}%`}
      />
      <p className="text-xs text-text-dim">
        Dropout randomly disables neurons during training to prevent overfitting. Typical values: 0.2-0.5.
      </p>
    </div>
  );

  const renderBatchNormConfig = () => (
    <div className="space-y-4">
      <NumberInput
        label="Momentum"
        value={(layer.config as any).momentum || 0.99}
        min={LAYER_LIMITS.minMomentum}
        max={LAYER_LIMITS.maxMomentum}
        step={0.001}
        onChange={(v) => handleChange('momentum', v)}
        color="neural-yellow"
      />
      <p className="text-xs text-text-dim">
        Batch normalization stabilizes and accelerates training by normalizing layer inputs.
      </p>
    </div>
  );

  const renderPoolingConfig = () => (
    <div className="space-y-4">
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-text-secondary">Pooling Type</label>
        <OptionButtons
          options={POOLING_TYPES}
          value={((layer.config as any).type || 'max') as 'max' | 'average'}
          onChange={(v) => handleChange('type', v)}
          color="neural-orange"
          formatLabel={(v) => v.charAt(0).toUpperCase() + v.slice(1)}
        />
      </div>
      <NumberInput
        label="Pool Size"
        value={(layer.config as any).poolSize || 2}
        min={LAYER_LIMITS.minPoolSize}
        max={LAYER_LIMITS.maxPoolSize}
        step={1}
        onChange={(v) => handleChange('poolSize', v)}
        color="neural-orange"
        formatValue={(v) => `${v}×${v}`}
      />
    </div>
  );

  const renderFlattenConfig = () => (
    <div className="space-y-4">
      <p className="text-sm text-text-secondary">
        Flatten layer converts multi-dimensional inputs to 1D. No configuration needed.
      </p>
      <div className="rounded-lg border border-border-subtle bg-bg-elevated/40 p-3">
        <p className="text-xs font-mono text-text-dim">
          Input shape will be automatically flattened before dense layers.
        </p>
      </div>
    </div>
  );

  const renderConfig = () => {
    switch (layer.type) {
      case 'dense':
        return renderDenseConfig();
      case 'conv2d':
        return renderConv2DConfig();
      case 'dropout':
        return renderDropoutConfig();
      case 'batchNorm':
        return renderBatchNormConfig();
      case 'pooling':
        return renderPoolingConfig();
      case 'flatten':
        return renderFlattenConfig();
      default:
        return <p className="text-sm text-text-secondary">Unknown layer type</p>;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between border-b border-border-subtle pb-3">
        <div>
          <h3 className="text-sm font-bold capitalize text-neural-blue">{layer.type} Configuration</h3>
          <p className="mt-0.5 text-xs text-text-dim">ID: {layer.id.slice(0, 8)}...</p>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-text-secondary transition-colors hover:bg-bg-elevated hover:text-text-primary"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      {renderConfig()}
    </motion.div>
  );
};
