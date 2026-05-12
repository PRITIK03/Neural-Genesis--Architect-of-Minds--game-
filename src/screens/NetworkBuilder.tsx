import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useNetworkStore, Layer } from '../stores/networkStore';
import levels from '../lib/levels';
import { useAppStore } from '../stores/appStore';
import { NeuralBackdrop } from '../components/NeuralBackdrop';
import { ScreenHeader } from '../components/ScreenHeader';

const LayerProperties: React.FC<{ layerId: string }> = ({ layerId }) => {
  const { layers, updateLayer } = useNetworkStore();
  const layer = layers.find((l) => l.id === layerId);

  if (!layer) return null;

  const handleConfigChange = (key: string, value: unknown) => {
    updateLayer(layerId, { ...layer.config, [key]: value });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-neural-purple">{layer.type}</h3>
      {layer.type === 'dense' && (
        <div className="space-y-3">
          <label className="block text-sm text-text-secondary">
            Units
            <input
              type="number"
              min={1}
              value={layer.config.units ?? ''}
              onChange={(e) => handleConfigChange('units', Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-border-subtle bg-bg-app p-2 text-text-primary focus:border-neural-blue focus:outline-none"
            />
          </label>
          <label className="block text-sm text-text-secondary">
            Activation
            <select
              value={layer.config.activation ?? 'relu'}
              onChange={(e) => handleConfigChange('activation', e.target.value)}
              className="mt-1 w-full rounded-lg border border-border-subtle bg-bg-app p-2 text-text-primary focus:border-neural-blue focus:outline-none"
            >
              <option value="relu">ReLU</option>
              <option value="sigmoid">Sigmoid</option>
              <option value="tanh">Tanh</option>
              <option value="linear">Linear</option>
            </select>
          </label>
        </div>
      )}
      {layer.type === 'conv2d' && (
        <div className="space-y-3">
          <label className="block text-sm text-text-secondary">
            Filters
            <input
              type="number"
              min={1}
              value={layer.config.filters ?? ''}
              onChange={(e) => handleConfigChange('filters', Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-border-subtle bg-bg-app p-2 text-text-primary focus:border-neural-blue focus:outline-none"
            />
          </label>
          <label className="block text-sm text-text-secondary">
            Kernel size
            <input
              type="number"
              min={1}
              value={layer.config.kernelSize ?? ''}
              onChange={(e) => handleConfigChange('kernelSize', Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-border-subtle bg-bg-app p-2 text-text-primary focus:border-neural-blue focus:outline-none"
            />
          </label>
          <label className="block text-sm text-text-secondary">
            Activation
            <select
              value={layer.config.activation ?? 'relu'}
              onChange={(e) => handleConfigChange('activation', e.target.value)}
              className="mt-1 w-full rounded-lg border border-border-subtle bg-bg-app p-2 text-text-primary focus:border-neural-blue focus:outline-none"
            >
              <option value="relu">ReLU</option>
              <option value="sigmoid">Sigmoid</option>
              <option value="tanh">Tanh</option>
            </select>
          </label>
        </div>
      )}
      {layer.type === 'dropout' && (
        <label className="block text-sm text-text-secondary">
          Rate
          <input
            type="number"
            step={0.05}
            min={0}
            max={1}
            value={layer.config.rate ?? ''}
            onChange={(e) => handleConfigChange('rate', Number(e.target.value))}
            className="mt-1 w-full rounded-lg border border-border-subtle bg-bg-app p-2 text-text-primary focus:border-neural-blue focus:outline-none"
          />
        </label>
      )}
    </motion.div>
  );
};

const NetworkBuilder: React.FC = () => {
  const {
    layers,
    selectedLayerId,
    currentLevelId,
    customPuzzle,
    isTraining,
    loss,
    accuracy,
    trainingHistory,
    addLayer,
    removeLayer,
    setSelectedLayer,
    startTraining,
    stopTraining,
  } = useNetworkStore();
  const setScreen = useAppStore((state) => state.setScreen);

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
    const newLayer: Layer = {
      id: crypto.randomUUID(),
      type,
      config:
        type === 'dense'
          ? { units: Math.min(10, maxNeurons), activation: 'relu' }
          : type === 'conv2d'
            ? { filters: Math.min(16, maxNeurons), kernelSize: 3, activation: 'relu' }
            : type === 'dropout'
              ? { rate: 0.2 }
              : {},
    };
    addLayer(newLayer);
  };

  const goBack = () => {
    if (customPuzzle) setScreen('custom');
    else if (level) setScreen('campaign');
    else setScreen('mainMenu');
  };

  const title = level?.name ?? customPuzzle?.name ?? 'Network lab';
  const subtitle =
    level?.description ??
    customPuzzle?.description ??
    'Stack layers, train against the dataset, then view results when metrics stabilize.';

  return (
    <div className="relative min-h-screen text-text-primary">
      <NeuralBackdrop />

      <div className="relative z-10 flex min-h-screen flex-col px-3 pb-6 pt-4 md:flex-row md:px-4 md:pb-8 md:pt-6">
        <motion.aside
          className="panel-card mb-3 flex w-full flex-shrink-0 flex-col p-4 md:mb-0 md:mr-3 md:w-[280px] lg:w-[300px]"
          initial={{ x: -24, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <ScreenHeader title="Layers" subtitle="Add blocks, select to edit, train when ready." onBack={goBack} backLabel="Leave lab" />
          <div className="mt-4 space-y-2">
            <p className="text-xs text-text-dim">
              Cap: {layers.length}/{maxLayers} layers · max ~{maxNeurons} units/filters per dense/conv
            </p>
            <div className="grid grid-cols-1 gap-2">
              <motion.button
                type="button"
                disabled={atLayerCap}
                onClick={() => handleAddLayer('dense')}
                className="rounded-xl bg-neural-blue py-2.5 text-sm font-semibold text-bg-app neon-glow disabled:opacity-40"
                whileHover={atLayerCap ? {} : { scale: 1.02 }}
                whileTap={atLayerCap ? {} : { scale: 0.98 }}
              >
                + Dense
              </motion.button>
              <motion.button
                type="button"
                disabled={atLayerCap}
                onClick={() => handleAddLayer('conv2d')}
                className="rounded-xl bg-neural-purple py-2.5 text-sm font-semibold text-text-primary neon-glow-purple disabled:opacity-40"
                whileHover={atLayerCap ? {} : { scale: 1.02 }}
                whileTap={atLayerCap ? {} : { scale: 0.98 }}
              >
                + Conv2D
              </motion.button>
              <motion.button
                type="button"
                disabled={atLayerCap}
                onClick={() => handleAddLayer('dropout')}
                className="rounded-xl bg-neural-green py-2.5 text-sm font-semibold text-bg-app disabled:opacity-40"
                whileHover={atLayerCap ? {} : { scale: 1.02 }}
                whileTap={atLayerCap ? {} : { scale: 0.98 }}
              >
                + Dropout
              </motion.button>
            </div>
          </div>

          <div className="mt-6 flex-1 overflow-y-auto">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-dim">Stack</h3>
            {layers.length === 0 ? (
              <p className="text-sm text-text-secondary">No layers yet—add at least one dense or conv block.</p>
            ) : (
              <ul className="space-y-2">
                {layers.map((layer, index) => {
                  const summary =
                    layer.type === 'dense'
                      ? `${layer.config.units ?? '?'} units · ${layer.config.activation ?? 'relu'}`
                      : layer.type === 'conv2d'
                        ? `${layer.config.filters ?? '?'}×${layer.config.kernelSize ?? '?'} kern · ${layer.config.activation ?? 'relu'}`
                        : `rate ${layer.config.rate ?? '?'}`;
                  const selected = selectedLayerId === layer.id;
                  return (
                    <li
                      key={layer.id}
                      className={`rounded-xl border px-3 py-2 transition-colors ${
                        selected ? 'border-neural-blue bg-neural-blue/15' : 'border-border-subtle bg-bg-elevated/70 hover:border-neural-blue/25'
                      }`}
                    >
                      <button type="button" className="w-full text-left" onClick={() => setSelectedLayer(layer.id)}>
                        <span className="text-xs text-text-dim">#{index + 1}</span>
                        <span className="ml-2 text-sm font-semibold capitalize text-text-primary">{layer.type}</span>
                        <span className="mt-0.5 block text-xs text-text-secondary">{summary}</span>
                      </button>
                      <div className="mt-2 flex gap-2">
                        <button
                          type="button"
                          className="flex-1 rounded-lg border border-border-subtle py-1 text-xs text-text-secondary hover:border-neural-blue/40 hover:text-text-primary"
                          onClick={() => setSelectedLayer(layer.id)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="flex-1 rounded-lg border border-neural-red/40 py-1 text-xs text-neural-red hover:bg-neural-red/10"
                          onClick={() => removeLayer(layer.id)}
                        >
                          Remove
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </motion.aside>

        <motion.main
          className="panel-card mb-3 flex min-h-[280px] flex-1 flex-col p-3 md:mb-0 md:min-h-0 md:p-4"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, delay: 0.05 }}
        >
          <div className="mb-3 md:hidden">
            <p className="text-xs font-semibold uppercase tracking-wide text-neural-blue">{title}</p>
            <p className="text-xs text-text-secondary line-clamp-2">{subtitle}</p>
          </div>
          <div className="relative h-[min(52vh,520px)] w-full flex-1 overflow-hidden rounded-xl border border-border-subtle bg-[#060814]">
            <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
              <color attach="background" args={['#060814']} />
              <ambientLight intensity={0.35} />
              <pointLight position={[10, 12, 10]} intensity={1.1} />
              <pointLight position={[-10, -8, -6]} intensity={0.45} color="#B800FF" />
              <OrbitControls enablePan enableZoom enableRotate />
              {layers.map((layer, index) => {
                const sizeBoost = (layer.config.units || layer.config.filters || 4) / 24;
                const radius = 0.55 + Math.min(sizeBoost, 1.2);
                return (
                  <mesh key={layer.id} position={[0, index * 2 - (layers.length - 1), 0]}>
                    <sphereGeometry args={[radius, 28, 28]} />
                    <meshStandardMaterial
                      color={layer.type === 'dense' ? '#00D9FF' : layer.type === 'conv2d' ? '#B800FF' : '#00FF88'}
                      metalness={0.35}
                      roughness={0.45}
                      emissive={isTraining ? '#00FF88' : '#000000'}
                      emissiveIntensity={isTraining ? 0.25 : 0}
                    />
                  </mesh>
                );
              })}
            </Canvas>
            <div className="pointer-events-none absolute bottom-3 left-3 rounded-lg bg-bg-panel/80 px-3 py-1 text-[10px] text-text-dim backdrop-blur-sm md:text-xs">
              Drag to orbit · Scroll to zoom
            </div>
          </div>
        </motion.main>

        <motion.aside
          className="panel-card flex w-full flex-shrink-0 flex-col p-4 md:ml-3 md:w-[300px] lg:w-[320px]"
          initial={{ x: 24, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.08 }}
        >
          <div className="mb-4 hidden md:block">
            <h2 className="text-lg font-bold text-neural-blue">{title}</h2>
            <p className="mt-1 text-sm text-text-secondary">{subtitle}</p>
            {puzzleData && (
              <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
                <span className="rounded-full border border-border-subtle bg-bg-elevated px-2 py-0.5 text-text-secondary">
                  Shape {puzzleData.inputShape.join('×')} → {puzzleData.outputShape.join('×')}
                </span>
                <span className="rounded-full border border-border-subtle bg-bg-elevated px-2 py-0.5 text-text-secondary">
                  Epochs ≤ {puzzleData.maxEpochs ?? 100}
                </span>
                <span className="rounded-full border border-border-subtle bg-bg-elevated px-2 py-0.5 text-text-secondary">
                  Target {(puzzleData.accuracyThreshold * 100).toFixed(0)}%+
                </span>
              </div>
            )}
          </div>

          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-dim">Inspector</h3>
          {selectedLayerId ? (
            <LayerProperties layerId={selectedLayerId} />
          ) : (
            <p className="text-sm text-text-secondary">Select a layer from the stack to tune hyperparameters.</p>
          )}

          <div className="mt-6 border-t border-border-subtle pt-4">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-dim">Training loop</h3>
            <motion.button
              type="button"
              onClick={() => {
                if (isTraining) stopTraining();
                else if (puzzleData) {
                  startTraining(
                    {
                      inputs: puzzleData.trainingData.map((d) => d.input),
                      outputs: puzzleData.trainingData.map((d) => d.output),
                    },
                    puzzleData.maxEpochs ?? 100
                  );
                }
              }}
              disabled={!puzzleData || layers.length === 0}
              className="mb-3 w-full rounded-xl bg-neural-green py-3 text-sm font-semibold text-bg-app disabled:opacity-45"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isTraining ? 'Stop training' : 'Run training'}
            </motion.button>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg border border-border-subtle bg-bg-elevated/80 p-3">
                <p className="text-xs text-text-dim">Loss</p>
                <p className="font-mono text-lg text-neural-red">{loss.toFixed(4)}</p>
              </div>
              <div className="rounded-lg border border-border-subtle bg-bg-elevated/80 p-3">
                <p className="text-xs text-text-dim">Accuracy</p>
                <p className="font-mono text-lg text-neural-green">{(accuracy * 100).toFixed(2)}%</p>
              </div>
            </div>
            {!isTraining && accuracy > 0 && (
              <motion.button
                type="button"
                onClick={() => setScreen('results')}
                className="mt-3 w-full rounded-xl bg-neural-yellow py-2.5 text-sm font-semibold text-bg-app"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Open debrief
              </motion.button>
            )}
            {trainingHistory.length > 0 && (
              <div className="mt-4 h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trainingHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                    <XAxis dataKey="epoch" stroke="var(--text-secondary)" tick={{ fontSize: 10 }} />
                    <YAxis stroke="var(--text-secondary)" tick={{ fontSize: 10 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--bg-elevated)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '8px',
                      }}
                    />
                    <Line type="monotone" dataKey="loss" stroke="var(--neural-red)" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="accuracy" stroke="var(--neural-green)" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </motion.aside>
      </div>
    </div>
  );
};

export default NetworkBuilder;
