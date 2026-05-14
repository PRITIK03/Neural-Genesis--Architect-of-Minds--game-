import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import * as tf from '@tensorflow/tfjs';
import { useNetworkStore, Layer } from '../stores/networkStore';

interface WeightVisualizationProps {
  layers: Layer[];
  weights: any[];
  onClose?: () => void;
}

export const WeightVisualization: React.FC<WeightVisualizationProps> = ({
  layers,
  weights,
  onClose,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedLayerIndex, setSelectedLayerIndex] = useState(0);

  useEffect(() => {
    if (!canvasRef.current || !weights[selectedLayerIndex]) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const weightData = weights[selectedLayerIndex];
    const layer = layers[selectedLayerIndex];

    // Clear canvas
    ctx.fillStyle = '#060814';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Visualize based on layer type
    if (layer.type === 'dense') {
      visualizeDenseWeights(ctx, weightData, canvas.width, canvas.height);
    } else if (layer.type === 'conv2d') {
      visualizeConvWeights(ctx, weightData, canvas.width, canvas.height);
    }

  }, [selectedLayerIndex, weights, layers]);

  const visualizeDenseWeights = (
    ctx: CanvasRenderingContext2D,
    weightData: Float32Array | number[][],
    width: number,
    height: number
  ) => {
    // Get weight matrix (kernel * input)
    const flatWeights = Array.isArray(weightData)
      ? weightData.flat(Infinity).map(Number)
      : Array.from(weightData);

    const min = Math.min(...flatWeights);
    const max = Math.max(...flatWeights);
    const range = max - min || 1;

    const cols = Math.ceil(Math.sqrt(flatWeights.length));
    const rows = Math.ceil(flatWeights.length / cols);
    const cellSize = Math.min(width / cols, height / rows, 20);

    const offsetX = (width - cols * cellSize) / 2;
    const offsetY = (height - rows * cellSize) / 2;

    flatWeights.forEach((value, idx) => {
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      const normalized = (value - min) / range;
      const color = normalized > 0.5
        ? `rgba(0, 255, 136, ${0.3 + normalized * 0.7})`
        : `rgba(255, 51, 102, ${0.3 + (1 - normalized) * 0.7})`;

      ctx.fillStyle = color;
      ctx.fillRect(offsetX + col * cellSize, offsetY + row * cellSize, cellSize - 1, cellSize - 1);
    });
  };

  const visualizeConvWeights = (
    ctx: CanvasRenderingContext2D,
    weightData: Float32Array | number[][],
    width: number,
    height: number
  ) => {
    // For conv2d: weightData is [filterIndex, kernelY, kernelX, inputChannel]
    // Visualize first few filters
    const flatWeights = Array.isArray(weightData)
      ? weightData.flat(Infinity).map(Number)
      : Array.from(weightData);

    const min = Math.min(...flatWeights);
    const max = Math.max(...flatWeights);
    const range = max - min || 1;

    // Display up to 16 filters in a 4x4 grid
    const filtersToShow = Math.min(16, layers[selectedLayerIndex].config.filters || 16);
    const cols = Math.ceil(Math.sqrt(filtersToShow));
    const rows = Math.ceil(filtersToShow / cols);
    const cellSize = Math.min(width / cols, height / rows, 15);

    const offsetX = (width - cols * cellSize) / 2;
    const offsetY = (height - rows * cellSize) / 2;

    let filterIdx = 0;
    const weightsPerFilter = (layers[selectedLayerIndex].config.kernelSize || 3) ** 2;

    for (let f = 0; f < filtersToShow && filterIdx < flatWeights.length; f++) {
      const row = Math.floor(f / cols);
      const col = f % cols;

      for (let k = 0; k < weightsPerFilter && filterIdx < flatWeights.length; k++) {
        const value = flatWeights[filterIdx++];
        const normalized = (value - min) / range;
        const color = normalized > 0.5
          ? `rgba(184, 0, 255, ${0.3 + normalized * 0.7})`
          : `rgba(0, 217, 255, ${0.3 + (1 - normalized) * 0.7})`;

        ctx.fillStyle = color;
        const kx = k % (layers[selectedLayerIndex].config.kernelSize || 3);
        const ky = Math.floor(k / (layers[selectedLayerIndex].config.kernelSize || 3));
        ctx.fillRect(
          offsetX + col * cellSize * (layers[selectedLayerIndex].config.kernelSize || 3) + kx * (cellSize - 1),
          offsetY + row * cellSize * (layers[selectedLayerIndex].config.kernelSize || 3) + ky * (cellSize - 1),
          cellSize - 1,
          cellSize - 1
        );
      }
    }
  };

  const selectedLayer = layers[selectedLayerIndex];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-4 rounded-xl border border-border-subtle bg-bg-elevated/80 p-4"
    >
      <div className="flex items-center justify-between border-b border-border-subtle pb-3">
        <div>
          <h3 className="text-sm font-bold text-neural-purple">Weights & Biases</h3>
          <p className="text-xs text-text-dim">
            {selectedLayer?.type.toUpperCase()} - {weights[selectedLayerIndex] ? `${(weights[selectedLayerIndex] as any).length} parameters` : 'No weights'}
          </p>
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

      {/* Layer Selector */}
      {layers.length > 1 && (
        <div className="flex gap-1 overflow-x-auto pb-2">
          {layers.map((layer, idx) => (
            <button
              key={layer.id}
              type="button"
              onClick={() => setSelectedLayerIndex(idx)}
              className={`flex-shrink-0 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                selectedLayerIndex === idx
                  ? layer.type === 'dense' ? 'border-neural-blue bg-neural-blue/20 text-neural-blue' :
                    layer.type === 'conv2d' ? 'border-neural-purple bg-neural-purple/20 text-neural-purple' :
                    'border-neural-green bg-neural-green/20 text-neural-green'
                  : 'border-border-subtle bg-bg-app text-text-secondary hover:border-neural-blue/40'
              }`}
            >
              #{idx + 1} {layer.type}
            </button>
          ))}
        </div>
      )}

      {/* Weight Visualization Canvas */}
      {weights[selectedLayerIndex] ? (
        <div className="relative aspect-video overflow-hidden rounded-lg border border-border-subtle bg-[#060814]">
          <canvas
            ref={canvasRef}
            width={300}
            height={200}
            className="h-full w-full"
          />
          <div className="pointer-events-none absolute bottom-2 left-2 text-[10px] text-text-dim">
            Bright: high magnitude weights • Dark: low magnitude weights
          </div>
        </div>
      ) : (
        <div className="aspect-video flex items-center justify-center rounded-lg border border-border-subtle bg-[#060814]">
          <p className="text-sm text-text-dim">No weights to display</p>
        </div>
      )}

      {/* Statistics */}
      {weights[selectedLayerIndex] && (
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="rounded border border-border-subtle bg-bg-elevated/40 p-2">
            <p className="text-text-dim">Min</p>
            <p className="font-mono text-neural-red">
              {getStats(weights[selectedLayerIndex]).min?.toFixed(4) || 'N/A'}
            </p>
          </div>
          <div className="rounded border border-border-subtle bg-bg-elevated/40 p-2">
            <p className="text-text-dim">Mean</p>
            <p className="font-mono text-neural-blue">
              {getStats(weights[selectedLayerIndex]).mean?.toFixed(4) || 'N/A'}
            </p>
          </div>
          <div className="rounded border border-border-subtle bg-bg-elevated/40 p-2">
            <p className="text-text-dim">Max</p>
            <p className="font-mono text-neural-green">
              {getStats(weights[selectedLayerIndex]).max?.toFixed(4) || 'N/A'}
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
};

function getStats(data: any) {
  const arr = Array.isArray(data) ? data.flat(Infinity).map(Number) : Array.from(data);
  const sum = arr.reduce((a, b) => a + b, 0);
  return {
    min: Math.min(...arr),
    max: Math.max(...arr),
    mean: sum / arr.length,
  };
}
