import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useNetworkStore, Layer } from '../stores/networkStore';
import { useAppStore } from '../stores/appStore';

const DailyChallenge: React.FC = () => {
  const { layers, selectedLayerId, isTraining, loss, accuracy, trainingHistory, addLayer, setSelectedLayer, startTraining, stopTraining } = useNetworkStore();
  const setScreen = useAppStore((state) => state.setScreen);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes

  useEffect(() => {
    if (timeLeft > 0 && !isTraining) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      stopTraining();
    }
  }, [timeLeft, isTraining, stopTraining]);

  const handleAddLayer = (type: Layer['type']) => {
    const newLayer: Layer = {
      id: Date.now().toString(),
      type,
      config: type === 'dense' ? { units: 10, activation: 'relu' } : {},
    };
    addLayer(newLayer);
  };

  // Use XOR for daily
  const data = {
    inputs: [[0, 0], [0, 1], [1, 0], [1, 1]],
    outputs: [[0], [1], [1], [0]],
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

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
        <h2 className="text-xl mb-4 text-neural-blue">Daily Challenge</h2>
        <div className="mb-4 text-center">
          <div className="text-2xl font-bold text-neural-red">
            {minutes}:{seconds.toString().padStart(2, '0')}
          </div>
          <p className="text-sm text-text-secondary">Time Left</p>
        </div>
        <div className="space-y-2">
          <motion.button
            onClick={() => handleAddLayer('dense')}
            className="w-full bg-neural-blue hover:bg-neural-blue text-bg-app p-2 rounded-lg neon-glow transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Add Dense
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
              {layer.type} - {layer.config.units || 'N/A'}
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
                color="cyan"
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
        <h2 className="text-xl mb-4 text-neural-blue">Training</h2>
        <p className="mb-2 text-sm text-text-secondary">XOR Gate Challenge</p>
        <motion.button
          onClick={() => isTraining ? stopTraining() : startTraining(data, 100)}
          disabled={layers.length === 0 || timeLeft === 0}
          className="w-full bg-neural-green hover:bg-neural-green text-bg-app p-2 rounded-lg disabled:opacity-50 mb-2 transition-all duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isTraining ? 'Stop Training' : 'Start Training'}
        </motion.button>
        <p className="text-sm">Loss: <span className="text-neural-red">{loss.toFixed(4)}</span></p>
        <p className="text-sm">Accuracy: <span className="text-neural-green">{accuracy.toFixed(4)}</span></p>
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
        <motion.button
          onClick={() => setScreen('mainMenu')}
          className="w-full mt-4 bg-neural-red hover:bg-neural-red text-text-primary p-2 rounded-lg transition-all duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Exit Challenge
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default DailyChallenge;