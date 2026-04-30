import { getWebRTCSignals } from './modules/network-client';
import { getHardwareSignals, getCanvasFingerprint, getWebGLFingerprint } from './modules/rendering';
import { getAutomationSignals } from './modules/automation';
import { getFontSignals } from './modules/fonts';
import { getLocaleSignals, getAudioFingerprint } from './modules/audio-locale';
import { runConsistencyChecks } from './consistency';
import { computeRiskScores } from '../platform-profiles';
import UAParser from 'ua-parser-js';

export async function runFullScan() {
  const startTime = Date.now();
  
  // 1. IP Detection (Server-side fetch)
  const ipResponse = await fetch('/api/scan/ip');
  const networkServer = await ipResponse.json();

  // 2. Client-side modules
  const [
    webrtc,
    hardware,
    canvas,
    webgl,
    automation,
    fonts,
    locale,
    audio
  ] = await Promise.all([
    getWebRTCSignals(),
    getHardwareSignals(),
    getCanvasFingerprint(),
    getWebGLFingerprint(),
    getAutomationSignals(),
    getFontSignals(),
    getLocaleSignals(),
    getAudioFingerprint()
  ]);

  // 3. User Agent Parsing
  const parser = new UAParser();
  const uaResults = parser.getResult();

  // 4. Combine Signals
  const signals: any = {
    client: {
      user_agent: navigator.userAgent,
      user_agent_parsed: uaResults,
      client_hints: (navigator as any).userAgentData || {}
    },
    network: {
      ...networkServer,
      webrtc_local_ips: (webrtc as any).local_ips,
      webrtc_public_ips: (webrtc as any).public_ips,
      webrtc_leaked: (webrtc as any).public_ips?.length > 0 && (webrtc as any).public_ips[0] !== networkServer.public_ip
    },
    hardware,
    rendering: {
      canvas_hash: canvas.hash,
      webgl,
      fonts
    },
    audio,
    locale,
    automation_detection: automation,
    scan_meta: {
      timestamp: new Date().toISOString(),
      duration_ms: Date.now() - startTime
    }
  };

  // 5. Run Consistency Checks
  const consistency = runConsistencyChecks(signals);
  signals.consistency_checks = consistency;

  // 6. Compute Risk Scores
  signals.risk_scores = computeRiskScores(signals, consistency);

  return signals;
}
