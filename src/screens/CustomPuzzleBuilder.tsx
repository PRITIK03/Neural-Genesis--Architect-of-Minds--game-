import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../stores/appStore';
import { useNetworkStore } from '../stores/networkStore';
import { NeuralBackdrop } from '../components/NeuralBackdrop';
import { ScreenHeader } from '../components/ScreenHeader';
import { visitMode } from '../lib/playerProgress';

interface CustomPuzzle {
  id: string;
  name: string;
  description: string;
  inputShape: number[];
  outputShape: number[];
  trainingData: { input: number[]; output: number[] }[];
  testData: { input: number[]; output: number[] }[];
  accuracyThreshold: number;
  maxEpochs: number;
  maxLayers: number;
  maxNeurons: number;
}

const CustomPuzzleBuilder: React.FC = () => {
  const setScreen = useAppStore((state) => state.setScreen);
  const setCustomPuzzle = useNetworkStore((state) => state.setCustomPuzzle);

  useEffect(() => {
    visitMode('custom');
  }, []);

  const [puzzle, setPuzzle] = useState<Partial<CustomPuzzle>>({
    id: crypto.randomUUID(),
    name: '',
    description: '',
    inputShape: [],
    outputShape: [],
    trainingData: [],
    testData: [],
    accuracyThreshold: 0.8,
    maxEpochs: 100,
    maxLayers: 5,
    maxNeurons: 20,
  });
  const [csvData, setCsvData] = useState('');
  const [hasHeaders, setHasHeaders] = useState(true);

  const handleCsvUpload = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCsvData(e.target.value);
  };

  const parseCsv = () => {
    const lines = csvData.trim().split('\n');
    if (lines.length === 0) return;

    const data = lines
      .slice(hasHeaders ? 1 : 0)
      .map((line) => line.split(',').map((cell) => parseFloat(cell.trim())))
      .filter((row) => row.every((val) => !Number.isNaN(val)));

    if (data.length === 0) return;

    const inputCols = puzzle.inputShape?.[0] || 1;
    const trainingData = data.slice(0, Math.floor(data.length * 0.8)).map((row) => ({
      input: row.slice(0, inputCols),
      output: row.slice(inputCols),
    }));
    const testData = data.slice(Math.floor(data.length * 0.8)).map((row) => ({
      input: row.slice(0, inputCols),
      output: row.slice(inputCols),
    }));

    setPuzzle((prev) => ({
      ...prev,
      trainingData,
      testData,
      outputShape: [trainingData[0]?.output.length || 1],
    }));
  };

  const handleSave = () => {
    const finalized: CustomPuzzle = {
      id: puzzle.id || crypto.randomUUID(),
      name: puzzle.name || 'Untitled Puzzle',
      description: puzzle.description || '',
      inputShape: puzzle.inputShape?.length ? puzzle.inputShape : [1],
      outputShape: puzzle.outputShape?.length ? puzzle.outputShape : [1],
      trainingData: puzzle.trainingData || [],
      testData: puzzle.testData || [],
      accuracyThreshold: puzzle.accuracyThreshold ?? 0.8,
      maxEpochs: puzzle.maxEpochs ?? 100,
      maxLayers: puzzle.maxLayers ?? 5,
      maxNeurons: puzzle.maxNeurons ?? 20,
    };

    const stored = JSON.parse(localStorage.getItem('neuropuzzle-custom-puzzles') || '[]') as CustomPuzzle[];
    const withoutThis = stored.filter((p) => p.id !== finalized.id);
    const updated = [finalized, ...withoutThis];
    localStorage.setItem('neuropuzzle-custom-puzzles', JSON.stringify(updated));

    setCustomPuzzle(finalized);
    setScreen('network');
  };

  return (
    <div className="relative min-h-screen px-4 py-10 text-text-primary md:px-10">
      <NeuralBackdrop />

      <div className="relative z-10 mx-auto max-w-5xl">
        <ScreenHeader
          title="Custom puzzle lab"
          subtitle="Describe constraints, paste CSV (features then targets per row), parse, then jump into the builder."
          onBack={() => setScreen('mainMenu')}
          backLabel="Main menu"
        />

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <motion.div className="panel-card p-6 md:p-8" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <h2 className="text-lg font-semibold text-neural-purple">Story & naming</h2>
            <div className="mt-4 space-y-4">
              <label className="block text-sm text-text-secondary">
                Puzzle name
                <input
                  type="text"
                  value={puzzle.name || ''}
                  onChange={(e) => setPuzzle((prev) => ({ ...prev, name: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-border-subtle bg-bg-app p-3 text-text-primary focus:border-neural-blue focus:outline-none"
                  placeholder="My dataset puzzle"
                />
              </label>
              <label className="block text-sm text-text-secondary">
                Description
                <textarea
                  value={puzzle.description || ''}
                  onChange={(e) => setPuzzle((prev) => ({ ...prev, description: e.target.value }))}
                  className="mt-1 min-h-[96px] w-full rounded-xl border border-border-subtle bg-bg-app p-3 text-text-primary focus:border-neural-blue focus:outline-none"
                  placeholder="What should the learner figure out?"
                  rows={3}
                />
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className="block text-sm text-text-secondary">
                  Input features (columns)
                  <input
                    type="number"
                    min={1}
                    value={puzzle.inputShape?.[0] || ''}
                    onChange={(e) => setPuzzle((prev) => ({ ...prev, inputShape: [Number(e.target.value)] }))}
                    className="mt-1 w-full rounded-xl border border-border-subtle bg-bg-app p-3 text-text-primary focus:border-neural-blue focus:outline-none"
                    placeholder="2"
                  />
                </label>
                <label className="block text-sm text-text-secondary">
                  Output dimension
                  <input
                    type="number"
                    min={1}
                    value={puzzle.outputShape?.[0] || ''}
                    onChange={(e) => setPuzzle((prev) => ({ ...prev, outputShape: [Number(e.target.value)] }))}
                    className="mt-1 w-full rounded-xl border border-border-subtle bg-bg-app p-3 text-text-primary focus:border-neural-blue focus:outline-none"
                    placeholder="1"
                  />
                </label>
              </div>
            </div>
          </motion.div>

          <motion.div className="panel-card p-6 md:p-8" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <h2 className="text-lg font-semibold text-neural-purple">Training budget</h2>
            <div className="mt-4 space-y-4">
              <label className="block text-sm text-text-secondary">
                Accuracy target (0–1)
                <input
                  type="number"
                  step={0.05}
                  min={0}
                  max={1}
                  value={puzzle.accuracyThreshold ?? 0.8}
                  onChange={(e) => setPuzzle((prev) => ({ ...prev, accuracyThreshold: Number(e.target.value) }))}
                  className="mt-1 w-full rounded-xl border border-border-subtle bg-bg-app p-3 text-text-primary focus:border-neural-blue focus:outline-none"
                />
              </label>
              <label className="block text-sm text-text-secondary">
                Max epochs
                <input
                  type="number"
                  min={1}
                  value={puzzle.maxEpochs ?? 100}
                  onChange={(e) => setPuzzle((prev) => ({ ...prev, maxEpochs: Number(e.target.value) }))}
                  className="mt-1 w-full rounded-xl border border-border-subtle bg-bg-app p-3 text-text-primary focus:border-neural-blue focus:outline-none"
                />
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className="block text-sm text-text-secondary">
                  Max layers
                  <input
                    type="number"
                    min={1}
                    value={puzzle.maxLayers ?? 5}
                    onChange={(e) => setPuzzle((prev) => ({ ...prev, maxLayers: Number(e.target.value) }))}
                    className="mt-1 w-full rounded-xl border border-border-subtle bg-bg-app p-3 text-text-primary focus:border-neural-blue focus:outline-none"
                  />
                </label>
                <label className="block text-sm text-text-secondary">
                  Max units / filters
                  <input
                    type="number"
                    min={1}
                    value={puzzle.maxNeurons ?? 20}
                    onChange={(e) => setPuzzle((prev) => ({ ...prev, maxNeurons: Number(e.target.value) }))}
                    className="mt-1 w-full rounded-xl border border-border-subtle bg-bg-app p-3 text-text-primary focus:border-neural-blue focus:outline-none"
                  />
                </label>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div className="panel-card mt-6 p-6 md:p-8" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <h2 className="text-lg font-semibold text-neural-purple">Dataset import</h2>
          <p className="mt-2 text-sm text-text-secondary">
            Each row: comma-separated inputs then outputs. Example with two inputs and one output:{' '}
            <code className="rounded bg-bg-app px-2 py-0.5 text-xs text-neural-blue">0.1,0.4,1</code>
          </p>
          <label className="mt-4 flex items-center gap-2 text-sm text-text-secondary">
            <input type="checkbox" checked={hasHeaders} onChange={(e) => setHasHeaders(e.target.checked)} className="rounded border-border-subtle accent-neural-blue" />
            First row is a header
          </label>
          <textarea
            value={csvData}
            onChange={handleCsvUpload}
            className="mt-4 min-h-[180px] w-full rounded-xl border border-border-subtle bg-bg-app p-4 font-mono text-sm text-text-primary focus:border-neural-blue focus:outline-none"
            placeholder={'feature_a,feature_b,target\n0,0,0\n0,1,1\n'}
            rows={8}
          />
          <div className="mt-4 flex flex-wrap gap-3">
            <motion.button
              type="button"
              onClick={parseCsv}
              className="rounded-xl bg-neural-green px-6 py-2.5 text-sm font-semibold text-bg-app"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Parse CSV
            </motion.button>
            <motion.button
              type="button"
              onClick={handleSave}
              disabled={!puzzle.name || !puzzle.trainingData?.length}
              className="rounded-xl bg-neural-blue px-6 py-2.5 text-sm font-semibold text-bg-app neon-glow disabled:opacity-45"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Save & open builder
            </motion.button>
          </div>

          {(puzzle.trainingData?.length || 0) > 0 && (
            <div className="mt-6 rounded-xl border border-neural-green/30 bg-neural-green/5 p-4">
              <h3 className="text-sm font-semibold text-neural-green">Dataset preview</h3>
              <div className="mt-3 grid gap-3 text-sm text-text-secondary sm:grid-cols-2">
                <p>
                  Training samples: <span className="text-text-primary">{puzzle.trainingData?.length}</span>
                </p>
                <p>
                  Holdout samples: <span className="text-text-primary">{puzzle.testData?.length}</span>
                </p>
                <p>
                  Input shape:{' '}
                  <span className="font-mono text-text-primary">[{puzzle.inputShape?.join(', ')}]</span>
                </p>
                <p>
                  Output shape:{' '}
                  <span className="font-mono text-text-primary">[{puzzle.outputShape?.join(', ')}]</span>
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default CustomPuzzleBuilder;
