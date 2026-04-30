import { RTCIceCandidate } from '@/types/scanner';

export async function getWebRTCSignals() {
  const signals = {
    local_ips: [] as string[],
    public_ips: [] as string[],
    leaked: false,
    supported: false
  };

  if (typeof window === 'undefined') return signals;

  try {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });
    signals.supported = true;

    return new Promise((resolve) => {
      pc.createDataChannel('');
      pc.createOffer().then(offer => pc.setLocalDescription(offer));

      pc.onicecandidate = (event) => {
        if (!event.candidate) {
          pc.close();
          resolve(signals);
          return;
        }

        const candidate = event.candidate.candidate;
        const ipRegex = /([0-9]{1,3}(\.[0-9]{1,3}){3}|([a-f0-9]{1,4}(:[a-f0-9]{1,4}){7}))/g;
        const match = candidate.match(ipRegex);

        if (match) {
          const ip = match[0];
          if (isPrivateIP(ip)) {
            if (!signals.local_ips.includes(ip)) signals.local_ips.push(ip);
          } else {
            if (!signals.public_ips.includes(ip)) signals.public_ips.push(ip);
          }
        }
      };

      // Timeout fallback
      setTimeout(() => {
        pc.close();
        resolve(signals);
      }, 3000);
    });
  } catch (e) {
    return signals;
  }
}

function isPrivateIP(ip: string) {
  return /^(10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|127\.)/.test(ip);
}
