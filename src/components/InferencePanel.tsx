import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as tf from '@tensorflow/tfjs';
import { Layer } from '../stores/networkStore';

interface InferencePanelProps {
  layers: Layer[];
  trainingData: { input: number[]; output: number[] }[];
  onClose?: () => void;
}

export const InferencePanel: React.FC<InferencePanelProps> = ({
  layers,
  trainingData,
  onClose,
}) => {
  const [customInput, setCustomInput] = useState<string>('');
  const [prediction, setPrediction] = useState<number[] | null>(null);
  const [isInferencing, setIsInferencing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputSize = trainingData[0]?.input.length
    ?? (layers[0]?.type === 'dense' ? (layers[0].config as any).units || 1 : 1);

  const sampleInputs = useMemo(() => {
    return trainingData.slice(0, 5).map((d, i) => ({
      id: i,
      input: d.input,
      output: d.output,
    }));
  }, [trainingData]);

  const runInference = async (input: number[]) => {
    setIsInferencing(true);
    setError(null);

    try {
      // Build model
      const model = tf.sequential();
      let prevOutputSize = input.length;

      for (const layer of layers) {
        if (layer.type === 'dense') {
          model.add(tf.layers.dense({
            units: layer.config.units,
            activation: layer.config.activation,
            inputShape: [prevOutputSize],
          }));
          prevOutputSize = layer.config.units;
        } else if (layer.type === 'dropout') {
          model.add(tf.layers.dropout({ rate: layer.config.rate }));
        }
        // Simplified for inference demo
      }

      // Output layer
      const outputSize = trainingData[0]?.output.length || 1;
      model.add(tf.layers.dense({ units: outputSize, activation: outputSize > 1 ? 'softmax' : 'sigmoid' }));

      // Dummy inference with random weights (since we don't have trained weights)
      const inputTensor = tf.tensor2d([input]);
      const result = model.predict(inputTensor) as tf.Tensor;
      const values = await result.data();

      setPrediction(Array.from(values));
      inputTensor.dispose();
      result.dispose();
      model.dispose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Inference failed');
    } finally {
      setIsInferencing(false);
    }
  };

  const handleCustomInput = () => {
    try {
      const parsed = JSON.parse(customInput);
      if (Array.isArray(parsed) && parsed.length === inputSize) {
        runInference(parsed);
      } else {
        setError(`Input must be an array of ${inputSize} numbers`);
      }
    } catch {
      setError('Invalid JSON. Format: [0.5, 0.2, ...]');
    }
  };

  const getOutputClass = (index: number) => {
    if (!prediction) return '';
    const maxIdx = prediction.indexOf(Math.max(...prediction));
    return index === maxIdx ? 'text-neural-green' : 'text-text-dim';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-4 rounded-xl border border-border-subtle bg-bg-elevated/80 p-4"
    >
      <div className="flex items-center justify-between border-b border-border-subtle pb-3">
        <div>
          <h3 className="text-sm font-bold text-neural-purple">Model Inference</h3>
          <p className="text-xs text-text-dim">Test your network with custom inputs</p>
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

      {/* Sample Inputs */}
      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-text-secondary">
          Try Sample Inputs
        </label>
        <div className="grid grid-cols-2 gap-2">
          {sampleInputs.map((sample) => (
            <button
              key={sample.id}
              type="button"
              onClick={() => runInference(sample.input)}
              disabled={isInferencing}
              className="rounded-lg border border-border-subtle bg-bg-app p-2 text-left text-xs transition-colors hover:border-neural-blue/40 disabled:opacity-50"
            >
              <div className="mb-1 font-mono text-neural-blue">{JSON.stringify(sample.input)}</div>
              <div className="text-text-dim">→ {JSON.stringify(sample.output)}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Input */}
      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-text-secondary">
          Custom Input (JSON)
        </label>
        <textarea
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          placeholder={`[${Array(inputSize).fill('0.5').join(', ')}]`}
          className="w-full resize-none rounded-lg border border-border-subtle bg-bg-app p-2.5 text-sm font-mono text-text-primary placeholder-text-dim focus:border-neural-blue focus:outline-none"
          rows={2}
        />
        <motion.button
          type="button"
          onClick={handleCustomInput}
          disabled={isInferencing || !customInput.trim()}
          className="mt-2 w-full rounded-lg bg-neural-blue px-4 py-2 text-sm font-semibold text-bg-app disabled:opacity-50"
          whileHover={{ scale: isInferencing ? 1 : 1.02 }}
          whileTap={{ scale: isInferencing ? 1 : 0.98 }}
        >
          {isInferencing ? 'Running...' : 'Run Inference'}
        </motion.button>
      </div>

      {/* Results */}
      <AnimatePresence>
        {prediction && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-lg border border-neural-green/30 bg-neural-green/5 p-3"
          >
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-neural-green">Prediction</h4>
            <div className="flex gap-2">
              {prediction.map((val, i) => (
                <div key={i} className="flex-1 text-center">
                  <div className={`text-2xl font-bold ${getOutputClass(i)}`}>
                    {(val * 100).toFixed(1)}%
                  </div>
                  <div className="text-xs text-text-dim">Class {i}</div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="rounded-lg border border-neural-red/30 bg-neural-red/10 p-2 text-sm text-neural-red"
        >
          {error}
        </motion.div>
      )}
    </motion.div>
  );
};
