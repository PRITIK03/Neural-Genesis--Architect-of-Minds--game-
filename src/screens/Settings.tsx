import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../stores/appStore';
import { NeuralBackdrop } from '../components/NeuralBackdrop';
import { ScreenHeader } from '../components/ScreenHeader';
import { saveSettings, loadSettings, type GameSettings } from '../lib/playerProgress';

const Settings: React.FC = () => {
  const setScreen = useAppStore((state) => state.setScreen);
  const [draft, setDraft] = useState<GameSettings>(() => loadSettings());

  useEffect(() => {
    document.documentElement.dataset.reducedMotion = draft.reducedMotion ? 'true' : 'false';
  }, [draft.reducedMotion]);

  useEffect(() => {
    document.documentElement.dataset.theme = draft.theme;
  }, [draft.theme]);

  const persist = (next: GameSettings) => {
    setDraft(next);
    saveSettings(next);
  };

  return (
    <div className="relative min-h-screen px-4 py-10 text-text-primary md:px-10">
      <NeuralBackdrop />

      <div className="relative z-10 mx-auto max-w-lg">
        <ScreenHeader title="Settings" subtitle="Preferences stay on this device." onBack={() => setScreen('mainMenu')} backLabel="Main menu" />

        <motion.div
          className="panel-card mt-6 space-y-6 p-6 md:p-8"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-text-dim">Theme accent</label>
            <p className="mb-2 text-xs text-text-secondary">Cosmetic label for now—persists for future palettes.</p>
            <select
              value={draft.theme}
              onChange={(e) => persist({ ...draft, theme: e.target.value })}
              className="mt-1 w-full rounded-xl border border-border-subtle bg-bg-app p-3 text-sm text-text-primary focus:border-neural-blue focus:outline-none"
            >
              <option value="dark-neon">Dark neon (default)</option>
              <option value="ocean">Ocean depths</option>
              <option value="forest">Forest canopy</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-text-dim">Master volume</label>
            <div className="mt-3 flex items-center gap-4">
              <input
                type="range"
                min={0}
                max={100}
                value={draft.soundVolume}
                onChange={(e) => persist({ ...draft, soundVolume: Number(e.target.value) })}
                className="h-2 w-full accent-neural-blue"
              />
              <span className="w-10 text-right font-mono text-sm text-neural-blue">{draft.soundVolume}%</span>
            </div>
            <p className="mt-2 text-xs text-text-secondary">Hooks into audio when sound design lands.</p>
          </div>

          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border-subtle bg-bg-elevated/60 p-4">
            <input
              type="checkbox"
              checked={draft.reducedMotion}
              onChange={(e) => persist({ ...draft, reducedMotion: e.target.checked })}
              className="mt-1 h-4 w-4 rounded border-border-subtle accent-neural-blue"
            />
            <span>
              <span className="block text-sm font-semibold text-text-primary">Reduce motion</span>
              <span className="text-xs text-text-secondary">Toning down celebratory motion keeps things calmer.</span>
            </span>
          </label>
        </motion.div>
      </div>
    </div>
  );
};

export default Settings;
