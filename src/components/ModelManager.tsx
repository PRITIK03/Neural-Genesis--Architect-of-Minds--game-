import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNetworkStore } from '../stores/networkStore';

export const ModelManager: React.FC<{
  onLoadModel?: (id: string) => void;
  onClose?: () => void;
}> = ({ onLoadModel, onClose }) => {
  const { savedModels, loadModel, deleteModel, layers } = useNetworkStore();
  const [newModelName, setNewModelName] = useState('');
  const [showSaveForm, setShowSaveForm] = useState(false);

  const handleSave = () => {
    if (!newModelName.trim()) return;
    useNetworkStore.getState().saveModel(newModelName.trim());
    setNewModelName('');
    setShowSaveForm(false);
  };

  const handleLoad = (id: string) => {
    loadModel(id);
    if (onLoadModel) onLoadModel();
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getLayerSummary = (modelLayers: any[]) => {
    const counts: Record<string, number> = {};
    modelLayers.forEach((l) => {
      counts[l.type] = (counts[l.type] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([type, count]) => `${count} ${type}`)
      .join(', ');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-border-subtle pb-3">
        <div>
          <h3 className="text-sm font-bold text-neural-blue">Saved Models</h3>
          <p className="text-xs text-text-dim">Persist your architectures locally</p>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-text-secondary transition-colors hover:bg-bg-elevated hover:text-text-primary"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Save Current Model */}
      {layers.length > 0 && (
        <div className="rounded-lg border border-border-subtle bg-bg-elevated/40 p-3">
          {showSaveForm ? (
            <div className="space-y-2">
              <input
                type="text"
                value={newModelName}
                onChange={(e) => setNewModelName(e.target.value)}
                placeholder="Model name..."
                className="w-full rounded-lg border border-border-subtle bg-bg-app px-3 py-2 text-sm text-text-primary placeholder-text-dim focus:border-neural-blue focus:outline-none"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSave}
                  className="flex-1 rounded-lg bg-neural-blue px-3 py-1.5 text-xs font-bold text-bg-app"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setShowSaveForm(false)}
                  className="flex-1 rounded-lg border border-border-subtle px-3 py-1.5 text-xs text-text-secondary hover:border-neural-blue/40"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowSaveForm(true)}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-neural-blue/40 px-3 py-2 text-xs font-medium text-neural-blue transition-colors hover:border-neural-blue hover:bg-neural-blue/10"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Save Current Architecture
            </button>
          )}
        </div>
      )}

      {/* Saved Models List */}
      <div className="space-y-2">
        {savedModels.length === 0 ? (
          <div className="py-6 text-center">
            <svg className="mx-auto mb-2 h-10 w-10 text-text-dim" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M12 8v8M8 12h8" />
            </svg>
            <p className="text-sm text-text-dim">No saved models yet</p>
          </div>
        ) : (
          savedModels.map((model) => (
            <motion.div
              key={model.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="group rounded-lg border border-border-subtle bg-bg-elevated/60 p-3 transition-all hover:border-neural-blue/40"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h4 className="truncate text-sm font-semibold text-text-primary">
                    {model.name}
                  </h4>
                  <p className="mt-0.5 text-xs text-text-dim">{getLayerSummary(model.layers)}</p>
                  <p className="mt-1 text-[10px] text-text-dim">{formatDate(model.timestamp)}</p>
                </div>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => handleLoad(model.id)}
                    className="rounded-lg bg-neural-blue/10 px-2 py-1 text-xs font-medium text-neural-blue transition-colors hover:bg-neural-blue/20"
                  >
                    Load
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteModel(model.id)}
                    className="rounded-lg border border-border-subtle px-2 py-1 text-xs text-text-secondary transition-colors hover:border-neural-red/40 hover:text-neural-red"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};
