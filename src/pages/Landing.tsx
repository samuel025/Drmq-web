
import { CanvasTrafficWeaver } from '../components/CanvasTrafficWeaver';
import { Link } from 'react-router-dom';
import { ArrowRight, Terminal } from 'lucide-react';

export const Landing = () => {
  return (
    <div className="min-h-screen bg-black text-zinc-300 font-sans selection:bg-emerald-500/30">
      {/* Navigation - Modern Floating Pill */}
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-6 pointer-events-none px-4">
        <nav className="pointer-events-auto flex items-center justify-between px-6 py-3 border border-zinc-800/80 bg-zinc-950/50 backdrop-blur-xl rounded-full w-full max-w-4xl shadow-2xl">
          <div className="flex items-center">
            <span className="text-lg font-bold text-white tracking-tight">DRMQ</span>
          </div>
          <div className="flex items-center gap-6 text-sm font-medium">
            <a href="https://github.com/samuel025/Distributed-Reliable-Message-Queue" target="_blank" rel="noreferrer" className="hidden md:block text-zinc-400 hover:text-white transition-colors">GitHub</a>
            <Link to="/docs" className="hidden md:block text-zinc-400 hover:text-white transition-colors">Documentation</Link>
            <Link to="/docs" className="bg-white text-black px-4 py-1.5 rounded-full hover:bg-zinc-200 transition-colors flex items-center gap-1.5">
              Get Started <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </nav>
      </div>

      {/* Hero Section */}
      <main className="relative w-full h-screen overflow-hidden flex flex-col">
        {/* Layer 1: Canvas Background */}
        <CanvasTrafficWeaver />

        {/* Layer 2: Content Top Half */}
        <div className="relative z-10 flex-1 flex flex-col justify-end pb-2 items-center text-center w-full px-8 pointer-events-none">
          {/* Smooth gradient from top, fading to transparent at the hub gap */}
          <div className="absolute inset-0 bg-gradient-to-b from-black via-black/90 to-transparent md:bg-[radial-gradient(ellipse_at_top,rgba(0,0,0,0.8)_0%,transparent_70%)] -z-10 pointer-events-none"></div>
          

          <h1 className="text-4xl md:text-7xl font-extrabold text-white tracking-tight leading-tight drop-shadow-2xl">
            The high-performance <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Raft-backed</span> message broker.
          </h1>
        </div>

        {/* GAP FOR DRMQ HUB */}
        <div className="h-[100px] w-full shrink-0 pointer-events-none"></div>

        {/* Layer 3: Content Bottom Half */}
        <div className="relative z-10 flex-1 flex flex-col justify-start pt-4 items-center text-center w-full px-8 pointer-events-none">
          {/* Smooth gradient from bottom, fading to transparent at the hub gap */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/90 to-transparent md:bg-[radial-gradient(ellipse_at_bottom,rgba(0,0,0,0.8)_0%,transparent_70%)] -z-10 pointer-events-none"></div>
          
          <p className="text-lg md:text-xl text-zinc-300 mb-8 max-w-2xl leading-relaxed drop-shadow-lg font-medium">
            DRMQ is a distributed, fault-tolerant messaging system built from scratch in Java. 
            Engineered for zero-data-loss and strict ordering using the Raft consensus algorithm.
          </p>
          
          <div className="flex flex-col md:flex-row items-center gap-4 pointer-events-auto w-full md:w-auto">
            <Link to="/docs" className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold px-8 py-4 rounded-full transition-all flex items-center justify-center gap-2 hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(16,185,129,0.3)] w-full md:w-auto">
              Read the Docs <ArrowRight className="w-5 h-5" />
            </Link>
            <div className="hidden md:flex font-mono text-sm bg-[#030712] border border-zinc-800 px-6 py-4 rounded-full items-center gap-3 text-zinc-400">
              <Terminal className="w-4 h-4 text-zinc-500" />
              <span>git clone https://github.com/samuel025/...</span>
            </div>
          </div>
        </div>
      </main>


    </div>
  );
};
