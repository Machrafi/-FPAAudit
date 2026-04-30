import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ChevronRight, Shield, Zap, Search, Github, Terminal } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col technical-grid">
      {/* Header */}
      <header className="h-16 border-b border-zinc-800 flex items-center justify-between px-6 bg-zinc-950/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-cyan-500 rounded-sm flex items-center justify-center transition-transform group-hover:rotate-90 duration-300">
              <div className="w-4 h-4 bg-zinc-950 rounded-full"></div>
            </div>
            <span className="font-bold tracking-tight text-white text-xl">
              Fingerprint<span className="text-cyan-400">Audit</span>
            </span>
          </Link>
          <nav className="hidden md:flex gap-6 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
            <Link href="/scan" className="hover:text-cyan-400 transition-colors">Start Scan</Link>
            <Link href="/compare" className="hover:text-cyan-400 transition-colors">Compare</Link>
            <Link href="/schema" className="hover:text-cyan-400 transition-colors">Schema</Link>
            <Link href="/learn" className="hover:text-cyan-400 transition-colors">Learn</Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <Link href="https://github.com" target="_blank" className="text-zinc-500 hover:text-white transition-colors">
            <Github className="w-5 h-5" />
          </Link>
          <Button asChild className="bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold px-6">
            <Link href="/scan">RUN SCAN NOW</Link>
          </Button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-20">
        {/* Hero */}
        <section className="text-center mb-32">
          <div className="technical-label mb-4">Diagnostics v1.0.4 r12</div>
          <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tighter mb-6">
            See exactly what <span className="text-cyan-400">anti-fraud systems</span> see
          </h1>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
            A professional diagnostic tool that scans 100+ browser signals used by Amazon, Stripe, and Google to identify returning users and detect automation.
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg" className="bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold px-8 h-14" asChild>
              <Link href="/scan">INITIALIZE SCAN <ChevronRight className="w-4 h-4 ml-2" /></Link>
            </Button>
            <Button variant="outline" size="lg" className="border-zinc-800 hover:bg-zinc-900 text-white px-8 h-14" asChild>
              <Link href="/learn">VIEW METHODOLOGY</Link>
            </Button>
          </div>
        </section>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-32">
          {[
            { icon: Search, title: "100+ Signals", content: "Deep inspection of Canvas, WebGL, Fonts, WebRTC and Hardware headers." },
            { icon: Zap, title: "Risk Scoring", content: "Platform-specific risk weights for Amazon, Google, and Stripe." },
            { icon: Shield, title: "Leak Detection", content: "Compare two sessions side-by-side to identify fingerprint inconsistencies." }
          ].map((f, i) => (
            <Card key={i} className="bg-zinc-900/50 border-zinc-800 p-8 hover:border-zinc-700 transition-all">
              <f.icon className="w-10 h-10 text-cyan-500 mb-6" />
              <h3 className="text-xl font-bold text-white mb-3">{f.title}</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">{f.content}</p>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <section className="max-w-3xl mx-auto mb-32">
          <h2 className="text-3xl font-bold text-white mb-8 text-center italic tracking-tight underline decoration-cyan-500/50 underline-offset-8">Internal Reference & FAQ</h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="privacy" className="border-zinc-800">
              <AccordionTrigger className="text-white hover:text-cyan-400 font-bold">How is my data handled?</AccordionTrigger>
              <AccordionContent className="text-zinc-400">
                All fingerprint scans are performed client-side. No session data is stored on our servers or in any database. You can export your audit results as a JSON file and compare them locally using our comparison engine.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="detect-logic" className="border-zinc-800">
              <AccordionTrigger className="text-white hover:text-cyan-400 font-bold">How accurate is the risk scoring?</AccordionTrigger>
              <AccordionContent className="text-zinc-400">
                Risk weights are based on public documentation and observed behavior of major anti-fraud platforms. While highly accurate for diagnostic purposes, actual platform thresholds remain proprietary and subject to change.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800 bg-zinc-950 px-6 py-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-zinc-500" />
            <span className="text-xs uppercase tracking-widest text-zinc-600 font-bold">
              Built by <span className="text-zinc-400">FullPublish</span> &copy; 2026
            </span>
          </div>
          <div className="flex gap-8 text-[10px] uppercase tracking-widest font-bold text-zinc-600">
            <Link href="/about" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/schema" className="hover:text-white transition-colors">Docs</Link>
            <Link href="mailto:support@fingerprintaudit.com" className="hover:text-white transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
