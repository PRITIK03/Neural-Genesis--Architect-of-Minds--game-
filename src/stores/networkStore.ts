import { create } from 'zustand';

export interface Layer {
  id: string;
  type: 'dense' | 'conv2d' | 'dropout';
  config: Record<string, any>;
}

export interface TrainingData {
  inputs: number[][];
  outputs: number[][];
}

interface NetworkState {
  layers: Layer[];
  selectedLayerId: string | null;
  currentLevelId: number | null;
  isTraining: boolean;
  loss: number;
  accuracy: number;
  trainingHistory: { epoch: number; loss: number; accuracy: number }[];
  worker: Worker | null;
  addLayer: (layer: Layer) => void;
  removeLayer: (id: string) => void;
  updateLayer: (id: string, config: Record<string, any>) => void;
  setSelectedLayer: (id: string | null) => void;
  setCurrentLevel: (id: number) => void;
  startTraining: (data: TrainingData, epochs: number) => void;
  stopTraining: () => void;
}

export const useNetworkStore = create<NetworkState>((set, get) => ({
  layers: [],
  selectedLayerId: null,
  currentLevelId: null,
  isTraining: false,
  loss: 0,
  accuracy: 0,
  trainingHistory: [],
  worker: null,
  addLayer: (layer) => set((state) => ({ layers: [...state.layers, layer] })),
  removeLayer: (id) => set((state) => ({ layers: state.layers.filter((l) => l.id !== id) })),
  updateLayer: (id, config) =>
    set((state) => ({
      layers: state.layers.map((l) => (l.id === id ? { ...l, config } : l)),
    })),
  setSelectedLayer: (id) => set({ selectedLayerId: id }),
  setCurrentLevel: (id) => set({ currentLevelId: id }),
  startTraining: (data, epochs) => {
    const { layers } = get();
    if (layers.length === 0) return;

    const worker = new Worker(new URL('../workers/trainingWorker.ts', import.meta.url));
    set({ worker, isTraining: true, trainingHistory: [] });

    worker.postMessage({
      type: 'start',
      layers,
      data,
      epochs,
    });

    worker.onmessage = (e) => {
      if (e.data.type === 'progress') {
        set((state) => ({
          loss: e.data.loss,
          accuracy: e.data.accuracy,
          trainingHistory: [...state.trainingHistory, {
            epoch: e.data.epoch,
            loss: e.data.loss,
            accuracy: e.data.accuracy,
          }],
        }));
      } else if (e.data.type === 'done') {
        set({
          isTraining: false,
          loss: e.data.loss,
          accuracy: e.data.accuracy,
        });
        worker.terminate();
        set({ worker: null });
      }
    };
  },
  stopTraining: () => {
    const { worker } = get();
    if (worker) {
      worker.terminate();
      set({ worker: null, isTraining: false });
    }
  },
}));