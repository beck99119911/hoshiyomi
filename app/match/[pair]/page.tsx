import { notFound } from "next/navigation";
import { readFileSync, existsSync } from "fs";
import { join } from "path";
import Link from "next/link";
import type { Metadata } from "next";

const ZODIACS = [
  { slug: "aries", name: "牡羊座" }, { slug: "taurus", name: "牡牛座" },
  { slug: "gemini", name: "双子座" }, { slug: "cancer", name: "蟹座" },
  { slug: "leo", name: "獅子座" }, { slug: "virgo", name: "乙女座" },
  { slug: "libra", name: "天秤座" }, { slug: "scorpio", name: "蠍座" },
  { slug: "sagittarius", name: "射手座" }, { slug: "capricorn", name: "山羊座" },
  { slug: "aquarius", name: "水瓶座" }, { slug: "pisces", name: "魚座" },
];

type MatchData = {
  slug1: string; slug2: string; name1: string; name2: string;
  score: number; keyword: string; summary: string;
  love: string; friendship: string; work: string;
  strength: string; challenge: string; advice: string;
};

function getData(pair: string): MatchData | null {
  const filePath = join(process.cwd(), "data/match", `${pair}.json`);
  if (!existsSync(filePath)) return null;
  try { return JSON.parse(readFileSync(filePath, "utf-8")); } catch { return null; }
}

export function generateStaticParams() {
  const params: { pair: string }[] = [];
  for (const s1 of ZODIACS) {
    for (const s2 of ZODIACS) {
      const pair = `${s1.slug}-${s2.slug}`;
      if (existsSync(join(process.cwd(), "data/match", `${pair}.json`))) {
        params.push({ pair });
      }
    }
  }
  return params;
}

export async function generateMetadata({ params }: { params: Promise<{ pair: string }> }): Promise<Metadata> {
  const { pair } = await params;
  const data = getData(pair);
  if (!data) return {};
  const title = `${data.name1}と${data.name2}の相性【${data.score}点】| 星詠み`;
  const description = `${data.name1}×${data.name2}の相性スコアは${data.score}点。${data.keyword}。恋愛・友情・仕事の相性をAIが詳しく解説。`;
  return {
    title, description,
    openGraph: { title, description, url: `https://hoshiyomi.xyz/match/${pair}`, siteName: "星詠み", locale: "ja_JP", type: "article" },
    twitter: { card: "summary", title, description, site: "@hoshiyomi_xyz" },
    alternates: { canonical: `https://hoshiyomi.xyz/match/${pair}` },
  };
}

function ScoreBar({ score }: { score: number }) {
  return (
    <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: "rgba(212,168,76,0.12)" }}>
      <div className="h-full rounded-full" style={{ width: `${score}%`, background: "linear-gradient(90deg, #d4a84c, #f0d898)", boxShadow: "0 0 6px rgba(212,168,76,0.35)" }} />
    </div>
  );
}

