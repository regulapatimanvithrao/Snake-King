/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import SnakeGame from './components/SnakeGame';
import MusicPlayer from './components/MusicPlayer';
import { Gamepad2 } from 'lucide-react';

export default function App() {
  const [score, setScore] = useState(0);

  return (
    <div className="flex flex-col h-screen text-white bg-neon-bg font-sans overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 px-6 py-4 border-b border-neon-pink/30 flex items-center justify-between bg-black/50 backdrop-blur-md z-10 shadow-[0_4px_30px_rgba(255,0,255,0.1)]">
        <div className="flex items-center gap-3">
          <Gamepad2 className="text-neon-pink w-8 h-8 drop-shadow-[0_0_8px_rgba(255,0,255,0.8)] animate-pulse" />
          <h1 className="text-2xl font-black italic tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-neon-pink to-neon-cyan drop-shadow-[0_0_10px_rgba(255,0,255,0.4)]">
            NEON<span className="text-white">SNAKE</span>
          </h1>
        </div>
        <div className="flex items-center gap-4 bg-neon-surface border border-neon-green/40 px-6 py-2 rounded-full shadow-[0_0_15px_rgba(57,255,20,0.15)] relative overflow-hidden">
          <div className="absolute inset-0 bg-neon-green/5"></div>
          <span className="text-xs uppercase font-mono tracking-widest text-gray-400 z-10">Score</span>
          <span className="font-mono text-2xl font-bold text-neon-green tracking-wider z-10 drop-shadow-[0_0_8px_rgba(57,255,20,0.8)]">
            {score.toString().padStart(4, '0')}
          </span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Decorative Gradients */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-neon-pink/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute -top-32 -left-32 w-[400px] h-[400px] bg-neon-cyan/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-neon-green/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="z-10 w-full max-w-2xl px-4 transition-transform duration-300 hover:scale-[1.02]">
          <SnakeGame onScoreChange={setScore} />
        </div>
        
        {/* Controls Instructions */}
        <div className="relative mt-8 z-10 text-center space-y-2 opacity-60 hover:opacity-100 transition-opacity bg-black/40 px-6 py-4 rounded-xl border border-white/5 backdrop-blur-sm">
          <p className="font-mono text-sm tracking-wider uppercase text-neon-cyan">
            [ W A S D ] or [ ARROWS ] to move
          </p>
          <p className="font-mono text-sm tracking-wider uppercase text-white">
            [ SPACE ] to Pause / Unpause
          </p>
        </div>
      </main>

      {/* Footer / Music Player */}
      <div className="flex-shrink-0 z-20">
        <MusicPlayer />
      </div>
    </div>
  );
}
