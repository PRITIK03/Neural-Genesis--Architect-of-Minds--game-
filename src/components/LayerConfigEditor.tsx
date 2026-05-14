import React from 'react';
import { motion } from 'framer-motion';
import { useNetworkStore, Layer } from '../stores/networkStore';

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
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-text-secondary">Units</label>
        <input
          type="range"
          min={1}
          max={1024}
          step={1}
          value={(layer.config as any).units || 10}
          onChange={(e) => handleChange('units', Number(e.target.value))}
          className="h-2 w-full cursor-pointer accent-neural-blue"
        />
        <div className="mt-1 flex justify-between text-xs text-text-dim">
          <span>1</span>
          <span className="font-mono text-neural-blue">{(layer.config as any).units || 10}</span>
          <span>1024</span>
        </div>
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-text-secondary">Activation</label>
        <div className="grid grid-cols-2 gap-2">
          {(['relu', 'sigmoid', 'tanh', 'linear'] as const).map((act) => (
            <button
              key={act}
              type="button"
              onClick={() => handleChange('activation', act)}
              className={`rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
                (layer.config as any).activation === act
                  ? 'border-neural-blue bg-neural-blue/20 text-neural-blue'
                  : 'border-border-subtle bg-bg-elevated text-text-secondary hover:border-neural-blue/40'
              }`}
            >
              {act.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderConv2DConfig = () => (
    <div className="space-y-4">
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-text-secondary">Filters</label>
        <input
          type="range"
          min={1}
          max={256}
          step={1}
          value={(layer.config as any).filters || 16}
          onChange={(e) => handleChange('filters', Number(e.target.value))}
          className="h-2 w-full cursor-pointer accent-neural-purple"
        />
        <div className="mt-1 flex justify-between text-xs text-text-dim">
          <span>1</span>
          <span className="font-mono text-neural-purple">{(layer.config as any).filters || 16}</span>
          <span>256</span>
        </div>
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-text-secondary">Kernel Size</label>
        <div className="flex gap-2">
          {[1, 2, 3, 5, 7].map((size) => (
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
        <div className="grid grid-cols-3 gap-2">
          {(['relu', 'sigmoid', 'tanh'] as const).map((act) => (
            <button
              key={act}
              type="button"
              onClick={() => handleChange('activation', act)}
              className={`rounded-lg border px-2 py-1.5 text-xs font-medium transition-all ${
                (layer.config as any).activation === act
                  ? 'border-neural-purple bg-neural-purple/20 text-neural-purple'
                  : 'border-border-subtle bg-bg-elevated text-text-secondary hover:border-neural-purple/40'
              }`}
            >
              {act.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderDropoutConfig = () => (
    <div className="space-y-4">
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-text-secondary">Dropout Rate</label>
        <input
          type="range"
          min={0}
          max={0.9}
          step={0.05}
          value={(layer.config as any).rate || 0.2}
          onChange={(e) => handleChange('rate', Number(e.target.value))}
          className="h-2 w-full cursor-pointer accent-neural-green"
        />
        <div className="mt-1 flex justify-between text-xs text-text-dim">
          <span>0%</span>
          <span className="font-mono text-neural-green">{Math.round(((layer.config as any).rate || 0.2) * 100)}%</span>
          <span>90%</span>
        </div>
      </div>
      <p className="text-xs text-text-dim">
        Dropout randomly disables neurons during training to prevent overfitting. Typical values: 0.2-0.5.
      </p>
    </div>
  );

  const renderBatchNormConfig = () => (
    <div className="space-y-4">
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-text-secondary">Momentum</label>
        <input
          type="range"
          min={0.8}
          max={0.999}
          step={0.001}
          value={(layer.config as any).momentum || 0.99}
          onChange={(e) => handleChange('momentum', Number(e.target.value))}
          className="h-2 w-full cursor-pointer accent-neural-yellow"
        />
        <div className="mt-1 flex justify-between text-xs text-text-dim">
          <span>0.80</span>
          <span className="font-mono text-neural-yellow">{(layer.config as any).momentum || 0.99}</span>
          <span>0.999</span>
        </div>
      </div>
      <p className="text-xs text-text-dim">
        Batch normalization stabilizes and accelerates training by normalizing layer inputs.
      </p>
    </div>
  );

  const renderPoolingConfig = () => (
    <div className="space-y-4">
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-text-secondary">Pooling Type</label>
        <div className="grid grid-cols-2 gap-2">
          {(['max', 'average'] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => handleChange('type', type)}
              className={`rounded-lg border px-3 py-2 text-xs font-medium capitalize transition-all ${
                (layer.config as any).type === type
                  ? 'border-neural-orange bg-neural-orange/20 text-neural-orange'
                  : 'border-border-subtle bg-bg-elevated text-text-secondary hover:border-neural-orange/40'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-text-secondary">Pool Size</label>
        <input
          type="range"
          min={2}
          max={4}
          step={1}
          value={(layer.config as any).poolSize || 2}
          onChange={(e) => handleChange('poolSize', Number(e.target.value))}
          className="h-2 w-full cursor-pointer accent-neural-orange"
        />
        <div className="mt-1 flex justify-between text-xs text-text-dim">
          <span>2×2</span>
          <span className="font-mono text-neural-orange">{(layer.config as any).poolSize || 2}×{(layer.config as any).poolSize || 2}</span>
          <span>4×4</span>
        </div>
      </div>
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
