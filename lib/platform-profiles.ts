export interface PlatformProfile {
  name: string;
  weights: Record<string, number>;
}

export const PLATFORM_PROFILES: Record<string, PlatformProfile> = {
  amazon_appstore: {
    name: "Amazon Appstore",
    weights: {
      "ip_type_datacenter": 1.0,
      "ip_type_vpn": 0.8,
      "webrtc_leak_real_ip": 1.0,
      "navigator_webdriver": 1.0,
      "headless_chrome": 0.95,
      "automation_globals": 0.95,
      "font_detection_suspicious": 0.4,
      "timezone_ip_mismatch": 0.7,
      "device_memory_suspicious": 0.5,
      "ua_platform_inconsistency": 0.6,
      "hardware_concurrency_suspicious": 0.4,
      "network_api_blocked": 0.3
    }
  },
  google_play: {
    name: "Google Play",
    weights: {
      "ip_type_datacenter": 1.0,
      "webrtc_leak_real_ip": 1.0,
      "navigator_webdriver": 1.0,
      "headless_chrome": 0.95,
      "automation_globals": 0.9,
      "device_memory_suspicious": 0.5,
      "font_detection_suspicious": 0.4,
      "hardware_concurrency_suspicious": 0.4,
      "timezone_ip_mismatch": 0.7,
      "network_api_blocked": 0.3,
      "ua_platform_inconsistency": 0.6
    }
  },
  paypal: {
    name: "PayPal",
    weights: {
      "ip_type_vpn": 0.9,
      "ip_type_datacenter": 0.8,
      "webrtc_leak_real_ip": 1.0,
      "navigator_webdriver": 1.0,
      "headless_chrome": 1.0,
      "timezone_ip_mismatch": 0.7,
      "device_memory_suspicious": 0.5,
      "hardware_concurrency_suspicious": 0.4,
      "font_detection_suspicious": 0.4,
      "ua_platform_inconsistency": 0.6,
      "network_api_blocked": 0.4
    }
  },
  stripe: {
    name: "Stripe",
    weights: {
      "ip_type_datacenter": 0.8,
      "webrtc_leak_real_ip": 1.0,
      "navigator_webdriver": 1.0,
      "headless_chrome": 0.9,
      "timezone_ip_mismatch": 0.7,
      "device_memory_suspicious": 0.5,
      "font_detection_suspicious": 0.4,
      "hardware_concurrency_suspicious": 0.4,
      "network_api_blocked": 0.3,
      "ua_platform_inconsistency": 0.6
    }
  },
  facebook_ads: {
    name: "Facebook Ads",
    weights: {
      "ip_type_datacenter": 1.0,
      "ip_type_vpn": 0.9,
      "webrtc_leak_real_ip": 1.0,
      "headless_chrome": 0.95,
      "navigator_webdriver": 1.0,
      "automation_globals": 0.95,
      "device_memory_suspicious": 0.5,
      "font_detection_suspicious": 0.4,
      "timezone_ip_mismatch": 0.7,
      "ua_platform_inconsistency": 0.6,
      "hardware_concurrency_suspicious": 0.4,
      "network_api_blocked": 0.3
    }
  },
  google_ads: {
    name: "Google Ads",
    weights: {
      "ip_type_datacenter": 1.0,
      "webrtc_leak_real_ip": 1.0,
      "headless_chrome": 0.95,
      "navigator_webdriver": 1.0,
      "automation_globals": 0.95,
      "device_memory_suspicious": 0.5,
      "font_detection_suspicious": 0.4,
      "hardware_concurrency_suspicious": 0.4,
      "timezone_ip_mismatch": 0.7,
      "ua_platform_inconsistency": 0.6,
      "network_api_blocked": 0.4
    }
  }
};

export function computeRiskScores(signals: any, consistency: any[]) {
  const scores: Record<string, any> = {};

  const activeRisks: Record<string, boolean> = {
    ip_type_datacenter: signals.network?.is_datacenter,
    ip_type_vpn: signals.network?.is_vpn_exit,
    webrtc_leak_real_ip: signals.network?.webrtc_leaked,
    navigator_webdriver: signals.automation_detection?.navigator_webdriver,
    headless_chrome: signals.automation_detection?.headless_chrome_indicators?.length > 0,
    automation_globals: signals.automation_detection?.automation_globals_detected?.length > 0,
    ua_platform_inconsistency: consistency.some(c => c.check === 'ua_platform_mismatch' && !c.passed),
    timezone_ip_mismatch: consistency.some(c => c.check === 'timezone_ip_mismatch' && !c.passed),
    device_memory_suspicious: consistency.some(c => c.check === 'suspicious_memory' && !c.passed),
    hardware_concurrency_suspicious: consistency.some(c => c.check === 'suspicious_concurrency' && !c.passed),
    font_detection_suspicious: consistency.some(c => c.check === 'font_detection' && !c.passed),
    network_api_blocked: consistency.some(c => c.check === 'network_api_blocked' && !c.passed),
    screen_resolution_suspicious: signals.hardware?.screen?.width === 800 || signals.hardware?.screen?.width === 1024,
    canvas_fingerprint_match: false, // Placeholder for v1 as we don't have global DB match yet
    webgl_fingerprint_match: false,
    audio_fingerprint_match: false,
    font_list_match: false
  };

  Object.entries(PLATFORM_PROFILES).forEach(([key, profile]) => {
    let rawScore = 0;
    let totalPossible = 0;
    const topRisks: string[] = [];

    Object.entries(profile.weights).forEach(([signalKey, weight]) => {
      totalPossible += weight;
      if (activeRisks[signalKey]) {
        rawScore += weight;
        topRisks.push(signalKey.replace(/_/g, ' '));
      }
    });

    let normalized = (totalPossible > 0) ? Math.round((rawScore / totalPossible) * 100) : 0;
    
    // Critical Overrides
    if (activeRisks.webrtc_leak_real_ip || activeRisks.navigator_webdriver) {
      normalized = Math.max(normalized, 100);
    } else if (activeRisks.headless_chrome || activeRisks.automation_globals) {
      normalized = Math.max(normalized, 85); // High risk minimum
    }

    let level = 'Low';
    if (normalized > 80) level = 'Critical';
    else if (normalized > 50) level = 'High';
    else if (normalized > 25) level = 'Medium';

    scores[key] = {
      score: normalized,
      level,
      top_risks: topRisks.slice(0, 3)
    };
  });

  return scores;
}
