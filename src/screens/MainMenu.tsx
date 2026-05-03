import React from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../stores/appStore';

const MainMenu: React.FC = () => {
  const setScreen = useAppStore((state) => state.setScreen);

  return (
    <div className="min-h-screen bg-gradient-to-b from-bg-app via-neural-purple to-bg-app text-neural-blue flex flex-col items-center justify-center relative overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-neural-blue opacity-20 rounded-full"
            animate={{
              x: [0, Math.random() * 100 - 50],
              y: [0, Math.random() * 100 - 50],
            }}
            transition={{
              duration: Math.random() * 10 + 5,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      <motion.h1
        className="text-6xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-neural-blue to-neural-purple relative z-10"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        ⚡ NeuroPuzzle ⚡
      </motion.h1>

      <motion.div
        className="space-y-4 relative z-10"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <motion.button
          onClick={() => setScreen('campaign')}
          className="block w-64 px-6 py-3 bg-neural-blue hover:bg-neural-blue text-bg-app font-semibold rounded-lg neon-glow transition-all duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Start Campaign
        </motion.button>
        <motion.button
          onClick={() => setScreen('sandbox')}
          className="block w-64 px-6 py-3 bg-neural-purple hover:bg-neural-purple text-text-primary font-semibold rounded-lg neon-glow-purple transition-all duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Sandbox Mode
        </motion.button>
        <motion.button
          onClick={() => setScreen('daily')}
          className="block w-64 px-6 py-3 bg-neural-green hover:bg-neural-green text-bg-app font-semibold rounded-lg transition-all duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Daily Challenge
        </motion.button>
        <motion.button
          onClick={() => setScreen('settings')}
          className="block w-64 px-6 py-3 bg-neural-red hover:bg-neural-red text-text-primary font-semibold rounded-lg transition-all duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Settings
        </motion.button>
      </motion.div>
    </div>
  );
};

export default MainMenu;