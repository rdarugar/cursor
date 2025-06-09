"use client";

// Modern template for creating a new prototype
// To use this template:
// 1. Create a new folder in app/prototypes with your prototype name
// 2. Copy this file and styles.module.css into your new folder
// 3. Create an 'images' folder for your prototype's images
// 4. Rename and customize the component and styles as needed

import Link from 'next/link';
import styles from './styles.module.css';
import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { instrumentSans, bebasNeue } from '../../fonts';
import { KEY_TO_NOTE, NOTES } from './constants';

type OscillatorType = 'sine' | 'square' | 'sawtooth' | 'triangle';

type PianoState = {
  audioContext: AudioContext | null;
  activeNotes: Set<string>;
  pressedKeys: Set<string>;
  oscillatorType: OscillatorType;
};

type PianoAction = 
  | { type: 'INIT_AUDIO'; context: AudioContext }
  | { type: 'SET_OSCILLATOR_TYPE'; oscillatorType: OscillatorType }
  | { type: 'ADD_ACTIVE_NOTE'; note: string }
  | { type: 'REMOVE_ACTIVE_NOTE'; note: string }
  | { type: 'ADD_PRESSED_KEY'; key: string }
  | { type: 'REMOVE_PRESSED_KEY'; key: string };

function pianoReducer(state: PianoState, action: PianoAction): PianoState {
  switch (action.type) {
    case 'INIT_AUDIO':
      return { ...state, audioContext: action.context };
    case 'SET_OSCILLATOR_TYPE':
      return { ...state, oscillatorType: action.oscillatorType };
    case 'ADD_ACTIVE_NOTE':
      return { ...state, activeNotes: new Set([...state.activeNotes, action.note]) };
    case 'REMOVE_ACTIVE_NOTE':
      const newActiveNotes = new Set(state.activeNotes);
      newActiveNotes.delete(action.note);
      return { ...state, activeNotes: newActiveNotes };
    case 'ADD_PRESSED_KEY':
      return { ...state, pressedKeys: new Set([...state.pressedKeys, action.key]) };
    case 'REMOVE_PRESSED_KEY':
      const newPressedKeys = new Set(state.pressedKeys);
      newPressedKeys.delete(action.key);
      return { ...state, pressedKeys: newPressedKeys };
    default:
      return state;
  }
}

