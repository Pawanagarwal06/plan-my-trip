'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Preload, PerformanceMonitor } from '@react-three/drei';
import { MountainsEnvironment, BeachEnvironment, DesertEnvironment, CityEnvironment, ForestEnvironment } from './Environments';
import gsap from 'gsap';

export type DestinationType = 'mountains' | 'beach' | 'desert' | 'city' | 'forest' | 'default';

export default function SceneManager({ destinationType = 'default' }: { destinationType?: DestinationType }) {
  const [dpr, setDpr] = useState(1.5);
  const [isLowPower, setIsLowPower] = useState(false);

  useEffect(() => {
    // Basic hardware concurrency check for fallback video loop (performance optimization)
    if (typeof window !== 'undefined' && navigator.hardwareConcurrency <= 4) {
      setIsLowPower(true);
    }
  }, []);

  if (isLowPower) {
    return (
      <div className="fixed inset-0 z-[-1] bg-slate-900 flex items-center justify-center text-white/20">
        {/* Fallback Video Loop or Static Gradient for low end devices */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900 to-black"></div>
      </div>
    );
  }

  // Render correct environment
  const EnvironmentComponent = {
    mountains: MountainsEnvironment,
    beach: BeachEnvironment,
    desert: DesertEnvironment,
    city: CityEnvironment,
    forest: ForestEnvironment,
    default: MountainsEnvironment, // Default aesthetic requested: dramatic tropical mountain
  }[destinationType];

  return (
    <div className="fixed inset-0 z-[-1]">
      <Canvas
        camera={{ position: [0, 2, 10], fov: 45 }}
        dpr={dpr}
        gl={{ antialias: false, powerPreference: "high-performance" }}
      >
        <PerformanceMonitor onDecline={() => setDpr(1)} onIncline={() => setDpr(2)}>
          <Suspense fallback={null}>
            <EnvironmentComponent />
            <Preload all />
          </Suspense>
        </PerformanceMonitor>
      </Canvas>
    </div>
  );
}
