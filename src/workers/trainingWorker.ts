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

    layers.forEach((layer, index) => {
      if (layer.type === 'dense') {
        model.add(
          tf.layers.dense({
            units: layer.config.units,
            activation: layer.config.activation,
            inputShape: index === 0 ? [data.inputs[0].length] : undefined,
          })
        );
      } else if (layer.type === 'conv2d') {
        const inputShape = index === 0
          ? layer.config.inputShape || [data.inputs[0].length, 1, 1] // Default for 1D-like data
          : undefined;
        model.add(
          tf.layers.conv2d({
            filters: layer.config.filters,
            kernelSize: layer.config.kernelSize,
            strides: layer.config.strides || 1,
            activation: layer.config.activation,
            inputShape,
          })
        );
      } else if (layer.type === 'dropout') {
        model.add(
          tf.layers.dropout({
            rate: layer.config.rate,
          })
        );
      }
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