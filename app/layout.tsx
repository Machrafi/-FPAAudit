import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Inter, JetBrains_Mono } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "FingerprintAudit | Browser Intelligence Diagnostic",
  description: "See exactly what anti-fraud systems (Amazon, Stripe, Facebook, Google) see when you connect. Advanced browser fingerprinting detection, WebGL, WebRTC, TLS JA3/JA4, and hardware spoofing analysis.",
  keywords: "browser fingerprinting, anti-detect browser, canvas fingerprint, WebGL fingerprint, WebRTC leak, TLS fingerprint, JA3, JA4, bot detection, fraud prevention",
  authors: [{ name: "FingerprintAudit" }],
  creator: "FingerprintAudit",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://fingerprintaudit.com",
    title: "FingerprintAudit | Advanced Browser Intelligence",
    description: "Analyze your browser's fingerprint, proxy leaks, hardware spoofing, and TLS extensions.",
    siteName: "FingerprintAudit",
  },
  twitter: {
    card: "summary_large_image",
    title: "FingerprintAudit | Advanced Browser Intelligence",
    description: "Analyze your browser's fingerprint, proxy leaks, hardware spoofing, and TLS extensions.",
    creator: "@fingerprintaudit",
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' }
    ],
    apple: [
      { url: '/icon.svg' }
    ]
  }
};

export const viewport: Viewport = {
  themeColor: "#09090b",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans bg-zinc-950 text-zinc-100 antialiased selection:bg-cyan-500/30`}
      >
        {children}
      </body>
    </html>
  );
}
