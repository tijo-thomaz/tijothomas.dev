"use client";

import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Text, Float, Html } from '@react-three/drei';
import { Mesh, Color } from 'three';

interface ExperienceWorldProps {
  onNavigate: (world: string) => void;
}

interface CompanyBuilding {
  name: string;
  position: [number, number, number];
  color: string;
  period: string;
  role: string;
  achievements: string[];
  size: [number, number, number];
}

const companies: CompanyBuilding[] = [
  {
    name: "Bet365",
    position: [-4, 0, 0],
    color: "#00ff88",
    period: "Feb 2023 - Present",
    role: "Software Engineer",
    achievements: [
      "System modernization and migration",
      "Performance optimization initiatives", 
      "Internal tooling development",
      "VS Code extension development"
    ],
    size: [2, 4, 2]
  },
  {
    name: "Infosys",
    position: [0, 0, 0],
    color: "#3b82f6",
    period: "Apr 2021 - Feb 2023",
    role: "Frontend Consultant",
    achievements: [
      "Angular expertise for major clients",
      "Home Depot and eBay project delivery",
      "Team mentoring and leadership",
      "TypeScript best practices implementation"
    ],
    size: [2.5, 3.5, 2.5]
  },
  {
    name: "QBurst Technologies",
    position: [4, 0, 0],
    color: "#f59e0b",
    period: "Sep 2018 - Apr 2021",
    role: "Senior Software Engineer",
    achievements: [
      "AWS cloud architecture implementation",
      "Full-stack application development",
      "Technical team leadership",
      "Client relationship management"
    ],
    size: [2, 3, 2]
  }
];

function CompanyBuilding({ company, onClick }: { company: CompanyBuilding; onClick: () => void }) {
  const meshRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current && hovered) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 2) * 0.1;
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 3) * 0.1;
    }
  });

  return (
    <Float speed={1} rotationIntensity={0.2} floatIntensity={0.1}>
      <group position={company.position}>
        {/* Building */}
        <mesh
          ref={meshRef}
          onClick={onClick}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
        >
          <Box args={company.size}>
            <meshPhongMaterial
              color={hovered ? "#ffffff" : company.color}
              transparent
              opacity={hovered ? 0.9 : 0.7}
              emissive={company.color}
              emissiveIntensity={hovered ? 0.3 : 0.1}
            />
          </Box>
        </mesh>
        
        {/* Company Name */}
        <Text
          position={[0, company.size[1] / 2 + 0.5, 0]}
          fontSize={0.4}
          color={company.color}
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
        >
          {company.name}
        </Text>
        
        {/* Period */}
        <Text
          position={[0, company.size[1] / 2 + 1, 0]}
          fontSize={0.2}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          {company.period}
        </Text>
        
        {/* Interactive hint */}
        {hovered && (
          <Html
            position={[0, -company.size[1] / 2 - 0.5, 0]}
            center
            style={{
              color: company.color,
              fontFamily: 'monospace',
              fontSize: '12px',
              background: 'rgba(0,0,0,0.9)',
              padding: '10px',
              borderRadius: '5px',
              border: `1px solid ${company.color}`,
              maxWidth: '200px',
              textAlign: 'center'
            }}
          >
            <div>
              <strong>{company.role}</strong>
              <br />
              Click to explore achievements
            </div>
          </Html>
        )}
      </group>
    </Float>
  );
}

function CareerPath() {
  return (
    <group>
      {/* Timeline path connecting buildings */}
      {companies.map((company, index) => {
        if (index === companies.length - 1) return null;
        
        const next = companies[index + 1];
        const midPoint = [
          (company.position[0] + next.position[0]) / 2,
          0.1,
          (company.position[2] + next.position[2]) / 2
        ] as [number, number, number];
        
        return (
          <Float key={index} speed={0.5} floatIntensity={0.1}>
            <mesh position={midPoint}>
              <Box args={[Math.abs(next.position[0] - company.position[0]) - 1, 0.1, 0.2]}>
                <meshBasicMaterial
                  color="#00ff88"
                  transparent
                  opacity={0.6}
                />
              </Box>
            </mesh>
          </Float>
        );
      })}
    </group>
  );
}

export function ExperienceWorld({ onNavigate }: ExperienceWorldProps) {
  const [selectedCompany, setSelectedCompany] = useState<CompanyBuilding | null>(null);

  const handleCompanyClick = (company: CompanyBuilding) => {
    setSelectedCompany(company);
  };

  return (
    <group>
      {/* Career Timeline Path */}
      <CareerPath />
      
      {/* Company Buildings */}
      {companies.map((company, index) => (
        <CompanyBuilding
          key={index}
          company={company}
          onClick={() => handleCompanyClick(company)}
        />
      ))}
      
      {/* Achievement Monuments */}
      <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.2}>
        <group position={[0, 3, -3]}>
          <Text
            fontSize={0.5}
            color="#fbbf24"
            anchorX="center"
            anchorY="middle"
            fontWeight="bold"
          >
            🏆 ACHIEVEMENTS
          </Text>
          <Text
            position={[0, -0.7, 0]}
            fontSize={0.25}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
            maxWidth={6}
            textAlign="center"
          >
            8+ Years Experience • 3 Major Companies
            {'\n'}Frontend Leadership • System Modernization
            {'\n'}Enterprise Client Delivery
          </Text>
        </group>
      </Float>
      
      {/* Company Detail Modal */}
      {selectedCompany && (
        <Html
          position={[0, 0, 5]}
          center
          style={{
            color: '#ffffff',
            fontFamily: 'monospace',
            fontSize: '14px',
            background: 'rgba(0,0,0,0.95)',
            padding: '20px',
            borderRadius: '10px',
            border: `2px solid ${selectedCompany.color}`,
            maxWidth: '400px',
            minWidth: '300px'
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3 style={{ color: selectedCompany.color, margin: 0 }}>{selectedCompany.name}</h3>
              <button
                onClick={() => setSelectedCompany(null)}
                style={{
                  background: 'transparent',
                  border: `1px solid ${selectedCompany.color}`,
                  color: selectedCompany.color,
                  borderRadius: '3px',
                  padding: '5px 10px',
                  cursor: 'pointer'
                }}
              >
                ✕
              </button>
            </div>
            
            <div style={{ marginBottom: '10px' }}>
              <strong style={{ color: '#00ff88' }}>Role:</strong> {selectedCompany.role}
            </div>
            <div style={{ marginBottom: '10px' }}>
              <strong style={{ color: '#00ff88' }}>Period:</strong> {selectedCompany.period}
            </div>
            
            <div style={{ marginBottom: '10px' }}>
              <strong style={{ color: '#00ff88' }}>Key Achievements:</strong>
            </div>
            <ul style={{ paddingLeft: '20px', margin: 0 }}>
              {selectedCompany.achievements.map((achievement, index) => (
                <li key={index} style={{ marginBottom: '5px' }}>{achievement}</li>
              ))}
            </ul>
          </div>
        </Html>
      )}
    </group>
  );
}
