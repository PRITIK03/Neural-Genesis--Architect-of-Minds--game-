import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import confetti from 'canvas-confetti';
import { useNetworkStore, Layer } from '../stores/networkStore';
import levels from '../lib/levels';
import { useAppStore } from '../stores/appStore';

const LayerProperties: React.FC<{ layerId: string }> = ({ layerId }) => {
  const { layers, updateLayer } = useNetworkStore();
  const layer = layers.find((l) => l.id === layerId);

  if (!layer) return null;

  const handleConfigChange = (key: string, value: any) => {
    updateLayer(layerId, { ...layer.config, [key]: value });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h3 className="text-lg mb-2 text-neural-purple">{layer.type.toUpperCase()} Properties</h3>
      {layer.type === 'dense' && (
        <div className="space-y-3">
          <motion.label
            className="block"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <span className="text-sm text-text-secondary">Units:</span>
            <input
              type="number"
              value={layer.config.units || ''}
              onChange={(e) => handleConfigChange('units', Number(e.target.value))}
              className="w-full p-2 mt-1 bg-bg-elevated border border-border-subtle text-text-primary rounded-lg focus:border-neural-blue focus:outline-none transition-all duration-300"
            />
          </motion.label>
          <motion.label
            className="block"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <span className="text-sm text-text-secondary">Activation:</span>
            <select
              value={layer.config.activation || ''}
              onChange={(e) => handleConfigChange('activation', e.target.value)}
              className="w-full p-2 mt-1 bg-bg-elevated border border-border-subtle text-text-primary rounded-lg focus:border-neural-blue focus:outline-none transition-all duration-300"
            >
              <option value="relu">ReLU</option>
              <option value="sigmoid">Sigmoid</option>
              <option value="tanh">Tanh</option>
              <option value="linear">Linear</option>
            </select>
          </motion.label>
        </div>
      )}
      {layer.type === 'conv2d' && (
        <div className="space-y-3">
          <motion.label
            className="block"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <span className="text-sm text-text-secondary">Filters:</span>
            <input
              type="number"
              value={layer.config.filters || ''}
              onChange={(e) => handleConfigChange('filters', Number(e.target.value))}
              className="w-full p-2 mt-1 bg-bg-elevated border border-border-subtle text-text-primary rounded-lg focus:border-neural-blue focus:outline-none transition-all duration-300"
            />
          </motion.label>
          <motion.label
            className="block"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <span className="text-sm text-text-secondary">Kernel Size:</span>
            <input
              type="number"
              value={layer.config.kernelSize || ''}
              onChange={(e) => handleConfigChange('kernelSize', Number(e.target.value))}
              className="w-full p-2 mt-1 bg-bg-elevated border border-border-subtle text-text-primary rounded-lg focus:border-neural-blue focus:outline-none transition-all duration-300"
            />
          </motion.label>
          <motion.label
            className="block"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <span className="text-sm text-text-secondary">Activation:</span>
            <select
              value={layer.config.activation || ''}
              onChange={(e) => handleConfigChange('activation', e.target.value)}
              className="w-full p-2 mt-1 bg-bg-elevated border border-border-subtle text-text-primary rounded-lg focus:border-neural-blue focus:outline-none transition-all duration-300"
            >
              <option value="relu">ReLU</option>
              <option value="sigmoid">Sigmoid</option>
              <option value="tanh">Tanh</option>
            </select>
          </motion.label>
        </div>
      )}
      {layer.type === 'dropout' && (
        <div className="space-y-3">
          <motion.label
            className="block"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <span className="text-sm text-text-secondary">Rate:</span>
            <input
              type="number"
              step="0.1"
              min="0"
              max="1"
              value={layer.config.rate || ''}
              onChange={(e) => handleConfigChange('rate', Number(e.target.value))}
              className="w-full p-2 mt-1 bg-bg-elevated border border-border-subtle text-text-primary rounded-lg focus:border-neural-blue focus:outline-none transition-all duration-300"
            />
          </motion.label>
        </div>
      )}
    </motion.div>
  );
};

