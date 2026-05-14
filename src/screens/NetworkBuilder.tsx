import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNetworkStore, Layer } from '../stores/networkStore';
import levels from '../lib/levels';
import { useAppStore } from '../stores/appStore';
import { NeuralBackdrop } from '../components/NeuralBackdrop';
import { ScreenHeader } from '../components/ScreenHeader';
import { LayerCard } from '../components/LayerCard';
import { LayerConfigEditor } from '../components/LayerConfigEditor';
import { TrainingMetricsPanel } from '../components/TrainingMetricsPanel';
import { NetworkVisualization } from '../components/NetworkVisualization';
import { OptimizerPanel } from '../components/OptimizerPanel';

type SidebarTab = 'layers' | 'training' | 'optimizer';

const NetworkBuilder: React.FC = () => {
  const {
    layers,
    selectedLayerId,
    currentLevelId,
    customPuzzle,
    trainingStatus,
    trainingHistory,
    currentMetrics,
    trainingSession,
    addLayer,
    removeLayer,
    updateLayer,
    setSelectedLayer,
    startTraining,
    stopTraining,
    pauseTraining,
    reorderLayers,
    duplicateLayer,
    moveLayer,
    clearWorkspace,
  } = useNetworkStore();
  const setScreen = useAppStore((state) => state.setScreen);
  const [activeTab, setActiveTab] = useState<SidebarTab>('layers');
  const [showEditor, setShowEditor] = useState(false);

  const level = levels.find((l) => l.id === currentLevelId) ?? null;
  const puzzleData =
    level?.puzzleData ??
    (customPuzzle
      ? {
          inputShape: customPuzzle.inputShape,
          outputShape: customPuzzle.outputShape,
          trainingData: customPuzzle.trainingData,
          testData: customPuzzle.testData,
          accuracyThreshold: customPuzzle.accuracyThreshold,
          maxEpochs: customPuzzle.maxEpochs,
          maxLayers: customPuzzle.maxLayers,
          maxNeurons: customPuzzle.maxNeurons,
        }
      : null);

  const maxLayers = puzzleData?.maxLayers ?? 99;
  const maxNeurons = puzzleData?.maxNeurons ?? 999;
  const atLayerCap = layers.length >= maxLayers;

  const handleAddLayer = (type: Layer['type']) => {
    if (atLayerCap) return;
    let newLayer: Layer;
    switch (type) {
      case 'dense':
        newLayer = {
          id: crypto.randomUUID(),
          type: 'dense',
          config: { units: Math.min(16, maxNeurons), activation: 'relu' },
        };
        break;
      case 'conv2d':
        newLayer = {
          id: crypto.randomUUID(),
          type: 'conv2d',
          config: { filters: Math.min(32, maxNeurons), kernelSize: 3, activation: 'relu', strides: 1 },
        };
        break;
      case 'dropout':
        newLayer = {
          id: crypto.randomUUID(),
          type: 'dropout',
          config: { rate: 0.2 },
        };
        break;
      case 'batchNorm':
        newLayer = {
          id: crypto.randomUUID(),
          type: 'batchNorm',
          config: { momentum: 0.99, epsilon: 0.001 },
        };
        break;
      case 'pooling':
        newLayer = {
          id: crypto.randomUUID(),
          type: 'pooling',
          config: { poolSize: 2, type: 'max', strides: 2 },
        };
        break;
      case 'flatten':
        newLayer = {
          id: crypto.randomUUID(),
          type: 'flatten',
          config: {},
        };
        break;
      default:
        return;
    }
    addLayer(newLayer);
  };

  const goBack = () => {
    if (customPuzzle) setScreen('custom');
    else if (level) setScreen('campaign');
    else setScreen('mainMenu');
  };

  const title = level?.name ?? customPuzzle?.name ?? 'Network Builder';
  const subtitle =
    level?.description ??
    customPuzzle?.description ??
    'Construct a neural network, tune hyperparameters, and train to solve the puzzle.';

  const selectedLayer = layers.find((l) => l.id === selectedLayerId);

  const handleTrain = () => {
    if (!puzzleData || layers.length === 0) return;
    startTraining(
      {
        inputs: puzzleData.trainingData.map((d) => d.input),
        outputs: puzzleData.trainingData.map((d) => d.output),
      },
      {
        epochs: puzzleData.maxEpochs ?? 100,
        batchSize: 32,
        learningRate: 0.001,
        optimizer: 'adam',
      }
    );
  };

  return (
    <div className="relative min-h-screen text-text-primary">
      <NeuralBackdrop />

      <div className="relative z-10 flex min-h-screen flex-col px-3 pb-6 pt-4 md:flex-row md:px-4 md:pb-8 md:pt-6">
        {/* Left Sidebar - Layers */}
        <motion.aside
          className="panel-card mb-3 flex w-full flex-shrink-0 flex-col p-4 md:mb-0 md:mr-3 md:w-[300px] lg:w-[320px]"
          initial={{ x: -24, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <ScreenHeader title="Architecture" subtitle="Add, reorder, and configure layers" onBack={goBack} backLabel="Back" />

          {/* Layer Type Buttons */}
          <div className="mt-4 grid grid-cols-2 gap-2">
            {([
              { type: 'dense' as const, label: 'Dense', color: 'blue' },
              { type: 'conv2d' as const, label: 'Conv2D', color: 'purple' },
              { type: 'pooling' as const, label: 'Pool', color: 'orange' },
              { type: 'dropout' as const, label: 'Dropout', color: 'green' },
              { type: 'batchNorm' as const, label: 'BatchNorm', color: 'yellow' },
              { type: 'flatten' as const, label: 'Flatten', color: 'gray' },
            ]).map((btn) => (
              <motion.button
                key={btn.type}
                type="button"
                disabled={atLayerCap}
                onClick={() => handleAddLayer(btn.type)}
                className={`rounded-xl py-2.5 text-xs font-semibold text-bg-app disabled:opacity-40
                  ${btn.color === 'blue' ? 'bg-neural-blue neon-glow' :
                btn.color === 'purple' ? 'bg-neural-purple neon-glow-purple' :
                btn.color === 'green' ? 'bg-neural-green' :
                btn.color === 'yellow' ? 'bg-neural-yellow text-bg-app' :
                btn.color === 'orange' ? 'bg-neural-orange' :
                'bg-gray-500'}`}
                whileHover={atLayerCap ? {} : { scale: 1.02 }}
                whileTap={atLayerCap ? {} : { scale: 0.98 }}
              >
                + {btn.label}
              </motion.button>
            ))}
          </div>

          <p className="mt-2 text-xs text-text-dim">
            {atLayerCap ? `Max layers (${maxLayers}) reached` : `${layers.length}/${maxLayers} layers`}
          </p>

          {/* Layer Stack */}
          <div className="mt-4 flex-1 overflow-y-auto">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-dim">Architecture</h3>
            {layers.length === 0 ? (
              <p className="text-sm text-text-secondary">
                Start building by adding layers. Dense for fully-connected, Conv2D for images, Pool for downsampling.
              </p>
            ) : (
              <ul className="space-y-2">
                {layers.map((layer, index) => (
                  <LayerCard
                    key={layer.id}
                    layer={layer}
                    index={index}
                    isSelected={selectedLayerId === layer.id}
                    onSelect={setSelectedLayer}
                    onRemove={removeLayer}
                    onDuplicate={duplicateLayer}
                    onMove={moveLayer}
                    showActions={true}
                  />
                ))}
              </ul>
            )}
          </div>
        </motion.aside>

        {/* Main Visualization Area */}
        <motion.main
          className="panel-card mb-3 flex min-h-[320px] flex-1 flex-col p-3 md:mb-0 md:p-4"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, delay: 0.05 }}
        >
          <div className="mb-3 md:hidden">
            <p className="text-xs font-semibold uppercase tracking-wide text-neural-blue">{title}</p>
            <p className="text-xs text-text-secondary line-clamp-2">{subtitle}</p>
          </div>

          {/* Goal Card */}
          {puzzleData && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border-subtle bg-bg-elevated/50 p-3"
            >
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full border border-border-subtle bg-bg-panel px-2.5 py-1 text-xs font-medium text-text-secondary">
                  Input: {puzzleData.inputShape.join(' × ')}
                </span>
                <span className="rounded-full border border-border-subtle bg-bg-panel px-2.5 py-1 text-xs font-medium text-text-secondary">
                  Output: {puzzleData.outputShape.join(' × ')}
                </span>
              </div>
              <div className="flex gap-2 text-xs">
                <span className="rounded-full border border-neural-blue/30 bg-neural-blue/10 px-2 py-1 font-medium text-neural-blue">
                  Epochs ≤ {puzzleData.maxEpochs ?? 100}
                </span>
                <span className="rounded-full border border-neural-green/30 bg-neural-green/10 px-2 py-1 font-medium text-neural-green">
                  Target {(puzzleData.accuracyThreshold * 100).toFixed(0)}%+
                </span>
              </div>
            </motion.div>
          )}

          {/* 3D Network Visualization */}
          <div className="relative flex-1 min-h-[400px]">
            <NetworkVisualization
              layers={layers}
              isTraining={trainingStatus === 'training'}
              onLayerClick={setSelectedLayer}
              selectedLayerId={selectedLayerId}
              showConnections={true}
            />
          </div>
        </motion.main>

        {/* Right Sidebar - Configuration */}
        <motion.aside
          className="panel-card flex w-full flex-shrink-0 flex-col overflow-hidden md:ml-3 md:w-[320px] lg:w-[340px]"
          initial={{ x: 24, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.08 }}
        >
          {/* Tabs */}
          <div className="flex border-b border-border-subtle">
            {(['layers', 'training', 'optimizer'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`flex-1 border-b-2 px-3 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
                  activeTab === tab
                    ? 'border-neural-blue text-neural-blue'
                    : 'border-transparent text-text-dim hover:text-text-secondary'
                }`}
              >
                {tab === 'layers' ? 'Layers' : tab === 'training' ? 'Train' : 'Config'}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-4">
            <AnimatePresence mode="wait">
              {activeTab === 'layers' && (
                <motion.div
                  key="layers"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                >
                  {selectedLayer ? (
                    <LayerConfigEditor
                      layerId={selectedLayerId!}
                      onClose={() => setShowEditor(false)}
                    />
                  ) : (
                    <div className="space-y-4">
                      <div className="rounded-lg border border-border-subtle bg-bg-elevated/40 p-4 text-center">
                        <p className="text-sm text-text-secondary">
                          Select a layer from the stack to configure its properties.
                        </p>
                      </div>

                      {/* Layer Info */}
                      <div className="space-y-3">
                        <h3 className="text-xs font-semibold uppercase tracking-wide text-text-dim">Quick Tips</h3>
                        <div className="space-y-2 text-xs">
                          <div className="rounded-lg border border-neural-blue/20 bg-neural-blue/5 p-2">
                            <span className="font-semibold text-neural-blue">Dense:</span> Fully connected neurons for general patterns
                          </div>
                          <div className="rounded-lg border border-neural-purple/20 bg-neural-purple/5 p-2">
                            <span className="font-semibold text-neural-purple">Conv2D:</span> Spatial feature detection (images)
                          </div>
                          <div className="rounded-lg border border-neural-green/20 bg-neural-green/5 p-2">
                            <span className="font-semibold text-neural-green">Dropout:</span> Prevents overfitting by randomly disabling neurons
                          </div>
                          <div className="rounded-lg border border-neural-yellow/20 bg-neural-yellow/5 p-2">
                            <span className="font-semibold text-neural-yellow">BatchNorm:</span> Stabilizes training dynamics
                          </div>
                          <div className="rounded-lg border border-neural-orange/20 bg-neural-orange/5 p-2">
                            <span className="font-semibold text-neural-orange">Pool:</span> Reduces spatial dimensions
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'training' && (
                <motion.div
                  key="training"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                >
                  <TrainingMetricsPanel
                    showControls={true}
                    showChart={true}
                    height="h-52"
                  />
                </motion.div>
              )}

              {activeTab === 'optimizer' && (
                <motion.div
                  key="optimizer"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                >
                  {trainingSession ? (
                    <OptimizerPanel
                      optimizer={trainingSession.optimizer}
                      learningRate={trainingSession.learningRate || 0.001}
                      batchSize={trainingSession.batchSize || 32}
                      epochs={trainingSession.epochs}
                      onOptimizerChange={(opt) => startTraining({ inputs: [], outputs: [] }, { optimizer: opt })}
                      onLearningRateChange={(lr) => startTraining({ inputs: [], outputs: [] }, { learningRate: lr })}
                      onBatchSizeChange={(batch) => startTraining({ inputs: [], outputs: [] }, { batchSize: batch })}
                      onEpochsChange={(epochs) => startTraining({ inputs: [], outputs: [] }, { epochs })}
                    />
                  ) : (
                    <p className="text-sm text-text-secondary">Configure training parameters before starting.</p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.aside>
      </div>
    </div>
  );
};

export default NetworkBuilder;
