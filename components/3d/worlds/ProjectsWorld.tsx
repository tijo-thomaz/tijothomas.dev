"use client";

import { Float, Text, Sphere } from '@react-three/drei';

interface ProjectsWorldProps {
  onNavigate: (world: string) => void;
}

export function ProjectsWorld({ onNavigate }: ProjectsWorldProps) {
  return (
    <group>
      <Float speed={1} rotationIntensity={0.2} floatIntensity={0.3}>
        <Text
          position={[0, 0, 0]}
          fontSize={0.8}
          color="#ff6b6b"
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
        >
          PROJECTS UNIVERSE
        </Text>
        <Text
          position={[0, -1, 0]}
          fontSize={0.3}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          Project galaxies coming soon...
        </Text>
      </Float>
      
      {/* Project planets placeholder */}
      {Array.from({ length: 5 }).map((_, i) => (
        <Float key={i} speed={1 + i * 0.2} rotationIntensity={0.3}>
          <Sphere
            position={[
              Math.cos((i / 5) * Math.PI * 2) * 4,
              Math.sin(i) * 2,
              Math.sin((i / 5) * Math.PI * 2) * 4
            ]}
            args={[0.5 + i * 0.1, 16, 16]}
          >
            <meshPhongMaterial
              color={`hsl(${i * 60}, 70%, 60%)`}
              transparent
              opacity={0.8}
            />
          </Sphere>
        </Float>
      ))}
    </group>
  );
}
