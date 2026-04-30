"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ShieldCheck, ShieldAlert, ArrowLeftRight, ChevronLeft, Upload, Info } from "lucide-react";

export default function ComparePage() {
  const [dataA, setDataA] = useState<any>(null);
  const [dataB, setDataB] = useState<any>(null);
  const [comparison, setComparison] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'A' | 'B') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (target === 'A') setDataA(json);
        else setDataB(json);
        setError(null);
      } catch (err) {
        setError("Invalid JSON file uploaded.");
      }
    };
    reader.readAsText(file);
  };

  const runComparison = () => {
    if (!dataA || !dataB) return;

    const diff: any[] = [];
    
    // Helper to add row
    const addRow = (label: string, valA: any, valB: any) => {
      const isMatch = valA === valB;
      diff.push({
        label,
        valA: String(valA),
        valB: String(valB),
        status: isMatch ? 'ISOLATED' : 'LEAK DETECTED'
      });
    };

    addRow("Public IP", dataA.network.public_ip, dataB.network.public_ip);
    addRow("Canvas Hash", dataA.rendering.canvas_hash, dataB.rendering.canvas_hash);
    addRow("WebGL Renderer", dataA.rendering.webgl.renderer, dataB.rendering.webgl.renderer);
    addRow("Hardware Cores", dataA.hardware.hardware_concurrency, dataB.hardware.hardware_concurrency);
    addRow("Device Memory", dataA.hardware.device_memory, dataB.hardware.device_memory);
    addRow("Resolution", `${dataA.hardware.screen.width}x${dataA.hardware.screen.height}`, `${dataB.hardware.screen.width}x${dataB.hardware.screen.height}`);
    addRow("User Agent", dataA.client.user_agent, dataB.client.user_agent);
    addRow("Timezone", dataA.locale.timezone, dataB.locale.timezone);
    addRow("Audio Context", dataA.audio.id, dataB.audio.id);

    setComparison(diff);
  };

  const leaksCount = comparison?.filter((d: any) => d.status.includes('LEAK')).length || 0;
  const isolatedCount = comparison?.filter((d: any) => d.status === 'ISOLATED').length || 0;

  return (
    <div className="min-h-screen bg-zinc-950 technical-grid py-12 px-6">
      <div className="max-w-5xl mx-auto space-y-8">
        <Link href="/" className="inline-flex items-center text-xs font-bold text-zinc-500 hover:text-cyan-400 uppercase tracking-widest transition-colors mb-4">
          <ChevronLeft className="w-4 h-4 mr-1" /> Return to Mainframe
        </Link>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-1">
            <div className="technical-label">Advanced Differential Diagnostics</div>
            <h1 className="text-4xl font-bold text-white tracking-widest uppercase italic">Local Side-by-Side</h1>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-zinc-900 border-zinc-800 p-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="technical-label">Dataset Alpha</span>
              {dataA && <Badge className="bg-emerald-500 text-[10px]">LOADED</Badge>}
            </div>
            <div className="relative group cursor-pointer border-2 border-dashed border-zinc-800 hover:border-cyan-500/50 rounded-lg p-8 transition-colors text-center">
              <input 
                type="file" 
                accept=".json" 
                onChange={(e) => handleFileUpload(e, 'A')} 
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <Upload className="w-8 h-8 text-zinc-700 mx-auto mb-2 group-hover:text-cyan-400" />
              <p className="text-xs font-mono text-zinc-500">{dataA ? `fpa_audit_${dataA.scan_meta.timestamp.slice(0,10)}.json` : "Click to upload JSON profile"}</p>
            </div>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800 p-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="technical-label">Dataset Omega</span>
              {dataB && <Badge className="bg-emerald-500 text-[10px]">LOADED</Badge>}
            </div>
            <div className="relative group cursor-pointer border-2 border-dashed border-zinc-800 hover:border-cyan-500/50 rounded-lg p-8 transition-colors text-center">
              <input 
                type="file" 
                accept=".json" 
                onChange={(e) => handleFileUpload(e, 'B')} 
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <Upload className="w-8 h-8 text-zinc-700 mx-auto mb-2 group-hover:text-cyan-400" />
              <p className="text-xs font-mono text-zinc-500">{dataB ? `fpa_audit_${dataB.scan_meta.timestamp.slice(0,10)}.json` : "Click to upload JSON profile"}</p>
            </div>
          </Card>
        </div>

        {dataA && dataB && !comparison && (
          <div className="flex justify-center">
             <Button onClick={runComparison} className="bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold uppercase py-6 px-12 text-sm tracking-widest shadow-[0_0_20px_-5px_#22d3ee]">
               Run Cross-Correlation Audit
             </Button>
          </div>
        )}

        {error && (
            <div className="p-4 bg-red-950/20 border border-red-900 text-red-400 text-xs font-mono uppercase">
                ERROR: {error}
            </div>
        )}

        {comparison && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="grid md:grid-cols-3 gap-6">
               <Card className="bg-zinc-900 border-zinc-800 p-6 flex items-center justify-between">
                  <div>
                    <div className="technical-label mb-1">Cross-Linkages</div>
                    <div className="text-3xl font-bold text-red-500">{leaksCount}</div>
                  </div>
                  <ShieldAlert className="w-10 h-10 text-red-500/20" />
               </Card>
               <Card className="bg-zinc-900 border-zinc-800 p-6 flex items-center justify-between">
                  <div>
                    <div className="technical-label mb-1">True Isolation</div>
                    <div className="text-3xl font-bold text-emerald-500">{isolatedCount}</div>
                  </div>
                  <ShieldCheck className="w-10 h-10 text-emerald-500/20" />
               </Card>
               <Card className="bg-zinc-900 border-zinc-800 p-6 flex flex-col justify-center">
                  <div className="technical-label mb-2">Isolation Index</div>
                  <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-cyan-500" 
                      style={{ width: `${(isolatedCount / comparison.length) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-2 text-[10px] font-mono text-zinc-500">
                    <span>INDEX: {Math.round((isolatedCount / comparison.length) * 100)}%</span>
                  </div>
               </Card>
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
               <Table>
                 <TableHeader className="bg-zinc-950">
                    <TableRow className="border-zinc-800 hover:bg-transparent">
                      <TableHead className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest">Diagnostic Vector</TableHead>
                      <TableHead className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest">Alpha Profile</TableHead>
                      <TableHead className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest">Omega Profile</TableHead>
                      <TableHead className="text-right text-zinc-500 text-[10px] uppercase font-bold tracking-widest">Differential Status</TableHead>
                    </TableRow>
                 </TableHeader>
                 <TableBody>
                   {comparison.map((row: any, i: number) => (
                     <TableRow key={i} className="border-zinc-800/50 hover:bg-zinc-800/10">
                        <TableCell className="font-bold text-xs text-zinc-400 tracking-tight">{row.label.toUpperCase()}</TableCell>
                        <TableCell className="font-mono text-[10px] text-white">
                           <div className="max-w-[200px] truncate">{row.valA}</div>
                        </TableCell>
                        <TableCell className="font-mono text-[10px] text-white">
                           <div className="max-w-[200px] truncate">{row.valB}</div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="outline" className={`text-[9px] uppercase tracking-tighter ${row.status.includes('LEAK') ? 'border-red-500 text-red-500 bg-red-500/5' : 'border-emerald-500 text-emerald-500 bg-emerald-500/5'}`}>
                            {row.status}
                          </Badge>
                        </TableCell>
                     </TableRow>
                   ))}
                 </TableBody>
               </Table>
            </div>
            
            <div className="flex items-center gap-2 p-4 bg-zinc-900/40 border border-zinc-800 rounded text-[10px] text-zinc-500 font-mono">
               <Info className="w-4 h-4 text-cyan-500" />
               CROSS-CORRELATION COMPLETE. NO DATA LEAVING LOCAL ENVIRONMENT.
            </div>
          </div>
        )}

        {!comparison && (
            <div className="text-center py-20 border-2 border-dashed border-zinc-900 rounded-xl">
                <ArrowLeftRight className="w-12 h-12 text-zinc-800 mx-auto mb-4" />
                <h3 className="text-zinc-500 uppercase tracking-widest font-bold text-sm">Differential Analysis Offline</h3>
                <p className="text-zinc-700 text-xs mt-2 italic">Upload two previously exported FPA JSON profiles to calculate cross-session leakage.</p>
            </div>
        )}
      </div>
    </div>
  );
}
