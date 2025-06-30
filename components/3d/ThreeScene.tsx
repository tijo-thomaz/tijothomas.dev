"use client";

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Html, Text, Float } from '@react-three/drei';
import { Suspense, useRef, useState } from 'react';
import { Vector3 } from 'three';
import { AICompanion } from './AICompanion';
import { ExperienceWorld } from './worlds/ExperienceWorld';
import { ProjectsWorld } from './worlds/ProjectsWorld';
import { SkillsWorld } from './worlds/SkillsWorld';
import { ClientsWorld } from './worlds/ClientsWorld';

interface ThreeSceneProps {
  currentWorld: string;
  onWorldExit: () => void;
  onWorldChange: (world: string) => void;
}

function SceneLoader() {
  return (
    <Html center>
      <div className="text-green-400 font-mono text-sm animate-pulse">
        Initializing 3D World...
      </div>
    </Html>
  );
}

export default function ThreeScene({ currentWorld, onWorldExit, onWorldChange }: ThreeSceneProps) {
  const [aiDialogue, setAIDialogue] = useState<string>("");

  const getWorldComponent = () => {
    switch (currentWorld) {
      case 'experience':
        return <ExperienceWorld onNavigate={onWorldChange} />;
      case 'projects':
        return <ProjectsWorld onNavigate={onWorldChange} />;
      case 'skills':
        return <SkillsWorld onNavigate={onWorldChange} />;
      case 'clients':
        return <ClientsWorld onNavigate={onWorldChange} />;
      default:
        return <ExperienceWorld onNavigate={onWorldChange} />;
    }
  };

  const getAIIntroduction = () => {
    switch (currentWorld) {
      case 'experience':
        return "Welcome to Tijo's career timeline! Click on the buildings to explore his journey from junior to senior engineer.";
      case 'projects':
        return "Here are Tijo's key projects floating as interactive worlds. Click any planet to see live demos and technical details.";
      case 'skills':
        return "Behold the tech skill constellation! Each orb represents a technology - larger ones show higher expertise.";
      case 'clients':
        return "This is the client showcase gallery. Explore the success stories and testimonials from major companies.";
      default:
        return "Welcome to Tijo's 3D portfolio experience! I'm your AI guide through this immersive journey.";
    }
  };

  return (
    <div className="w-full h-full relative">
      {/* 3D Canvas */}
      <Canvas
        camera={{ 
          position: [0, 5, 10], 
          fov: 60,
          near: 0.1,
          far: 1000 
        }}
        style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)' }}
        gl={{ 
          antialias: true,
          alpha: true,
          powerPreference: "high-performance"
        }}
      >
        <Suspense fallback={<SceneLoader />}>
          {/* Lighting */}
          <ambientLight intensity={0.3} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <pointLight position={[-10, -10, -5]} intensity={0.5} color="#00ff88" />
          
          {/* Environment */}
          <Environment preset="night" />
          
          {/* AI Companion */}
          <AICompanion 
            position={[3, 2, 5]}
            dialogue={getAIIntroduction()}
            onDialogueChange={setAIDialogue}
          />
          
          {/* Current World */}
          {getWorldComponent()}
          
          {/* World Title */}
          <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
            <Text
              position={[0, 8, 0]}
              fontSize={1.5}
              color="#00ff88"
              anchorX="center"
              anchorY="middle"
              fontWeight="bold"
            >
              {currentWorld.toUpperCase()} WORLD
            </Text>
          </Float>
          
          {/* Navigation Help */}
          <Html
            position={[0, -3, 0]}
            center
            style={{
              color: '#00ff88',
              fontFamily: 'monospace',
              fontSize: '12px',
              background: 'rgba(0,0,0,0.7)',
              padding: '10px',
              borderRadius: '5px',
              border: '1px solid #00ff88'
            }}
          >
            <div className="text-center">
              <div>🖱️ Mouse: Look around | 🖱️ Click: Interact</div>
              <div>⌨️ ESC: Return to terminal | 🎮 WASD: Navigate</div>
            </div>
          </Html>
          
          {/* Controls */}
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={3}
            maxDistance={20}
            maxPolarAngle={Math.PI / 2}
            minPolarAngle={0}
          />
        </Suspense>
      </Canvas>
      
      {/* Exit Button */}
      <button
        onClick={onWorldExit}
        className="absolute top-4 right-4 bg-black/70 text-green-400 border border-green-400 px-4 py-2 rounded font-mono hover:bg-green-400 hover:text-black transition-all"
      >
        ← Terminal
      </button>
      
      {/* AI Dialogue Display */}
      {aiDialogue && (
        <div className="absolute bottom-4 left-4 right-4 bg-black/80 text-green-400 p-4 rounded border border-green-400 font-mono text-sm">
          <div className="flex items-start gap-2">
            <span className="text-blue-400">🤖 AI:</span>
            <span>{aiDialogue}</span>
          </div>
        </div>
      )}
    </div>
  );
}