export default async function MatchPage({ params }: { params: Promise<{ pair: string }> }) {
  const { pair } = await params;
  const data = getData(pair);
  if (!data) notFound();

  return (
    <main className="relative z-10 min-h-screen text-[#f0e8d8] px-6 py-12">
      <div className="max-w-lg mx-auto">

        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-12">
          <Link href="/" className="text-xs tracking-[0.3em] text-[#d4a84c]/60 hover:text-[#d4a84c] transition-colors uppercase">
            ← Hoshiyomi
          </Link>
          <span className="text-[9px] tracking-[0.3em] text-[#d4a84c]/50 uppercase">Compatibility</span>
        </div>

        {/* タイトル */}
        <div className="text-center mb-12 space-y-3">
          <p className="text-[10px] tracking-[0.4em] text-[#d4a84c]/60 uppercase">Compatibility Reading</p>
          <h1 className="text-2xl font-bold">
            <span className="gold-text">{data.name1}</span>
            <span className="text-[#f5eedd]/40 mx-3">×</span>
            <span className="gold-text">{data.name2}</span>
          </h1>
          <div className="text-5xl font-bold gold-text">{data.score}<span className="text-2xl text-[#d4a84c]/60">点</span></div>
          <ScoreBar score={data.score} />
          <p className="text-sm text-[#f5eedd]/50 tracking-wider mt-2">{data.keyword}</p>
        </div>

        {/* 概要 */}
        <div className="mb-8 py-6" style={{ borderTop: "1px solid rgba(212,168,76,0.3)" }}>
          <div style={{ borderLeft: "2px solid rgba(212,168,76,0.4)", paddingLeft: "18px" }}>
            <p className="text-sm text-[#f5eedd]/85 leading-[2.1]">{data.summary}</p>
          </div>
        </div>

        {/* 3項目スコア */}
        <div className="space-y-4 mb-8">
          {[
            { label: "恋愛相性", value: data.love, icon: "♥" },
            { label: "友情・人間関係", value: data.friendship, icon: "◈" },
            { label: "仕事・ビジネス", value: data.work, icon: "✦" },
          ].map(({ label, value, icon }) => (
            <div key={label} className="p-5"
              style={{ background: "rgba(212,168,76,0.04)", border: "1px solid rgba(212,168,76,0.15)" }}>
              <p className="text-[9px] tracking-[0.3em] text-[#d4a84c]/50 uppercase mb-2">{icon} {label}</p>
              <p className="text-sm text-[#f5eedd]/80 leading-relaxed">{value}</p>
            </div>
          ))}
        </div>

        {/* 強み・課題 */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          <div className="p-4" style={{ background: "rgba(212,168,76,0.06)", border: "1px solid rgba(212,168,76,0.2)" }}>
            <p className="text-[9px] tracking-[0.2em] text-[#d4a84c]/50 uppercase mb-2">強み</p>
            <p className="text-xs text-[#e8d08a] leading-relaxed">{data.strength}</p>
          </div>
          <div className="p-4" style={{ background: "rgba(180,100,100,0.06)", border: "1px solid rgba(212,168,76,0.15)" }}>
            <p className="text-[9px] tracking-[0.2em] text-[#d4a84c]/50 uppercase mb-2">注意点</p>
            <p className="text-xs text-[#f5eedd]/70 leading-relaxed">{data.challenge}</p>
          </div>
        </div>

        {/* アドバイス */}
        <div className="mb-12 text-center py-4" style={{ border: "1px solid rgba(212,168,76,0.2)" }}>
          <p className="text-[9px] tracking-[0.3em] text-[#d4a84c]/45 uppercase mb-3">Advice</p>
          <p className="text-sm text-[#e8d08a]/85 italic px-4 leading-relaxed">&ldquo;{data.advice}&rdquo;</p>
        </div>

        {/* CTA */}
        <div className="p-6 text-center space-y-4"
          style={{ background: "rgba(212,168,76,0.04)", border: "1px solid rgba(212,168,76,0.25)" }}>
          <p className="text-[9px] tracking-[0.4em] text-[#d4a84c]/50 uppercase">Personal Reading</p>
          <p className="text-sm text-[#f0e8d8]/70 leading-relaxed">
            生年月日・血液型を入力すると、<br />AIがあなた専用の相性を詳しく鑑定します。
          </p>
          <Link href="/compatibility"
            className="block w-full py-4 text-sm tracking-[0.3em] uppercase transition-all duration-300 hover:opacity-80"
            style={{ background: "linear-gradient(135deg, rgba(212,168,76,0.18), rgba(212,168,76,0.08))", border: "1px solid rgba(212,168,76,0.5)", color: "#e8d08a" }}>
            AI相性診断を受ける →
          </Link>
          <p className="text-[10px] text-[#f0e8d8]/30 tracking-wider">登録不要・1日3回まで無料</p>
        </div>

        {/* 逆パターンへのリンク */}
        {data.slug1 !== data.slug2 && (
          <div className="mt-6 text-center">
            <Link href={`/match/${data.slug2}-${data.slug1}`}
              className="text-xs text-[#d4a84c]/40 hover:text-[#d4a84c]/70 transition-colors tracking-wider">
              {data.name2} × {data.name1} の相性を見る →
            </Link>
          </div>
        )}

      </div>
    </main>
  );
}
