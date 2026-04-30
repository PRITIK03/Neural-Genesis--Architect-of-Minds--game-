import React from 'react';
import { useAppStore } from '../stores/appStore';

const MainMenu: React.FC = () => {
  const setScreen = useAppStore((state) => state.setScreen);
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-purple-900 to-black text-cyan-400 flex flex-col items-center justify-center">
      <h1 className="text-6xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
        NeuroPuzzle
      </h1>
      <div className="space-y-4">
        <button onClick={() => setScreen('campaign')} className="block w-64 px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-black font-semibold rounded-lg shadow-lg transition duration-300">
          Start Campaign
        </button>
        <button onClick={() => setScreen('sandbox')} className="block w-64 px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-lg shadow-lg transition duration-300">
          Sandbox Mode
        </button>
        <button onClick={() => setScreen('daily')} className="block w-64 px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-lg shadow-lg transition duration-300">
          Daily Challenge
        </button>
        <button onClick={() => setScreen('settings')} className="block w-64 px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-lg shadow-lg transition duration-300">
          Settings
        </button>
      </div>
    </div>
  );
};

export default MainMenu;