import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../stores/appStore';

interface CustomPuzzle {
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
  const [puzzle, setPuzzle] = useState<Partial<CustomPuzzle>>({
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

    const data = lines.slice(hasHeaders ? 1 : 0).map(line =>
      line.split(',').map(cell => parseFloat(cell.trim()))
    ).filter(row => row.every(val => !isNaN(val)));

    if (data.length === 0) return;

    const inputCols = puzzle.inputShape?.[0] || 1;
    const trainingData = data.slice(0, Math.floor(data.length * 0.8)).map(row => ({
      input: row.slice(0, inputCols),
      output: row.slice(inputCols),
    }));
    const testData = data.slice(Math.floor(data.length * 0.8)).map(row => ({
      input: row.slice(0, inputCols),
      output: row.slice(inputCols),
    }));

    setPuzzle(prev => ({
      ...prev,
      trainingData,
      testData,
      outputShape: [row.slice(inputCols).length],
    }));
  };

  const handleSave = () => {
    // TODO: Save to localStorage or backend
    console.log('Saving custom puzzle:', puzzle);
    // For now, just go back to main menu
    setScreen('main');
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-b from-bg-app to-bg-panel text-text-primary p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="max-w-4xl mx-auto"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <motion.button
          onClick={() => setScreen('main')}
          className="mb-6 bg-neural-blue hover:bg-neural-blue text-bg-app px-4 py-2 rounded-lg neon-glow transition-all duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          ← Back to Main Menu
        </motion.button>

        <h1 className="text-3xl font-bold mb-8 text-neural-blue">Custom Puzzle Builder</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div
            className="glass p-6 rounded-lg"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-xl font-semibold mb-4 text-neural-purple">Puzzle Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-text-secondary mb-1">Puzzle Name</label>
                <input
                  type="text"
                  value={puzzle.name || ''}
                  onChange={(e) => setPuzzle(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-2 bg-bg-elevated border border-border-subtle text-text-primary rounded-lg focus:border-neural-blue focus:outline-none transition-all duration-300"
                  placeholder="My Custom Puzzle"
                />
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-1">Description</label>
                <textarea
                  value={puzzle.description || ''}
                  onChange={(e) => setPuzzle(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-2 bg-bg-elevated border border-border-subtle text-text-primary rounded-lg focus:border-neural-blue focus:outline-none transition-all duration-300"
                  placeholder="Describe your puzzle..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-text-secondary mb-1">Input Features</label>
                  <input
                    type="number"
                    value={puzzle.inputShape?.[0] || ''}
                    onChange={(e) => setPuzzle(prev => ({ ...prev, inputShape: [Number(e.target.value)] }))}
                    className="w-full p-2 bg-bg-elevated border border-border-subtle text-text-primary rounded-lg focus:border-neural-blue focus:outline-none transition-all duration-300"
                    placeholder="2"
                  />
                </div>
                <div>
                  <label className="block text-sm text-text-secondary mb-1">Output Classes</label>
                  <input
                    type="number"
                    value={puzzle.outputShape?.[0] || ''}
                    onChange={(e) => setPuzzle(prev => ({ ...prev, outputShape: [Number(e.target.value)] }))}
                    className="w-full p-2 bg-bg-elevated border border-border-subtle text-text-primary rounded-lg focus:border-neural-blue focus:outline-none transition-all duration-300"
                    placeholder="1"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="glass p-6 rounded-lg"
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <h2 className="text-xl font-semibold mb-4 text-neural-purple">Training Constraints</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-text-secondary mb-1">Accuracy Threshold</label>
                <input
                  type="number"
                  step="0.05"
                  min="0"
                  max="1"
                  value={puzzle.accuracyThreshold || 0.8}
                  onChange={(e) => setPuzzle(prev => ({ ...prev, accuracyThreshold: Number(e.target.value) }))}
                  className="w-full p-2 bg-bg-elevated border border-border-subtle text-text-primary rounded-lg focus:border-neural-blue focus:outline-none transition-all duration-300"
                />
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-1">Max Epochs</label>
                <input
                  type="number"
                  value={puzzle.maxEpochs || 100}
                  onChange={(e) => setPuzzle(prev => ({ ...prev, maxEpochs: Number(e.target.value) }))}
                  className="w-full p-2 bg-bg-elevated border border-border-subtle text-text-primary rounded-lg focus:border-neural-blue focus:outline-none transition-all duration-300"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-text-secondary mb-1">Max Layers</label>
                  <input
                    type="number"
                    value={puzzle.maxLayers || 5}
                    onChange={(e) => setPuzzle(prev => ({ ...prev, maxLayers: Number(e.target.value) }))}
                    className="w-full p-2 bg-bg-elevated border border-border-subtle text-text-primary rounded-lg focus:border-neural-blue focus:outline-none transition-all duration-300"
                  />
                </div>
                <div>
                  <label className="block text-sm text-text-secondary mb-1">Max Neurons/Layer</label>
                  <input
                    type="number"
                    value={puzzle.maxNeurons || 20}
                    onChange={(e) => setPuzzle(prev => ({ ...prev, maxNeurons: Number(e.target.value) }))}
                    className="w-full p-2 bg-bg-elevated border border-border-subtle text-text-primary rounded-lg focus:border-neural-blue focus:outline-none transition-all duration-300"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          className="glass p-6 rounded-lg mt-8"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <h2 className="text-xl font-semibold mb-4 text-neural-purple">Dataset Upload</h2>
          <div className="space-y-4">
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={hasHeaders}
                  onChange={(e) => setHasHeaders(e.target.checked)}
                  className="rounded border-border-subtle"
                />
                <span className="text-sm text-text-secondary">First row contains headers</span>
              </label>
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-1">CSV Data</label>
              <textarea
                value={csvData}
                onChange={handleCsvUpload}
                className="w-full p-4 bg-bg-elevated border border-border-subtle text-text-primary rounded-lg focus:border-neural-blue focus:outline-none transition-all duration-300 font-mono text-sm"
                placeholder="Paste your CSV data here...&#10;feature1,feature2,target&#10;1.0,2.0,0.0&#10;2.0,3.0,1.0&#10;..."
                rows={10}
              />
            </div>
            <div className="flex space-x-4">
              <motion.button
                onClick={parseCsv}
                className="bg-neural-green hover:bg-neural-green text-bg-app px-6 py-2 rounded-lg transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Parse CSV
              </motion.button>
              <motion.button
                onClick={handleSave}
                disabled={!puzzle.name || !puzzle.trainingData?.length}
                className="bg-neural-blue hover:bg-neural-blue text-bg-app px-6 py-2 rounded-lg disabled:opacity-50 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Save Puzzle
              </motion.button>
            </div>
          </div>

          {(puzzle.trainingData?.length || 0) > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2 text-neural-green">Dataset Preview</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-text-secondary">Training Samples: {puzzle.trainingData?.length}</p>
                  <p className="text-sm text-text-secondary">Test Samples: {puzzle.testData?.length}</p>
                </div>
                <div>
                  <p className="text-sm text-text-secondary">Input Shape: [{puzzle.inputShape?.join(', ')}]</p>
                  <p className="text-sm text-text-secondary">Output Shape: [{puzzle.outputShape?.join(', ')}]</p>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default CustomPuzzleBuilder;