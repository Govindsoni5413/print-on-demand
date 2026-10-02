'use client';

import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useGLTF, useTexture, Decal } from '@react-three/drei';
import type { GLTF } from 'three-stdlib';
import { ProceduralShirt } from './ProceduralShirt';

type GLTFResult = GLTF & {
  nodes: {
    T_Shirt_male: THREE.Mesh;
  };
  materials: {
    lambert1: THREE.MeshStandardMaterial;
  };
};

interface DecalTextureProps {
  url: string;
  placement?: 'chest' | 'center' | 'back';
  scale?: number;
}

function DecalGraphic({ url, placement = 'chest', scale = 1.0 }: DecalTextureProps) {
  const texture = useTexture(url);
  texture.anisotropy = 16;

  let pos: [number, number, number] = [0, 0.04, 0.15];
  let rot: [number, number, number] = [0, 0, 0];
  let decalScale: [number, number, number] = [0.16 * scale, 0.16 * scale, 0.16 * scale];

  if (placement === 'center') {
    pos = [0, -0.02, 0.15];
    rot = [0, 0, 0];
    decalScale = [0.22 * scale, 0.22 * scale, 0.22 * scale];
  } else if (placement === 'back') {
    pos = [0, 0.04, -0.15];
    rot = [0, Math.PI, 0];
    decalScale = [0.22 * scale, 0.22 * scale, 0.22 * scale];
  }

  return (
    <Decal
      position={pos}
      rotation={rot}
      scale={decalScale}
      map={texture}
    />
  );
}

interface TshirtModelProps {
  color?: string;
  designImageUrl?: string;
  placement?: 'chest' | 'center' | 'back';
  scale?: number;
  autoRotate?: boolean;
}

export function TshirtModelContent({
  color = '#121212',
  designImageUrl,
  placement = 'chest',
  scale = 1.0,
  autoRotate = false,
}: TshirtModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { nodes, materials } = useGLTF('/models/tshirt.glb') as unknown as GLTFResult;

  useFrame((_, delta) => {
    if (autoRotate && groupRef.current) {
      groupRef.current.rotation.y += delta * 0.4;
    }
    if (materials?.lambert1) {
      materials.lambert1.color.lerp(new THREE.Color(color), 0.1);
      materials.lambert1.roughness = 0.85;
    }
  });

  if (!nodes?.T_Shirt_male || !materials?.lambert1) {
    return <ProceduralShirt color={color} />;
  }

  return (
    <group ref={groupRef} dispose={null}>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.T_Shirt_male.geometry}
        material={materials.lambert1}
        material-roughness={0.85}
        dispose={null}
      >
        {designImageUrl && (
          <React.Suspense fallback={null}>
            <DecalGraphic url={designImageUrl} placement={placement} scale={scale} />
          </React.Suspense>
        )}
      </mesh>
    </group>
  );
}

export class ModelErrorBoundary extends React.Component<
  { color: string; children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { color: string; children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.warn('3D Model failed to load GLB, falling back to procedural:', error);
  }

  render() {
    if (this.state.hasError) {
      return <ProceduralShirt color={this.props.color} />;
    }
    return this.props.children;
  }
}

export function TshirtModel(props: TshirtModelProps) {
  return (
    <ModelErrorBoundary color={props.color || '#121212'}>
      <React.Suspense fallback={<ProceduralShirt color={props.color || '#121212'} />}>
        <TshirtModelContent {...props} />
      </React.Suspense>
    </ModelErrorBoundary>
  );
}

// Preload real GLB model
try {
  useGLTF.preload('/models/tshirt.glb');
} catch {
  // Ignore in SSR
}
