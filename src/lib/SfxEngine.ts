/* ── Phonics Flow — UI Sound Effects ──
   Procedural audio for swipe/success/error feedback.
   No external files needed. */

const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();

export const playSound = (type: 'swipe' | 'success' | 'error', combo = 0) => {
  const now = audioCtx.currentTime;

  if (type === 'swipe') {
    const bufferSize = audioCtx.sampleRate * 0.1;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const source = audioCtx.createBufferSource();
    source.buffer = buffer;
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2000, now);
    filter.Q.setValueAtTime(1, now);
    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.05, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.1);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);
    source.start();
  }

  if (type === 'success') {
    const baseFreq = 440 * Math.pow(1.05946, Math.min(combo, 12));
    const freqs = [baseFreq, baseFreq * 1.25, baseFreq * 1.5];
    freqs.forEach((freq) => {
      const osc = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.01, now + 0.5);
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(0.1, now + 0.05);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
      osc.connect(g);
      g.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.8);
    });
  }

  if (type === 'error') {
    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.linearRampToValueAtTime(110, now + 0.2);
    g.gain.setValueAtTime(0.2, now);
    g.gain.linearRampToValueAtTime(0, now + 0.2);
    osc.connect(g);
    g.connect(audioCtx.destination);
    osc.start();
    osc.stop(now + 0.2);
  }
};
