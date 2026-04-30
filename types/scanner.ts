export interface RTCIceCandidate {
  candidate: string;
  sdpMid: string | null;
  sdpMLineIndex: number | null;
  usernameFragment: string | null;
}

export interface NetworkSignals {
  public_ip: string;
  asn: string;
  asn_org: string;
  country: string;
  region: string;
  city: string;
  timezone: string;
  is_proxy: boolean;
  is_datacenter: boolean;
  is_vpn_exit: boolean;
  is_tor: boolean;
  ip_reputation_score: number;
  webrtc_local_ips: string[];
  webrtc_public_ips: string[];
  webrtc_leaked: boolean;
}
