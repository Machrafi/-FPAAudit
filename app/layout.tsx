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

export const metadata = {
  title: "FingerprintAudit | Browser Intelligence Diagnostic",
  description: "See exactly what anti-fraud systems see when you connect. scan, compare, and analyze browser fingerprints.",
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
