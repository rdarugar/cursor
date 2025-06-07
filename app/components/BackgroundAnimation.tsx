'use client';

import { useEffect, useRef } from 'react';
import styles from './BackgroundAnimation.module.css';

export default function BackgroundAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d', {
      alpha: true,
      willReadFrequently: true
    });
    if (!context) return;

    // Set canvas size
    const setCanvasSize = () => {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    // Sun parameters
    let sunParams = {
      x: window.innerWidth * 0.7,
      y: window.innerHeight * 0.5,
      radius: Math.min(window.innerWidth, window.innerHeight) * 0.3,
      rotation: 0,
      speed: 0.002,
      rays: 12,
      rayLength: Math.min(window.innerWidth, window.innerHeight) * 0.4
    };

    // Corona parameters
    const coronaLayers = 3;
    const coronaPoints = 100;
    const coronaRadius = sunParams.radius * 1.5;
    const coronaNoiseScale = 0.03;
    let noiseOffset = 0;

    function drawSun(ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number, time: number) {
      // Clear canvas with fade effect
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // Update rotation
      sunParams.rotation += sunParams.speed;
      noiseOffset += 0.005;

      // Draw corona layers
      for (let layer = 0; layer < coronaLayers; layer++) {
        const layerOpacity = 0.05 - (layer * 0.01);
        ctx.beginPath();
        for (let i = 0; i < coronaPoints; i++) {
          const angle = (i / coronaPoints) * Math.PI * 2;
          const noise = Math.sin(angle * 5 + noiseOffset + layer) * 0.2;
          const radius = coronaRadius * (1 + noise) * (1 + layer * 0.3);
          const x = sunParams.x + Math.cos(angle + sunParams.rotation) * radius;
          const y = sunParams.y + Math.sin(angle + sunParams.rotation) * radius;
          
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.closePath();
        
        // Create gradient for corona
        const gradient = ctx.createRadialGradient(
          sunParams.x, sunParams.y, sunParams.radius,
          sunParams.x, sunParams.y, coronaRadius * (1 + layer * 0.3)
        );
        gradient.addColorStop(0, `hsla(45, 100%, 60%, ${layerOpacity})`);
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.fill();
      }

      // Draw sun core
      const coreGradient = ctx.createRadialGradient(
        sunParams.x, sunParams.y, 0,
        sunParams.x, sunParams.y, sunParams.radius
      );
      coreGradient.addColorStop(0, 'hsla(45, 100%, 70%, 0.3)');
      coreGradient.addColorStop(0.5, 'hsla(35, 100%, 60%, 0.2)');
      coreGradient.addColorStop(1, 'hsla(30, 100%, 50%, 0.1)');

      ctx.beginPath();
      ctx.arc(sunParams.x, sunParams.y, sunParams.radius, 0, Math.PI * 2);
      ctx.fillStyle = coreGradient;
      ctx.fill();

      // Draw rotating rays
      for (let i = 0; i < sunParams.rays; i++) {
        const angle = (i / sunParams.rays) * Math.PI * 2 + sunParams.rotation;
        const rayGradient = ctx.createLinearGradient(
          sunParams.x + Math.cos(angle) * sunParams.radius,
          sunParams.y + Math.sin(angle) * sunParams.radius,
          sunParams.x + Math.cos(angle) * sunParams.rayLength,
          sunParams.y + Math.sin(angle) * sunParams.rayLength
        );
        rayGradient.addColorStop(0, 'hsla(45, 100%, 60%, 0.2)');
        rayGradient.addColorStop(1, 'transparent');

        ctx.beginPath();
        ctx.moveTo(
          sunParams.x + Math.cos(angle) * sunParams.radius,
          sunParams.y + Math.sin(angle) * sunParams.radius
        );
        ctx.lineTo(
          sunParams.x + Math.cos(angle) * sunParams.rayLength,
          sunParams.y + Math.sin(angle) * sunParams.rayLength
        );
        ctx.strokeStyle = rayGradient;
        ctx.lineWidth = 50;
        ctx.stroke();
      }
    }

    // Animation loop
    let animationFrameId: number;
    let lastTime = 0;

    function animate(currentTime: number) {
      if (!canvas || !context) return;

      // Update sun position on resize
      sunParams = {
        ...sunParams,
        x: window.innerWidth * 0.7,
        y: window.innerHeight * 0.5,
        radius: Math.min(window.innerWidth, window.innerHeight) * 0.3,
        rayLength: Math.min(window.innerWidth, window.innerHeight) * 0.4
      };
      
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;

      drawSun(context, canvas.width, canvas.height, currentTime);
      animationFrameId = requestAnimationFrame(animate);
    }

    animate(0);

    return () => {
      window.removeEventListener('resize', setCanvasSize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className={styles.canvas} />;
} 