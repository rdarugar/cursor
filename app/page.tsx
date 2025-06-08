"use client";

import Link from "next/link";
import styles from './styles.module.css';
import { instrumentSans, bebasNeue } from './fonts';

export default function Home() {
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
      <div className={styles.pingPong}>
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
