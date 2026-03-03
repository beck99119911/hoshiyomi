import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "星詠み - AIによる本格占い鑑定",
  description: "西洋占星術・数秘術・血液型を組み合わせたAI占い。今の悩みを入力するだけで、具体的なアドバイスが届きます。1日3回まで無料。",
  metadataBase: new URL("https://hoshiyomi.xyz"),
  openGraph: {
    title: "星詠み - AIによる本格占い鑑定",
    description: "西洋占星術・数秘術・血液型を組み合わせたAI占い。1日3回まで無料。",
    url: "https://hoshiyomi.xyz",
    siteName: "星詠み",
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "星詠み - AIによる本格占い鑑定",
    description: "西洋占星術・数秘術・血液型を組み合わせたAI占い。1日3回まで無料。",
    site: "@hoshiyomi_xyz",
  },
};

const STARS = [
  { t: "8%",  l: "12%", s: 2,   d: "2.1s", dl: "0s"   },
  { t: "22%", l: "83%", s: 1.5, d: "1.8s", dl: "0.5s" },
  { t: "6%",  l: "52%", s: 2,   d: "2.5s", dl: "0.9s" },
  { t: "42%", l: "7%",  s: 1.5, d: "3.0s", dl: "0.3s" },
  { t: "33%", l: "70%", s: 1,   d: "1.6s", dl: "1.2s" },
  { t: "68%", l: "28%", s: 2,   d: "2.8s", dl: "0.7s" },
  { t: "58%", l: "91%", s: 1.5, d: "2.2s", dl: "1.5s" },
  { t: "78%", l: "58%", s: 1,   d: "1.9s", dl: "0.4s" },
  { t: "14%", l: "38%", s: 1.5, d: "2.6s", dl: "1.0s" },
  { t: "88%", l: "18%", s: 1,   d: "1.7s", dl: "0.6s" },
  { t: "52%", l: "46%", s: 2,   d: "2.3s", dl: "1.3s" },
  { t: "4%",  l: "74%", s: 1,   d: "1.5s", dl: "0.8s" },
  { t: "95%", l: "65%", s: 1.5, d: "2.9s", dl: "0.2s" },
  { t: "75%", l: "88%", s: 1,   d: "2.0s", dl: "1.1s" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* ── 星空背景 ── */}
        <div className="stars" />

        {/* オーロラ */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div
            className="aurora-glow absolute"
            style={{
              width: "70vw", height: "50vh",
              top: "5%", left: "15%",
              background: "radial-gradient(ellipse, rgba(100,80,200,0.12) 0%, transparent 70%)",
            }}
          />
          <div
            className="aurora-glow absolute"
            style={{
              width: "50vw", height: "40vh",
              top: "55%", right: "8%",
              background: "radial-gradient(ellipse, rgba(212,168,76,0.07) 0%, transparent 70%)",
              animationDelay: "3.5s",
            }}
          />
          <div
            className="aurora-glow absolute"
            style={{
              width: "40vw", height: "35vh",
              top: "30%", left: "5%",
              background: "radial-gradient(ellipse, rgba(80,60,180,0.08) 0%, transparent 70%)",
              animationDelay: "1.8s",
            }}
          />
        </div>

        {/* きらめく星 */}
        <div className="fixed inset-0 pointer-events-none z-0">
          {STARS.map((star, i) => (
            <div
              key={i}
              className="star-t absolute rounded-full"
              style={{
                top: star.t,
                left: star.l,
                width: `${star.s}px`,
                height: `${star.s}px`,
                background: i % 3 === 0
                  ? "rgba(212,168,76,0.95)"
                  : "rgba(255,255,255,0.85)",
                boxShadow: i % 3 === 0
                  ? `0 0 ${star.s * 4}px rgba(212,168,76,0.7)`
                  : `0 0 ${star.s * 2}px rgba(255,255,255,0.5)`,
                ["--dur" as string]: star.d,
                ["--delay" as string]: star.dl,
              }}
            />
          ))}
        </div>

        {children}
        <Analytics />
      </body>
    </html>
  );
}
