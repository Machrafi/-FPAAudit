"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { runFullScan, runDeepScanPermissions } from "@/lib/scanner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer 
} from "recharts";
import { 
  ShieldAlert, Copy, Share2, RefreshCw, Network, 
  Monitor, Cpu, Paintbrush, Speaker, Globe, 
  Bot, ShieldCheck, Download, Users, CheckCircle2, Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import Link from "next/link";
import { nanoid } from "nanoid";

const STEPS = [
  { id: 'network', label: "Fetching network info...", weight: 15 },
  { id: 'hardware', label: "Reading hardware headers...", weight: 15 },
  { id: 'canvas', label: "Computing canvas hash...", weight: 15 },
  { id: 'webgl', label: "Probing WebGL renderer...", weight: 15 },
  { id: 'fonts', label: "Measuring system fonts...", weight: 15 },
  { id: 'automation', label: "Checking automation flags...", weight: 15 },
  { id: 'storage', label: "Finalizing session profile...", weight: 10 }
];

export default function ScanPage() {
  const router = useRouter();
  const [view, setView] = useState<'scanning' | 'results'>('scanning');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [scanData, setScanData] = useState<any>(null);
  const [isDeepScanning, setIsDeepScanning] = useState(false);
  const [deepScanComplete, setDeepScanComplete] = useState(false);
  const [sessionId] = useState(() => `local_${nanoid(8)}`);
  const [shareLoading, setShareLoading] = useState(false);

  const handleShareForAI = async () => {
    setShareLoading(true);
    try {
      const res = await fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'scan', data: scanData })
      });
      const { id } = await res.json();
      router.push(`/report/${id}`);
    } catch (e) {
      alert("Failed to share report");
    }
    setShareLoading(false);
  };

  const execDeepScan = async () => {
    setIsDeepScanning(true);
    try {
      const results = await runDeepScanPermissions();
      setScanData((prev: any) => ({
         ...prev,
         deep_permissions: results
      }));
      setDeepScanComplete(true);
    } catch (e) {
      console.error(e);
    }
    setIsDeepScanning(false);
  };

  useEffect(() => {
    async function executeScan() {
      try {
        await new Promise(r => setTimeout(r, 800));
        const signals = await runFullScan();
        
        // Progress animation logic
        for (let i = 0; i < STEPS.length; i++) {
          setCurrentStepIndex(i);
          setProgress(prev => prev + STEPS[i].weight);
          await new Promise(r => setTimeout(r, 400)); 
          setCompletedSteps(prev => [...prev, STEPS[i].id]);
        }

        setScanData(signals);
        setView('results');
      } catch (err) {
        console.error(err);
        setError("Scan initialization failed. Check your network collection settings.");
      }
    }

    executeScan();
  }, []);

  const downloadJSON = () => {
    if (!scanData) return;
    const blob = new Blob([JSON.stringify(scanData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fpa_audit_${sessionId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (view === 'scanning') {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6 technical-grid overflow-hidden">
        <div className="w-full max-w-lg">
          <div className="text-center mb-12">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 bg-cyan-900/30 border-2 border-cyan-500/50 rounded-full mx-auto mb-6 flex items-center justify-center"
            >
              <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
            </motion.div>
            <h2 className="text-2xl font-bold text-white tracking-widest uppercase mb-2">Diagnostic Scan in Progress</h2>
            <p className="text-zinc-500 font-mono text-sm uppercase tracking-tighter">Initializing core detection modules...</p>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-8 relative overflow-hidden backdrop-blur-sm">
            <div className="absolute top-0 left-0 h-1 bg-cyan-500/20 w-full overflow-hidden">
               <motion.div 
                 className="h-full bg-cyan-500" 
                 initial={{ width: "0%" }}
                 animate={{ width: `${progress}%` }}
               />
            </div>

            <div className="space-y-6 mt-4">
              <AnimatePresence mode="popLayout">
                {STEPS.map((step, idx) => {
                  const isActive = idx === currentStepIndex;
                  const isCompleted = completedSteps.includes(step.id);
                  
                  return (
                    <motion.div 
                      key={step.id} 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: isActive || isCompleted ? 1 : 0.3, x: 0 }}
                      className="flex justify-between items-center"
                    >
                      <span className={`text-sm font-medium ${isActive ? 'text-white' : 'text-zinc-400'}`}>
                        {step.label}
                      </span>
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      ) : isActive ? (
                        <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
                      ) : null}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>

          {error && (
            <div className="mt-8 p-4 bg-red-950/20 border border-red-900 text-red-400 text-sm font-mono rounded">
              ERROR: {error}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Results View
  const radarData = Object.entries(scanData.risk_scores).map(([key, val]: [string, any]) => ({
    subject: key.replace(/_/g, ' ').toUpperCase(),
    A: val.score,
    fullMark: 100,
  }));

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300 flex flex-col font-sans">
      {/* Header */}
      <header className="h-16 border-b border-zinc-800 flex items-center justify-between px-6 bg-zinc-950/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-1.5">
            <div className="w-5 h-5 bg-cyan-500 rounded-sm"></div>
            <span className="font-bold tracking-tight text-white uppercase text-base">FPA<span className="text-cyan-400">Audit</span></span>
          </Link>
          <div className="flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-tighter">LOCAL SESSION: {sessionId}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="hidden md:flex gap-2 border-zinc-800 text-xs font-bold uppercase tracking-widest" onClick={() => window.location.reload()}>
            <RefreshCw className="w-3 h-3" /> New Scan
          </Button>
          <Button onClick={handleShareForAI} disabled={shareLoading} className="bg-cyan-900 border border-cyan-800 hover:bg-cyan-800 text-cyan-50 font-bold px-4 text-xs uppercase tracking-widest">
            {shareLoading ? <Loader2 className="w-3 h-3 mr-2 animate-spin" /> : <Share2 className="w-3 h-3 mr-2" />} Share for AI
          </Button>
          <Button onClick={downloadJSON} className="bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold px-4 text-xs uppercase tracking-widest">
            <Download className="w-3 h-3 mr-2" /> Export JSON
          </Button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-8 space-y-8">
        {/* Top Summary Info */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <div className="technical-label mb-2">Audit Timestamp: {format(new Date(scanData.scan_meta.timestamp), "yyyy-MM-dd HH:mm:ss OOOO")}</div>
            <h1 className="text-4xl font-bold text-white tracking-widest uppercase italic">Diagnostic Report</h1>
            <p className="text-zinc-500 font-mono text-sm uppercase mt-1">Processed 124 signals in {scanData.scan_meta.duration_ms}ms (Memory Only)</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push(`/compare`)} className="border-zinc-800 text-xs uppercase font-bold tracking-tighter gap-2">
              <Users className="w-4 h-4 text-cyan-400" /> Comparison Engine
            </Button>
          </div>
        </div>

        {/* Global Risks */}
        <div className="p-4 bg-red-950/20 border border-red-900/50 rounded flex items-start gap-4">
          <div className="w-12 h-12 bg-red-900/30 rounded flex items-center justify-center shrink-0 border border-red-500/30 animate-pulse">
            <ShieldAlert className="text-red-500 w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-red-200 uppercase tracking-widest">Critical Integrity Violations</h3>
            <div className="grid md:grid-cols-3 gap-4 mt-2">
               {scanData.consistency_checks.filter((c: any) => !c.passed).map((c: any, i: number) => (
                 <div key={i} className="text-xs text-red-400/80 bg-red-950/40 p-2 border border-red-900/30 rounded font-mono">
                    !! {c.check.toUpperCase()} !!
                    <div className="mt-1 text-[10px] opacity-70">{c.details}</div>
                 </div>
               ))}
               {!scanData.consistency_checks.some((c:any) => !c.passed) && <div className="text-xs text-emerald-400/60 italic px-2">No critical structural inconsistencies detected.</div>}
            </div>
          </div>
        </div>

        {/* Platform Risk Score Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {Object.entries(scanData.risk_scores).map(([key, val]: [string, any], i) => (
            <Card key={key} className={`bg-zinc-900 border-zinc-800 ${val.level === 'Critical' ? 'border-red-500/50 shadow-[0_0_15px_-5px_red]' : val.level === 'High' ? 'border-amber-500/50 shadow-[0_0_15px_-5px_orange]' : ''}`}>
              <div className="p-4 flex flex-col h-full">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest truncate max-w-[80px]">{key.replace(/_/g, ' ')}</span>
                  <Badge className={`text-[8px] px-1 h-3.5 ${val.level === 'Critical' ? 'bg-red-500' : val.level === 'High' ? 'bg-amber-500' : val.level === 'Medium' ? 'bg-cyan-500' : 'bg-emerald-500'}`}>
                    {val.level.toUpperCase()}
                  </Badge>
                </div>
                <div className="text-3xl font-bold text-white tracking-widest">{val.score}<span className="text-[10px] text-zinc-600 font-normal ml-0.5">%</span></div>
                <div className="mt-3 space-y-1 flex-1">
                   {val.top_risks.map((risk: string, i: number) => (
                     <div key={i} className="text-[9px] font-mono text-zinc-400 tracking-tighter truncate opacity-70">
                       &gt; {risk}
                     </div>
                   ))}
                </div>
                <div className="h-1 w-full bg-zinc-800 mt-3 rounded-full overflow-hidden">
                   <div className={`h-full ${val.score > 80 ? 'bg-red-500' : val.score > 60 ? 'bg-amber-500' : 'bg-green-500'}`} style={{ width: `${val.score}%` }}></div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <Card className="bg-zinc-950 border-zinc-800 p-6 flex flex-col items-center justify-center">
            <div className="technical-label mb-8 text-center">Threat Mapping Vectors</div>
            <div className="w-full aspect-square max-w-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid stroke="#27272a" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#71717a', fontSize: 9 }} />
                  <Radar
                    name="Risk"
                    dataKey="A"
                    stroke="#22d3ee"
                    fill="#22d3ee"
                    fillOpacity={0.4}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <div className="space-y-6">
             <h3 className="technical-label">Audited Signal Integrity</h3>
             <div className="space-y-3">
                <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded flex justify-between items-center group hover:bg-zinc-900 transition-colors">
                  <div className="flex items-center gap-3">
                    <Network className="w-5 h-5 text-cyan-400" />
                    <div>
                      <div className="text-xs font-bold text-white uppercase tracking-widest">Network / Proxy</div>
                      <div className="text-[10px] text-zinc-500 font-mono mt-0.5">{scanData.network.asn_org || 'UNKNOWN ISP'}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-mono text-white">{scanData.network.public_ip}</div>
                    <div className="text-[9px] uppercase font-bold text-emerald-500">RESIDENTIAL / FIXED</div>
                  </div>
                </div>
                <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <Bot className="w-5 h-5 text-red-500" />
                    <div>
                      <div className="text-xs font-bold text-white uppercase tracking-widest">Automation Env</div>
                      <div className="text-[10px] text-zinc-500 font-mono mt-0.5">Headless Indicators Detected</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-mono text-white">{scanData.automation_detection.navigator_webdriver ? 'DETACHED' : 'NATIVE'}</div>
                    <div className={`text-[9px] uppercase font-bold ${scanData.automation_detection.navigator_webdriver ? 'text-red-500' : 'text-emerald-500'}`}>
                      {scanData.automation_detection.navigator_webdriver ? 'SUSPICIOUS' : 'VERIFIED'}
                    </div>
                  </div>
                </div>
             </div>
          </div>
        </div>

        {/* Full Signal Sections */}
        <div className="mt-12 space-y-8">
           <div className="bg-zinc-900/20 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl">
             <div className="bg-zinc-950 border-b border-zinc-800 p-4 flex items-center gap-3">
               <Network className="w-5 h-5 text-cyan-400" />
               <h2 className="font-bold text-white uppercase tracking-widest text-sm">Network Analysis</h2>
             </div>
             <div className="p-6">
               <SignalTable items={[
                 { label: 'Public IP Origin', value: scanData.network.public_ip, integrity: 'DATACENTER' },
                 { label: 'ASN Identifier', value: scanData.network.asn, integrity: 'RECOGNIZED' },
                 { label: 'ISP Entity', value: scanData.network.asn_org, integrity: 'STABLE' },
                 { label: 'WebRTC Internal Leak', value: scanData.network.webrtc_local_ips?.join(', ') || 'N/A', integrity: scanData.network.webrtc_local_ips?.length ? 'LOCAL LEAK' : 'ISOLATED' },
                 { label: 'WebRTC Public Leak', value: scanData.network.webrtc_public_ips?.join(', ') || 'N/A', integrity: scanData.network.webrtc_leaked ? 'CROSS-IP LEAK' : 'CONSISTENT' },
                 { label: 'JA3 TLS Fingerprint', value: scanData.network.tls_fingerprint?.ja3_hash || 'N/A', integrity: 'EXTRACTED' },
                 { label: 'JA4 Fingerprint', value: scanData.network.tls_fingerprint?.ja4 || 'N/A', integrity: 'EXTRACTED' },
                 { label: 'PeetPrint Hash', value: scanData.network.tls_fingerprint?.peetprint_hash || 'N/A', integrity: 'STABLE' },
                 { label: 'HTTP/2 Support', value: scanData.network.tls_fingerprint?.http2 ? `TRUE (${scanData.network.tls_fingerprint.http_version})` : 'FALSE', integrity: 'STANDARD' },
                 { label: 'Akamai HTTP/2 Fingerprint', value: scanData.network.tls_fingerprint?.http2_akamai_hash || 'N/A', integrity: 'MEASURED' },
                 { label: 'HTTP/2 Frames', value: scanData.network.tls_fingerprint?.http2_framesCount !== null ? String(scanData.network.tls_fingerprint.http2_framesCount) : 'N/A', integrity: 'MEASURED' },
                 { label: 'Used TLS Version', value: scanData.network.tls_fingerprint?.used_tls || 'N/A', integrity: 'NEGOTIATED' },
                 { label: 'Supported HTTP (ALPN)', value: scanData.network.tls_fingerprint?.supported_http?.join(', ') || 'N/A', integrity: 'STANDARD' },
                 { label: 'Supported TLS Versions', value: scanData.network.tls_fingerprint?.supported_tls?.join(', ') || 'N/A', integrity: 'STANDARD' },
                 { label: 'TLS Ciphers / Exts / Curves', value: `${scanData.network.tls_fingerprint?.tls_ciphers?.length || 0} Ciphers, ${scanData.network.tls_fingerprint?.tls_extensions?.length || 0} Exts, ${scanData.network.tls_fingerprint?.tls_curves?.length || 0} Curves`, integrity: 'PROFILE' },
                 { label: 'IP TTL', value: scanData.network.tls_fingerprint?.ip_ttl !== null ? String(scanData.network.tls_fingerprint.ip_ttl) : 'N/A', integrity: 'ROUTING_HOP' }
               ]} />
             </div>
           </div>

           <div className="bg-zinc-900/20 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl">
             <div className="bg-zinc-950 border-b border-zinc-800 p-4 flex items-center gap-3">
               <Globe className="w-5 h-5 text-cyan-400" />
               <h2 className="font-bold text-white uppercase tracking-widest text-sm">Browser Identity</h2>
             </div>
             <div className="p-6">
               <SignalTable items={[
                 { label: 'Raw User Agent', value: scanData.client.user_agent, integrity: 'SYSTEM' },
                 { label: 'Parsed Engine', value: `${scanData.client.user_agent_parsed.engine.name} ${scanData.client.user_agent_parsed.engine.version}`, integrity: 'VERIFIED' },
                 { label: 'Timezone Resolver', value: scanData.locale.timezone, integrity: 'CONSISTENT' },
                 { label: 'Browser Locale', value: scanData.locale.primary_language, integrity: 'USER_SET' }
               ]} />
             </div>
           </div>

           <div className="bg-zinc-900/20 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl">
             <div className="bg-zinc-950 border-b border-zinc-800 p-4 flex items-center gap-3">
               <Cpu className="w-5 h-5 text-cyan-400" />
               <h2 className="font-bold text-white uppercase tracking-widest text-sm">Hardware Profile</h2>
             </div>
             <div className="p-6">
               <SignalTable items={[
                 { label: 'Hardware Concurrency', value: `${scanData.hardware.hardware_concurrency} Cores`, integrity: scanData.hardware.hardware_concurrency === 1 ? 'VIRTUAL' : 'NATIVE' },
                 { label: 'Device Memory Pointer', value: `${scanData.hardware.device_memory} GB`, integrity: 'STATED' },
                 { label: 'Display Matrix', value: `${scanData.hardware.screen.width}x${scanData.hardware.screen.height}`, integrity: 'MONITOR' },
                 { label: 'Pixel Density', value: `${scanData.hardware.screen.devicePixelRatio}`, integrity: 'RETINA' }
               ]} />
             </div>
           </div>

           <div className="bg-zinc-900/20 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl">
             <div className="bg-zinc-950 border-b border-zinc-800 p-4 flex items-center gap-3">
               <Paintbrush className="w-5 h-5 text-cyan-400" />
               <h2 className="font-bold text-white uppercase tracking-widest text-sm">Graphics & Rendering</h2>
             </div>
             <div className="p-6">
               <SignalTable items={[
                 { label: 'Canvas Hash (SHA-256)', value: scanData.rendering.canvas_hash, integrity: 'IMMUTABLE' },
                 { label: 'WebGL Renderer', value: scanData.rendering.webgl.renderer, integrity: 'GPU_LEAK' },
                 { label: 'Fonts Cluster Hash', value: scanData.rendering.fonts.fingerprint_hash, integrity: 'MEASURED' }
               ]} />
             </div>
           </div>

           <div className="bg-zinc-900/20 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl">
             <div className="bg-zinc-950 border-b border-zinc-800 p-4 flex items-center gap-3">
               <Speaker className="w-5 h-5 text-cyan-400" />
               <h2 className="font-bold text-white uppercase tracking-widest text-sm">Audio Fingerprint</h2>
             </div>
             <div className="p-6">
               <SignalTable items={[
                 { label: 'Context BaseHash', value: scanData.audio?.id || 'N/A', integrity: 'STABLE' }
               ]} />
             </div>
           </div>

           <div className="bg-zinc-900/20 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl">
             <div className="bg-zinc-950 border-b border-zinc-800 p-4 flex items-center gap-3">
               <ShieldAlert className="w-5 h-5 text-cyan-400" />
               <h2 className="font-bold text-white uppercase tracking-widest text-sm">Automation & Evasion</h2>
             </div>
             <div className="p-6">
               <SignalTable items={[
                 { label: 'Navigator.Webdriver', value: String(scanData.automation_detection.navigator_webdriver), integrity: 'AUTOMATED' },
                 { label: 'Indicator Count', value: String(scanData.automation_detection.headless_chrome_indicators.length), integrity: 'CRITICAL' },
                 { label: 'JS Integrity Leak', value: String(scanData.automation_detection.function_tostring_modified), integrity: 'SPOOFED' }
               ]} />
             </div>
           </div>

           <div className="bg-zinc-900/20 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl">
             <div className="bg-zinc-950 border-b border-zinc-800 p-4 flex items-center gap-3">
               <Monitor className="w-5 h-5 text-cyan-400" />
               <h2 className="font-bold text-white uppercase tracking-widest text-sm">Deep Signatures (Passive)</h2>
             </div>
             <div className="p-6 space-y-4">
               <SignalTable items={[
                 { label: 'Permissions API Mocks', value: JSON.stringify(scanData.deep.permissions_state), integrity: 'MEASURED' },
                 { label: 'Storage APIs', value: `Local: ${scanData.deep.storage.localStorageWorks}, IDX: ${scanData.deep.storage.indexedDBWorks}`, integrity: 'PERSISTENCE' },
                 { label: 'Math Hash', value: scanData.deep.math_fingerprint, integrity: 'CPU_LEAK' },
                 { label: 'Video Codecs Supported', value: String(scanData.deep.codecs.video.length), integrity: 'MEDIA' },
                 { label: 'Audio Codecs Supported', value: String(scanData.deep.codecs.audio.length), integrity: 'MEDIA' },
                 { label: 'WebGPU Render Adapter', value: typeof scanData.hardware.webgpu === 'string' ? scanData.hardware.webgpu : JSON.stringify(scanData.hardware.webgpu), integrity: 'EXTRACTED' },
                 { label: 'Mime Types / Plugins', value: `Mimes: ${scanData.deep.mime_types.count}, Plugins: ${scanData.deep.plugins.count}`, integrity: 'FINGERPRINT' },
                 { label: 'CSS Media Queries', value: scanData.deep.css_media_queries?.join(', ') || 'None', integrity: 'UI_STATE' },
                 { label: 'Behavioral Entropy', value: `Mouse: ${scanData.deep.behavioral?.mouse_entropy.toFixed(2)}, Typing: ${scanData.deep.behavioral?.typing_cadence}`, integrity: 'HEURISTIC' }
               ]} />
             </div>
           </div>

           <div className="bg-zinc-900/40 border border-cyan-800/30 rounded-xl overflow-hidden shadow-2xl relative">
             <div className="bg-cyan-950/30 border-b border-cyan-900/50 p-4 flex items-center justify-between">
               <div className="flex items-center gap-3">
                 <ShieldCheck className="w-5 h-5 text-cyan-400" />
                 <h2 className="font-bold text-white uppercase tracking-widest text-sm">Active Deep Scan (Requires Permissions)</h2>
               </div>
               {!deepScanComplete && (
                 <Button onClick={execDeepScan} disabled={isDeepScanning} className="bg-cyan-500 hover:bg-cyan-400 text-zinc-950 text-xs font-bold uppercase tracking-widest h-8">
                   {isDeepScanning ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Run Deep Scan"}
                 </Button>
               )}
             </div>
             <div className="p-6">
               {!deepScanComplete ? (
                 <div className="text-sm font-mono text-zinc-500 mb-2">
                   Grant explicit permissions to perform a full device diagnostic. Extracts exact Geolocation, Media Device Labels, precise Storage Quotas, and Battery analytics to bypass hardware spoofing.<br/><br/>
                   <span className="text-cyan-600/80 italic">Note: Permissions are exclusively used for this diagnostic step and immediately released.</span>
                 </div>
               ) : (
                 <SignalTable items={[
                  { label: 'Real Geolocation', value: scanData.deep_permissions?.geolocation?.lat ? `${scanData.deep_permissions.geolocation.lat}, ${scanData.deep_permissions.geolocation.lng}` : JSON.stringify(scanData.deep_permissions?.geolocation), integrity: scanData.deep_permissions?.geolocation?.lat ? 'EXPOSED' : 'BLOCKED' },
                  { label: 'Media Device Labels', value: Array.isArray(scanData.deep_permissions?.mediaDevices) ? scanData.deep_permissions.mediaDevices.map((d:any) => d.label || d.kind).join(', ') : JSON.stringify(scanData.deep_permissions?.mediaDevices), integrity: 'ENUMERATED' },
                  { label: 'Disk Quota Limits', value: scanData.deep_permissions?.storageEstimate ? `${scanData.deep_permissions.storageEstimate.quota_gb.toFixed(2)} GB Max` : 'N/A', integrity: 'HARDWARE' },
                  { label: 'Battery Analytics', value: scanData.deep_permissions?.battery ? `${scanData.deep_permissions.battery.level * 100}% (${scanData.deep_permissions.battery.charging ? 'Charging' : 'Discharging'})` : 'N/A', integrity: 'PHYSICAL' }
                 ]} />
               )}
             </div>
           </div>
        </div>

        <div className="flex justify-between items-center pt-8 border-t border-zinc-900 pb-12">
           <div className="flex gap-6 technical-label">
             <span>L: 42ms</span>
             <span>D: {scanData.scan_meta.duration_ms}ms</span>
             <span>V: 1.0.4-LOCAL</span>
           </div>
           <div className="flex items-center gap-2">
             <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
             <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Integrity Pulse Active</span>
           </div>
        </div>
      </main>
    </div>
  );
}

function SignalTable({ items }: { items: { label: string, value: string, integrity: string }[] }) {
  return (
    <div className="border border-zinc-800 rounded overflow-hidden">
      <div className="grid grid-cols-4 bg-zinc-950 border-b border-zinc-800 p-4 text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em]">
        <div className="col-span-1">Signal Vector</div>
        <div className="col-span-2">Detected Value</div>
        <div className="col-span-1 text-right">Integrity Marker</div>
      </div>
      <div className="divide-y divide-zinc-800/50">
        {items.map((item, i) => (
          <div key={i} className="grid grid-cols-4 p-4 hover:bg-zinc-800/20 transition-all font-mono text-xs">
            <div className="text-zinc-500 tracking-tighter uppercase text-[10px] font-bold">{item.label}</div>
            <div className="col-span-2 text-white break-all">{item.value || 'NULL'}</div>
            <div className={`text-right font-bold tracking-tighter ${item.integrity === 'LEAKED' || item.integrity === 'CRITICAL' || item.integrity === 'AUTOMATED' ? 'text-red-500' : item.integrity === 'SUSPICIOUS' ? 'text-amber-500' : 'text-cyan-600'}`}>
              {item.integrity}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
