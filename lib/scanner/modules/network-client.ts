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

export async function getTLSSignals() {
  try {
    const response = await fetch('https://tls.peet.ws/api/all');
    if (!response.ok) throw new Error('TLS fetch failed');
    const data = await response.json();
    
    // Extract ALPN / Supported HTTP
    const alpnExt = data.tls?.extensions?.find((e: any) => e.name?.includes('application_layer_protocol_negotiation'));
    const supported_http = alpnExt?.protocols || [];
    
    // Extract TLS Versions Supported
    const versionsExt = data.tls?.extensions?.find((e: any) => e.name?.includes('supported_versions'));
    const supported_tls = versionsExt?.versions || [];
    
    // Extract Curves
    const groupsExt = data.tls?.extensions?.find((e: any) => e.name?.includes('supported_groups'));
    const supported_groups = groupsExt?.supported_groups || [];

    // Map Used TLS Version string
    let used_tls = data.tls?.tls_version_negotiated || data.tls?.version || null;

    return {
      ja3: data.tls?.ja3 || data.ja3 || null,
      ja3_hash: data.tls?.ja3_hash || data.ja3_hash || null,
      ja4: data.tls?.ja4 || data.ja4 || null,
      peetprint_hash: data.tls?.peetprint_hash || null,
      http_version: data.http_version || null,
      http2_akamai_fingerprint: data.http2?.akamai_fingerprint || null,
      http2_akamai_hash: data.http2?.akamai_fingerprint_hash || null,
      http2_framesCount: data.http2?.frames?.length || null,
      used_tls: used_tls,
      supported_http: supported_http,
      supported_tls: supported_tls,
      ip_ttl: data.tcpip?.ip?.ttl || null,
      tls_ciphers: data.tls?.ciphers || [],
      tls_extensions: data.tls?.extensions?.map((e: any) => e.name) || [],
      tls_curves: supported_groups,
        // legacy compat
      http2: !!data.http2 || data.http_version?.includes('2'),
      http3: false,
      alpn: supported_http.join(', ') || null
    };
  } catch (e) {
    return {
      ja3: null,
      ja3_hash: null,
      ja4: null,
      peetprint_hash: null,
      http_version: null,
      http2_akamai_fingerprint: null,
      http2_akamai_hash: null,
      http2_framesCount: null,
      used_tls: null,
      supported_http: [],
      supported_tls: [],
      ip_ttl: null,
      tls_ciphers: [],
      tls_extensions: [],
      tls_curves: [],
      http2: false,
      http3: false,
      alpn: null
    };
  }
}

function isPrivateIP(ip: string) {
  return /^(10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|127\.)/.test(ip);
}
