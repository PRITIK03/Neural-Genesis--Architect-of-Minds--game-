import React, { useMemo } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Line, Sphere } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import { useNetworkStore, Layer } from '../stores/networkStore';

interface NetworkVisualizationProps {
  layers: Layer[];
  isTraining?: boolean;
  onLayerClick?: (id: string) => void;
  selectedLayerId?: string | null;
  showConnections?: boolean;
}

const NeuronSphere: React.FC<{
  position: [number, number, number];
  radius: number;
  color: string;
  isActive: boolean;
  onClick?: () => void;
}> = ({ position, radius, color, isActive, onClick }) => {
  return (
    <Sphere position={position} args={[radius, 16, 16]} onClick={onClick}>
      <meshStandardMaterial
        color={color}
        metalness={0.4}
        roughness={0.4}
        emissive={isActive ? color : '#000000'}
        emissiveIntensity={isActive ? 0.3 : 0}
      />
    </Sphere>
  );
};

const Connections: React.FC<{
  fromLayer: number;
  toLayer: number;
  fromCount: number;
  toCount: number;
  fromY: number;
  toY: number;
  color: string;
}> = ({ fromLayer, toLayer, fromCount, toCount, fromY, toY, color }) => {
  const connections = useMemo(() => {
    const lines: { start: [number, number, number]; end: [number, number, number] }[] = [];
    const spacingFrom = 0.8 / Math.max(fromCount, 4);
    const spacingTo = 0.8 / Math.max(toCount, 4);

    for (let i = 0; i < fromCount; i++) {
      for (let j = 0; j < toCount; j++) {
        const xFrom = (i - fromCount / 2 + 0.5) * spacingFrom;
        const xTo = (j - toCount / 2 + 0.5) * spacingTo;
        lines.push({
          start: [xFrom, fromY, 0],
          end: [xTo, toY, 0],
        });
      }
    }
    return lines;
  }, [fromCount, toCount, fromY, toY]);

  return (
    <group>
      {connections.map((line, idx) => (
        <Line
          key={idx}
          points={[line.start, line.end]}
          color={color}
          opacity={0.15}
          lineWidth={1}
          transparent
        />
      ))}
    </group>
  );
};

const LayerSpheres: React.FC<{
  layer: Layer;
  index: number;
  totalLayers: number;
  isSelected: boolean;
  onClick: () => void;
}> = ({ layer, index, totalLayers, isSelected, onClick }) => {
  let count = 0;
  switch (layer.type) {
    case 'dense':
      count = (layer.config as any).units || 4;
      break;
    case 'conv2d':
      count = (layer.config as any).filters || 4;
      break;
    case 'pooling':
      count = 4;
      break;
    default:
      count = 1;
  }

  const spacing = 0.6 / Math.sqrt(Math.max(count, 1));
  const yPos = index * 2 - (totalLayers - 1);
  const getColor = () => {
    switch (layer.type) {
      case 'dense': return '#00D9FF';
      case 'conv2d': return '#B800FF';
      case 'dropout': return '#00FF88';
      case 'batchNorm': return '#FFD700';
      case 'pooling': return '#FF8C00';
      case 'flatten': return '#888888';
      default: return '#666666';
    }
  };

  return (
    <group position={[0, yPos, 0]}>
      {/* Render multiple spheres for denser layers */}
      {count > 1 ? (
        Array.from({ length: Math.min(count, 16) }).map((_, i) => {
          const angle = (i / Math.min(count, 16)) * Math.PI * 2;
          const radius = 0.35;
          const x = Math.cos(angle) * radius;
          const z = Math.sin(angle) * radius;
          return (
            <NeuronSphere
              key={i}
              position={[x, 0, z]}
              radius={0.12}
              color={getColor()}
              isActive={false}
              onClick={onClick}
            />
          );
        })
      ) : (
        <NeuronSphere
          position={[0, 0, 0]}
          radius={0.3}
          color={getColor()}
          isActive={false}
          onClick={onClick}
        />
      )}
    </group>
  );
};

const NetworkScene: React.FC<NetworkVisualizationProps> = ({
  layers,
  isTraining = false,
  onLayerClick,
  selectedLayerId,
  showConnections = true,
}) => {
  const { camera } = useThree();

  // Auto-adjust camera based on layer count
  React.useEffect(() => {
    const distance = Math.max(12, layers.length * 1.5 + 5);
    camera.position.set(0, 0, distance);
  }, [layers.length, camera]);

  const totalLayers = layers.length;

  return (
    <>
      <ambientLight intensity={0.25} />
      <pointLight position={[10, 12, 10]} intensity={1} />
      <pointLight position={[-10, -8, -6]} intensity={0.4} color="#B800FF" />
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minDistance={8}
        maxDistance={30}
        autoRotate={isTraining}
        autoRotateSpeed={0.5}
      />

      {/* Render connections */}
      {showConnections && layers.map((layer, idx) => {
        if (idx === 0) return null;
        const prevLayer = layers[idx - 1];
        let fromCount = 0, toCount = 0;
        switch (prevLayer.type) {
          case 'dense': fromCount = (prevLayer.config as any).units || 4; break;
          case 'conv2d': fromCount = (prevLayer.config as any).filters || 4; break;
          default: fromCount = 4;
        }
        switch (layer.type) {
          case 'dense': toCount = (layer.config as any).units || 4; break;
          case 'conv2d': toCount = (layer.config as any).filters || 4; break;
          default: toCount = 4;
        }
        const fromY = (idx - 1) * 2 - (totalLayers - 1);
        const toY = idx * 2 - (totalLayers - 1);

        return (
          <Connections
            key={`conn-${idx}`}
            fromLayer={idx - 1}
            toLayer={idx}
            fromCount={fromCount}
            toCount={toCount}
            fromY={fromY}
            toY={toY}
            color="#4a9eff"
          />
        );
      })}

      {/* Render layers */}
      {layers.map((layer, idx) => (
        <LayerSpheres
          key={layer.id}
          layer={layer}
          index={idx}
          totalLayers={totalLayers}
          isSelected={selectedLayerId === layer.id}
          onClick={() => onLayerClick?.(layer.id)}
        />
      ))}
    </>
  );
};

export const NetworkVisualization: React.FC<NetworkVisualizationProps> = ({
  layers,
  isTraining = false,
  onLayerClick,
  selectedLayerId,
  showConnections = true,
}) => {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl border border-border-subtle bg-[#060814]">
      <Canvas camera={{ position: [0, 0, 12], fov: 50 }}>
        <NetworkScene
          layers={layers}
          isTraining={isTraining}
          onLayerClick={onLayerClick}
          selectedLayerId={selectedLayerId}
          showConnections={showConnections}
        />
      </Canvas>
      <div className="pointer-events-none absolute bottom-2 left-2 rounded bg-bg-panel/80 px-2 py-1 text-[10px] text-text-dim backdrop-blur">
        Drag to orbit • Scroll to zoom
      </div>
    </div>
  );
};
