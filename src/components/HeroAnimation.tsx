import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Types for our particles
type Particle = {
  id: string;
  sourceId: number; // 0, 1, 2
  targetId: number; // 0, 1, 2
  color: string;
  stage: 'ingest' | 'sorting' | 'delivery';
  progress: number; // 0 to 1
};

const INGEST_COLOR = '#fb923c'; // Warm orange for raw input
const COLORS = ['#06b6d4', '#14b8a6', '#3b82f6']; // Cool cyan, teal, blue for processed topics

export const HeroAnimation = () => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [coreFlash, setCoreFlash] = useState(false);
  const [consumerFlashes, setConsumerFlashes] = useState([false, false, false]);

  useEffect(() => {
    // Generate new particles periodically
    const interval = setInterval(() => {
      const sourceId = Math.floor(Math.random() * 3);
      const targetId = Math.floor(Math.random() * 3);
      const newParticle: Particle = {
        id: Math.random().toString(36).substr(2, 9),
        sourceId,
        targetId,
        color: COLORS[targetId], // Color represents the destination topic
        stage: 'ingest',
        progress: 0,
      };
      setParticles(prev => [...prev, newParticle]);
    }, 400); // 400ms interval for constant hum

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Animation loop
    let lastTime = performance.now();
    let animationFrameId: number;

    const animate = (time: number) => {
      const deltaTime = time - lastTime;
      lastTime = time;

      setParticles(prev => {
        let didCoreFlash = false;
        const newConsumerFlashes = [...consumerFlashes];


        const nextParticles = prev.map(p => {
          let nextProgress = p.progress + (deltaTime * 0.0015); // Speed multiplier
          let nextStage = p.stage;

          if (p.stage === 'ingest' && nextProgress >= 1) {
            nextStage = 'sorting';
            nextProgress = 0;
            didCoreFlash = true;
          } else if (p.stage === 'sorting' && nextProgress >= 1) {
            nextStage = 'delivery';
            nextProgress = 0;
          } else if (p.stage === 'delivery' && nextProgress >= 1) {
            newConsumerFlashes[p.targetId] = true;
            return null; // Particle delivered, remove it
          }

          return { ...p, progress: nextProgress, stage: nextStage };
        }).filter(Boolean) as Particle[];

        if (didCoreFlash) {
          setCoreFlash(true);
          setTimeout(() => setCoreFlash(false), 150);
        }
        
        if (newConsumerFlashes.some(f => f)) {
          setConsumerFlashes(newConsumerFlashes);
          setTimeout(() => setConsumerFlashes([false, false, false]), 150);
        }

        return nextParticles;
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [consumerFlashes]);

  // Layout Constants
  const width = 800;
  const height = 400;

  const activeIngest = new Set(particles.filter(p => p.stage === 'ingest').map(p => p.sourceId));
  const activeDeliveryColors = new Map(particles.filter(p => p.stage === 'delivery').map(p => [p.targetId, p.color]));

  const getBezierPoint = (start: {x: number, y: number}, end: {x: number, y: number}, cp1x: number, cp2x: number, t: number) => {
    if (t <= 0) return { cx: start.x, cy: start.y };
    if (t >= 1) return { cx: end.x, cy: end.y };
    const cx = Math.pow(1-t, 3)*start.x + 3*Math.pow(1-t, 2)*t*cp1x + 3*(1-t)*Math.pow(t, 2)*cp2x + Math.pow(t, 3)*end.x;
    const cy = Math.pow(1-t, 3)*start.y + 3*Math.pow(1-t, 2)*t*start.y + 3*(1-t)*Math.pow(t, 2)*end.y + Math.pow(t, 3)*end.y;
    return { cx, cy };
  };
  
  const producers = [
    { x: 50, y: 100 },
    { x: 50, y: 200 },
    { x: 50, y: 300 }
  ];
  
  const core = { x: 400, y: 200 };
  
  const consumers = [
    { x: 750, y: 100 },
    { x: 750, y: 200 },
    { x: 750, y: 300 }
  ];



  return (
    <div className="w-full max-w-4xl mx-auto p-8 rounded-2xl bg-zinc-950 border border-zinc-800 shadow-2xl overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-900/50 via-zinc-950 to-zinc-950"></div>
      
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto relative z-10 drop-shadow-2xl">
        <defs>
          <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Draw Tracks */}
        {producers.map((p, i) => (
          <path key={`track-in-${i}`} d={`M ${p.x} ${p.y} C 200 ${p.y}, 250 ${core.y}, ${core.x - 40} ${core.y}`} 
                fill="none" 
                stroke={activeIngest.has(i) ? `${INGEST_COLOR}60` : '#27272a'} 
                strokeWidth={activeIngest.has(i) ? "3" : "2"}
                style={{ transition: 'stroke 0.3s ease, stroke-width 0.3s ease' }} />
        ))}
        {consumers.map((c, i) => (
          <path key={`track-out-${i}`} d={`M ${core.x + 40} ${core.y} C 550 ${core.y}, 600 ${c.y}, ${c.x} ${c.y}`} 
                fill="none" 
                stroke={activeDeliveryColors.get(i) ? `${activeDeliveryColors.get(i)}60` : '#27272a'} 
                strokeWidth={activeDeliveryColors.has(i) ? "3" : "2"}
                style={{ transition: 'stroke 0.3s ease, stroke-width 0.3s ease' }} />
        ))}

        {/* Producers */}
        {producers.map((p, i) => (
          <g key={`producer-${i}`}>
            <rect x={p.x - 15} y={p.y - 15} width="30" height="30" rx="6" fill="#09090b" stroke={activeIngest.has(i) ? INGEST_COLOR : "#3f3f46"} strokeWidth="2" style={{ transition: 'stroke 0.2s' }} />
            <circle cx={p.x} cy={p.y} r="4" fill={activeIngest.has(i) ? INGEST_COLOR : "#a1a1aa"} style={{ transition: 'fill 0.2s' }} filter={activeIngest.has(i) ? "url(#neonGlow)" : ""} />
          </g>
        ))}

        {/* Consumers */}
        {consumers.map((c, i) => (
          <g key={`consumer-${i}`}>
            <rect x={c.x - 15} y={c.y - 15} width="30" height="30" rx="6" fill="#09090b" 
                  stroke={consumerFlashes[i] ? COLORS[i] : "#3f3f46"} 
                  strokeWidth="2" 
                  style={{ transition: 'stroke 0.1s ease-out' }} />
            <circle cx={c.x} cy={c.y} r="4" fill={consumerFlashes[i] ? COLORS[i] : "#a1a1aa"} 
                    style={{ transition: 'fill 0.1s ease-out' }} filter={consumerFlashes[i] ? "url(#neonGlow)" : ""} />
          </g>
        ))}

        {/* Broker Core */}
        <g transform={`translate(${core.x}, ${core.y})`}>
          {/* Ripple Effect */}
          <AnimatePresence>
            {coreFlash && (
              <motion.circle 
                cx="0" cy="0" r="40" 
                fill="none" stroke="#f4f4f5" strokeWidth="2"
                initial={{ scale: 1, opacity: 0.8 }}
                animate={{ scale: 1.8, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            )}
          </AnimatePresence>
          
          <rect 
            x="-40" y="-40" width="80" height="80" rx="16" 
            fill="#09090b" 
            stroke={coreFlash ? "#f4f4f5" : "#3f3f46"} 
            strokeWidth="2"
            style={{ transition: 'stroke 0.15s ease' }}
          />
          <rect x="-25" y="-25" width="50" height="50" rx="25" fill="none" stroke={coreFlash ? "#f4f4f5" : "#27272a"} strokeWidth="2" strokeDasharray="4 4" className="origin-center animate-spin-slow" />
          <text x="0" y="5" textAnchor="middle" fill={coreFlash ? "#ffffff" : "#a1a1aa"} fontSize="14" fontWeight="900" fontFamily="monospace" style={{ transition: 'fill 0.1s', filter: coreFlash ? 'drop-shadow(0 0 4px white)' : 'none' }}>DRMQ</text>
        </g>

        {/* Particles & Trails */}
        <AnimatePresence>
          {particles.map(p => {
            let particleColor = p.stage === 'ingest' ? INGEST_COLOR : p.color;
            
            // Helper to get position for a specific progress t
            const getPos = (t: number) => {
              if (p.stage === 'ingest') {
                return getBezierPoint(producers[p.sourceId], {x: core.x - 40, y: core.y}, 200, 250, t);
              } else if (p.stage === 'sorting') {
                const angle = t * Math.PI * 2;
                return { cx: core.x + Math.cos(angle) * 25, cy: core.y + Math.sin(angle) * 25 };
              } else {
                return getBezierPoint({x: core.x + 40, y: core.y}, consumers[p.targetId], 550, 600, t);
              }
            };

            const pos = getPos(p.progress);
            // Trail particles (slightly behind in time)
            const trail1 = getPos(p.progress - 0.04);
            const trail2 = getPos(p.progress - 0.08);

            // Transition color inside sorting ring
            if (p.stage === 'sorting' && p.progress > 0.5) {
              particleColor = p.color;
            }

            return (
              <g key={p.id}>
                {/* Trails */}
                <circle cx={trail2.cx} cy={trail2.cy} r="2" fill={particleColor} opacity="0.2" filter="url(#neonGlow)" />
                <circle cx={trail1.cx} cy={trail1.cy} r="3" fill={particleColor} opacity="0.5" filter="url(#neonGlow)" />
                
                {/* Main Particle */}
                <motion.circle
                  cx={pos.cx}
                  cy={pos.cy}
                  r="5"
                  fill={particleColor}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  filter="url(#neonGlow)"
                />
              </g>
            );
          })}
        </AnimatePresence>
      </svg>
    </div>
  );
};
