export async function getDeepClientSignals() {
  // 1. Permissions API state (Query only)
  const permissionsState: Record<string, string> = {};
  const queryPerms = ['geolocation', 'notifications', 'camera', 'microphone', 'clipboard-read', 'midi'];
  
  if (navigator.permissions && navigator.permissions.query) {
    for (const p of queryPerms) {
      try {
        const res = await navigator.permissions.query({ name: p as any });
        permissionsState[p] = res.state;
      } catch (e) {
        permissionsState[p] = 'unsupported';
      }
    }
  }

  // 2. Storage & Persistence
  let localStorageWorks = false;
  try {
    localStorage.setItem('fpa_test', '1');
    localStorage.removeItem('fpa_test');
    localStorageWorks = true;
  } catch (e) {}

  let indexedDBWorks = false;
  try {
    indexedDBWorks = !!window.indexedDB;
  } catch (e) {}

  // 3. Network Information API
  let connectionInfo = null;
  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
  if (connection) {
    connectionInfo = {
      effectiveType: connection.effectiveType,
      rtt: connection.rtt,
      downlink: connection.downlink,
      saveData: connection.saveData
    };
  }

  // 4. Plugins & MIME Types
  const pluginsInfo = [];
  if (navigator.plugins) {
    for (let i = 0; i < navigator.plugins.length; i++) {
        pluginsInfo.push({ name: navigator.plugins[i].name, filename: navigator.plugins[i].filename });
    }
  }

  const mimeTypesInfo = [];
  if (navigator.mimeTypes) {
    for (let i = 0; i < navigator.mimeTypes.length; i++) {
        mimeTypesInfo.push({ type: navigator.mimeTypes[i].type });
    }
  }

  // 5. Math precision fingerprint (hashing floating point operations)
  const mathSum = Math.tan(-1e300) + Math.cos(1e300) + Math.acos(1.000001);
  const mathFingerprint = mathSum.toString(); // simplistic hash idea

  // 6. Codec Fingerprint
  const videoCodecs = ['video/mp4; codecs="avc1.42E01E"', 'video/webm; codecs="vp8"', 'video/webm; codecs="vp9"'];
  const audioCodecs = ['audio/mpeg', 'audio/ogg; codecs="vorbis"', 'audio/wav; codecs="1"'];
  const supportedVideo = [];
  const supportedAudio = [];
  
  if (window.MediaSource && MediaSource.isTypeSupported) {
    for (const c of videoCodecs) {
      if (MediaSource.isTypeSupported(c)) supportedVideo.push(c);
    }
  }
  
  const audioTest = document.createElement('audio');
  for (const c of audioCodecs) {
    if (audioTest.canPlayType && audioTest.canPlayType(c) !== '') {
      supportedAudio.push(c);
    }
  }

  // 7. WebGPU Info
  let webgpuInfo = null;
  if ((navigator as any).gpu) {
    try {
      const adapter = await (navigator as any).gpu.requestAdapter();
      if (adapter) {
        // adapter.info may contain vendor, architecture, device, description
        webgpuInfo = {
           vendor: adapter.info?.vendor || 'unknown',
           architecture: adapter.info?.architecture || 'unknown',
           device: adapter.info?.device || 'unknown',
           description: adapter.info?.description || 'unknown'
        };
      } else {
        webgpuInfo = 'adapter_null';
      }
    } catch(e) {
      webgpuInfo = 'unsupported_or_blocked';
    }
  } else {
    webgpuInfo = 'not_available';
  }

  // 8. CSS Media Queries Fingerprint
  const mediaQueries = [
    '(prefers-color-scheme: dark)',
    '(prefers-color-scheme: light)',
    '(prefers-reduced-motion: reduce)',
    '(color-gamut: p3)',
    '(color-gamut: srgb)',
    '(color-gamut: rec2020)',
    '(any-hover: hover)',
    '(any-pointer: fine)',
    '(forced-colors: active)'
  ];
  const matchedMedia = [];
  if (typeof window !== 'undefined' && window.matchMedia) {
    for (const q of mediaQueries) {
      if (window.matchMedia(q).matches) {
        matchedMedia.push(q);
      }
    }
  }

  // 9. Behavioral Signals (Mouse Jitter / Entropy)
  // Normally captured via event listeners taking seconds, here we return a mock or initial 0
  // Real implementation would accumulate events on window.addEventListener('mousemove')
  const behavioral = {
    mouse_entropy: Math.random() * 100, // mock placeholder
    typing_cadence: 'unmeasured',
    scroll_natural: true
  };

  return {
    permissionsState,
    storage: {
      localStorageWorks,
      indexedDBWorks,
      cookiesEnabled: navigator.cookieEnabled
    },
    networkInformationAPI: connectionInfo,
    plugins: {
      count: pluginsInfo.length,
      details: pluginsInfo
    },
    mimeTypes: {
      count: mimeTypesInfo.length,
      details: mimeTypesInfo
    },
    mathFingerprint,
    codecs: {
      video: supportedVideo,
      audio: supportedAudio
    },
    webgpu: webgpuInfo,
    css_media_queries: matchedMedia,
    behavioral
  };
}

export async function runDeepScanPermissions() {
    // This function explicitly asks for permissions 
    // And uses advanced features that prompt the user.
    const results: any = {};
    
    // 1. Geolocation
    results.geolocation = await new Promise((resolve) => {
        if (!navigator.geolocation) { resolve('unsupported'); return; }
        navigator.geolocation.getCurrentPosition(
            (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy }),
            (err) => resolve(`error: ${err.message}`),
            { timeout: 5000 }
        );
    });

    // 2. Media Devices (Camera/Mic)
    results.mediaDevices = await new Promise(async (resolve) => {
        try {
            await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
            const devices = await navigator.mediaDevices.enumerateDevices();
            resolve(devices.map(d => ({ kind: d.kind, label: d.label, deviceId: d.deviceId })));
        } catch (e: any) {
            resolve(`error: ${e.message}`);
        }
    });

    // 3. Storage Estimate
    if (navigator.storage && navigator.storage.estimate) {
        try {
            const estimate = await navigator.storage.estimate();
            results.storageEstimate = {
                quota_gb: (estimate.quota || 0) / (1024 * 1024 * 1024),
                usage_mb: (estimate.usage || 0) / (1024 * 1024)
            };
        } catch (e) {}
    }

    // 4. Battery
    if ((navigator as any).getBattery) {
        try {
            const battery = await (navigator as any).getBattery();
            results.battery = {
                level: battery.level,
                charging: battery.charging,
                chargingTime: battery.chargingTime
            };
        } catch (e) {}
    }
    
    return results;
}
