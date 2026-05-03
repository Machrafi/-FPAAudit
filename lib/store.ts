import fs from 'fs';
import path from 'path';
import { nanoid } from 'nanoid';

const REPORT_DIR = '/tmp/fingerprint-reports';

// Ensure directory exists
if (!fs.existsSync(REPORT_DIR)) {
  fs.mkdirSync(REPORT_DIR, { recursive: true });
}

interface StoredReport {
  timestamp: number;
  data: any;
  type: 'scan' | 'compare';
}

export function saveReport(data: any, type: 'scan' | 'compare'): string {
  const id = nanoid(10);
  const report: StoredReport = {
    timestamp: Date.now(),
    data,
    type
  };
  
  fs.writeFileSync(path.join(REPORT_DIR, `${id}.json`), JSON.stringify(report, null, 2), 'utf8');
  
  return id;
}

export function getReport(id: string): StoredReport | null {
  const filePath = path.join(REPORT_DIR, `${id}.json`);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const report: StoredReport = JSON.parse(content);
    
    // Check if older than 1 hour (3600000 ms)
    if (Date.now() - report.timestamp > 3600000) {
      fs.unlinkSync(filePath); // delete it
      return null;
    }
    
    return report;
  } catch (e) {
    return null;
  }
}

// Cleanup job to remove old files periodically (could be called on intervals)
export function cleanupOldReports() {
  if (!fs.existsSync(REPORT_DIR)) return;
  
  const files = fs.readdirSync(REPORT_DIR);
  const now = Date.now();
  
  for (const file of files) {
    if (!file.endsWith('.json')) continue;
    const filePath = path.join(REPORT_DIR, file);
    try {
      const stat = fs.statSync(filePath);
      if (now - stat.mtimeMs > 3600000) {
        fs.unlinkSync(filePath);
      }
    } catch(e) {}
  }
}
