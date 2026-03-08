import { notFound } from "next/navigation";
import { readFileSync, existsSync } from "fs";
import { join } from "path";
import Link from "next/link";
import type { Metadata } from "next";

const SLUG_TO_NAME: Record<string, string> = {
  aries: "牡羊座", taurus: "牡牛座", gemini: "双子座", cancer: "蟹座",
  leo: "獅子座", virgo: "乙女座", libra: "天秤座", scorpio: "蠍座",
  sagittarius: "射手座", capricorn: "山羊座", aquarius: "水瓶座", pisces: "魚座",
};

const ALL_SLUGS = Object.keys(SLUG_TO_NAME);

type ZodiacData = {
  slug: string; name: string; period: string; symbol: string; element: string;
  keyword: string; personality: string; love: string; work: string; money: string; health: string;
  luckyColor: string; luckyNumber: number; luckyItem: string;
  compatibleSigns: string[]; weekFortune: string; yearFortune2026: string;
};

function getData(slug: string): ZodiacData | null {
  const filePath = join(process.cwd(), "data/zodiac", `${slug}.json`);
  if (!existsSync(filePath)) return null;
  try { return JSON.parse(readFileSync(filePath, "utf-8")); } catch { return null; }
}

export function generateStaticParams() {
  return ALL_SLUGS
    .filter((slug) => existsSync(join(process.cwd(), "data/zodiac", `${slug}.json`)))
    .map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const data = getData(slug);
  if (!data) return {};
  const title = `${data.name}の性格・運勢・2026年【完全解説】| 星詠み`;
  const description = `${data.name}（${data.period}）の性格・恋愛・仕事・2026年の運勢をAIが詳しく解説。ラッキーカラーは${data.luckyColor}。相性の良い星座は${data.compatibleSigns.join("・")}。`;
  return {
    title, description,
    openGraph: { title, description, url: `https://hoshiyomi.xyz/zodiac/${slug}`, siteName: "星詠み", locale: "ja_JP", type: "article" },
    twitter: { card: "summary", title, description, site: "@hoshiyomi_xyz" },
    alternates: { canonical: `https://hoshiyomi.xyz/zodiac/${slug}` },
  };
}

