"use client";

import { Float, Text } from '@react-three/drei';

interface ClientsWorldProps {
  onNavigate: (world: string) => void;
}

export function ClientsWorld({ onNavigate }: ClientsWorldProps) {
  return (
    <group>
      <Float speed={1} rotationIntensity={0.2} floatIntensity={0.3}>
        <Text
          position={[0, 0, 0]}
          fontSize={0.8}
          color="#f87171"
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
        >
          CLIENT SHOWCASE
        </Text>
        <Text
          position={[0, -1, 0]}
          fontSize={0.3}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          Client gallery coming soon...
        </Text>
      </Float>
    </group>
  );
}
