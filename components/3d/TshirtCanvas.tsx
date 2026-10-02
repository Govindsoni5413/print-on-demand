'use client';

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Center, Float } from '@react-three/drei';
import { TshirtModel } from './TshirtModel';
import { ProceduralShirt } from './ProceduralShirt';

interface TshirtCanvasProps {
  color?: string;
  designImageUrl?: string;
  placement?: 'chest' | 'center' | 'back';
  scale?: number;
  interactive?: boolean;
  autoRotate?: boolean;
  floating?: boolean;
  className?: string;
}

export function TshirtCanvas({
  color = '#121212',
  designImageUrl,
  placement = 'chest',
  scale = 1.0,
  interactive = true,
  autoRotate = false,
  floating = false,
  className = 'w-full h-full min-h-[360px]',
}: TshirtCanvasProps) {
  return (
    <div className={`relative ${className} select-none overflow-hidden`}>
      <Canvas
        shadows
        camera={{ position: [0, 0, 2.2], fov: 32 }}
        gl={{ preserveDrawingBuffer: true, antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 10, 5]} intensity={1.2} castShadow />
        <directionalLight position={[-5, 5, -5]} intensity={0.4} />
        <directionalLight position={[0, -5, 2]} intensity={0.3} />

        <Suspense fallback={<ProceduralShirt color={color} />}>
          <Center>
            {floating ? (
              <Float speed={1.8} rotationIntensity={0.4} floatIntensity={0.5}>
                <TshirtModel
                  color={color}
                  designImageUrl={designImageUrl}
                  placement={placement}
                  scale={scale}
                  autoRotate={autoRotate}
                />
              </Float>
            ) : (
              <TshirtModel
                color={color}
                designImageUrl={designImageUrl}
                placement={placement}
                scale={scale}
                autoRotate={autoRotate}
              />
            )}
          </Center>
        </Suspense>

        {interactive && (
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            minPolarAngle={Math.PI / 3.5}
            maxPolarAngle={Math.PI / 1.8}
            rotateSpeed={0.8}
          />
        )}
      </Canvas>
    </div>
  );
}

export default TshirtCanvas;
