import { NextResponse } from 'next/server';
import { saveReport, cleanupOldReports } from '@/lib/store';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { data, type } = body;
    
    if (!data || !['scan', 'compare'].includes(type)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
    
    // Attempt cleanup of old files asynchronously
    setTimeout(() => cleanupOldReports(), 0);
    
    const id = saveReport(data, type);
    
    return NextResponse.json({ id });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to share report' }, { status: 500 });
  }
}
