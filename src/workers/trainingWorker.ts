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
  meta?: {
    inputShape?: number[];
    outputShape?: number[];
  };
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

self.onmessage = async (e: MessageEvent<TrainingMessage>) => {
  if (e.data.type !== 'start') return;
  const { layers, data, epochs, meta } = e.data;

  if (!data.inputs?.length || !data.outputs?.length) {
    self.postMessage({ type: 'done', loss: 0, accuracy: 0, weights: [] } satisfies DoneMessage);
    return;
  }

  const inferredInputSize = data.inputs[0].length;
  const inferredOutputSize = data.outputs[0].length;
  const inputShape = meta?.inputShape?.length ? meta.inputShape : [inferredInputSize];
  const outputShape = meta?.outputShape?.length ? meta.outputShape : [inferredOutputSize];

  const outSize = outputShape[0] ?? inferredOutputSize;
  const oneHot = isOneHot(data.outputs, outSize);
  const isBinary =
    outSize === 1 && data.outputs.every((r) => r.length === 1 && (r[0] === 0 || r[0] === 1));

  const outputActivation = oneHot ? 'softmax' : isBinary ? 'sigmoid' : 'linear';
  const lossFn = oneHot ? 'categoricalCrossentropy' : isBinary ? 'binaryCrossentropy' : 'meanSquaredError';

  const shouldUseConv = layers.some((l) => l.type === 'conv2d') || inputShape.length === 3;

  const model = tf.sequential();

  let previousWasConv = false;

  layers.forEach((layer, index) => {
    if (layer.type === 'dense') {
      if (previousWasConv) {
        model.add(tf.layers.flatten());
        previousWasConv = false;
      }
      model.add(
        tf.layers.dense({
          units: layer.config.units,
          activation: layer.config.activation,
          inputShape: index === 0 && !shouldUseConv ? [inferredInputSize] : undefined,
        })
      );
      return;
    }

    if (layer.type === 'conv2d') {
      const shape =
        index === 0
          ? (inputShape.length === 3
              ? (inputShape as [number, number, number])
              : ([inferredInputSize, 1, 1] as [number, number, number]))
          : undefined;
      model.add(
        tf.layers.conv2d({
          filters: layer.config.filters,
          kernelSize: layer.config.kernelSize,
          strides: layer.config.strides || 1,
          activation: layer.config.activation,
          inputShape: shape,
        })
      );
      previousWasConv = true;
      return;
    }

    if (layer.type === 'dropout') {
      model.add(tf.layers.dropout({ rate: layer.config.rate }));
    }
  });

  if (previousWasConv) {
    model.add(tf.layers.flatten());
  }

  // Always enforce correct output shape, so the puzzle can be solved
  model.add(tf.layers.dense({ units: outSize, activation: outputActivation }));

  model.compile({
    optimizer: 'adam',
    loss: lossFn as any,
    metrics: ['accuracy'],
  });

  let xs: tf.Tensor;
  const ys = tf.tensor2d(data.outputs);

  if (shouldUseConv && inputShape.length === 3) {
    const [h, w, c] = inputShape as [number, number, number];
    xs = tf.tensor2d(data.inputs).reshape([data.inputs.length, h, w, c]);
  } else {
    xs = tf.tensor2d(data.inputs);
  }

  await model.fit(xs as any, ys as any, {
    epochs,
    callbacks: {
      onEpochEnd: async (epoch, logs) => {
        const l: any = logs || {};
        const progress: ProgressMessage = {
          type: 'progress',
          epoch: epoch + 1,
          loss: l.loss ?? 0,
          accuracy: l.acc ?? l.accuracy ?? 0,
        };
        self.postMessage(progress);
      },
    },
  });

  const evalResult = model.evaluate(xs as any, ys as any) as tf.Tensor[];
  const loss = (await evalResult[0].data())[0];
  const accuracy = (await evalResult[1].data())[0];

  const weights = model.getWeights().map((w) => w.arraySync());

  const done: DoneMessage = { type: 'done', loss, accuracy, weights };
  self.postMessage(done);

  xs.dispose();
  ys.dispose();
  evalResult.forEach((t) => t.dispose());
  model.dispose();
};