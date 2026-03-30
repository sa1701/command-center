'use client';

import { useEffect, useRef } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Star {
  x: number;
  y: number;
  z: number;           // depth layer 0–1 (0 = far, 1 = near)
  radius: number;
  opacity: number;
  twinklePhase: number;
  twinkleSpeed: number;
}

interface ShootingStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  length: number;
  opacity: number;
  life: number;        // 0–1, counts down to 0 then removed
}

export interface StarfieldProps {
  /** Multiplier applied to all drift/animation speeds. Default: 1 */
  speed?: number;
  /** 0–1 fraction of maximum star count (~200). Default: 1 */
  density?: number;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MAX_STARS = 200;
const SHOOTING_STAR_INTERVAL_MS = 8000; // one shooting star every ~8 s
const LAYER_SPEEDS = [0.02, 0.06, 0.12]; // far / mid / near drift speeds (px/frame)

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function Starfield({ speed = 1, density = 1 }: StarfieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const shootingStarsRef = useRef<ShootingStar[]>([]);
  const rafRef = useRef<number>(0);
  const lastShootingRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // --- sizing -----------------------------------------------------------
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(document.documentElement);

    // --- populate stars ---------------------------------------------------
    const count = Math.round(MAX_STARS * Math.max(0.05, Math.min(1, density)));
    starsRef.current = Array.from({ length: count }, () => {
      const z = Math.random(); // 0 = far, 1 = near
      return {
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        z,
        radius: 0.3 + z * 1.4,
        opacity: 0.3 + z * 0.5,
        twinklePhase: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.005 + Math.random() * 0.015,
      };
    });

    // --- spawn a shooting star -------------------------------------------
    const spawnShootingStar = () => {
      const angle = (Math.random() * Math.PI) / 4 + Math.PI / 8; // 22–67 deg
      const spd = (2 + Math.random() * 3) * speed;
      shootingStarsRef.current.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * (window.innerHeight * 0.5),
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        length: 80 + Math.random() * 120,
        opacity: 1,
        life: 1,
      });
    };

    // --- animation loop --------------------------------------------------
    let prevTime = performance.now();

    const draw = (now: number) => {
      const dt = Math.min(now - prevTime, 50); // cap at 50 ms to handle tab-hide
      prevTime = now;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw stars
      for (const star of starsRef.current) {
        star.twinklePhase += star.twinkleSpeed * speed * (dt / 16);
        const twinkle = 0.7 + 0.3 * Math.sin(star.twinklePhase);
        const alpha = star.opacity * twinkle;

        // Depth-based horizontal drift
        const layerIdx = star.z < 0.33 ? 0 : star.z < 0.66 ? 1 : 2;
        star.x += LAYER_SPEEDS[layerIdx] * speed * (dt / 16);
        if (star.x > canvas.width + 2) star.x = -2;

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.fill();
      }

      // Spawn shooting stars
      if (now - lastShootingRef.current > SHOOTING_STAR_INTERVAL_MS / speed) {
        lastShootingRef.current = now;
        spawnShootingStar();
      }

      // Draw & advance shooting stars
      shootingStarsRef.current = shootingStarsRef.current.filter((ss) => ss.life > 0);
      for (const ss of shootingStarsRef.current) {
        ss.life -= 0.012 * speed * (dt / 16);
        ss.x += ss.vx * (dt / 16);
        ss.y += ss.vy * (dt / 16);
        ss.opacity = ss.life;

        const grad = ctx.createLinearGradient(
          ss.x,
          ss.y,
          ss.x - ss.vx * (ss.length / Math.hypot(ss.vx, ss.vy)),
          ss.y - ss.vy * (ss.length / Math.hypot(ss.vx, ss.vy))
        );
        grad.addColorStop(0, `rgba(255, 255, 255, ${ss.opacity})`);
        grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.beginPath();
        ctx.moveTo(ss.x, ss.y);
        ctx.lineTo(
          ss.x - ss.vx * (ss.length / Math.hypot(ss.vx, ss.vy)),
          ss.y - ss.vy * (ss.length / Math.hypot(ss.vx, ss.vy))
        );
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, [speed, density]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
}

/*
 * Usage example:
 *
 * import Starfield from '@/components/ambient/Starfield';
 *
 * // Full-speed, full-density (OT / Raimi theme)
 * <Starfield />
 *
 * // Slower, sparser stars (Prequel theme)
 * <Starfield speed={0.4} density={0.5} />
 *
 * // Minimal, cold (Sequel theme)
 * <Starfield speed={0.2} density={0.3} />
 */
