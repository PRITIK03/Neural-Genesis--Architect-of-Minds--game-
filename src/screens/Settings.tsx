import React from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../stores/appStore';

const Settings: React.FC = () => {
  const setScreen = useAppStore((state) => state.setScreen);

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-b from-bg-app to-bg-panel text-text-primary flex flex-col items-center justify-center p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.h1
        className="text-4xl font-bold mb-8"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        Settings
      </motion.h1>

      <motion.div
        className="glass p-6 rounded-lg max-w-md w-full space-y-4"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div>
          <label className="block text-sm text-text-secondary mb-1">Theme:</label>
          <select className="w-full p-2 bg-bg-elevated border border-border-subtle text-text-primary rounded-lg">
            <option>Dark Neon (Default)</option>
            <option>Ocean Depths</option>
            <option>Forest Canopy</option>
            {/* Add more */}
          </select>
        </div>

        <div>
          <label className="block text-sm text-text-secondary mb-1">Graphics Quality:</label>
          <select className="w-full p-2 bg-bg-elevated border border-border-subtle text-text-primary rounded-lg">
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>
        </div>

        <div>
          <label className="block text-sm text-text-secondary mb-1">Sound Volume:</label>
          <input type="range" min="0" max="100" className="w-full" />
        </div>
      </motion.div>

      <motion.button
        onClick={() => setScreen('mainMenu')}
        className="mt-6 px-6 py-2 glass hover:bg-neural-blue/20 text-text-primary rounded-lg transition-all duration-300"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Back to Menu
      </motion.button>
    </motion.div>
  );
};

export default Settings;