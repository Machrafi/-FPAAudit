export async function getHardwareSignals() {
  if (typeof window === 'undefined') return {};

  const n = navigator as any;
  const s = screen;

  return {
    platform: n.platform,
    hardware_concurrency: n.hardwareConcurrency,
    device_memory: n.deviceMemory, // in GB
    max_touch_points: n.maxTouchPoints,
    screen: {
      width: s.width,
      height: s.height,
      availWidth: s.availWidth,
      availHeight: s.availHeight,
      colorDepth: s.colorDepth,
      pixelDepth: s.pixelDepth,
      devicePixelRatio: window.devicePixelRatio
    },
    battery: await getBatteryStatus(),
    connection: n.connection ? {
      downlink: n.connection.downlink,
      rtt: n.connection.rtt,
      effectiveType: n.connection.effectiveType
    } : null
  };
}

async function getBatteryStatus() {
  const n = navigator as any;
  if (!n.getBattery) return null;
  try {
    const battery = await n.getBattery();
    return {
      level: battery.level,
      charging: battery.charging
    };
  } catch {
    return null;
  }
}

export async function getCanvasFingerprint() {
  if (typeof window === 'undefined') return { hash: '', data: '' };

  try {
    const canvas = document.createElement('canvas');
    canvas.width = 280;
    canvas.height = 60;
    const ctx = canvas.getContext('2d');
    if (!ctx) return { hash: 'blocked', data: '' };

    ctx.textBaseline = "top";
    ctx.font = "14px 'Arial'";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = "#f60";
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = "#069";
    ctx.fillText("FingerprintAudit 🔍", 2, 15);
    ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
    ctx.fillText("FingerprintAudit 🔍", 4, 17);

    const dataURL = canvas.toDataURL();
    const hash = await sha256(dataURL);
    return { hash, data: dataURL.slice(0, 100) };
  } catch (e) {
    return { hash: 'error', data: '' };
  }
}

export async function getWebGLFingerprint() {
  if (typeof window === 'undefined') return null;

  try {
    const canvas = document.createElement('canvas');
    const gl = (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')) as WebGLRenderingContext;
    if (!gl) return null;

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    const vendor = debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : 'unknown';
    const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : 'unknown';
    
    const extensions = gl.getSupportedExtensions() || [];
    const params: Record<string, any> = {
      vendor,
      renderer,
      version: gl.getParameter(gl.VERSION),
      shading_language_version: gl.getParameter(gl.SHADING_LANGUAGE_VERSION),
      max_texture_size: gl.getParameter(gl.MAX_TEXTURE_SIZE),
      max_viewport_dims: gl.getParameter(gl.MAX_VIEWPORT_DIMS),
      aliased_line_width_range: gl.getParameter(gl.ALIASED_LINE_WIDTH_RANGE)
    };

    const hash = await sha256(JSON.stringify(params) + extensions.join(','));

    return {
      ...params,
      extensions_count: extensions.length,
      fingerprint_hash: hash
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
