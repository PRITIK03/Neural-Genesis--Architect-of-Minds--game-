import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNetworkStore, CustomPuzzle } from '../stores/networkStore';
import { useAppStore } from '../stores/appStore';
import { NeuralBackdrop } from '../components/NeuralBackdrop';
import { ScreenHeader } from '../components/ScreenHeader';

interface DataPoint {
  input: number[];
  output: number[];
}

const CustomPuzzleBuilder: React.FC = () => {
  const setScreen = useAppStore((state) => state.setScreen);
  const { setCustomPuzzle } = useNetworkStore();

  const [name, setName] = useState('My Puzzle');
  const [description, setDescription] = useState('');
  const [inputSize, setInputSize] = useState(2);
  const [outputSize, setOutputSize] = useState(1);
  const [maxEpochs, setMaxEpochs] = useState(200);
  const [accuracyThreshold, setAccuracyThreshold] = useState(0.9);
  const [maxLayers, setMaxLayers] = useState(5);
  const [maxNeurons, setMaxNeurons] = useState(20);
  const [trainingData, setTrainingData] = useState<DataPoint[]>([
    { input: [0, 0], output: [0] },
    { input: [0, 1], output: [1] },
    { input: [1, 0], output: [1] },
    { input: [1, 1], output: [0] },
  ]);
   const [testData] = useState<DataPoint[]>([
     { input: [0, 0], output: [0] },
     { input: [1, 1], output: [0] },
   ]);

   const handleCreatePuzzle = () => {
    const puzzle: CustomPuzzle = {
      id: crypto.randomUUID(),
      name,
      description,
      inputShape: [inputSize],
      outputShape: [outputSize],
      trainingData,
      testData,
      accuracyThreshold,
      maxEpochs,
      maxLayers,
      maxNeurons,
    };
    setCustomPuzzle(puzzle);
    setScreen('network');
  };

  const isValid =
    name.trim() &&
    trainingData.length >= 4 &&
    testData.length >= 2 &&
    trainingData.every((d) => d.input.length === inputSize && d.output.length === outputSize) &&
    testData.every((d) => d.input.length === inputSize && d.output.length === outputSize);

  return (
    <div className="relative min-h-screen text-text-primary">
      <NeuralBackdrop />

      <div className="relative z-10 flex min-h-screen flex-col px-3 pb-6 pt-4 md:flex-row md:px-4 md:pb-8 md:pt-6">
        {/* Left Panel - Config */}
        <motion.aside
          className="panel-card mb-3 w-full flex-shrink-0 flex-col overflow-y-auto p-4 md:mb-0 md:mr-3 md:w-[320px] lg:w-[340px]"
          initial={{ x: -24, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <ScreenHeader title="Custom Puzzle" subtitle="Design your own challenge" onBack={() => setScreen('mainMenu')} backLabel="Back" />

          {/* Puzzle Metadata */}
          <div className="mt-4 space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-secondary">Puzzle Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter puzzle name..."
                className="w-full rounded-lg border border-border-subtle bg-bg-app px-3 py-2 text-sm text-text-primary placeholder-text-dim focus:border-neural-blue focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-secondary">Description (optional)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the puzzle objective..."
                rows={2}
                className="w-full resize-none rounded-lg border border-border-subtle bg-bg-app px-3 py-2 text-sm text-text-secondary placeholder-text-dim focus:border-neural-blue focus:outline-none"
              />
            </div>
          </div>

          {/* Data Dimensions */}
          <div className="mt-6 border-t border-border-subtle pt-4">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-dim">Data Dimensions</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs text-text-secondary">Input Size</label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={inputSize}
                  onChange={(e) => setInputSize(Number(e.target.value))}
                  className="w-full rounded-lg border border-border-subtle bg-bg-app px-3 py-2 text-sm text-text-primary focus:border-neural-blue focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs text-text-secondary">Output Size</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={outputSize}
                  onChange={(e) => setOutputSize(Number(e.target.value))}
                  className="w-full rounded-lg border border-border-subtle bg-bg-app px-3 py-2 text-sm text-text-primary focus:border-neural-blue focus:outline-none"
                />
              </div>
            </div>
            <p className="mt-1.5 text-xs text-text-dim">
              {outputSize === 1 ? 'Binary classification (0 or 1)' : `Multi-class (${outputSize} classes, use one-hot encoding)`}
            </p>
          </div>

          {/* Constraints */}
          <div className="mt-4 border-t border-border-subtle pt-4">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-dim">Constraints</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs text-text-secondary">Max Epochs</label>
                <input
                  type="number"
                  min={10}
                  max={1000}
                  step={10}
                  value={maxEpochs}
                  onChange={(e) => setMaxEpochs(Number(e.target.value))}
                  className="w-full rounded-lg border border-border-subtle bg-bg-app px-3 py-2 text-sm text-text-primary focus:border-neural-blue focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs text-text-secondary">Max Layers</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={maxLayers}
                  onChange={(e) => setMaxLayers(Number(e.target.value))}
                  className="w-full rounded-lg border border-border-subtle bg-bg-app px-3 py-2 text-sm text-text-primary focus:border-neural-blue focus:outline-none"
                />
              </div>
              <div className="col-span-2">
                <label className="mb-1.5 block text-xs text-text-secondary">Max Neurons/Filters</label>
                <input
                  type="number"
                  min={1}
                  max={500}
                  value={maxNeurons}
                  onChange={(e) => setMaxNeurons(Number(e.target.value))}
                  className="w-full rounded-lg border border-border-subtle bg-bg-app px-3 py-2 text-sm text-text-primary focus:border-neural-blue focus:outline-none"
                />
              </div>
              <div className="col-span-2">
                <label className="mb-1.5 block text-xs text-text-secondary">Accuracy Target</label>
                <input
                  type="range"
                  min={0.5}
                  max={1}
                  step={0.05}
                  value={accuracyThreshold}
                  onChange={(e) => setAccuracyThreshold(Number(e.target.value))}
                  className="w-full accent-neural-green"
                />
                <div className="mt-1 flex justify-between text-xs text-text-dim">
                  <span>50%</span>
                  <span className="font-mono text-neural-green">{(accuracyThreshold * 100).toFixed(0)}%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Data Summary */}
          <div className="mt-4 border-t border-border-subtle pt-4">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-dim">Data Summary</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded border border-border-subtle bg-bg-elevated/40 px-2 py-1.5">
                Training: {trainingData.length} samples
              </div>
              <div className="rounded border border-border-subtle bg-bg-elevated/40 px-2 py-1.5">
                Test: {testData.length} samples
              </div>
            </div>
          </div>

          {/* Create Button */}
          <motion.button
            type="button"
            onClick={handleCreatePuzzle}
            disabled={!isValid}
            className="mt-6 w-full rounded-xl bg-neural-green py-3 text-sm font-bold text-bg-app shadow-lg shadow-neural-green/20 disabled:opacity-40"
            whileHover={isValid ? { scale: 1.02 } : {}}
            whileTap={isValid ? { scale: 0.98 } : {}}
          >
            Create & Play Puzzle
          </motion.button>
        </motion.aside>

        {/* Right Panel - Data Editor */}
        <motion.main
          className="panel-card flex w-full flex-1 flex-col p-3 md:ml-3 md:p-4"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.05 }}
        >
          <div className="mb-4 flex items-center justify-between border-b border-border-subtle pb-3">
            <div>
              <h2 className="text-sm font-bold text-neural-purple">Training Data</h2>
              <p className="text-xs text-text-dim">Edit input-output pairs</p>
            </div>
            <div className="flex gap-2">
              <motion.button
                type="button"
                onClick={() => setTrainingData([...trainingData, { input: Array(inputSize).fill(0), output: Array(outputSize).fill(0) }])}
                className="rounded-lg border border-border-subtle bg-bg-app px-3 py-1.5 text-xs font-medium text-text-primary hover:border-neural-blue/40"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Add Row
              </motion.button>
              <motion.button
                type="button"
                onClick={() => setTrainingData(trainingData.slice(0, -1))}
                disabled={trainingData.length <= 4}
                className="rounded-lg border border-neural-red/30 px-3 py-1.5 text-xs font-medium text-neural-red disabled:opacity-40"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Remove Last
              </motion.button>
            </div>
          </div>

          {/* Data Table */}
          <div className="flex-1 overflow-auto rounded-lg border border-border-subtle bg-bg-elevated/40">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-bg-panel">
                <tr>
                  <th className="px-3 py-2 text-left text-text-dim">#</th>
                  <th className="px-3 py-2 text-left text-text-dim">Input [{inputSize}]</th>
                  <th className="px-3 py-2 text-left text-text-dim">Output [{outputSize}]</th>
                </tr>
              </thead>
              <tbody>
                {trainingData.map((point, idx) => (
                  <tr key={idx} className="border-t border-border-subtle/50 hover:bg-bg-elevated/40">
                    <td className="px-3 py-2 font-mono text-text-secondary">{idx + 1}</td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={JSON.stringify(point.input)}
                        onChange={(e) => {
                          try {
                            const parsed = JSON.parse(e.target.value);
                            const newData = [...trainingData];
                            newData[idx] = { ...point, input: parsed };
                            setTrainingData(newData);
                          } catch {}
                        }}
                        className="w-32 rounded border border-border-subtle bg-bg-app px-2 py-1 font-mono text-neural-blue"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={JSON.stringify(point.output)}
                        onChange={(e) => {
                          try {
                            const parsed = JSON.parse(e.target.value);
                            const newData = [...trainingData];
                            newData[idx] = { ...point, output: parsed };
                            setTrainingData(newData);
                          } catch {}
                        }}
                        className="w-32 rounded border border-border-subtle bg-bg-app px-2 py-1 font-mono text-neural-green"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-2 text-xs text-text-dim">
            Tip: For multi-class, use one-hot encoding. Example: class 2 of 3 → [0, 0, 1]
          </p>
        </motion.main>
      </div>
    </div>
  );
};

export default CustomPuzzleBuilder;
