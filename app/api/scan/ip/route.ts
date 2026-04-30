import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    
    // x-forwarded-for can be a comma-separated list; we want the first external IP
    const clientIp = forwardedFor ? forwardedFor.split(',')[0].trim() : (realIp || '');

    // Determine target URL for ipapi
    // If running locally, we might get IPv6 localhost or 127.0.0.1, fallback to global lookup
    let url = 'https://ipapi.co/json/';
    if (clientIp && clientIp !== '::1' && clientIp !== '127.0.0.1') {
      url = `https://ipapi.co/${clientIp}/json/`;
    }

    const response = await fetch(url, {
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
