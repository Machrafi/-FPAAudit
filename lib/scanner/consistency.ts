export function runConsistencyChecks(signals: any) {
  const checks = [];

  // UA vs WebGL Renderer
  const uaOS = signals.client?.user_agent_parsed?.os?.name?.toLowerCase() || '';
  const webglRenderer = signals.rendering?.webgl?.renderer?.toLowerCase() || '';
  
  if (uaOS.includes('windows') && webglRenderer.includes('apple')) {
    checks.push({ check: 'ua_platform_mismatch', passed: false, details: 'UA says Windows but WebGL says Apple' });
  } else {
    checks.push({ check: 'ua_platform_mismatch', passed: true, details: 'UA and WebGL platform consistent' });
  }

  // Timezone vs IP
  const ipTimezone = signals.network?.timezone;
  const browserTimezone = signals.locale?.timezone;
  if (ipTimezone && browserTimezone && ipTimezone !== browserTimezone) {
    checks.push({ check: 'timezone_ip_mismatch', passed: false, details: `Browser TZ (${browserTimezone}) != IP TZ (${ipTimezone})` });
  } else {
    checks.push({ check: 'timezone_ip_mismatch', passed: true, details: 'Timezone aligns with IP geolocation' });
  }

  // Mobile vs Touch
  const isMobile = signals.client?.user_agent_parsed?.device?.type === 'mobile';
  if (isMobile && signals.hardware?.max_touch_points === 0) {
    checks.push({ check: 'mobile_touch_inconsistency', passed: false, details: 'Mobile UA but 0 touch points' });
  } else {
    checks.push({ check: 'mobile_touch_inconsistency', passed: true, details: 'Touch points consistent with device type' });
  }

  // Hardware Concurrency
  const cores = signals.hardware?.hardware_concurrency;
  if (cores === 1) {
    checks.push({ check: 'suspicious_concurrency', passed: false, details: 'Reported 1 CPU core (often anti-detect default)' });
  } else if (cores && cores % 2 !== 0) {
    checks.push({ check: 'suspicious_concurrency', passed: false, details: `Odd number of CPU cores (${cores}) is impossible on real hardware` });
  } else {
    checks.push({ check: 'suspicious_concurrency', passed: true, details: 'CPU core count typical' });
  }

  // Device Memory
  const mem = signals.hardware?.device_memory;
  const validMem = [0.25, 0.5, 1, 2, 4, 8, 16];
  if (!isMobile && mem < 2) {
    checks.push({ check: 'suspicious_memory', passed: false, details: `Desktop device with < 2GB RAM (${mem}GB) is highly suspicious` });
  } else if (mem && !validMem.includes(mem)) {
    checks.push({ check: 'suspicious_memory', passed: false, details: `Device memory (${mem}GB) is not a standard expected value` });
  } else {
    checks.push({ check: 'suspicious_memory', passed: true, details: 'Device memory appears normal' });
  }

  // Fonts count
  const fontCount = signals.rendering?.fonts?.detected_count;
  if (fontCount === 0) {
    checks.push({ check: 'font_detection', passed: false, details: 'No system fonts detected (impossible on real OS)' });
  } else if (!isMobile && fontCount && fontCount < 50) {
    checks.push({ check: 'font_detection', passed: false, details: `Only ${fontCount} fonts detected on desktop (suspicious)` });
  } else {
    checks.push({ check: 'font_detection', passed: true, details: 'System fonts detected' });
  }

  // Network info API missing
  if (signals.network?.connection_api === null) {
    checks.push({ check: 'network_api_blocked', passed: false, details: 'Network Information API is null (often blocked by privacy browsers like Brave)' });
  } else {
    checks.push({ check: 'network_api_blocked', passed: true, details: 'Network Information API available' });
  }

  return checks;
}
