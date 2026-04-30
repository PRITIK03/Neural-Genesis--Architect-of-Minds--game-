import * as tf from '@tensorflow/tfjs';

interface Layer {
  id: string;
  type: 'dense' | 'conv2d' | 'dropout';
  config: Record<string, any>;
}

interface TrainingData {
  inputs: number[][];
  outputs: number[][];
}

interface TrainingMessage {
  type: 'start';
  layers: Layer[];
  data: TrainingData;
  epochs: number;
}

interface ProgressMessage {
  type: 'progress';
  epoch: number;
  loss: number;
  accuracy: number;
}

interface DoneMessage {
  type: 'done';
  loss: number;
  accuracy: number;
  weights: any; // Serialized weights
}

self.onmessage = async (e: MessageEvent<TrainingMessage>) => {
  if (e.data.type === 'start') {
    const { layers, data, epochs } = e.data;

    // Build model
    const model = tf.sequential();

    layers.forEach((layer) => {
      if (layer.type === 'dense') {
        model.add(
          tf.layers.dense({
            units: layer.config.units,
            activation: layer.config.activation,
            inputShape: layer.id === layers[0].id ? [data.inputs[0].length] : undefined,
          })
        );
      }
      // Add more layer types later
    });

    model.compile({
      optimizer: 'adam',
      loss: 'meanSquaredError',
      metrics: ['accuracy'],
    });

    // Prepare tensors
    const xs = tf.tensor2d(data.inputs);
    const ys = tf.tensor2d(data.outputs);

    // Train
    await model.fit(xs, ys, {
      epochs,
      callbacks: {
        onEpochEnd: async (epoch, logs) => {
          const progress: ProgressMessage = {
            type: 'progress',
            epoch: epoch + 1,
            loss: logs?.loss || 0,
            accuracy: logs?.acc || 0,
          };
          self.postMessage(progress);
        },
      },
    });

    // Get final metrics
    const evalResult = model.evaluate(xs, ys) as tf.Tensor[];
    const loss = (await evalResult[0].data())[0];
    const accuracy = (await evalResult[1].data())[0];

    // Serialize weights
    const weights = model.getWeights().map((w) => w.arraySync());

    const done: DoneMessage = {
      type: 'done',
      loss,
      accuracy,
      weights,
    };
    self.postMessage(done);

    // Cleanup
    xs.dispose();
    ys.dispose();
    model.dispose();
  }
};