import { TrainingData } from '../stores/networkStore';

export interface LevelData {
  id: number;
  name: string;
  description: string;
  data: TrainingData;
  targetAccuracy: number;
}

const levels: LevelData[] = [
  {
    id: 1,
    name: 'XOR Gate',
    description: 'Learn the XOR logic gate',
    data: {
      inputs: [[0, 0], [0, 1], [1, 0], [1, 1]],
      outputs: [[0], [1], [1], [0]],
    },
    targetAccuracy: 0.95,
  },
];

export default levels;