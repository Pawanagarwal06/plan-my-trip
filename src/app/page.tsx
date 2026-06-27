'use client';

import { useState } from 'react';
import SceneManager, { DestinationType } from '@/components/3d/SceneManager';
import TripForm from '@/components/TripForm';

export default function Home() {
  const [sceneType, setSceneType] = useState<DestinationType>('default');

  return (
    <main className="min-h-screen relative overflow-hidden bg-slate-950">
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        <source src="/scroll_up_to_down.mp4" type="video/mp4" />
      </video>
      {/* Subtle Overlay to keep text readable but keep video clear */}
      <div className="absolute inset-0 z-0 bg-black/20" />

      {/* Main Content Overlay */}
      <div className="relative z-10 min-h-screen p-4 md:p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto pt-24 md:pt-32">
          <header className="mb-16 text-center text-white drop-shadow-2xl flex flex-col items-center">
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-6 text-transparent bg-clip-text bg-gradient-to-b from-white via-teal-100 to-teal-600">
              Plan My Trip
            </h1>
            <p className="text-xl md:text-2xl text-teal-50 opacity-90 max-w-3xl mx-auto font-medium leading-relaxed">
              Your AI-powered travel architect. Enter your Destination, and let the AI build a perfect, fully costed itinerary in seconds.
            </p>
          </header>

          <TripForm setSceneType={setSceneType} />
        </div>
      </div>
    </main>
  );
}
