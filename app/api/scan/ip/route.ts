import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Using ipapi.co free endpoint which provides JSON
    // No API key required for the basic rate-limited endpoint
    const response = await fetch('https://ipapi.co/json/', {
      headers: {
        'User-Agent': 'FPA-Audit-Diagnostic-Tool/1.0',
      },
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      throw new Error('IP lookup service error');
    }

    const data = await response.json();

    return NextResponse.json({
      public_ip: data.ip,
      asn: data.asn,
      asn_org: data.org,
      country: data.country_name,
      region: data.region,
      city: data.city,
      timezone: data.timezone,
      is_proxy: false, // ipapi free doesn't give deep reputation
      is_datacenter: false,
      is_vpn_exit: false,
      is_tor: false,
      ip_reputation_score: 0,
      webrtc_local_ips: [],
      webrtc_public_ips: [],
      webrtc_leaked: false,
    });
  } catch (error) {
    console.error('IP Audit Error:', error);
    // Fallback if the external service fails or is blocked
    return NextResponse.json({
      public_ip: '0.0.0.0',
      asn: 'AS0',
      asn_org: 'UNKNOWN_ISP',
      country: 'PRIVATE',
      region: 'UNKNOWN',
      city: 'UNKNOWN',
      timezone: 'UTC',
      is_proxy: false,
      is_datacenter: false,
      is_vpn_exit: false,
      is_tor: false,
      ip_reputation_score: 0,
      webrtc_local_ips: [],
      webrtc_public_ips: [],
      webrtc_leaked: false,
    }, { status: 200 });
  }
}
