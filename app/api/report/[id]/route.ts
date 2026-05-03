import { NextResponse } from 'next/server';
import { getReport } from '@/lib/store';

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  const { id } = params;
  
  if (!id || typeof id !== 'string') {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  }
  
  const report = getReport(id);
  
  if (!report) {
    return NextResponse.json({ error: 'Report not found or expired' }, { status: 404 });
  }
  
  return NextResponse.json(report.data, {
    headers: {
      'Cache-Control': 'no-store, max-age=0'
    }
  });
}
