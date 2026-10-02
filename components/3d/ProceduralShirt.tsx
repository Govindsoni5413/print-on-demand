'use client';

import React from 'react';
import * as THREE from 'three';

interface ProceduralShirtProps {
  color: string;
}

export function ProceduralShirt({ color }: ProceduralShirtProps) {
  const shirtColor = new THREE.Color(color);

  return (
    <group position={[0, -0.2, 0]} scale={[1.2, 1.2, 1.2]}>
      {/* Torso */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.7, 0.65, 1.4, 32]} />
        <meshStandardMaterial color={shirtColor} roughness={0.7} />
      </mesh>

      {/* Shoulders */}
      <mesh position={[0, 0.7, 0]}>
        <boxGeometry args={[1.5, 0.2, 0.5]} />
        <meshStandardMaterial color={shirtColor} roughness={0.7} />
      </mesh>

      {/* Left Sleeve */}
      <mesh position={[-0.9, 0.5, 0]} rotation={[0, 0, 0.5]}>
        <cylinderGeometry args={[0.26, 0.28, 0.7, 24]} />
        <meshStandardMaterial color={shirtColor} roughness={0.7} />
      </mesh>

      {/* Right Sleeve */}
      <mesh position={[0.9, 0.5, 0]} rotation={[0, 0, -0.5]}>
        <cylinderGeometry args={[0.26, 0.28, 0.7, 24]} />
        <meshStandardMaterial color={shirtColor} roughness={0.7} />
      </mesh>

      {/* Collar */}
      <mesh position={[0, 0.75, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.25, 0.04, 16, 32]} />
        <meshStandardMaterial color={shirtColor} roughness={0.8} />
      </mesh>
    </group>
  );
}
