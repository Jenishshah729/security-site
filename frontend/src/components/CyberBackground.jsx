import React, { useRef, useEffect } from 'react';
import { useReducedMotion } from 'motion/react';

/**
 * Matrix Number Stream Canvas
 * Perfectly balanced gold matrix number rain (0s, 1s, hex codes).
 * Visible and clean without being too bright or too dull.
 */
const MatrixNumberRain = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    // Characters: Binary digits, hex codes, and cyber numbers
    const chars = '0101010101101001011101010100101110100010111010123456789ABCDEF0x7F40480801337256';
    const fontSize = 13;
    let columns = 0;
    let drops = [];
    let speeds = [];

    const initCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const width = window.innerWidth;
      const height = window.innerHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      columns = Math.floor(width / (fontSize + 14));
      drops = [];
      speeds = [];

      for (let i = 0; i < columns; i++) {
        drops[i] = Math.floor(Math.random() * -50);
        speeds[i] = 0.85 + Math.random() * 0.95; // Brisk, fast-flowing cyber rain
      }
    };

    initCanvas();
    window.addEventListener('resize', initCanvas);

    let lastTime = 0;
    const interval = 28; // Faster, high-frame-rate stream (~36 FPS)

    const render = (currentTime) => {
      animationFrameId = requestAnimationFrame(render);

      if (currentTime - lastTime < interval) return;
      lastTime = currentTime;

      const width = window.innerWidth;
      const height = window.innerHeight;

      // Soft fading trail
      ctx.fillStyle = 'rgba(6, 6, 8, 0.18)';
      ctx.fillRect(0, 0, width, height);

      ctx.font = `500 ${fontSize}px "JetBrains Mono", monospace`;

      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        const x = i * (fontSize + 14) + 6;
        const y = drops[i] * (fontSize + 8);

        // Perfectly tuned gold matrix brightness (crisp but not blinding)
        ctx.fillStyle = 'rgba(229, 193, 88, 0.28)';
        ctx.fillText(char, x, y);

        // Reset drop when past bottom
        if (y > height && Math.random() > 0.96) {
          drops[i] = 0;
          speeds[i] = 0.85 + Math.random() * 0.95;
        }

        drops[i] += speeds[i];
      }
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', initCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0"
      style={{
        opacity: 0.85,
        maskImage: 'radial-gradient(ellipse 92% 88% at 50% 50%, black 40%, transparent 95%)',
        WebkitMaskImage: 'radial-gradient(ellipse 92% 88% at 50% 50%, black 40%, transparent 95%)'
      }}
    />
  );
};

/**
 * Static Matrix Numbers Fallback for prefers-reduced-motion
 */
const StaticMatrixNumbers = () => {
  return (
    <div 
      className="absolute inset-0 pointer-events-none select-none z-0 opacity-16 font-mono text-xs text-[#E5C158] overflow-hidden flex flex-wrap gap-7 p-8 leading-loose"
      style={{
        maskImage: 'radial-gradient(circle at 50% 50%, black 25%, transparent 88%)',
        WebkitMaskImage: 'radial-gradient(circle at 50% 50%, black 25%, transparent 88%)'
      }}
    >
      {Array.from({ length: 90 }).map((_, idx) => (
        <span key={idx} className="tracking-widest opacity-45 font-normal">
          {(idx % 3 === 0) ? '01001101' : (idx % 3 === 1) ? `0x${(idx * 17).toString(16).toUpperCase()}` : '192.168.1.1'}
        </span>
      ))}
    </div>
  );
};

/**
 * Clean & Minimal Luxury Cyber Background (Balanced Matrix Theme)
 */
const CyberBackground = () => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <aside 
      className="fixed inset-0 overflow-hidden pointer-events-none select-none z-0 bg-[var(--bg-base)]"
      aria-hidden="true"
    >
      {/* 1. Deep Canvas Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f] via-[#060608] to-[#030304]" />

      {/* 2. Soft, Ambient Vignette Glows */}
      <div 
        className="absolute -top-[10%] left-1/2 -translate-x-1/2 w-[90vw] max-w-[900px] h-[450px] rounded-full opacity-18 blur-[130px] pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(229, 193, 88, 0.20) 0%, rgba(229, 193, 88, 0.03) 50%, transparent 75%)'
        }}
      />

      <div 
        className="absolute top-[30%] -left-[10%] w-[500px] h-[500px] rounded-full opacity-12 blur-[140px] pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(56, 189, 248, 0.10) 0%, transparent 70%)'
        }}
      />

      <div 
        className="absolute bottom-[10%] -right-[8%] w-[550px] h-[550px] rounded-full opacity-12 blur-[150px] pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(243, 186, 47, 0.12) 0%, transparent 75%)'
        }}
      />

      {/* 3. Balanced Visible Gold Matrix Number Rain */}
      {shouldReduceMotion ? <StaticMatrixNumbers /> : <MatrixNumberRain />}

      {/* 4. Subtle Micro Dot Matrix Pattern Grid */}
      <div 
        className="absolute inset-0 opacity-[0.11]"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(229, 193, 88, 0.28) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(ellipse 85% 70% at 50% 40%, black 20%, transparent 85%)',
          WebkitMaskImage: 'radial-gradient(ellipse 85% 70% at 50% 40%, black 20%, transparent 85%)'
        }}
      />
    </aside>
  );
};

export default CyberBackground;
