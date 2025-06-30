"use client";

import { Float, Text, Sphere } from '@react-three/drei';

interface SkillsWorldProps {
  onNavigate: (world: string) => void;
}

export function SkillsWorld({ onNavigate }: SkillsWorldProps) {
  return (
    <group>
      <Float speed={1} rotationIntensity={0.2} floatIntensity={0.3}>
        <Text
          position={[0, 0, 0]}
          fontSize={0.8}
          color="#a855f7"
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
        >
          SKILLS CONSTELLATION
        </Text>
        <Text
          position={[0, -1, 0]}
          fontSize={0.3}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          Tech skill orbs coming soon...
        </Text>
      </Float>
    </group>
  );
}
