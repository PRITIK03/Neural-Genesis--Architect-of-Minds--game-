import React, { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useNetworkStore, Layer, TrainingData } from '../stores/networkStore';
import { useAppStore } from '../stores/appStore';
import { NeuralBackdrop } from '../components/NeuralBackdrop';
import { ScreenHeader } from '../components/ScreenHeader';
import { visitMode } from '../lib/playerProgress';

const datasets: { name: string; data: TrainingData }[] = [
  {
    name: 'XOR',
    data: {
      inputs: [
        [0, 0],
        [0, 1],
        [1, 0],
        [1, 1],
      ],
      outputs: [[0], [1], [1], [0]],
    },
  },
  {
    name: 'AND',
    data: {
      inputs: [
        [0, 0],
        [0, 1],
        [1, 0],
        [1, 1],
      ],
      outputs: [[0], [0], [0], [1]],
    },
  },
  {
    name: 'Simple Iris',
    data: {
      inputs: [
        [5.1, 3.5],
        [4.9, 3.0],
        [6.0, 3.0],
        [5.9, 3.0],
      ],
      outputs: [[0], [0], [1], [1]],
    },
  },
];

const Sandbox: React.FC = () => {
  const {
    layers,
    selectedLayerId,
    trainingStatus,
    currentMetrics,
    trainingHistory,
    addLayer,
    removeLayer,
    setSelectedLayer,
    startTraining,
    stopTraining,
    clearWorkspace,
  } = useNetworkStore();
  const setScreen = useAppStore((state) => state.setScreen);
  const [selectedDataset, setSelectedDataset] = useState<string>('XOR');

  const isTraining = trainingStatus === 'training';
  const loss = currentMetrics.loss;
  const accuracy = currentMetrics.accuracy;

  useEffect(() => {
    visitMode('sandbox');
    clearWorkspace();
  }, [clearWorkspace]);

  const dataset = datasets.find((d) => d.name === selectedDataset);

  const handleAddLayer = (type: Layer['type']) => {
    const newLayer: Layer = {
      id: crypto.randomUUID(),
      type,
      config:
        type === 'dense'
          ? { units: 10, activation: 'relu' }
          : type === 'conv2d'
            ? { filters: 16, kernelSize: 3, activation: 'relu' }
            : { rate: 0.2 },
    };
    addLayer(newLayer);
  };

  return (
    <div className="relative min-h-screen text-text-primary">
      <NeuralBackdrop />

      <div className="relative z-10 flex min-h-screen flex-col px-3 pb-6 pt-4 md:flex-row md:px-4 md:pb-8 md:pt-6">
        <motion.aside
          className="panel-card mb-3 w-full flex-shrink-0 p-4 md:mb-0 md:mr-3 md:w-[280px]"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
        >
          <ScreenHeader title="Sandbox" subtitle="Free-play lab with preset toy datasets." onBack={() => setScreen('mainMenu')} backLabel="Main menu" />
          <div className="mt-4 grid gap-2">
            <motion.button
              type="button"
              onClick={() => handleAddLayer('dense')}
              className="rounded-xl bg-neural-blue py-2.5 text-sm font-semibold text-bg-app neon-glow"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              + Dense
            </motion.button>
            <motion.button
              type="button"
              onClick={() => handleAddLayer('conv2d')}
              className="rounded-xl bg-neural-purple py-2.5 text-sm font-semibold text-text-primary neon-glow-purple"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              + Conv2D
            </motion.button>
            <motion.button
              type="button"
              onClick={() => handleAddLayer('dropout')}
              className="rounded-xl bg-neural-green py-2.5 text-sm font-semibold text-bg-app"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              + Dropout
            </motion.button>
          </div>
          <div className="mt-6 max-h-[40vh] overflow-y-auto md:max-h-none">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-dim">Stack</h3>
            {layers.length === 0 ? (
              <p className="text-sm text-text-secondary">Add layers to visualize the stack.</p>
            ) : (
              <ul className="space-y-2">
                {layers.map((layer, index) => (
                  <li
                    key={layer.id}
                    className={`rounded-xl border px-3 py-2 ${
                      selectedLayerId === layer.id ? 'border-neural-blue bg-neural-blue/15' : 'border-border-subtle bg-bg-elevated/70'
                    }`}
                  >
                    <button type="button" className="w-full text-left text-sm font-medium capitalize" onClick={() => setSelectedLayer(layer.id)}>
                      <span className="text-xs text-text-dim">#{index + 1}</span> {layer.type}
                    </button>
                    <button
                      type="button"
                      className="mt-2 w-full rounded-lg border border-neural-red/35 py-1 text-xs text-neural-red hover:bg-neural-red/10"
                      onClick={() => removeLayer(layer.id)}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </motion.aside>

        <motion.main
          className="panel-card mb-3 flex min-h-[260px] flex-1 flex-col p-3 md:mb-0 md:p-4"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.05 }}
        >
          <div className="relative h-[min(48vh,480px)] w-full overflow-hidden rounded-xl border border-border-subtle bg-[#060814]">
            <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
              <color attach="background" args={['#060814']} />
              <ambientLight intensity={0.35} />
              <pointLight position={[10, 12, 10]} intensity={1.05} />
              <pointLight position={[-10, -8, -6]} intensity={0.45} color="#B800FF" />
              <OrbitControls enablePan enableZoom enableRotate />
              {layers.map((layer, index) => {
                const radius = 0.55 + Math.min((layer.config.units || layer.config.filters || 4) / 24, 1.2);
                return (
                  <mesh key={layer.id} position={[0, index * 2 - (layers.length - 1), 0]}>
                    <sphereGeometry args={[radius, 24, 24]} />
                    <meshStandardMaterial
                      color={layer.type === 'dense' ? '#00D9FF' : layer.type === 'conv2d' ? '#B800FF' : '#00FF88'}
                      emissive={isTraining ? '#00FF88' : '#000000'}
                      emissiveIntensity={isTraining ? 0.22 : 0}
                      metalness={0.3}
                      roughness={0.5}
                    />
                  </mesh>
                );
              })}
            </Canvas>
          </div>
        </motion.main>

        <motion.aside
          className="panel-card w-full flex-shrink-0 p-4 md:ml-3 md:w-[300px]"
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.08 }}
        >
          <h2 className="text-lg font-bold text-neural-blue">Training</h2>
          <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-text-dim">Dataset</label>
          <select
            value={selectedDataset}
            onChange={(e) => setSelectedDataset(e.target.value)}
            className="mt-2 w-full rounded-xl border border-border-subtle bg-bg-app p-2.5 text-sm text-text-primary focus:border-neural-blue focus:outline-none"
          >
            {datasets.map((d) => (
              <option key={d.name} value={d.name}>
                {d.name}
              </option>
            ))}
          </select>
          <motion.button
            type="button"
            onClick={() =>
              isTraining ? stopTraining() : startTraining(dataset?.data ?? { inputs: [], outputs: [] }, { epochs: 120 })
            }
            disabled={layers.length === 0}
            className="mt-4 w-full rounded-xl bg-neural-green py-3 text-sm font-semibold text-bg-app disabled:opacity-45"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isTraining ? 'Stop training' : 'Run training'}
          </motion.button>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg border border-border-subtle bg-bg-elevated/80 p-3">
              <p className="text-xs text-text-dim">Loss</p>
              <p className="font-mono text-neural-red">{loss.toFixed(4)}</p>
            </div>
            <div className="rounded-lg border border-border-subtle bg-bg-elevated/80 p-3">
              <p className="text-xs text-text-dim">Accuracy</p>
              <p className="font-mono text-neural-green">{(accuracy * 100).toFixed(2)}%</p>
            </div>
          </div>
          {trainingHistory.length > 0 && (
            <div className="mt-4 h-44 w-full">
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
        </motion.aside>
      </div>
    </div>
  );
};

export default Sandbox;
