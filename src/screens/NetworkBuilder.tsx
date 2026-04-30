import React from 'react';
import { Canvas } from '@react-three/fiber';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useNetworkStore, Layer } from '../stores/networkStore';
import levels from '../lib/levels';

const LayerProperties: React.FC<{ layerId: string }> = ({ layerId }) => {
  const { layers, updateLayer } = useNetworkStore();
  const layer = layers.find((l) => l.id === layerId);

  if (!layer) return null;

  const handleConfigChange = (key: string, value: any) => {
    updateLayer(layerId, { ...layer.config, [key]: value });
  };

  return (
    <div>
      <h3 className="text-lg mb-2">{layer.type} Properties</h3>
      {layer.type === 'dense' && (
        <div className="space-y-2">
          <label className="block">
            Units:
            <input
              type="number"
              value={layer.config.units || ''}
              onChange={(e) => handleConfigChange('units', Number(e.target.value))}
              className="w-full p-1 bg-gray-700 text-white rounded"
            />
          </label>
          <label className="block">
            Activation:
            <select
              value={layer.config.activation || ''}
              onChange={(e) => handleConfigChange('activation', e.target.value)}
              className="w-full p-1 bg-gray-700 text-white rounded"
            >
              <option value="relu">ReLU</option>
              <option value="sigmoid">Sigmoid</option>
              <option value="tanh">Tanh</option>
            </select>
          </label>
        </div>
      )}
      {/* Add more types later */}
    </div>
  );
};

const NetworkBuilder: React.FC = () => {
  const { layers, selectedLayerId, currentLevelId, isTraining, loss, accuracy, trainingHistory, addLayer, setSelectedLayer, startTraining, stopTraining } = useNetworkStore();

  const handleAddLayer = (type: Layer['type']) => {
    const newLayer: Layer = {
      id: Date.now().toString(),
      type,
      config: type === 'dense' ? { units: 10, activation: 'relu' } : {},
    };
    addLayer(newLayer);
  };

  return (
    <div className="min-h-screen bg-black text-white flex">
      <div className="w-1/4 p-4 bg-gray-800 overflow-y-auto">
        <h2 className="text-xl mb-4">Layers Panel</h2>
        <div className="space-y-2">
          <button
            onClick={() => handleAddLayer('dense')}
            className="w-full bg-cyan-600 hover:bg-cyan-500 p-2 rounded transition"
          >
            Add Dense
          </button>
          <button
            onClick={() => handleAddLayer('conv2d')}
            className="w-full bg-purple-600 hover:bg-purple-500 p-2 rounded transition"
          >
            Add Conv2D
          </button>
          <button
            onClick={() => handleAddLayer('dropout')}
            className="w-full bg-green-600 hover:bg-green-500 p-2 rounded transition"
          >
            Add Dropout
          </button>
        </div>
        <div className="mt-4">
          <h3 className="text-lg mb-2">Layers</h3>
          {layers.map((layer) => (
            <div
              key={layer.id}
              onClick={() => setSelectedLayer(layer.id)}
              className={`p-2 mb-2 rounded cursor-pointer transition ${
                selectedLayerId === layer.id ? 'bg-cyan-600' : 'bg-gray-700'
              }`}
            >
              {layer.type} - {layer.config.units || 'N/A'}
            </div>
          ))}
        </div>
      </div>
      <div className="w-1/2 p-4 bg-gray-900">
        <Canvas camera={{ position: [0, 0, 10] }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          {layers.map((layer, index) => (
            <mesh key={layer.id} position={[0, index * 2 - (layers.length - 1), 0]}>
              <sphereGeometry args={[0.5, 16, 16]} />
              <meshStandardMaterial color="cyan" />
            </mesh>
          ))}
        </Canvas>
      </div>
      <div className="w-1/4 p-4 bg-gray-800">
        <h2 className="text-xl mb-4">Properties Panel</h2>
        {selectedLayerId ? (
          <LayerProperties layerId={selectedLayerId} />
        ) : (
          <p>Select a layer to edit properties</p>
        )}
      </div>
    </div>
  );
};

export default NetworkBuilder;