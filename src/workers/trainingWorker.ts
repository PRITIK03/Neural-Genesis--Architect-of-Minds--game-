import * as tf from '@tensorflow/tfjs';

interface Layer {
  id: string;
  type: 'dense' | 'conv2d' | 'dropout' | 'batchNorm' | 'pooling' | 'flatten';
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
  batchSize?: number;
  learningRate?: number;
  optimizer: 'adam' | 'sgd' | 'rmsprop' | 'adagrad';
}

interface ProgressMessage {
  type: 'progress';
  epoch: number;
  loss: number;
  accuracy: number;
}

interface ErrorMessage {
  type: 'error';
  error: string;
}

interface PauseMessage {
  type: 'pause';
}

interface ResumeMessage {
  type: 'resume';
}

interface StopMessage {
  type: 'stop';
}

type WorkerMessage = TrainingMessage | ProgressMessage | ErrorMessage | PauseMessage | ResumeMessage | StopMessage;

function isOneHot(outputs: number[][], outSize: number) {
  if (outSize <= 1) return false;
  for (let i = 0; i < Math.min(outputs.length, 64); i++) {
    const row = outputs[i];
    if (!row || row.length !== outSize) return false;
    let sum = 0;
    for (const v of row) {
      if (!(v === 0 || v === 1)) return false;
      sum += v;
    }
    if (sum !== 1) return false;
  }
  return true;
}

function getOptimizer(type: string, learningRate: number) {
  switch (type) {
    case 'sgd':
      return tf.train.sgd(learningRate);
    case 'rmsprop':
      return tf.train.rmsprop(learningRate);
    case 'adagrad':
      return tf.train.adagrad(learningRate);
    case 'adam':
    default:
      return tf.train.adam(learningRate);
  }
}

let model: tf.LayersModel | null = null;
let isPaused = false;
let shouldStop = false;