export default function Page() {
  const [state, dispatch] = useReducer(pianoReducer, {
    audioContext: null,
    activeNotes: new Set<string>(),
    pressedKeys: new Set<string>(),
    oscillatorType: 'sine' as OscillatorType
  });

  const activeOscillators = useRef<Record<string, { 
    oscillator: OscillatorNode; 
    gainNode: GainNode;
    cleanupTimeout?: number;
  }>>({});
  const analyserRef = useRef<AnalyserNode | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();

  // Cleanup function for a note
  const cleanupNote = useCallback((note: string) => {
    const activeNote = activeOscillators.current[note];
    if (activeNote) {
      if (activeNote.cleanupTimeout) {
        window.clearTimeout(activeNote.cleanupTimeout);
      }
      try {
        activeNote.oscillator.stop();
        activeNote.oscillator.disconnect();
        activeNote.gainNode.disconnect();
      } catch (error) {
        console.error('Error cleaning up note:', error);
      }
      delete activeOscillators.current[note];
      dispatch({ type: 'REMOVE_ACTIVE_NOTE', note });
    }
  }, [dispatch]);

  // Initialize audio context and master gain node
  useEffect(() => {
    const initAudioOnInteraction = () => {
      if (!state.audioContext) {
        const ctx = new AudioContext();
        const masterGain = ctx.createGain();
        masterGain.gain.value = 0.5;
        masterGain.connect(ctx.destination);
        
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 512;
        analyser.connect(masterGain);
        
        analyserRef.current = analyser;
        masterGainRef.current = masterGain;
        dispatch({ type: 'INIT_AUDIO', context: ctx });
      }
    };

    window.addEventListener('click', initAudioOnInteraction);
    window.addEventListener('keydown', initAudioOnInteraction);

    return () => {
      window.removeEventListener('click', initAudioOnInteraction);
      window.removeEventListener('keydown', initAudioOnInteraction);
    };
  }, [state.audioContext]);

  const playNote = useCallback(async (note: keyof typeof NOTES) => {
    if (!state.audioContext || !masterGainRef.current || !analyserRef.current) {
      console.error('Audio context not initialized');
      return;
    }

    // Ensure audio context is running
    if (state.audioContext.state === 'suspended') {
      await state.audioContext.resume();
    }

    // Clean up any existing note immediately
    cleanupNote(note);

    // Calculate per-note gain based on number of active notes
    const activeNotesCount = Object.keys(activeOscillators.current).length + 1;
    const baseGain = 0.3;
    const perNoteGain = baseGain / Math.pow(activeNotesCount, 0.5);

    try {
      const oscillator = state.audioContext.createOscillator();
      const gainNode = state.audioContext.createGain();

      oscillator.type = state.oscillatorType;
      oscillator.frequency.setValueAtTime(NOTES[note], state.audioContext.currentTime);

      // Apply attack envelope
      gainNode.gain.setValueAtTime(0, state.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(
        perNoteGain,
        state.audioContext.currentTime + 0.015 // Faster attack for better responsiveness
      );

      oscillator.connect(gainNode);
      gainNode.connect(analyserRef.current);

      oscillator.start(state.audioContext.currentTime);

      activeOscillators.current[note] = { oscillator, gainNode };
      dispatch({ type: 'ADD_ACTIVE_NOTE', note });

      // Adjust gain for all active notes
      Object.values(activeOscillators.current).forEach(({ gainNode }) => {
        gainNode.gain.linearRampToValueAtTime(perNoteGain, state.audioContext.currentTime + 0.015);
      });
    } catch (error) {
      console.error('Error playing note:', error);
      cleanupNote(note);
    }
  }, [state.audioContext, state.oscillatorType, dispatch, cleanupNote]);

  const stopNote = useCallback((note: keyof typeof NOTES) => {
    const activeNote = activeOscillators.current[note];
    if (activeNote && state.audioContext) {
      const { oscillator, gainNode } = activeNote;

      try {
        // Clear any existing cleanup timeout
        if (activeNote.cleanupTimeout) {
          window.clearTimeout(activeNote.cleanupTimeout);
        }

        // Apply release envelope
        gainNode.gain.setValueAtTime(gainNode.gain.value, state.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0, state.audioContext.currentTime + 0.05);

        // Schedule cleanup
        activeNote.cleanupTimeout = window.setTimeout(() => {
          cleanupNote(note);
          
          // Recalculate gains for remaining notes
          const remainingNotes = Object.keys(activeOscillators.current).length;
          if (remainingNotes > 0) {
            const newGain = 0.3 / Math.pow(remainingNotes, 0.5);
            Object.values(activeOscillators.current).forEach(({ gainNode }) => {
              gainNode.gain.linearRampToValueAtTime(newGain, state.audioContext!.currentTime + 0.015);
            });
          }
        }, 60) as unknown as number; // Shorter cleanup time for better responsiveness
      } catch (error) {
        console.error('Error stopping note:', error);
        cleanupNote(note);
      }
    }
  }, [state.audioContext, cleanupNote]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const key = event.key.toLowerCase();
    if (KEY_TO_NOTE[key as keyof typeof KEY_TO_NOTE] && !state.pressedKeys.has(key)) {
      dispatch({ type: 'ADD_PRESSED_KEY', key });
      const note = KEY_TO_NOTE[key as keyof typeof KEY_TO_NOTE];
      playNote(note).catch(error => {
        console.error('Error playing note:', error);
      });
    }
  }, [dispatch, state.pressedKeys, playNote]);

  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    const key = event.key.toLowerCase();
    if (KEY_TO_NOTE[key as keyof typeof KEY_TO_NOTE]) {
      dispatch({ type: 'REMOVE_PRESSED_KEY', key });
      const note = KEY_TO_NOTE[key as keyof typeof KEY_TO_NOTE];
      stopNote(note);
    }
  }, [dispatch, stopNote]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  // Waveform visualization
  useEffect(() => {
    if (!state.audioContext || !analyserRef.current || !canvasRef.current) return;

    const drawWaveform = () => {
      const analyser = analyserRef.current;
      const canvas = canvasRef.current;
      if (!analyser || !canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyser.getByteTimeDomainData(dataArray);

      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.lineWidth = 3;
      ctx.strokeStyle = '#c6ff00';
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#c6ff00';
      ctx.beginPath();

      const sliceWidth = canvas.width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = canvas.height / 2 + (v - 1) * (canvas.height / 2);

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();

      animationFrameRef.current = requestAnimationFrame(drawWaveform);
    };

    drawWaveform();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [state.audioContext]);

  const handleMouseLeave = useCallback((note: string) => {
    if (activeOscillators.current[note]) {
      stopNote(note as keyof typeof NOTES);
    }
  }, [stopNote]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      Object.keys(activeOscillators.current).forEach(cleanupNote);
    };
  }, [cleanupNote]);

  return (
    <div className={`${styles.container} ${instrumentSans.className}`}>
      <div className={styles.pingPong}>
        <div className={styles.waterEffect}></div>
      </div>
      
      <h1 className={`${styles.title} ${bebasNeue.className}`}>Digikeys</h1>
      
      <div className={styles.controlPanel}>
        <div className={styles.control}>
          <label htmlFor="oscillator-type">Oscillator Type:</label>
          <select 
            id="oscillator-type"
            value={state.oscillatorType}
            onChange={(e) => dispatch({ type: 'SET_OSCILLATOR_TYPE', oscillatorType: e.target.value as OscillatorType })}
            className={styles.select}
          >
            <option value="sine">Sine</option>
            <option value="square">Square</option>
            <option value="sawtooth">Sawtooth</option>
            <option value="triangle">Triangle</option>
          </select>
        </div>
      </div>

      <div className={styles.visualizer}>
        <canvas 
          ref={canvasRef}
          className={styles.waveform}
          width={800}
          height={200}
        />
      </div>

      <div className={styles.piano}>
        {Object.keys(NOTES).map((note) => {
          const keyboardKey = Object.entries(KEY_TO_NOTE).find(([_, n]) => n === note)?.[0];
          return (
            <button
              key={note}
              className={`${styles.key} ${note.includes('#') ? styles.black : styles.white} ${state.activeNotes.has(note) ? styles.active : ''}`}
              onMouseDown={() => playNote(note as keyof typeof NOTES)}
              onMouseUp={() => stopNote(note as keyof typeof NOTES)}
              onMouseLeave={() => handleMouseLeave(note)}
            >
              <span className={styles.noteName}>{note}</span>
              {keyboardKey && <span className={styles.keyboardKey}>{keyboardKey.toUpperCase()}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}