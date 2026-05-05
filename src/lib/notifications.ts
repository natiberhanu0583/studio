'use client';

/**
 * Utility to play a "Classic Time Ringing" bell sound
 * Synthesized using Web Audio API for a high-fidelity "Classic" feel.
 */
export const playNotificationSound = (type: 'order' | 'ready' | 'paid') => {
  if (typeof window === 'undefined') return;

  const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  
  const playBell = (freq: number, duration: number, volume: number) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    // Classic bell has rich harmonics
    osc.type = 'triangle'; 
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    
    // Quick attack, long decay for "Ringing" effect
    gain.gain.setValueAtTime(0, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(volume, audioCtx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  };

  // Play a layered "Classic Clock Bell" (Ding-Dong style or Rich Ding)
  switch (type) {
    case 'order':
      // Deep "Grandfather Clock" Chime
      playBell(440, 2, 0.4); // A4
      setTimeout(() => playBell(349.23, 2.5, 0.3), 50); // F4 harmonic
      break;
    case 'ready':
      // Clear "Service Bell" Ding
      playBell(880, 1.5, 0.5); // A5
      playBell(1320, 1.2, 0.2); // E6 overtone
      break;
    case 'paid':
      // Classic Cash Bell
      playBell(1046.5, 1, 0.4); // C6
      setTimeout(() => playBell(1567.98, 0.8, 0.2), 30); // G6
      break;
  }
};
