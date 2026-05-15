import { create } from 'zustand';

export type OptimizerType = 'adam' | 'sgd' | 'rmsprop' | 'adagrad';

export interface TrainingSession {
  epochs: number;
  batchSize?: number;
  learningRate?: number;
  optimizer: OptimizerType;
}

export interface LayerConfig {
  [key: string]: any;
}

export interface Layer {
  id: string;
  type: 'dense' | 'conv2d' | 'dropout' | 'batchNorm' | 'pooling' | 'flatten';
  config: LayerConfig;
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

export type TrainingStatus = 'idle' | 'training' | 'paused' | 'completed' | 'stopped';

export interface TrainingMetrics {
  epoch: number;
  loss: number;
  accuracy: number;
  valLoss?: number;
  valAccuracy?: number;
  learningRate?: number;
}

// Legacy properties for backward compatibility
export interface LegacyMetrics {
  loss: number;
  accuracy: number;
  isTraining: boolean;
  trainingHistory: { epoch: number; loss: number; accuracy: number }[];
}

interface NetworkState extends LegacyMetrics {
  layers: Layer[];
  selectedLayerId: string | null;
  currentLevelId: string | null;
  customPuzzle: CustomPuzzle | null;
  trainingStatus: TrainingStatus;
  currentMetrics: { loss: number; accuracy: number };
  trainingHistory: TrainingMetrics[];
  trainingSession: TrainingSession | null;
  savedModels: { id: string; name: string; layers: Layer[]; timestamp: number }[];
  worker: Worker | null;
  error: string | null;
  addLayer: (layer: Layer) => void;
  removeLayer: (id: string) => void;
  updateLayer: (id: string, config: Partial<LayerConfig>) => void;
  setSelectedLayer: (id: string | null) => void;
  setCurrentLevel: (id: string) => void;
  setCustomPuzzle: (puzzle: CustomPuzzle | null) => void;
  startTraining: (data: TrainingData, session?: Partial<TrainingSession>) => void;
  stopTraining: () => void;
   pauseTraining: () => void;
  resumeTraining: () => void;
  clearWorkspace: () => void;
  updateSession: (patch: Partial<TrainingSession>) => void;
  saveModel: (name: string) => void;
  loadModel: (id: string) => void;
  deleteModel: (id: string) => void;
  setError: (error: string | null) => void;
  reorderLayers: (fromIndex: number, toIndex: number) => void;
  duplicateLayer: (id: string) => void;
  moveLayer: (id: string, direction: 'up' | 'down') => void;
}

export const useNetworkStore = create<NetworkState>((set, get) => ({
  layers: [],
  selectedLayerId: null,
  currentLevelId: null,
  customPuzzle: null,
  trainingStatus: 'idle',
  currentMetrics: { loss: 0, accuracy: 0 },
  trainingHistory: [],
  trainingSession: null,
  savedModels: [],
  worker: null,
  error: null,
  // Legacy getters - these will be accessed as properties
  get isTraining() { return get().trainingStatus === 'training'; },
  get loss() { return get().currentMetrics.loss; },
  get accuracy() { return get().currentMetrics.accuracy; },
  get legacyTrainingHistory() {
    return get().trainingHistory.map(h => ({ epoch: h.epoch, loss: h.loss, accuracy: h.accuracy }));
  },

  addLayer: (layer) => set((state) => ({ layers: [...state.layers, layer] })),

  removeLayer: (id) =>
    set((state) => ({
      layers: state.layers.filter((l) => l.id !== id),
      selectedLayerId: state.selectedLayerId === id ? null : state.selectedLayerId,
    })),

  updateLayer: (id, config) =>
    set((state) => ({
      layers: state.layers.map((l) =>
        l.id === id ? { ...l, config: { ...l.config, ...config } } : l
      ),
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
      currentMetrics: { loss: 0, accuracy: 0 },
      trainingStatus: 'idle',
      trainingSession: null,
      error: null,
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
      currentMetrics: { loss: 0, accuracy: 0 },
      trainingStatus: 'idle',
      trainingSession: null,
      error: null,
    });
  },

  startTraining: (data, sessionOverride) => {
    const { layers, trainingSession } = get();
    if (layers.length === 0) return;

    const defaultSession: TrainingSession = {
      epochs: 100,
      batchSize: 32,
      learningRate: 0.001,
      optimizer: 'adam',
    };

    const session = { ...defaultSession, ...trainingSession, ...sessionOverride };

    const worker = new Worker(new URL('../workers/trainingWorker.ts', import.meta.url));
    set({ worker, trainingStatus: 'training', trainingHistory: [], trainingSession: session, error: null, currentMetrics: { loss: 0, accuracy: 0 } });

    worker.postMessage({
      type: 'start',
      layers,
      data,
      epochs: session.epochs,
      batchSize: session.batchSize,
      learningRate: session.learningRate,
      optimizer: session.optimizer,
    });

    worker.onmessage = (e) => {
      const { type, epoch, loss, accuracy, error: err } = e.data;
      if (type === 'error') {
        set({ trainingStatus: 'stopped', error: err });
        worker.terminate();
        set({ worker: null });
        return;
      }
      if (type === 'progress') {
        set((state) => ({
          currentMetrics: { loss, accuracy },
          trainingHistory: [...state.trainingHistory, {
            epoch,
            loss,
            accuracy,
            learningRate: session.learningRate,
          }],
        }));
      } else if (type === 'done') {
        set({
          trainingStatus: 'completed',
          currentMetrics: { loss, accuracy },
        });
        worker.terminate();
        set({ worker: null });
      } else if (type === 'paused') {
        set({ trainingStatus: 'paused' });
      } else if (type === 'resumed') {
        set({ trainingStatus: 'training' });
      }
    };
  },

  stopTraining: () => {
    const { worker } = get();
    if (worker) {
      worker.postMessage({ type: 'stop' });
      set({ trainingStatus: 'stopped' });
    }
  },

  pauseTraining: () => {
    const { worker } = get();
    if (worker) {
      worker.postMessage({ type: 'pause' });
    }
  },

  resumeTraining: () => {
    const { worker } = get();
    if (worker) {
      worker.postMessage({ type: 'resume' });
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
      currentMetrics: { loss: 0, accuracy: 0 },
      trainingStatus: 'idle',
      trainingSession: null,
      error: null,
      currentLevelId: null,
      customPuzzle: null,
    });
  },

  updateSession: (patch) => {
    set((state) => ({
      trainingSession: state.trainingSession ? { ...state.trainingSession, ...patch } : null,
    }));
  },

  saveModel: (name) => {
    const { layers } = get();
    const model = {
      id: crypto.randomUUID(),
      name,
      layers: [...layers],
      timestamp: Date.now(),
    };
    set((state) => ({
      savedModels: [...state.savedModels, model],
    }));
  },

  loadModel: (id) => {
    const { savedModels } = get();
    const model = savedModels.find((m) => m.id === id);
    if (model) {
      set({
        layers: [...model.layers],
        selectedLayerId: null,
        trainingHistory: [],
        currentMetrics: { loss: 0, accuracy: 0 },
        trainingStatus: 'idle',
      });
    }
  },

  deleteModel: (id) => {
    set((state) => ({
      savedModels: state.savedModels.filter((m) => m.id !== id),
    }));
  },

  setError: (error) => set({ error }),

  reorderLayers: (fromIndex, toIndex) => {
    set((state) => {
      const newLayers = [...state.layers];
      const [removed] = newLayers.splice(fromIndex, 1);
      newLayers.splice(toIndex, 0, removed);
      return { layers: newLayers };
    });
  },

  duplicateLayer: (id) => {
    set((state) => {
      const index = state.layers.findIndex((l) => l.id === id);
      if (index === -1) return state;
      const original = state.layers[index];
      const duplicate: Layer = {
        id: crypto.randomUUID(),
        type: original.type,
        config: { ...original.config },
      };
      const newLayers = [...state.layers];
      newLayers.splice(index + 1, 0, duplicate);
      return { layers: newLayers };
    });
  },

  moveLayer: (id, direction) => {
    set((state) => {
      const index = state.layers.findIndex((l) => l.id === id);
      if (index === -1) return state;
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= state.layers.length) return state;
      const newLayers = [...state.layers];
      [newLayers[index], newLayers[newIndex]] = [newLayers[newIndex], newLayers[index]];
      return { layers: newLayers };
    });
  },
}));