export default async function ZodiacPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = getData(slug);
  if (!data) notFound();

  return (
    <main className="relative z-10 min-h-screen text-[#f0e8d8] px-6 py-12">
      <div className="max-w-lg mx-auto">

        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-12">
          <Link href="/" className="text-xs tracking-[0.3em] text-[#d4a84c]/60 hover:text-[#d4a84c] transition-colors uppercase">
            ← Hoshiyomi
          </Link>
          <span className="text-[9px] tracking-[0.3em] text-[#d4a84c]/50 uppercase">Zodiac Reading</span>
        </div>

        {/* タイトル */}
        <div className="text-center mb-12 space-y-3">
          <p className="text-4xl">{data.symbol}</p>
          <h1 className="text-4xl font-bold"><span className="gold-text">{data.name}</span></h1>
          <p className="text-sm text-[#f5eedd]/50 tracking-wider">{data.period} · {data.element}のサイン</p>
          <div className="inline-block mt-2 px-4 py-1.5 text-xs tracking-[0.25em]"
            style={{ border: "1px solid rgba(212,168,76,0.35)", color: "#e8d08a" }}>
            {data.keyword}
          </div>
        </div>

        {/* 性格 */}
        <div className="mb-8 py-6" style={{ borderTop: "1px solid rgba(212,168,76,0.3)" }}>
          <p className="text-[9px] tracking-[0.35em] text-[#d4a84c]/45 uppercase mb-4">Personality</p>
          <div style={{ borderLeft: "2px solid rgba(212,168,76,0.4)", paddingLeft: "18px" }}>
            <p className="text-sm text-[#f5eedd]/85 leading-[2.1]">{data.personality}</p>
          </div>
        </div>

        {/* 恋愛・仕事・金運・健康 */}
        <div className="space-y-4 mb-8">
          {[
            { label: "恋愛傾向", value: data.love, icon: "♥" },
            { label: "仕事・才能", value: data.work, icon: "✦" },
            { label: "金運", value: data.money, icon: "◎" },
            { label: "健康", value: data.health, icon: "◇" },
          ].map(({ label, value, icon }) => (
            <div key={label} className="p-5"
              style={{ background: "rgba(212,168,76,0.04)", border: "1px solid rgba(212,168,76,0.15)" }}>
              <p className="text-[9px] tracking-[0.3em] text-[#d4a84c]/50 uppercase mb-2">{icon} {label}</p>
              <p className="text-sm text-[#f5eedd]/80 leading-relaxed">{value}</p>
            </div>
          ))}
        </div>

        {/* ラッキー情報 */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { label: "Lucky Color", value: data.luckyColor },
            { label: "Lucky No.", value: String(data.luckyNumber) },
            { label: "Lucky Item", value: data.luckyItem },
          ].map(({ label, value }) => (
            <div key={label} className="p-4 text-center"
              style={{ background: "rgba(212,168,76,0.04)", border: "1px solid rgba(212,168,76,0.15)" }}>
              <p className="text-[9px] tracking-[0.2em] text-[#d4a84c]/45 uppercase mb-2">{label}</p>
              <p className="text-sm font-bold text-[#e8d08a]">{value}</p>
            </div>
          ))}
        </div>

        {/* 相性 */}
        <div className="text-center mb-8 py-4"
          style={{ borderTop: "1px solid rgba(212,168,76,0.2)", borderBottom: "1px solid rgba(212,168,76,0.2)" }}>
          <p className="text-[9px] tracking-[0.3em] text-[#d4a84c]/45 uppercase mb-3">Best Match</p>
          <div className="flex justify-center gap-4">
            {data.compatibleSigns.map((sign) => (
              <span key={sign} className="text-base font-bold text-[#e8d08a]">{sign}</span>
            ))}
          </div>
        </div>

        {/* 今週の運勢 */}
        <div className="mb-8">
          <p className="text-[9px] tracking-[0.35em] text-[#d4a84c]/45 uppercase mb-4">今週の運勢</p>
          <div style={{ borderLeft: "2px solid rgba(212,168,76,0.4)", paddingLeft: "18px" }}>
            <p className="text-sm text-[#f5eedd]/85 leading-[2.1]">{data.weekFortune}</p>
          </div>
        </div>

        {/* 2026年の運勢 */}
        <div className="mb-12">
          <p className="text-[9px] tracking-[0.35em] text-[#d4a84c]/45 uppercase mb-4">2026年の運勢</p>
          <div style={{ borderLeft: "2px solid rgba(212,168,76,0.4)", paddingLeft: "18px" }}>
            <p className="text-sm text-[#f5eedd]/85 leading-[2.1]">{data.yearFortune2026}</p>
          </div>
        </div>

        {/* CTA */}
        <div className="p-6 text-center space-y-4"
          style={{ background: "rgba(212,168,76,0.04)", border: "1px solid rgba(212,168,76,0.25)" }}>
          <p className="text-[9px] tracking-[0.4em] text-[#d4a84c]/50 uppercase">Personal Reading</p>
          <p className="text-sm text-[#f0e8d8]/70 leading-relaxed">
            星座占いはここまで。AIに悩みを入力すると、<br />あなただけの個別鑑定が届きます。
          </p>
          <Link href="/fortune"
            className="block w-full py-4 text-sm tracking-[0.3em] uppercase transition-all duration-300 hover:opacity-80"
            style={{ background: "linear-gradient(135deg, rgba(212,168,76,0.18), rgba(212,168,76,0.08))", border: "1px solid rgba(212,168,76,0.5)", color: "#e8d08a" }}>
            今すぐAI鑑定を受ける →
          </Link>
          <p className="text-[10px] text-[#f0e8d8]/30 tracking-wider">登録不要・1日3回まで無料</p>
        </div>

        {/* 他の星座へのナビ */}
        <div className="mt-8">
          <p className="text-[9px] tracking-[0.3em] text-[#d4a84c]/40 uppercase mb-3 text-center">Other Signs</p>
          <div className="flex flex-wrap justify-center gap-2">
            {ALL_SLUGS.filter((s) => s !== slug).map((s) => (
              <Link key={s} href={`/zodiac/${s}`}
                className="text-[11px] text-[#f5eedd]/30 hover:text-[#d4a84c]/60 transition-colors tracking-wider">
                {SLUG_TO_NAME[s]}
              </Link>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}
