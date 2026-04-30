import Link from "next/link";
import { ChevronLeft, ShieldCheck, Database, EyeOff } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300 font-sans technical-grid">
      <div className="max-w-3xl mx-auto py-20 px-6">
        <Link href="/" className="inline-flex items-center text-xs font-bold text-zinc-500 hover:text-cyan-400 uppercase tracking-widest transition-colors mb-12">
          <ChevronLeft className="w-4 h-4 mr-1" /> Return to Mainframe
        </Link>

        <header className="mb-20">
          <div className="technical-label mb-2">Operation Methodology</div>
          <h1 className="text-6xl font-bold text-white tracking-tighter uppercase mb-6 italic underline decoration-cyan-500 underline-offset-8">About</h1>
        </header>

        <div className="prose prose-invert max-w-none space-y-12">
          <section>
            <h2 className="text-xl font-bold text-white uppercase tracking-widest flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-emerald-500" /> MISSION OBJECTIVE
            </h2>
            <p className="text-zinc-400 leading-relaxed mt-4">
              FingerprintAudit was built to provide transparency in an era of silent tracking. Most web users are unaware that anti-fraud systems collect thousands of subtle signals—from audio timing variations to font rendering math—to create a persistent digital identity. Our tool exposes these signals so developers and security researchers can verify their privacy implementations.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white uppercase tracking-widest flex items-center gap-3">
              <Database className="w-6 h-6 text-cyan-500" /> DATA RETENTION POLICY
            </h2>
            <p className="text-zinc-400 leading-relaxed mt-4">
              We operate on a zero-persistence model for personal data:
            </p>
            <ul className="list-disc list-inside text-zinc-500 space-y-2 mt-4 text-sm font-mono">
              <li>NO user accounts or email verification required.</li>
              <li>SESSIONS are stored anonymously by random ID.</li>
              <li>TTL AUTO-PURGE: All data is permanently deleted after 30 days.</li>
              <li>NO third-party tracking scripts (Google Analytics, Pixels, etc).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white uppercase tracking-widest flex items-center gap-3">
              <EyeOff className="w-6 h-6 text-amber-500" /> PRIVACY BY DESIGN
            </h2>
            <p className="text-zinc-400 leading-relaxed mt-4">
              FingerprintAudit does not "fingerprint" you for tracking. We "audit" the fingerprinting capability of your browser. We do not sell data, nor do we build shadow profiles. The project is supported by the community and dedicated to open-source security diagnostics.
            </p>
          </section>
        </div>

        <div className="mt-20 pt-10 border-t border-zinc-900 text-center">
           <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.4em]">PROCEED WITH KNOWLEDGE</span>
        </div>
      </div>
    </div>
  );
}
