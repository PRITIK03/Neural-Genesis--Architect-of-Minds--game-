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

export interface CustomPuzzle {
  id: string;
  name: string;
  description: string;
  inputShape: number[];
  outputShape: number[];
  trainingData: { input: number[]; output: number[] }[];
  testData: { input: number[]; output: number[] }[];
  accuracyThreshold: number;
  maxEpochs: number;
  maxLayers: number;
  maxNeurons: number;
}

interface NetworkState {
  layers: Layer[];
  selectedLayerId: string | null;
  currentLevelId: string | null;
  customPuzzle: CustomPuzzle | null;
  isTraining: boolean;
  loss: number;
  accuracy: number;
  trainingHistory: { epoch: number; loss: number; accuracy: number }[];
  worker: Worker | null;
  addLayer: (layer: Layer) => void;
  removeLayer: (id: string) => void;
  updateLayer: (id: string, config: Record<string, any>) => void;
  setSelectedLayer: (id: string | null) => void;
  setCurrentLevel: (id: string) => void;
  setCustomPuzzle: (puzzle: CustomPuzzle | null) => void;
  startTraining: (data: TrainingData, epochs: number) => void;
  stopTraining: () => void;
  clearWorkspace: () => void;
}

export const useNetworkStore = create<NetworkState>((set, get) => ({
  layers: [],
  selectedLayerId: null,
  currentLevelId: null,
  customPuzzle: null,
  isTraining: false,
  loss: 0,
  accuracy: 0,
  trainingHistory: [],
  worker: null,
  addLayer: (layer) => set((state) => ({ layers: [...state.layers, layer] })),
  removeLayer: (id) =>
    set((state) => ({
      layers: state.layers.filter((l) => l.id !== id),
      selectedLayerId: state.selectedLayerId === id ? null : state.selectedLayerId,
    })),
  updateLayer: (id, config) =>
    set((state) => ({
      layers: state.layers.map((l) => (l.id === id ? { ...l, config } : l)),
    })),
  setSelectedLayer: (id) => set({ selectedLayerId: id }),
  setCurrentLevel: (id) => {
    const { worker } = get();
    worker?.terminate();
    set({
      worker: null,
      currentLevelId: id,
      customPuzzle: null,
      layers: [],
      selectedLayerId: null,
      trainingHistory: [],
      loss: 0,
      accuracy: 0,
      isTraining: false,
    });
  },
  setCustomPuzzle: (puzzle) => {
    const { worker } = get();
    worker?.terminate();
    set({
      worker: null,
      customPuzzle: puzzle,
      currentLevelId: puzzle ? `custom-${puzzle.id}` : null,
      layers: [],
      selectedLayerId: null,
      trainingHistory: [],
      loss: 0,
      accuracy: 0,
      isTraining: false,
    });
  },
  startTraining: (data, epochs) => {
    const { layers, customPuzzle } = get();
    if (layers.length === 0) return;

    const worker = new Worker(new URL('../workers/trainingWorker.ts', import.meta.url));
    set({ worker, isTraining: true, trainingHistory: [] });

    worker.postMessage({
      type: 'start',
      layers,
      data,
      epochs,
      meta: customPuzzle
        ? { inputShape: customPuzzle.inputShape, outputShape: customPuzzle.outputShape }
        : undefined,
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
  clearWorkspace: () => {
    const { worker } = get();
    worker?.terminate();
    set({
      worker: null,
      layers: [],
      selectedLayerId: null,
      trainingHistory: [],
      loss: 0,
      accuracy: 0,
      isTraining: false,
    });
  },
}));