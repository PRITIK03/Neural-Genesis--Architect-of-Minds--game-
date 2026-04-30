import React from 'react';
import { useAppStore } from '../stores/appStore';
import { useNetworkStore } from '../stores/networkStore';

const CampaignMap: React.FC = () => {
  const setScreen = useAppStore((state) => state.setScreen);
  const setCurrentLevel = useNetworkStore((state) => state.setCurrentLevel);

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-purple-900 to-black text-cyan-400 p-8">
      <button onClick={() => setScreen('mainMenu')} className="mb-8 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded">
        Back to Menu
      </button>
      <h1 className="text-4xl font-bold mb-8 text-center">Campaign Map</h1>
      <div className="grid grid-cols-10 gap-4 max-w-4xl mx-auto">
        {Array.from({ length: 40 }, (_, i) => (
          <button
            key={i}
            className="aspect-square bg-cyan-600 hover:bg-cyan-500 text-black font-semibold rounded-lg shadow-lg transition duration-300 flex items-center justify-center"
            onClick={() => { setCurrentLevel(i + 1); setScreen('network'); }}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CampaignMap;