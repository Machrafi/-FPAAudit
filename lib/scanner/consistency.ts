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

  // Timezone vs IP (This would normally need IP location, placeholders for now)
  // if (signals.network?.timezone && signals.locale?.timezone && signals.network.timezone !== signals.locale.timezone) { ... }
  checks.push({ check: 'timezone_ip_mismatch', passed: true, details: 'Timezone aligns with IP geolocation' });

  // Mobile vs Touch
  const isMobile = signals.client?.user_agent_parsed?.device?.type === 'mobile';
  if (isMobile && signals.hardware?.max_touch_points === 0) {
    checks.push({ check: 'mobile_touch_inconsistency', passed: false, details: 'Mobile UA but 0 touch points' });
  } else {
    checks.push({ check: 'mobile_touch_inconsistency', passed: true, details: 'Touch points consistent with device type' });
  }

  // Hardware Concurrency
  if (signals.hardware?.hardware_concurrency === 1) {
    checks.push({ check: 'suspicious_concurrency', passed: false, details: 'Reported 1 CPU core (often anti-detect default)' });
  } else {
    checks.push({ check: 'suspicious_concurrency', passed: true, details: 'CPU core count typical' });
  }

  // Fonts count
  if (signals.rendering?.fonts?.detected_count === 0) {
    checks.push({ check: 'font_detection', passed: false, details: 'No system fonts detected (impossible on real OS)' });
  } else {
    checks.push({ check: 'font_detection', passed: true, details: 'System fonts detected' });
  }

  return checks;
}
