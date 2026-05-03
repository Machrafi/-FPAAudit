'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Share2, Clock, Terminal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import ReactMarkdown from 'react-markdown';

export default function ReportViewPage() {
  const params = useParams();
  const id = params.id as string;
  
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/report/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Report not found or expired');
        return res.json();
      })
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return <div className="min-h-screen text-cyan-500 font-mono p-8 flex items-center justify-center">Loading Report Sequence...</div>;
  }

  if (error || !data) {
    return <div className="min-h-screen font-mono p-8 text-red-500 flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold mb-2">ACCESS DENIED / EXPIRED</h1>
      <p>{error}</p>
    </div>;
  }

  const rawUrl = typeof window !== 'undefined' ? `${window.location.origin}/api/report/${id}` : '';
  
  const markdownReport = `
# FingerprintAudit Scan Report
**ID:** ${id}

Access Raw JSON: [${rawUrl}](${rawUrl})

\`\`\`json
${JSON.stringify(data, null, 2)}
\`\`\`
  `;

  return (
    <div className="min-h-screen font-mono selection:bg-cyan-500/30 selection:text-cyan-200 p-8 pb-32">
      <div className="max-w-6xl mx-auto space-y-6">
        
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-800 pb-6 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Terminal className="w-6 h-6 text-cyan-500" />
              <h1 className="text-3xl font-bold tracking-tighter text-white uppercase">Shared Intelligence Report</h1>
            </div>
            <p className="text-zinc-400 text-sm flex items-center gap-2">
              <Clock className="w-4 h-4" /> This report will self-destruct 1 hour after creation.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-xs text-zinc-500 uppercase">Share this URL with AI Agents (Gemini, ChatGPT)</span>
            <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-3 py-2 rounded-lg">
               <Share2 className="w-4 h-4 text-cyan-500" />
               <a href={rawUrl} target="_blank" className="text-xs text-cyan-400 truncate max-wxs md:max-w-md hover:underline">{rawUrl}</a>
            </div>
          </div>
        </header>

        <Card className="bg-zinc-950 border-zinc-800 shadow-2xl p-6 overflow-auto border-t-4 border-t-cyan-500 text-zinc-300 relative">
          <div className="markdown-body prose prose-invert prose-cyan max-w-none prose-pre:bg-zinc-900 prose-pre:border prose-pre:border-zinc-800">
             <ReactMarkdown>{markdownReport}</ReactMarkdown>
          </div>
        </Card>
      </div>
    </div>
  );
}
