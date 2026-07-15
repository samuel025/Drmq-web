import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export const CanvasTrafficWeaver = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;

    // Handle resizing
    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    resize();
    window.addEventListener('resize', resize);

    // Hub State
    const hub = {
      radius: 55,
      glowRadius: 0,
      glowOpacity: 0,
    };

    // Paths definitions (calculated dynamically based on screen size)
    const getPaths = () => {
      const centerY = height / 2;
      const centerX = width / 2;

      // Spread 7 paths dynamically based on screen height for mobile responsiveness
      const spread = height * 0.45; // Covers 90% of the screen vertically
      const yOffsets = [
        -spread, 
        -spread * 0.66, 
        -spread * 0.33, 
        0, 
        spread * 0.33, 
        spread * 0.66, 
        spread
      ];

      const inputStarts = yOffsets.map(y => ({ x: -50, y: centerY + y }));
      const outputEnds = yOffsets.map(y => ({ x: width + 50, y: centerY + y }));

      const curveXOffset = Math.max(width * 0.15, 150);

      const inputs = inputStarts.map(start => ({
        start,
        cp1: { x: centerX - curveXOffset, y: start.y },
        cp2: { x: centerX - curveXOffset, y: centerY },
        end: { x: centerX - hub.radius, y: centerY }
      }));

      const outputs = outputEnds.map(end => ({
        start: { x: centerX + hub.radius, y: centerY },
        cp1: { x: centerX + curveXOffset, y: centerY },
        cp2: { x: centerX + curveXOffset, y: end.y },
        end
      }));

      return { inputs, outputs, centerX, centerY };
    };

    // Particle types
    type PathDef = { start: {x:number, y:number}, cp1: {x:number, y:number}, cp2: {x:number, y:number}, end: {x:number, y:number} };
    type Particle = {
      progress: number;
      path: PathDef;
      type: 'input' | 'output';
      color: string;
      speed: number;
    };

    let particles: Particle[] = [];

    // Helper: bezier calculation
    const getBezierPoint = (t: number, start: {x:number,y:number}, cp1: {x:number,y:number}, cp2: {x:number,y:number}, end: {x:number,y:number}) => {
      const cx = Math.pow(1-t, 3)*start.x + 3*Math.pow(1-t, 2)*t*cp1.x + 3*(1-t)*Math.pow(t, 2)*cp2.x + Math.pow(t, 3)*end.x;
      const cy = Math.pow(1-t, 3)*start.y + 3*Math.pow(1-t, 2)*t*cp1.y + 3*(1-t)*Math.pow(t, 2)*cp2.y + Math.pow(t, 3)*end.y;
      return { cx, cy };
    };

    const OUT_COLORS = ['#06b6d4', '#14b8a6', '#3b82f6'];

    // Spawn functions
    const spawnInput = (customStart?: {x:number, y:number}) => {
      const { inputs, centerX, centerY } = getPaths();
      const pathIndex = Math.floor(Math.random() * inputs.length);
      const p: Particle = {
        progress: 0,
        path: customStart ? {
          start: customStart,
          cp1: { x: customStart.x + Math.max(width * 0.15, 150), y: customStart.y },
          cp2: { x: centerX - Math.max(width * 0.15, 150), y: centerY },
          end: { x: centerX - hub.radius, y: centerY }
        } : inputs[pathIndex],
        type: 'input',
        color: '#fb923c', // Warm orange
        speed: 0.3 + Math.random() * 0.4
      };
      particles.push(p);

      gsap.to(p, {
        progress: 1,
        duration: 2 / p.speed,
        ease: 'power1.inOut',
        onComplete: () => {
          particles = particles.filter(part => part !== p);
          triggerHubPulse();
        }
      });
    };

    const spawnOutput = (customEnd?: {x:number, y:number}) => {
      const { outputs, centerX, centerY } = getPaths();
      const targetIndex = Math.floor(Math.random() * outputs.length);
      
      const p: Particle = {
        progress: 0,
        path: customEnd ? {
          start: { x: centerX + hub.radius, y: centerY },
          cp1: { x: centerX + Math.max(width * 0.15, 150), y: centerY },
          cp2: { x: customEnd.x - Math.max(width * 0.15, 150), y: customEnd.y },
          end: customEnd
        } : outputs[targetIndex],
        type: 'output',
        color: OUT_COLORS[targetIndex % 3],
        speed: 0.4 + Math.random() * 0.5
      };
      particles.push(p);

      gsap.to(p, {
        progress: 1,
        duration: 2 / p.speed,
        ease: 'power1.inOut',
        onComplete: () => {
          particles = particles.filter(part => part !== p);
        }
      });
    };

    const triggerHubPulse = () => {
      // Pulse animation
      hub.glowRadius = hub.radius;
      hub.glowOpacity = 0.8;
      gsap.to(hub, {
        glowRadius: hub.radius * 2.5,
        glowOpacity: 0,
        duration: 0.6,
        ease: 'power2.out'
      });
      spawnOutput();
    };

    // Easter Egg (Click to Produce / Consume)
    const onClick = (e: MouseEvent) => {
      const centerX = window.innerWidth / 2;
      if (e.clientX < centerX - 50) {
        // Produce
        for (let i = 0; i < 3; i++) {
          setTimeout(() => spawnInput({ x: e.clientX, y: e.clientY }), i * 150);
        }
      } else if (e.clientX > centerX + 50) {
        // Consume
        for (let i = 0; i < 3; i++) {
          setTimeout(() => spawnOutput({ x: e.clientX, y: e.clientY }), i * 150);
        }
      }
    };
    window.addEventListener('click', onClick);

    // Ambient Data Dust (slowly moving background dots)
    const dataDust = Array.from({ length: 150 }).map(() => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      radius: Math.random() * 1.5 + 0.5,
      speed: (Math.random() - 0.5) * 0.5,
      opacity: Math.random() * 0.5 + 0.1
    }));

    // Spawning loop (Faster for more traffic)
    const spawner = setInterval(spawnInput, 250);

    // Draw loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);
      
      const { inputs, outputs, centerX, centerY } = getPaths();

      // Draw ambient data dust
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      dataDust.forEach(dust => {
        dust.y += dust.speed;
        if (dust.y > height) dust.y = 0;
        if (dust.y < 0) dust.y = height;
        ctx.globalAlpha = dust.opacity;
        ctx.beginPath();
        ctx.arc(dust.x, dust.y, dust.radius, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      // Draw faint paths
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      
      inputs.forEach(p => {
        ctx.beginPath();
        ctx.moveTo(p.start.x, p.start.y);
        ctx.bezierCurveTo(p.cp1.x, p.cp1.y, p.cp2.x, p.cp2.y, p.end.x, p.end.y);
        ctx.stroke();
      });
      
      outputs.forEach(p => {
        ctx.beginPath();
        ctx.moveTo(p.start.x, p.start.y);
        ctx.bezierCurveTo(p.cp1.x, p.cp1.y, p.cp2.x, p.cp2.y, p.end.x, p.end.y);
        ctx.stroke();
      });

      // Draw Particles (Laser-style trails)
      particles.forEach(p => {
        const path = p.path;
        const pos = getBezierPoint(p.progress, path.start, path.cp1, path.cp2, path.end);
        
        // Continuous Trail
        ctx.beginPath();
        ctx.moveTo(pos.cx, pos.cy);
        const trailSteps = 15;
        for (let i = 1; i <= trailSteps; i++) {
          const tProgress = Math.max(0, p.progress - i * 0.008);
          const tPos = getBezierPoint(tProgress, path.start, path.cp1, path.cp2, path.end);
          ctx.lineTo(tPos.cx, tPos.cy);
        }
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        ctx.globalAlpha = 0.5;
        ctx.shadowBlur = 15;
        ctx.shadowColor = p.color;
        ctx.stroke();

        // Head
        ctx.globalAlpha = 1;
        ctx.beginPath();
        ctx.arc(pos.cx, pos.cy, 6, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.shadowBlur = 0; // reset
      });

      // Draw Hub
      // Outer ripple
      if (hub.glowOpacity > 0) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, hub.glowRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 255, 255, ${hub.glowOpacity})`;
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      // Spinning Outer Rings
      const time = Date.now() / 1000;
      ctx.save();
      ctx.translate(centerX, centerY);
      
      // Ring 1
      ctx.rotate(time * 0.5);
      ctx.strokeStyle = '#3b82f6'; // Blue
      ctx.lineWidth = 2;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.arc(0, 0, hub.radius + 15, i * (Math.PI*2/3) + 0.2, (i+1) * (Math.PI*2/3) - 0.2);
        ctx.stroke();
      }

      // Ring 2 (counter rotating)
      ctx.rotate(-time * 1.2);
      ctx.strokeStyle = '#14b8a6'; // Teal
      ctx.lineWidth = 4;
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.arc(0, 0, hub.radius + 28, i * (Math.PI/2) + 0.1, (i+1) * (Math.PI/2) - 0.1);
        ctx.stroke();
      }
      ctx.restore();

      // Inner Hub body
      ctx.beginPath();
      ctx.arc(centerX, centerY, hub.radius, 0, Math.PI * 2);
      ctx.fillStyle = '#020617';
      ctx.fill();
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, hub.radius - 4, 0, Math.PI * 2);
      ctx.fillStyle = hub.glowOpacity > 0 ? '#1f2937' : '#111827';
      ctx.strokeStyle = hub.glowOpacity > 0 ? '#f4f4f5' : '#3f3f46';
      ctx.lineWidth = 2;
      ctx.fill();
      ctx.stroke();

      // Hub text
      ctx.fillStyle = '#f4f4f5';
      ctx.font = 'bold 16px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      if (hub.glowOpacity > 0.3) {
        ctx.shadowBlur = 15;
        ctx.shadowColor = 'white';
        ctx.fillStyle = 'white';
      }
      ctx.fillText('DRMQ', centerX, centerY);
      ctx.shadowBlur = 0; // reset
    };

    gsap.ticker.add(render);

    // Cleanup
    return () => {
      clearInterval(spawner);
      gsap.ticker.remove(render);
      gsap.killTweensOf(particles);
      gsap.killTweensOf(hub);
      window.removeEventListener('resize', resize);
      window.removeEventListener('click', onClick);
    };
  }, []);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden" style={{
      maskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)',
      WebkitMaskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)'
    }}>
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
};