const NetworkBuilder: React.FC = () => {
  const { layers, selectedLayerId, currentLevelId, isTraining, loss, accuracy, trainingHistory, addLayer, setSelectedLayer, startTraining, stopTraining } = useNetworkStore();
  const setScreen = useAppStore((state) => state.setScreen);

  const level = levels.find(l => l.id === currentLevelId);

  const handleAddLayer = (type: Layer['type']) => {
    const newLayer: Layer = {
      id: crypto.randomUUID(),
      type,
      config: type === 'dense' ? { units: 10, activation: 'relu' }
             : type === 'conv2d' ? { filters: 32, kernelSize: 3, activation: 'relu' }
             : type === 'dropout' ? { rate: 0.2 }
             : {},
    };
    addLayer(newLayer);
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-b from-bg-app to-bg-panel text-text-primary flex"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="w-1/4 p-4 glass m-4 overflow-y-auto"
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-xl mb-4 text-neural-blue">Layers Panel</h2>
        <div className="space-y-2">
          <motion.button
            onClick={() => handleAddLayer('dense')}
            className="w-full bg-neural-blue hover:bg-neural-blue text-bg-app p-2 rounded-lg neon-glow transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Add Dense
          </motion.button>
          <motion.button
            onClick={() => handleAddLayer('conv2d')}
            className="w-full bg-neural-purple hover:bg-neural-purple text-text-primary p-2 rounded-lg neon-glow-purple transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Add Conv2D
          </motion.button>
          <motion.button
            onClick={() => handleAddLayer('dropout')}
            className="w-full bg-neural-green hover:bg-neural-green text-bg-app p-2 rounded-lg transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Add Dropout
          </motion.button>
        </div>
        <div className="mt-4">
          <h3 className="text-lg mb-2">Layers</h3>
          {layers.map((layer, index) => (
            <motion.div
              key={layer.id}
              onClick={() => setSelectedLayer(layer.id)}
              className={`p-2 mb-2 rounded-lg cursor-pointer transition-all duration-300 ${
                selectedLayerId === layer.id ? 'bg-neural-blue text-bg-app' : 'bg-bg-elevated'
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              {layer.type === 'dense' && `${layer.type} (${layer.config.units || 0} units)`}
              {layer.type === 'conv2d' && `${layer.type} (${layer.config.filters || 0} filters, ${layer.config.kernelSize || 0}x${layer.config.kernelSize || 0})`}
              {layer.type === 'dropout' && `${layer.type} (${layer.config.rate || 0} rate)`}
            </motion.div>
          ))}
        </div>
      </motion.div>
      <motion.div
        className="w-1/2 p-4 glass m-4"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Canvas camera={{ position: [0, 0, 10] }}>
          <ambientLight intensity={0.3} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color="purple" />
          <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
          {layers.map((layer, index) => (
            <motion.mesh
              key={layer.id}
              position={[0, index * 2 - (layers.length - 1), 0]}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.2 }}
            >
              <sphereGeometry args={[0.5 + (layer.config.units || 1) / 20, 16, 16]} />
              <meshStandardMaterial
                color={layer.type === 'dense' ? 'cyan' : layer.type === 'conv2d' ? 'purple' : 'green'}
                emissive={isTraining ? 'rgba(0,255,136,0.3)' : 'black'}
              />
            </motion.mesh>
          ))}
        </Canvas>
      </motion.div>
      <motion.div
        className="w-1/4 p-4 glass m-4"
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <h2 className="text-xl mb-4 text-neural-blue">Properties Panel</h2>
        {selectedLayerId ? (
          <LayerProperties layerId={selectedLayerId} />
        ) : (
          <p className="text-text-secondary">Select a layer to edit properties</p>
        )}
        <motion.div
          className="mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <h3 className="text-lg mb-2">Training</h3>
          {level && <p className="mb-2 text-sm text-text-secondary">{level.name}: {level.description}</p>}
          <motion.button
            onClick={() => {
              if (isTraining) {
                stopTraining();
              } else if (level) {
                const trainingData = {
                  inputs: level.puzzleData.trainingData.map(d => d.input),
                  outputs: level.puzzleData.trainingData.map(d => d.output),
                };
                startTraining(trainingData, level.puzzleData.maxEpochs || 100);
              }
            }}
            disabled={!level || layers.length === 0}
            className="w-full bg-neural-green hover:bg-neural-green text-bg-app p-2 rounded-lg disabled:opacity-50 mb-2 transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isTraining ? 'Stop Training' : 'Start Training'}
          </motion.button>
          <p className="text-sm">Loss: <span className="text-neural-red">{loss.toFixed(4)}</span></p>
          <p className="text-sm">Accuracy: <span className="text-neural-green">{accuracy.toFixed(4)}</span></p>
          {!isTraining && accuracy > 0 && (
            <motion.button
              onClick={() => setScreen('results')}
              className="w-full mt-2 bg-neural-yellow hover:bg-neural-yellow text-bg-app p-2 rounded-lg transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              View Results
            </motion.button>
          )}
          {trainingHistory.length > 0 && (
            <ResponsiveContainer width="100%" height={200} className="mt-4">
              <LineChart data={trainingHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                <XAxis dataKey="epoch" stroke="var(--text-secondary)" />
                <YAxis stroke="var(--text-secondary)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--bg-elevated)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '8px',
                  }}
                />
                <Line type="monotone" dataKey="loss" stroke="var(--neural-red)" strokeWidth={2} />
                <Line type="monotone" dataKey="accuracy" stroke="var(--neural-green)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default NetworkBuilder;