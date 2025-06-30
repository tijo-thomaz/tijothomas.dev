"use client";

import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Sphere, Float, Html } from '@react-three/drei';
import { Mesh, Color } from 'three';
import * as THREE from 'three';

interface AICompanionProps {
  position: [number, number, number];
  dialogue: string;
  onDialogueChange: (dialogue: string) => void;
}

export function AICompanion({ position, dialogue, onDialogueChange }: AICompanionProps) {
  const meshRef = useRef<Mesh>(null);
  const [isActive, setIsActive] = useState(false);
  const [currentDialogue, setCurrentDialogue] = useState(dialogue);

  // Floating animation
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime) * 0.3;
      
      // Subtle rotation
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      
      // Pulsing effect when active
      if (isActive) {
        meshRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 3) * 0.1);
      }
    }
  });

  // Update dialogue when prop changes
  useEffect(() => {
    setCurrentDialogue(dialogue);
    onDialogueChange(dialogue);
  }, [dialogue, onDialogueChange]);

  const handleClick = () => {
    setIsActive(!isActive);
    
    // AI responses based on current state
    const responses = [
      "Hi! I'm your AI guide through Tijo's portfolio. What would you like to explore?",
      "Feel free to click on any 3D element to learn more about Tijo's experience!",
      "This immersive portfolio showcases 8+ years of frontend engineering expertise.",
      "Try moving around with your mouse and discover hidden details in this 3D space!",
      "Would you like me to guide you to a specific area? Just let me know!"
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    setCurrentDialogue(randomResponse);
    onDialogueChange(randomResponse);
  };

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
      <group position={position}>
        {/* AI Avatar - Holographic Sphere */}
        <mesh ref={meshRef} onClick={handleClick}>
          <Sphere args={[0.5, 32, 32]}>
            <meshPhongMaterial
              color="#60a5fa"
              transparent
              opacity={0.7}
              emissive="#1e40af"
              emissiveIntensity={0.3}
              wireframe={false}
            />
          </Sphere>
          
          {/* Inner core */}
          <Sphere args={[0.3, 16, 16]}>
            <meshBasicMaterial
              color="#00ff88"
              transparent
              opacity={0.5}
            />
          </Sphere>
        </mesh>
        
        {/* AI Label */}
        <Text
          position={[0, 1, 0]}
          fontSize={0.3}
          color="#60a5fa"
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
        >
          AI GUIDE
        </Text>
        
        {/* Floating particles around AI */}
        <group>
          {Array.from({ length: 8 }).map((_, i) => (
            <Float
              key={i}
              speed={2 + i * 0.2}
              rotationIntensity={0.5}
              floatIntensity={0.8}
            >
              <mesh
                position={[
                  Math.cos((i / 8) * Math.PI * 2) * 1.5,
                  Math.sin((i / 8) * Math.PI * 2) * 0.5,
                  Math.sin((i / 8) * Math.PI * 2) * 1.5
                ]}
              >
                <Sphere args={[0.05, 8, 8]}>
                  <meshBasicMaterial
                    color="#00ff88"
                    transparent
                    opacity={0.6}
                  />
                </Sphere>
              </mesh>
            </Float>
          ))}
        </group>
        
        {/* Interactive hint */}
        {!isActive && (
          <Html
            position={[0, -1.2, 0]}
            center
            style={{
              color: '#60a5fa',
              fontFamily: 'monospace',
              fontSize: '10px',
              background: 'rgba(0,0,0,0.8)',
              padding: '5px 10px',
              borderRadius: '15px',
              border: '1px solid #60a5fa',
              cursor: 'pointer'
            }}
          >
            Click me for guidance! 🤖
          </Html>
        )}
      </group>
    </Float>
  );
}
