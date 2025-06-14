"use client";

import { useState } from 'react';
import styles from './styles.module.css';
import { 
  Rubik_Bubbles,
  Nabla,
  Bungee_Shade,
  Bungee_Spice,
  Silkscreen,
  Righteous,
  Monoton,
  Rampart_One,
  Bungee_Outline,
  Rubik_Puddles,
  Rubik_Spray_Paint,
  Rubik_Burned,
  Dancing_Script,
  Great_Vibes,
  Pacifico,
  Sacramento
} from 'next/font/google';

// Initialize fonts
const rubikBubbles = Rubik_Bubbles({
  weight: '400',
  subsets: ['latin'],
});

const nabla = Nabla({
  weight: '400',
  subsets: ['latin'],
});

const bungeeShade = Bungee_Shade({
  weight: '400',
  subsets: ['latin'],
});

const bungeeSpice = Bungee_Spice({
  weight: '400',
  subsets: ['latin'],
});

const silkscreen = Silkscreen({
  weight: '400',
  subsets: ['latin'],
});

const righteous = Righteous({
  weight: '400',
  subsets: ['latin'],
});

const monoton = Monoton({
  weight: '400',
  subsets: ['latin'],
});

const rampartOne = Rampart_One({
  weight: '400',
  subsets: ['latin'],
});

const bungeeOutline = Bungee_Outline({
  weight: '400',
  subsets: ['latin'],
});

const rubikPuddles = Rubik_Puddles({
  weight: '400',
  subsets: ['latin'],
});

const rubikSprayPaint = Rubik_Spray_Paint({
  weight: '400',
  subsets: ['latin'],
});

const rubikBurned = Rubik_Burned({
  weight: '400',
  subsets: ['latin'],
});

const dancingScript = Dancing_Script({
  weight: '400',
  subsets: ['latin'],
});

const greatVibes = Great_Vibes({
  weight: '400',
  subsets: ['latin'],
});

const pacifico = Pacifico({
  weight: '400',
  subsets: ['latin'],
});

const sacramento = Sacramento({
  weight: '400',
  subsets: ['latin'],
});

const fonts = [
  { font: rubikBubbles, color: '#39FF14' },     // Electric lime
  { font: nabla, color: '#FF3366' },            // Bright raspberry
  { font: bungeeShade, color: '#00FFFF' },      // Cyan
  { font: bungeeSpice, color: '#FFD700' },      // Golden yellow
  { font: silkscreen, color: '#FF69B4' },       // Hot pink
  { font: righteous, color: '#4DEEEA' },        // Turquoise
  { font: monoton, color: '#74EE15' },          // Bright lime
  { font: rampartOne, color: '#FFB700' },       // Orange yellow
  { font: bungeeOutline, color: '#FC46AA' },    // Neon pink
  { font: rubikPuddles, color: '#01F9C6' },     // Mint
  { font: rubikSprayPaint, color: '#7CFF01' },  // Yellow green
  { font: rubikBurned, color: '#F162FF' },      // Electric purple
  { font: dancingScript, color: '#00E4FF' },    // Electric blue
  { font: greatVibes, color: '#FFF01F' },       // Bright yellow
  { font: pacifico, color: '#7FFF00' },         // Chartreuse
  { font: sacramento, color: '#FF1493' }        // Deep pink
];

const effects = [
  'bounceEffect',
  'threeDEffect',
  'wavyEffect',
  'magneticEffect',
  'neonEffect',
  'liquidEffect',
  'splitEffect',
  'handwritingEffect',
  'morphingEffect',
  'organicEffect'
] as const;

type Effect = typeof effects[number];

export default function TypographyExperiments() {
  const [text, setText] = useState('Type something magical');

  // Fisher-Yates shuffle algorithm
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
  };

  // Get unique fonts and effects for each word
  const words = text.split(' ').map((word, index) => {
    // Shuffle fonts and effects only once at the start of each sequence
    const fontSequenceIndex = Math.floor(index / fonts.length);
    const effectSequenceIndex = Math.floor(index / effects.length);
    
    // Get shuffled arrays for the current sequence
    const shuffledFonts = shuffleArray([...fonts]);
    const shuffledEffects = shuffleArray([...effects]);
    
    // Use the remainder to pick from the current shuffled sequence
    const fontIndex = index % fonts.length;
    const effectIndex = index % effects.length;
    
    return {
      text: word,
      style: shuffledFonts[fontIndex],
      effect: shuffledEffects[effectIndex]
    };
  });

  return (
    <div className={styles.container}>
      <main className={styles.mainContent}>
        <div className={styles.controlsWrapper}>
          <input
            type="text"
            value={text}
            onChange={handleTextChange}
            className={styles.textInput}
            placeholder="Type your text here..."
          />
          <p className={styles.hint}>Each word gets a unique font and effect!</p>
        </div>

        <div className={styles.displayArea}>
          <div className={styles.textDisplay}>
            {words.map((word, wordIndex) => (
              <span 
                key={`${word.text}-${wordIndex}`} 
                className={`${styles.wordWrapper} ${styles[word.effect]}`}
                style={{ 
                  color: word.style.color,
                  fontFamily: word.style.font.style.fontFamily
                }}
              >
                {word.text.split('').map((char, charIndex) => (
                  <span 
                    key={`${wordIndex}-${charIndex}`}
                    className={styles.textCharacter}
                    style={{ 
                      '--char-index': charIndex,
                      '--total-chars': word.text.length
                    } as React.CSSProperties}
                  >
                    {char}
                  </span>
                ))}
                {wordIndex < words.length - 1 && ' '}
              </span>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
} 