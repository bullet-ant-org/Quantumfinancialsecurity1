import React, { useRef, useEffect } from 'react';
import './MatrixRain.css';

// Canvas-based "digital rain" effect, contained within its parent box.
// `active` controls whether the animation runs; `density` tunes column count.
const MatrixRain = ({ active = true, className = '' }) => {
  const canvasRef = useRef(null);
  const frameRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const chars = '01アイウエオカキクケコサシスセソ$#@%&+ABCDEFGHJKLMNPQRSTUVXYZ'.split('');
    const fontSize = 14;
    let columns = 0;
    let drops = [];

    const resize = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      columns = Math.floor(canvas.width / fontSize);
      drops = new Array(columns).fill(0).map(() => Math.random() * -50);
    };

    resize();
    window.addEventListener('resize', resize);

    if (prefersReducedMotion || !active) {
      ctx.fillStyle = 'rgba(6, 14, 12, 1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      return () => window.removeEventListener('resize', resize);
    }

    const draw = () => {
      ctx.fillStyle = 'rgba(4, 10, 9, 0.18)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        const isHead = Math.random() > 0.94;
        ctx.fillStyle = isHead ? '#c9fff0' : 'rgba(0, 225, 160, 0.85)';
        ctx.fillText(text, x, y);

        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }

      frameRef.current = requestAnimationFrame(draw);
    };

    frameRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resize);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [active]);

  return (
    <div className={`matrix-rain ${className}`}>
      <canvas ref={canvasRef} />
    </div>
  );
};

export default MatrixRain;
