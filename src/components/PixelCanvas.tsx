import React, { useEffect, useRef } from 'react';

interface ParticleOverlayProps {
  burst?: { x: number; y: number; color: string } | null;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  life: number;
}

export default function ParticleOverlay({ burst }: ParticleOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);

  const spawnBurst = (x: number, y: number, color: string) => {
    for (let i = 0; i < 24; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 8 + 4;
      particles.current.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 6 + 4,
        color,
        life: 1.0
      });
    }
  };

  useEffect(() => {
    if (burst) {
      spawnBurst(burst.x, burst.y, burst.color);
    }
  }, [burst]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', handleResize);
    handleResize();

    let requestRef: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.current = particles.current.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.97;
        p.vy *= 0.97;
        p.life -= 0.015;

        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        // Pixel feel: Use rects instead of arcs
        ctx.fillRect(p.x - p.size/2, p.y - p.size/2, p.size, p.size);

        return p.life > 0;
      });

      requestRef = requestAnimationFrame(animate);
    };

    requestRef = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(requestRef);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
    />
  );
}
