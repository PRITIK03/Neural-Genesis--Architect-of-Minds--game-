import React from 'react';
import { motion } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@radix-ui/react-tooltip';
import { useAppStore } from '../stores/appStore';
import { useNetworkStore } from '../stores/networkStore';
import levels from '../lib/levels';

const CampaignMap: React.FC = () => {
  const setScreen = useAppStore((state) => state.setScreen);
  const setCurrentLevel = useNetworkStore((state) => state.setCurrentLevel);

  // Simple tree layout: levels in rows
  const rows = [
    [1], // Act 1: Foundations
    [2, 3],
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { scale: 1, opacity: 1 },
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-b from-bg-app via-neural-purple to-bg-app text-neural-blue p-8 relative overflow-hidden">
        {/* Animated connections */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="var(--neural-blue)" />
            </marker>
          </defs>
          {/* Draw lines between levels */}
          <line x1="50%" y1="30%" x2="30%" y2="40%" stroke="var(--neural-blue)" strokeWidth="2" markerEnd="url(#arrowhead)" />
          <line x1="50%" y1="30%" x2="70%" y2="40%" stroke="var(--neural-blue)" strokeWidth="2" markerEnd="url(#arrowhead)" />
          {/* Add more connections as needed */}
        </svg>

        <motion.button
          onClick={() => setScreen('mainMenu')}
          className="mb-8 px-4 py-2 glass hover:bg-neural-blue/20 text-text-primary rounded-lg transition-all duration-300 relative z-10"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Back to Menu
        </motion.button>

        <motion.h1
          className="text-4xl font-bold mb-8 text-center text-text-primary relative z-10"
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          Campaign Map
        </motion.h1>

        <motion.div
          className="max-w-6xl mx-auto space-y-8 relative z-10"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {rows.map((row, rowIndex) => (
            <div key={rowIndex} className="flex justify-center space-x-8">
              {row.map((levelId) => {
                const level = levels.find(l => l.id === levelId);
                return (
                  <Tooltip key={levelId}>
                    <TooltipTrigger asChild>
                      <motion.button
                        className="w-16 h-16 bg-neural-blue hover:bg-neural-blue text-bg-app font-semibold rounded-full shadow-lg neon-glow transition-all duration-300 flex items-center justify-center"
                        onClick={() => { setCurrentLevel(levelId); setScreen('network'); }}
                        variants={itemVariants}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        {levelId}
                      </motion.button>
                    </TooltipTrigger>
                    <TooltipContent className="glass p-4 rounded-lg max-w-xs">
                      <h3 className="text-lg font-bold text-text-primary">{level?.name || `Level ${levelId}`}</h3>
                      <p className="text-sm text-text-secondary">{level?.description || 'No description'}</p>
                      {/* Add mini sparkline here later */}
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          ))}
        </motion.div>
      </div>
    </TooltipProvider>
  );
};

export default CampaignMap;