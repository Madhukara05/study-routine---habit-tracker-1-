export type BreakSoundType = 'zen' | 'chime' | 'digital' | 'cyber' | 'none';

export interface SoundConfig {
  id: BreakSoundType;
  name: string;
  description: string;
}

export const SOUND_PRESETS: SoundConfig[] = [
  { id: 'zen', name: 'Zen Bowl Chime', description: 'Deep, resonant, peaceful metallic resonance' },
  { id: 'chime', name: 'Bubble Harp Chime', description: 'Staggered bright ascending major tones' },
  { id: 'digital', name: 'Digital Trio Beep', description: 'Triple electronic synthesize beep alert' },
  { id: 'cyber', name: 'Cyber Alert Siren', description: 'Alternating modulated futuristic security frequency' },
  { id: 'none', name: 'Mute alerts', description: 'Visually flashing only' },
];

export function playSynthesizedSound(type: BreakSoundType) {
  if (type === 'none') return;

  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContextClass) {
    console.warn('AudioContext not supported by browser.');
    return;
  }

  try {
    const ctx = new AudioContextClass();
    const dest = ctx.destination;

    if (type === 'zen') {
      // Warm, deep resonant bell
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(196.00, ctx.currentTime); // G3

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(293.66, ctx.currentTime); // D4 (perfect fifth)

      gainNode.gain.setValueAtTime(0.5, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 3.0); // Slow decay

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(dest);

      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 3.0);
      osc2.stop(ctx.currentTime + 3.0);
    } else if (type === 'chime') {
      // Bright, happy bubbling notes (ascending arpeggio C major)
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      const duration = 0.15;

      notes.forEach((freq, index) => {
        const timeOffset = ctx.currentTime + index * 0.12;
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, timeOffset);

        gainNode.gain.setValueAtTime(0, timeOffset);
        gainNode.gain.linearRampToValueAtTime(0.3, timeOffset + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.001, timeOffset + duration);

        osc.connect(gainNode);
        gainNode.connect(dest);

        osc.start(timeOffset);
        osc.stop(timeOffset + duration);
      });
    } else if (type === 'digital') {
      // Classic three beep alarm
      const duration = 0.08;
      const freq = 880; // A5

      [0, 0.15, 0.3].forEach((startDelay) => {
        const timeOffset = ctx.currentTime + startDelay;
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, timeOffset);

        gainNode.gain.setValueAtTime(0, timeOffset);
        gainNode.gain.linearRampToValueAtTime(0.2, timeOffset + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, timeOffset + duration);

        osc.connect(gainNode);
        gainNode.connect(dest);

        osc.start(timeOffset);
        osc.stop(timeOffset + duration);
      });
    } else if (type === 'cyber') {
      // Alternating pitch alarm
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      
      // Modulate frequency with an LFO or discrete jumps
      osc.frequency.linearRampToValueAtTime(880, ctx.currentTime + 0.2);
      osc.frequency.linearRampToValueAtTime(440, ctx.currentTime + 0.4);
      osc.frequency.linearRampToValueAtTime(880, ctx.currentTime + 0.6);
      osc.frequency.linearRampToValueAtTime(440, ctx.currentTime + 0.8);

      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.0);

      osc.connect(gainNode);
      gainNode.connect(dest);

      osc.start();
      osc.stop(ctx.currentTime + 1.0);
    }
  } catch (err) {
    console.error('Error playing synthesized sound:', err);
  }
}
