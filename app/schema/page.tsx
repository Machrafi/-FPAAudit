import Link from "next/link";
import { Terminal, ChevronLeft } from "lucide-react";

export default function SchemaPage() {
  const schemaExample = {
    "schema_version": "1.0",
    "scan": {
      "session_id": "fpa_x92kM1sP",
      "timestamp": "2026-04-29T20:34:09Z",
      "scan_duration_ms": 4231
    },
    "network": {
      "public_ip": "34.120.54.211",
      "is_datacenter": true,
      "webrtc_leaked": false
    },
    "hardware": {
      "platform": "Win32",
      "hardware_concurrency": 16,
      "device_memory": 8
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300 font-sans technical-grid">
      <div className="max-w-4xl mx-auto py-20 px-6">
        <Link href="/" className="inline-flex items-center text-xs font-bold text-zinc-500 hover:text-cyan-400 uppercase tracking-widest transition-colors mb-12">
          <ChevronLeft className="w-4 h-4 mr-1" /> Return to Mainframe
        </Link>

        <header className="mb-16">
          <div className="technical-label mb-2">Technical Documentation</div>
          <h1 className="text-5xl font-bold text-white tracking-tighter uppercase mb-4">Export Schema v1.0</h1>
          <p className="text-zinc-500 text-lg leading-relaxed">
            FingerprintAudit exports diagnostic reports in a standardized JSON format designed for programmatic analysis and session correlation.
          </p>
        </header>

        <section className="space-y-12">
          <div>
             <h2 className="text-xl font-bold text-white mb-6 uppercase tracking-widest flex items-center gap-2">
               <Terminal className="w-5 h-5 text-cyan-400" /> JSON Response Template
             </h2>
             <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 overflow-hidden">
                <pre className="font-mono text-xs text-white overflow-x-auto">
                   {JSON.stringify(schemaExample, null, 2)}
                </pre>
             </div>
          </div>

          <div className="space-y-6">
             <h2 className="text-xl font-bold text-white uppercase tracking-widest border-b border-zinc-800 pb-4">Data Definitions</h2>
             <div className="grid gap-6">
                {[
                  { field: "scan.session_id", type: "string", desc: "Unique 12-char identifier (fpa_xxxx)." },
                  { field: "network.is_datacenter", type: "boolean", desc: "True if origin ASN belongs to a known cloud provider." },
                  { field: "hardware.platform", type: "string", desc: "Reported navigator.platform string." },
                  { field: "automation_detection", type: "object", desc: "Contains individual markers for Puppeteer, Playwright, and Selenium." }
                ].map((row, i) => (
                  <div key={i} className="flex flex-col md:flex-row md:items-center justify-between border-b border-zinc-900 pb-4 gap-2">
                    <span className="font-mono text-cyan-400 text-sm font-bold">{row.field}</span>
                    <div className="flex gap-4 items-center">
                       <span className="text-[10px] bg-zinc-800 px-2 py-0.5 rounded font-bold uppercase text-zinc-400">{row.type}</span>
                       <span className="text-xs text-zinc-500">{row.desc}</span>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </section>
      </div>
    </div>
  );
}
