import { Metadata } from "next";
import Link from "next/link";

type SearchParams = Promise<{
  zodiac?:  string;
  lp?:     string;
  blood?:  string;
  overall?: string;
  love?:   string;
  work?:   string;
  money?:  string;
  health?: string;
  quote?:  string;
}>;

type Props = { searchParams: SearchParams };

// OG画像URLを組み立てるヘルパー
function buildOgUrl(base: string, p: Awaited<SearchParams>): string {
  const q = new URLSearchParams({
    zodiac:  p.zodiac  || "",
    lp:      p.lp      || "",
    blood:   p.blood   || "",
    overall: p.overall || "3",
    love:    p.love    || "3",
    work:    p.work    || "3",
    money:   p.money   || "3",
    health:  p.health  || "3",
    quote:   p.quote   || "",
  });
  return `${base}/api/og?${q.toString()}`;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const p = await searchParams;
  const zodiac = p.zodiac || "星詠み";
  const lp     = p.lp    || "?";

  const base  = process.env.NEXT_PUBLIC_BASE_URL || "https://hoshiyomi.vercel.app";
  const ogImg = buildOgUrl(base, p);

  const title = `${zodiac} × ライフパス${lp} の今週の運勢 | 星詠み`;
  const description = p.quote
    ? `"${p.quote}" — AIが星座・数秘術・血液型を組み合わせた本格鑑定`
    : "AIが星座・数秘術・血液型を組み合わせた本格鑑定サービス「星詠み」";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: ogImg, width: 1200, height: 630 }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImg],
    },
  };
}

function ScoreRow({ label, score }: { label: string; score: number }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1.5">
        <span className="text-[#f5eedd]/70 tracking-wider">{label}</span>
        <span className="text-[#d4a84c] tracking-widest">
          {"●".repeat(score)}{"○".repeat(5 - score)}
        </span>
      </div>
      <div className="score-bar">
        <div className="score-bar-fill" style={{ width: `${score * 20}%` }} />
      </div>
    </div>
  );
}

export default async function SharePage({ searchParams }: Props) {
  const p = await searchParams;

  const zodiac  = p.zodiac  || "不明";
  const lp      = p.lp      || "?";
  const blood   = p.blood   || "?";
  const overall = Number(p.overall || 3);
  const love    = Number(p.love    || 3);
  const work    = Number(p.work    || 3);
  const money   = Number(p.money   || 3);
  const health  = Number(p.health  || 3);
  const quote   = p.quote   || "";

  const scores = [
    { label: "総合運", score: overall },
    { label: "恋愛運", score: love },
    { label: "仕事運", score: work },
    { label: "金　運", score: money },
    { label: "健康運", score: health },
  ];

  return (
    <>
      <div className="stars" />
      <main className="relative z-10 min-h-screen text-[#f0e8d8] flex flex-col items-center justify-center px-6 py-12">
        <div className="max-w-lg w-full mx-auto space-y-8">

          {/* ヘッダー */}
          <div className="text-center space-y-2">
            <p className="text-[10px] tracking-[0.4em] text-[#d4a84c]/60 uppercase mb-3">
              ✦ AI Fortune Reading
            </p>
            <h1 className="text-3xl font-bold">
              <span className="gold-text">{zodiac}</span>
            </h1>
            <p className="text-xs text-[#f5eedd]/50 tracking-wider">
              ライフパス {lp} · {blood}型
            </p>
          </div>

          {/* スコア */}
          <div
            className="glass gold-border p-7 space-y-4"
            style={{ borderTop: "1px solid rgba(212,168,76,0.5)" }}
          >
            {scores.map(({ label, score }) => (
              <ScoreRow key={label} label={label} score={score} />
            ))}
          </div>

          {/* 名言 */}
          {quote && (
            <div className="text-center py-4">
              <p className="text-lg text-[#e8d08a]/90 italic leading-relaxed px-4 border-l-2 border-r-2 border-[#d4a84c]/40">
                &ldquo;{quote}&rdquo;
              </p>
            </div>
          )}

          {/* CTA */}
          <div
            className="glass gold-border p-8 text-center space-y-5"
            style={{ borderTop: "1px solid rgba(212,168,76,0.4)" }}
          >
            <div>
              <p className="text-[10px] tracking-[0.3em] text-[#d4a84c]/60 uppercase mb-2">
                あなたも鑑定してみる？
              </p>
              <p className="text-sm text-[#f5eedd]/60 leading-relaxed">
                西洋占星術・数秘術・血液型——<br />
                3つの叡智が交わる、あなただけの鑑定
              </p>
            </div>
            <Link
              href="/fortune"
              className="group relative inline-flex items-center gap-3 px-10 py-4 text-sm tracking-widest uppercase transition-all duration-300"
              style={{
                background: "linear-gradient(135deg, rgba(201,168,76,0.15), rgba(201,168,76,0.05))",
                border: "1px solid rgba(201,168,76,0.5)",
              }}
            >
              <span className="gold-text font-bold">無料で鑑定を始める</span>
              <span className="text-[#c9a84c] group-hover:translate-x-1 transition-transform">→</span>
            </Link>
            <p className="text-xs text-[#f0e8d8]/25 tracking-wider">
              登録不要 · 1日3回まで無料
            </p>
          </div>

        </div>
      </main>
    </>
  );
}