self.onmessage = async (e: MessageEvent<WorkerMessage>) => {
  const { type } = e.data;

  if (type === 'stop') {
    shouldStop = true;
    cleanup();
    return;
  }

  if (type === 'pause') {
    isPaused = true;
    return;
  }

  if (type === 'resume') {
    isPaused = false;
    return;
  }

  if (type !== 'start') return;

  // Reset state
  shouldStop = false;
  isPaused = false;
  cleanup();

  const { layers, data, epochs, batchSize = 32, learningRate = 0.001, optimizer: optimizerType } = e.data;

  if (!data.inputs?.length || !data.outputs?.length) {
    self.postMessage({ type: 'error', error: 'No training data provided' } satisfies ErrorMessage);
    return;
  }

  try {
    const inferredInputSize = data.inputs[0].length;
    const inferredOutputSize = data.outputs[0].length;

    const outSize = inferredOutputSize;
    const oneHot = isOneHot(data.outputs, outSize);
    const isBinary =
      outSize === 1 && data.outputs.every((r) => r.length === 1 && (r[0] === 0 || r[0] === 1));

    const outputActivation = oneHot ? 'softmax' : isBinary ? 'sigmoid' : 'linear';
    const lossFn = oneHot ? 'categoricalCrossentropy' : isBinary ? 'binaryCrossentropy' : 'meanSquaredError';

    const shouldUseConv = layers.some((l) => l.type === 'conv2d' || l.type === 'pooling');

    const sequentialModel = tf.sequential();
    model = sequentialModel as any;

    let previousWasConv = false;

    for (let i = 0; i < layers.length; i++) {
      const layer = layers[i];

      if (layer.type === 'dense') {
        if (previousWasConv) {
          sequentialModel.add(tf.layers.flatten());
          previousWasConv = false;
        }
        sequentialModel.add(
          tf.layers.dense({
            units: layer.config.units,
            activation: layer.config.activation,
            inputShape: i === 0 && !shouldUseConv ? [inferredInputSize] : undefined,
          })
        );
        continue;
      }

      if (layer.type === 'conv2d') {
        const inputShape = i === 0 && inferredInputSize > 3
          ? ([Math.sqrt(inferredInputSize), Math.sqrt(inferredInputSize), 1] as [number, number, number])
          : undefined;

        sequentialModel.add(
          tf.layers.conv2d({
            filters: layer.config.filters,
            kernelSize: layer.config.kernelSize,
            strides: layer.config.strides || 1,
            activation: layer.config.activation,
            inputShape,
            padding: 'same',
          })
        );
        previousWasConv = true;
        continue;
      }

      if (layer.type === 'dropout') {
        sequentialModel.add(tf.layers.dropout({ rate: layer.config.rate }));
        continue;
      }

      if (layer.type === 'batchNorm') {
        sequentialModel.add(tf.layers.batchNormalization({
          momentum: layer.config.momentum || 0.99,
          epsilon: layer.config.epsilon || 0.001,
        }));
        continue;
      }

      if (layer.type === 'pooling') {
        sequentialModel.add(tf.layers.maxPooling2d({
          poolSize: [layer.config.poolSize || 2, layer.config.poolSize || 2],
          strides: layer.config.strides || layer.config.poolSize || 2,
          padding: 'same',
        }));
        previousWasConv = true;
        continue;
      }

      if (layer.type === 'flatten') {
        sequentialModel.add(tf.layers.flatten());
        continue;
      }
    }

    if (previousWasConv) {
      sequentialModel.add(tf.layers.flatten());
    }

    // Output layer
    sequentialModel.add(tf.layers.dense({ units: outSize, activation: outputActivation }));

    sequentialModel.compile({
      optimizer: getOptimizer(optimizerType, learningRate),
      loss: lossFn as any,
      metrics: ['accuracy'],
    });

    // Prepare tensors
    let xs: tf.Tensor;
    const ys = tf.tensor2d(data.outputs);

    if (shouldUseConv && layers.some(l => l.type === 'conv2d' || l.type === 'pooling')) {
      const side = Math.sqrt(inferredInputSize);
      if (Number.isInteger(side)) {
        xs = tf.tensor2d(data.inputs).reshape([data.inputs.length, side, side, 1]);
      } else {
        xs = tf.tensor2d(data.inputs);
      }
    } else {
      xs = tf.tensor2d(data.inputs);
    }

    // Training loop with pause/resume support
    const trainConfig: any = {
      epochs,
      batchSize,
      callbacks: {
        onEpochEnd: async (epoch: number, logs: any = {}) => {
          // Handle pause
          while (isPaused && !shouldStop) {
            if (shouldStop) break;
            await new Promise(resolve => setTimeout(resolve, 100));
          }

          if (shouldStop) {
            self.postMessage({ type: 'error', error: 'Training stopped by user' } satisfies ErrorMessage);
            cleanup();
            return;
          }

          const loss = logs.loss ?? 0;
          const accuracy = logs.acc ?? logs.accuracy ?? 0;
          self.postMessage({
            type: 'progress',
            epoch: epoch + 1,
            loss,
            accuracy,
          } satisfies ProgressMessage);
        },
      },
      validationSplit: 0.1,
    };

    await sequentialModel.fit(xs as any, ys as any, trainConfig);

    // Evaluation
    const evalResult = sequentialModel.evaluate(xs as any, ys as any) as tf.Tensor[];
    const lossVal = (await evalResult[0].data())[0];
    const accuracyVal = (await evalResult[1].data())[0];

    // Cleanup tensors
    xs.dispose();
    ys.dispose();
    evalResult.forEach((t) => t.dispose());

    if (!shouldStop) {
      self.postMessage({ type: 'done', loss: lossVal, accuracy: accuracyVal });
    }

    cleanup();
  } catch (error) {
    self.postMessage({
      type: 'error',
      error: error instanceof Error ? error.message : 'Unknown training error',
    } satisfies ErrorMessage);
    cleanup();
  }
};

function cleanup() {
  if (model) {
    model.dispose();
    model = null;
  }
  isPaused = false;
  shouldStop = false;
}
