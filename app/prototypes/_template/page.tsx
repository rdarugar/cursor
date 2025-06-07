"use client";

// Modern template for creating a new prototype
// To use this template:
// 1. Create a new folder in app/prototypes with your prototype name
// 2. Copy this file and styles.module.css into your new folder
// 3. Create an 'images' folder for your prototype's images
// 4. Rename and customize the component and styles as needed

import Link from 'next/link';
import styles from './styles.module.css';
import { useEffect, useState } from 'react';

export default function PrototypeTemplate() {
  const [raindrops, setRaindrops] = useState<Array<{ id: number; left: number; duration: number }>>([]);

  useEffect(() => {
    // Create initial raindrops
    const initialDrops = Array.from({ length: 100 }, (_, index) => ({
      id: index,
      left: Math.random() * 100, // Random horizontal position
      duration: Math.random() * 1 + 0.5, // Random duration between 0.5 and 1.5 seconds
    }));
    setRaindrops(initialDrops);

    // Animate raindrops
    const interval = setInterval(() => {
      setRaindrops(prev => prev.map(drop => ({
        ...drop,
        left: Math.random() * 100,
        duration: Math.random() * 1 + 0.5,
      })));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.container}>
      {/* Rain effect */}
      <div className={styles.rain}>
        {raindrops.map(drop => (
          <div
            key={drop.id}
            className={styles.drop}
            style={{
              left: `${drop.left}%`,
              animation: `${styles.fall} ${drop.duration}s linear infinite`,
            }}
          />
        ))}
      </div>

      <main className={styles.main}>
        <h1 className={styles.title}>Modern Prototype</h1>
        
        <div className={styles.panel}>
          <h2 className={styles.heading}>Welcome to Your Prototype</h2>
          <p className={styles.text}>
            This is a modern design template featuring clean aesthetics, smooth interactions, 
            and thoughtful spacing. Start building your prototype with these contemporary UI elements.
          </p>
          <button className={styles.button}>Get Started</button>
        </div>

        <div className={styles.panel}>
          <h2 className={styles.heading}>Modern Design Features</h2>
          <ul className={styles.list}>
            <li className={styles.listItem}>Clean and minimal interface</li>
            <li className={styles.listItem}>Subtle animations and transitions</li>
            <li className={styles.listItem}>Modern color gradients</li>
            <li className={styles.listItem}>Thoughtful typography and spacing</li>
          </ul>
        </div>
      </main>
    </div>
  );
} 