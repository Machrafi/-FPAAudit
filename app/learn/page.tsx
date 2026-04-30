import Link from "next/link";
import { BookOpen, ChevronLeft, ChevronRight, Info } from "lucide-react";
import { Card } from "@/components/ui/card";

const TOPICS = [
  { slug: 'webrtc-leak-fix', title: 'WebRTC Leak Prevention', excerpt: 'How to stop your browser from leaking private IP addresses through the real-time communication API.' },
  { slug: 'font-fingerprint-masking', title: 'Font Measurement Spoofing', excerpt: 'Why font enumeration is a high-entropy signal and how to normalize your font measurement lists.' },
  { slug: 'canvas-fingerprint', title: 'Canvas Anti-Fingerprinting', excerpt: 'Techniques for adding noise to HTML5 canvas elements to break tracking reliability.' },
  { slug: 'headless-chrome-detection', title: 'Evading Automation Flags', excerpt: 'A guide to cleaning up navigator.webdriver and other headless environment indicators.' }
];

export default function LearnPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300 font-sans technical-grid">
      <div className="max-w-4xl mx-auto py-20 px-6">
        <Link href="/" className="inline-flex items-center text-xs font-bold text-zinc-500 hover:text-cyan-400 uppercase tracking-widest transition-colors mb-12">
          <ChevronLeft className="w-4 h-4 mr-1" /> Return to Mainframe
        </Link>

        <header className="mb-16">
          <div className="technical-label mb-2">Knowledge Base</div>
          <h1 className="text-5xl font-bold text-white tracking-tighter uppercase mb-4 italic">Security Training</h1>
          <p className="text-zinc-500 text-lg leading-relaxed">
            Technical guides on understanding and neutralizing fingerprint signals used by advanced anti-fraud frameworks.
          </p>
        </header>

        <div className="grid gap-4">
           {TOPICS.map((t, i) => (
             <Link key={i} href={`/learn/${t.slug}`}>
               <Card className="bg-zinc-900/50 border-zinc-800 p-6 group hover:border-cyan-500/50 transition-all cursor-pointer">
                 <div className="flex justify-between items-center">
                   <div className="flex gap-4 items-start">
                     <div className="w-10 h-10 bg-zinc-800 rounded flex items-center justify-center shrink-0 group-hover:bg-cyan-500/20 transition-colors">
                       <BookOpen className="w-5 h-5 text-zinc-500 group-hover:text-cyan-400" />
                     </div>
                     <div>
                       <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">{t.title}</h3>
                       <p className="text-sm text-zinc-500 mt-1 max-w-xl">{t.excerpt}</p>
                     </div>
                   </div>
                   <ChevronRight className="w-5 h-5 text-zinc-800 group-hover:text-cyan-400 transform group-hover:translate-x-1 transition-all" />
                 </div>
               </Card>
             </Link>
           ))}
        </div>

        <div className="mt-20 p-6 bg-cyan-950/20 border border-cyan-900/50 rounded-xl flex items-start gap-4">
           <Info className="w-6 h-6 text-cyan-500 shrink-0" />
           <div className="text-sm text-cyan-400/80 leading-relaxed">
             <strong>Operator Notice:</strong> These guides are for educational and diagnostic purposes. Bypassing security systems should only be done for authorized security testing and research.
           </div>
        </div>
      </div>
    </div>
  );
}
