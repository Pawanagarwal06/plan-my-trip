'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Cloud, Clouds, Environment, Sky, Stars } from '@react-three/drei';
import * as THREE from 'three';

// Fallback primitives for different environments if GLTF models are missing
// In a real production app, these would be useGLTF loading DRACO compressed models.
export function MountainsEnvironment() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  return (
    <group>
      <Sky sunPosition={[0, 1, -1]} turbidity={0.1} rayleigh={0.5} />
      <Environment preset="sunset" />
      <ambientLight intensity={0.2} />
      <directionalLight position={[5, 10, -5]} intensity={1.5} color="#ffd2a6" />
      
      {/* Primitive Mountain Placeholder */}
      <mesh ref={meshRef} position={[0, -5, -20]}>
        <coneGeometry args={[15, 20, 4]} />
        <meshStandardMaterial color="#2c3e50" roughness={0.8} />
      </mesh>

      <Clouds material={THREE.MeshBasicMaterial}>
        <Cloud seed={1} bounds={[10, 2, 10]} volume={10} color="white" position={[0, 10, -10]} opacity={0.5} />
      </Clouds>
    </group>
  );
}

export function BeachEnvironment() {
  return (
    <group>
      <Sky sunPosition={[0, 0.5, 1]} turbidity={0.3} rayleigh={1.2} />
      <Environment preset="dawn" />
      <ambientLight intensity={0.4} />
      <directionalLight position={[-5, 5, 5]} intensity={1} color="#ffb84d" />
      
      {/* Primitive Water Placeholder */}
      <mesh position={[0, -2, -10]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#0080ff" roughness={0.1} metalness={0.8} transparent opacity={0.8} />
      </mesh>
    </group>
  );
}

export function DesertEnvironment() {
  return (
    <group>
      <Sky sunPosition={[0, 2, 0]} turbidity={0.01} rayleigh={0.1} />
      <Environment preset="apartment" />
      <ambientLight intensity={0.8} />
      <directionalLight position={[0, 20, 0]} intensity={2} color="#ffeaa7" />
      
      {/* Primitive Sand Placeholder */}
      <mesh position={[0, -2, -10]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#d2b48c" roughness={1} />
      </mesh>
    </group>
  );
}

export function CityEnvironment() {
  return (
    <group>
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <Environment preset="night" />
      <ambientLight intensity={0.1} />
      <pointLight position={[0, 10, 0]} intensity={0.5} color="#00ffff" />
      
      {/* Primitive Buildings Placeholder */}
      {[...Array(10)].map((_, i) => (
        <mesh key={i} position={[(Math.random() - 0.5) * 40, Math.random() * 5, -20 + (Math.random() - 0.5) * 20]}>
          <boxGeometry args={[2, 10 + Math.random() * 20, 2]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.2} metalness={0.8} />
        </mesh>
      ))}
    </group>
  );
}

export function ForestEnvironment() {
  return (
    <group>
      <Environment preset="forest" />
      <ambientLight intensity={0.3} color="#a8e6cf" />
      <directionalLight position={[5, 10, 5]} intensity={1} color="#dcedc1" />
      
      {/* Primitive Trees Placeholder */}
      {[...Array(20)].map((_, i) => (
        <mesh key={i} position={[(Math.random() - 0.5) * 30, 0, -10 + (Math.random() - 0.5) * 20]}>
          <cylinderGeometry args={[0.5, 0.5, 5]} />
          <meshStandardMaterial color="#8b4513" />
          <mesh position={[0, 4, 0]}>
             <sphereGeometry args={[2]} />
             <meshStandardMaterial color="#228b22" />
          </mesh>
        </mesh>
      ))}
      <fog attach="fog" args={['#a8e6cf', 10, 40]} />
    </group>
  );
}
