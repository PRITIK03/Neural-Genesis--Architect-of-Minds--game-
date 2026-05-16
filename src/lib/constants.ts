export const NEURO_COLORS = {
  blue: 'neural-blue',
  purple: 'neural-purple',
  green: 'neural-green',
  yellow: 'neural-yellow',
  orange: 'neural-orange',
  red: 'neural-red',
} as const;

export const LAYER_LIMITS = {
  minUnits: 1,
  maxUnits: 1024,
  minFilters: 1,
  maxFilters: 256,
  minDropoutRate: 0,
  maxDropoutRate: 0.9,
  minMomentum: 0.8,
  maxMomentum: 0.999,
  minPoolSize: 2,
  maxPoolSize: 4,
  kernelSizes: [1, 2, 3, 5, 7] as const,
} as const;

export const ACTIVATIONS = ['relu', 'sigmoid', 'tanh', 'linear'] as const;
export const ACTIVATIONS_CONV = ['relu', 'sigmoid', 'tanh'] as const;
export const POOLING_TYPES = ['max', 'average'] as const;

export const DEFAULT_SESSION = {
  epochs: 100,
  batchSize: 32,
  learningRate: 0.001,
  optimizer: 'adam' as const,
};

export const BATCH_SIZES = [8, 16, 32, 64, 128, 256, 512] as const;