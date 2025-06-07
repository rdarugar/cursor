"use client";

import Link from "next/link";
import styles from './styles.module.css';
import { instrumentSans, bebasNeue } from './fonts';
import { useEffect, useRef } from 'react';

export default function Home() {
  const bubbleRef = useRef<HTMLDivElement>(null);
  const trackerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bubble = bubbleRef.current;
    const tracker = trackerRef.current;
    
    if (!bubble || !tracker) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = bubble.getBoundingClientRect();
      const bubbleCenterX = rect.left + rect.width / 2;
      const bubbleCenterY = rect.top + rect.height / 2;
      
      const deltaX = e.clientX - bubbleCenterX;
      const deltaY = e.clientY - bubbleCenterY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      
      // Only react when cursor is within 200px of the bubble center
      if (distance < 200) {
        const angle = Math.atan2(deltaY, deltaX);
        const push = (200 - distance) / 200; // Stronger effect when closer
        
        const moveX = Math.cos(angle) * 20 * push;
        const moveY = Math.sin(angle) * 20 * push;
        
        bubble.style.transform = `translate(${-moveX}px, ${-moveY}px) scale(${1 + push * 0.15})`;
      } else {
        bubble.style.transform = '';
      }
    };

    tracker.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      tracker.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Add your prototypes to this array
  const prototypes = [
    {
      title: 'Getting started',
      description: 'A comprehensive guide to creating your first prototype, with step-by-step instructions and best practices.',
      path: '/prototypes/example'
    },
    {
      title: 'Confetti button',
      description: 'An interactive component exploring micro-interactions and animation principles through a delightful confetti effect.',
      path: '/prototypes/confetti-button'
    },
    // Add your new prototypes here like this:
    // {
    //   title: 'Your new prototype',
    //   description: 'A short description of what this prototype does',
    //   path: '/prototypes/my-new-prototype'
    // },
  ];

  return (
    <div className={`${styles.container} ${instrumentSans.className}`}>
      <div ref={trackerRef} className={styles.cursorTracker}></div>
      <div ref={bubbleRef} className={styles.pingPong}>
        <div className={styles.waterEffect}></div>
      </div>
      <header className={styles.header}>
        <div className={styles.heroWrapper}>
          <div className={styles.heroContent}>
            <h1 className={`${styles.hero} ${bebasNeue.className}`}>
              <span className={styles.heroFirst}>Rabab's</span>
              <span className={styles.heroSecond}>Universe</span>
            </h1>
          </div>

          <main className={styles.main}>
            <div className={styles.grid}>
              {/* Goes through the prototypes list (array) to create cards */}
              {prototypes.map((prototype, index) => (
                <Link 
                  key={index}
                  href={prototype.path} 
                  className={styles.link}
                >
                  <article className={styles.panel}>
                    <h2 className={styles.heading}>{prototype.title}</h2>
                    <p className={styles.text}>{prototype.description}</p>
                  </article>
                </Link>
              ))}
            </div>
          </main>
        </div>
      </header>
    </div>
  );
}
