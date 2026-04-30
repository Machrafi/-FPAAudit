const FONT_LIST = [
  'Arial', 'Helvetica', 'Times New Roman', 'Courier New', 'Georgia', 'Verdana', 'Impact',
  'Comic Sans MS', 'Trebuchet MS', 'Arial Black', 'Palatino', 'Consolas', 'Monaco',
  'Segoe UI', 'Roboto', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Open Sans',
  'Calibri', 'Candara', 'Optima', 'Cambria', 'Garamond', 'Perpetua', 'Didot', 'Futura',
  'Baskerville', 'Copperplate', 'American Typewriter', 'Andale Mono', 'Papyrus', 'Skia',
  'Herculanum', 'Zapfino', 'Trattatello', 'Luminari', 'Chalkduster', 'Bradley Hand'
];

export async function getFontSignals() {
  if (typeof window === 'undefined') return { detected_count: 0, detected_list: [], fingerprint_hash: '' };

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return { detected_count: 0, detected_list: [], fingerprint_hash: 'blocked' };

  const testString = "mmmmmmmmmlli";
  const fontSize = "72px";
  const baselines = ['monospace', 'sans-serif', 'serif'];
  
  const getWidth = (fontFamily: string) => {
    ctx.font = `${fontSize} ${fontFamily}`;
    return ctx.measureText(testString).width;
  };

  const detected: string[] = [];
  const baselineWidths: Record<string, number> = {};

  baselines.forEach(base => {
    baselineWidths[base] = getWidth(base);
  });

  FONT_LIST.forEach(font => {
    let isDetected = false;
    for (const base of baselines) {
      if (getWidth(`'${font}', ${base}`) !== baselineWidths[base]) {
        isDetected = true;
        break;
      }
    }
    if (isDetected) detected.push(font);
  });

  const hash = await sha256(detected.sort().join(','));

  return {
    detected_count: detected.length,
    detected_list: detected,
    fingerprint_hash: hash
  };
}

async function sha256(message: string) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
