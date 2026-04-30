export async function getLocaleSignals() {
  if (typeof window === 'undefined') return {};

  const df = new Intl.DateTimeFormat();
  return {
    timezone: df.resolvedOptions().timeZone,
    timezone_offset_minutes: new Date().getTimezoneOffset(),
    languages: navigator.languages || [navigator.language],
    primary_language: navigator.language
  };
}

export async function getAudioFingerprint() {
  if (typeof window === 'undefined') return null;

  try {
    const AudioContext = (window.AudioContext || (window as any).webkitAudioContext);
    if (!AudioContext) return null;

    const context = new OfflineAudioContext(1, 5000, 44100);
    const oscillator = context.createOscillator();
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(10000, context.currentTime);

    const compressor = context.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(-50, context.currentTime);
    compressor.knee.setValueAtTime(40, context.currentTime);
    compressor.ratio.setValueAtTime(12, context.currentTime);
    compressor.attack.setValueAtTime(0, context.currentTime);
    compressor.release.setValueAtTime(0.25, context.currentTime);

    oscillator.connect(compressor);
    compressor.connect(context.destination);

    oscillator.start(0);
    const buffer = await context.startRendering();
    const data = buffer.getChannelData(0);
    
    let sum = 0;
    for (let i = 4500; i < 5000; i++) {
        sum += Math.abs(data[i]);
    }

    const hash = await sha256(sum.toString());
    
    // Voices
    let voiceHash = '';
    let voiceCount = 0;
    if (window.speechSynthesis) {
        const voices = window.speechSynthesis.getVoices();
        voiceCount = voices.length;
        voiceHash = await sha256(voices.map(v => v.name).sort().join(','));
    }

    return {
      context_fingerprint: hash,
      speech_voices_count: voiceCount,
      speech_voices_hash: voiceHash
    };
  } catch (e) {
    return null;
  }
}

async function sha256(message: string) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
