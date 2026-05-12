export interface PuzzleData {
  inputShape: number[];
  outputShape: number[];
  trainingData: { input: number[]; output: number[] }[];
  testData: { input: number[]; output: number[] }[];
  accuracyThreshold: number;
  maxEpochs: number;
  maxLayers: number;
  maxNeurons: number;
}

export interface Level {
  id: string;
  name: string;
  description: string;
  difficulty: number;
  act: number;
  category: 'Foundations' | 'Specialization' | 'Mastery';
  puzzleData: PuzzleData;
  unlockedBy: string[];
  rewards: { xp: number; stars: number };
}

export const levels: Level[] = [
  // Level 1: XOR Gate
  {
    id: 'level-1',
    name: 'XOR Gate',
    description: 'Learn the fundamental XOR logic gate',
    difficulty: 1,
    act: 1,
    category: 'Foundations',
    puzzleData: {
      inputShape: [2],
      outputShape: [1],
      trainingData: [
        { input: [0, 0], output: [0] },
        { input: [0, 1], output: [1] },
        { input: [1, 0], output: [1] },
        { input: [1, 1], output: [0] },
        { input: [0.1, 0.1], output: [0] },
        { input: [0.1, 0.9], output: [1] },
        { input: [0.9, 0.1], output: [1] },
        { input: [0.9, 0.9], output: [0] },
      ],
      testData: [
        { input: [0, 0], output: [0] },
        { input: [0, 1], output: [1] },
        { input: [1, 0], output: [1] },
        { input: [1, 1], output: [0] },
      ],
      accuracyThreshold: 0.95,
      maxEpochs: 100,
      maxLayers: 2,
      maxNeurons: 4,
    },
    unlockedBy: [],
    rewards: { xp: 100, stars: 3 },
  },
  // Level 2: AND Gate
  {
    id: 'level-2',
    name: 'AND Gate',
    description: 'Master the AND logic gate',
    difficulty: 1,
    act: 1,
    category: 'Foundations',
    puzzleData: {
      inputShape: [2],
      outputShape: [1],
      trainingData: [
        { input: [0, 0], output: [0] },
        { input: [0, 1], output: [0] },
        { input: [1, 0], output: [0] },
        { input: [1, 1], output: [1] },
        { input: [0.2, 0.2], output: [0] },
        { input: [0.2, 0.8], output: [0] },
        { input: [0.8, 0.2], output: [0] },
        { input: [0.8, 0.8], output: [1] },
      ],
      testData: [
        { input: [0, 0], output: [0] },
        { input: [0, 1], output: [0] },
        { input: [1, 0], output: [0] },
        { input: [1, 1], output: [1] },
      ],
      accuracyThreshold: 0.95,
      maxEpochs: 100,
      maxLayers: 2,
      maxNeurons: 4,
    },
    unlockedBy: ['level-1'],
    rewards: { xp: 150, stars: 3 },
  },
  // Level 3: Three-Way Classification
  {
    id: 'level-3',
    name: 'Three-Way Classification',
    description: 'Classify three distinct patterns',
    difficulty: 2,
    act: 1,
    category: 'Foundations',
    puzzleData: {
      inputShape: [2],
      outputShape: [3],
      trainingData: [
        // Pattern A: (0,0) -> 0, (1,0) -> 0, (0,1) -> 1, (1,1) -> 2
        { input: [0, 0], output: [1, 0, 0] },
        { input: [1, 0], output: [1, 0, 0] },
        { input: [0, 1], output: [0, 1, 0] },
        { input: [1, 1], output: [0, 0, 1] },
        // Additional samples
        { input: [0.5, 0], output: [1, 0, 0] },
        { input: [0, 0.5], output: [0, 1, 0] },
        { input: [0.5, 0.5], output: [0, 0, 1] },
      ],
      testData: [
        { input: [0, 0], output: [1, 0, 0] },
        { input: [1, 0], output: [1, 0, 0] },
        { input: [0, 1], output: [0, 1, 0] },
        { input: [1, 1], output: [0, 0, 1] },
      ],
      accuracyThreshold: 0.85,
      maxEpochs: 200,
      maxLayers: 3,
      maxNeurons: 10,
    },
    unlockedBy: ['level-2'],
    rewards: { xp: 300, stars: 3 },
  },
  // Level 4: Circle vs Square
  {
    id: 'level-4',
    name: 'Circle vs Square',
    description: 'Distinguish between circular and rectangular shapes',
    difficulty: 2,
    act: 1,
    category: 'Foundations',
    puzzleData: {
      inputShape: [2],
      outputShape: [2],
      trainingData: [
        // Circles: (x,y) where x^2 + y^2 < 0.5
        { input: [0.3, 0.4], output: [1, 0] }, // circle
        { input: [0.1, 0.2], output: [1, 0] },
        { input: [-0.2, 0.3], output: [1, 0] },
        { input: [0.4, -0.1], output: [1, 0] },
        // Squares: |x| + |y| > 0.7
        { input: [0.8, 0.8], output: [0, 1] }, // square
        { input: [-0.9, 0.9], output: [0, 1] },
        { input: [0.9, -0.9], output: [0, 1] },
        { input: [-0.8, -0.8], output: [0, 1] },
      ],
      testData: [
        { input: [0.2, 0.3], output: [1, 0] },
        { input: [0.7, 0.7], output: [0, 1] },
        { input: [-0.3, 0.4], output: [1, 0] },
        { input: [-0.8, 0.6], output: [0, 1] },
      ],
      accuracyThreshold: 0.9,
      maxEpochs: 300,
      maxLayers: 4,
      maxNeurons: 15,
    },
    unlockedBy: ['level-3'],
    rewards: { xp: 350, stars: 3 },
  },
  // Level 5: Overfitting Prevention
  {
    id: 'level-5',
    name: 'Overfitting Prevention',
    description: 'Learn to generalize without overfitting to training data',
    difficulty: 3,
    act: 1,
    category: 'Foundations',
    puzzleData: {
      inputShape: [2],
      outputShape: [1],
      trainingData: [
        // Linear pattern with noise
        { input: [0, 0], output: [0] },
        { input: [1, 0], output: [0.2] },
        { input: [0, 1], output: [0.3] },
        { input: [1, 1], output: [0.5] },
        { input: [0.5, 0.5], output: [0.25] },
        { input: [0.2, 0.8], output: [0.35] },
        { input: [0.8, 0.2], output: [0.25] },
        { input: [0.3, 0.7], output: [0.32] },
      ],
      testData: [
        { input: [0.4, 0.6], output: [0.28] },
        { input: [0.6, 0.4], output: [0.26] },
        { input: [0.1, 0.9], output: [0.38] },
        { input: [0.9, 0.1], output: [0.22] },
      ],
      accuracyThreshold: 0.8,
      maxEpochs: 400,
      maxLayers: 3,
      maxNeurons: 8, // Smaller network to prevent overfitting
    },
    unlockedBy: ['level-4'],
    rewards: { xp: 400, stars: 3 },
  },
  // Level 6: Binary Classification with Noise
  {
    id: 'level-6',
    name: 'Noisy Signals',
    description: 'Classify binary patterns amidst random noise',
    difficulty: 3,
    act: 1,
    category: 'Foundations',
    puzzleData: {
      inputShape: [3],
      outputShape: [1],
      trainingData: [
        // Class 0: first two inputs similar, noise in third
        { input: [0.1, 0.2, 0.25], output: [0] },
        { input: [0.3, 0.4, 0.35], output: [0] },
        { input: [0.5, 0.6, 0.45], output: [0] },
        { input: [0.7, 0.8, 0.55], output: [0] },
        // Class 1: first two inputs different, noise in third
        { input: [0.1, 0.8, 0.65], output: [1] },
        { input: [0.2, 0.9, 0.75], output: [1] },
        { input: [0.3, 0.7, 0.85], output: [1] },
        { input: [0.4, 0.6, 0.95], output: [1] },
      ],
      testData: [
        { input: [0.2, 0.3, 0.5], output: [0] },
        { input: [0.6, 0.1, 0.3], output: [1] },
        { input: [0.4, 0.5, 0.7], output: [0] },
        { input: [0.8, 0.2, 0.1], output: [1] },
      ],
      accuracyThreshold: 0.85,
      maxEpochs: 500,
      maxLayers: 4,
      maxNeurons: 12,
    },
    unlockedBy: ['level-5'],
    rewards: { xp: 450, stars: 3 },
  },
  // Level 7: Introduction to Convolutional Networks
  {
    id: 'level-7',
    name: 'Pattern Recognition',
    description: 'Detect simple visual patterns using convolutional layers',
    difficulty: 4,
    act: 2,
    category: 'Specialization',
    puzzleData: {
      inputShape: [4, 4, 1], // Simple 4x4 grayscale images
      outputShape: [2],
      trainingData: [
        // Horizontal lines -> [1,0], Vertical lines -> [0,1]
        // Horizontal: rows with similar values
        { input: Array(16).fill(0).map((_, i) => i % 4 < 2 ? 0.8 : 0.2), output: [1, 0] },
        { input: Array(16).fill(0).map((_, i) => Math.floor(i / 4) < 2 ? 0.8 : 0.2), output: [1, 0] },
        // Vertical: columns with similar values
        { input: Array(16).fill(0).map((_, i) => i % 4 < 2 ? 0.8 : 0.2).reverse(), output: [0, 1] },
        { input: Array(16).fill(0).map((_, i) => Math.floor(i / 4) < 2 ? 0.8 : 0.2).reverse(), output: [0, 1] },
      ],
      testData: [
        { input: Array(16).fill(0).map((_, i) => (i % 4 === 0 || i % 4 === 3) ? 0.9 : 0.1), output: [1, 0] },
        { input: Array(16).fill(0).map((_, i) => (Math.floor(i / 4) === 0 || Math.floor(i / 4) === 3) ? 0.9 : 0.1), output: [0, 1] },
      ],
      accuracyThreshold: 0.75,
      maxEpochs: 300,
      maxLayers: 5,
      maxNeurons: 20,
    },
    unlockedBy: ['level-6'],
    rewards: { xp: 500, stars: 3 },
  },
];

export default levels;