import { notFound } from "next/navigation";
import { readFileSync, existsSync } from "fs";
import { join } from "path";
import Link from "next/link";
import type { Metadata } from "next";

type BirthdayData = {
  month: number;
  day: number;
  zodiac: string;
  keyword: string;
  personality: string;
  love: string;
  work: string;
  money: string;
  luckyColor: string;
  luckyNumber: number;
  luckyItem: string;
  compatibleZodiac: string;
  yearFortune: string;
};

function getData(mmdd: string): BirthdayData | null {
  const filePath = join(process.cwd(), "data/birthday", `${mmdd}.json`);
  if (!existsSync(filePath)) return null;
  try {
    return JSON.parse(readFileSync(filePath, "utf-8"));
  } catch {
    return null;
  }
}

export async function generateStaticParams() {
  const params: { mmdd: string }[] = [];
  const daysInMonth = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  for (let m = 1; m <= 12; m++) {
    for (let d = 1; d <= daysInMonth[m]; d++) {
      const mmdd = `${String(m).padStart(2, "0")}${String(d).padStart(2, "0")}`;
      const filePath = join(process.cwd(), "data/birthday", `${mmdd}.json`);
      if (existsSync(filePath)) {
        params.push({ mmdd });
      }
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ mmdd: string }>;
}): Promise<Metadata> {
  const { mmdd } = await params;
  const data = getData(mmdd);
  if (!data) return {};

  const title = `${data.month}月${data.day}日生まれの性格・運勢 | 星詠み`;
  const description = `${data.month}月${data.day}日生まれ（${data.zodiac}）の性格・恋愛・仕事・2026年の運勢をAIが詳しく解説。ラッキーカラーは${data.luckyColor}、相性の良い星座は${data.compatibleZodiac}。`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://hoshiyomi.xyz/birthday/${mmdd}`,
      siteName: "星詠み",
      locale: "ja_JP",
      type: "article",
    },
    twitter: {
      card: "summary",
      title,
      description,
      site: "@hoshiyomi_xyz",
    },
    alternates: {
      canonical: `https://hoshiyomi.xyz/birthday/${mmdd}`,
    },
  };
}

export default async function BirthdayPage({
  params,
}: {
  params: Promise<{ mmdd: string }>;
}) {
  const { mmdd } = await params;
  const data = getData(mmdd);
  if (!data) notFound();

  const sections = [
    { label: "恋愛傾向", value: data.love, icon: "♥" },
    { label: "仕事・才能", value: data.work, icon: "✦" },
    { label: "金運", value: data.money, icon: "◎" },
  ];

  return (
    <main className="relative z-10 min-h-screen text-[#f0e8d8] px-6 py-12">
      <div className="max-w-lg mx-auto">

        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-12">
          <Link
            href="/"
            className="text-xs tracking-[0.3em] text-[#d4a84c]/60 hover:text-[#d4a84c] transition-colors uppercase"
          >
            ← Hoshiyomi
          </Link>
          <span className="text-[9px] tracking-[0.3em] text-[#d4a84c]/50 uppercase">Birthday Reading</span>
        </div>

        {/* タイトル */}
        <div className="text-center mb-12 space-y-3">
          <p className="text-[10px] tracking-[0.4em] text-[#d4a84c]/60 uppercase">
            {data.zodiac}
          </p>
          <h1 className="text-4xl font-bold">
            <span className="gold-text">{data.month}月{data.day}日</span>
          </h1>
          <p className="text-sm text-[#f5eedd]/50 tracking-wider">生まれの運命と性格</p>
          <div
            className="inline-block mt-2 px-4 py-1.5 text-xs tracking-[0.25em]"
            style={{ border: "1px solid rgba(212,168,76,0.35)", color: "#e8d08a" }}
          >
            {data.keyword}
          </div>
        </div>

        {/* 性格 */}
        <div
          className="mb-8 py-6"
          style={{ borderTop: "1px solid rgba(212,168,76,0.3)" }}
        >
          <p className="text-[9px] tracking-[0.35em] text-[#d4a84c]/45 uppercase mb-4">Personality</p>
          <div style={{ borderLeft: "2px solid rgba(212,168,76,0.4)", paddingLeft: "18px" }}>
            <p className="text-sm text-[#f5eedd]/85 leading-[2.1]">{data.personality}</p>
          </div>
        </div>

        {/* 恋愛・仕事・金運 */}
        <div className="space-y-5 mb-8">
          {sections.map(({ label, value, icon }) => (
            <div
              key={label}
              className="p-5"
              style={{ background: "rgba(212,168,76,0.04)", border: "1px solid rgba(212,168,76,0.15)" }}
            >
              <p className="text-[9px] tracking-[0.3em] text-[#d4a84c]/50 uppercase mb-2">
                {icon} {label}
              </p>
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
            <div
              key={label}
              className="p-4 text-center"
              style={{ background: "rgba(212,168,76,0.04)", border: "1px solid rgba(212,168,76,0.15)" }}
            >
              <p className="text-[9px] tracking-[0.2em] text-[#d4a84c]/45 uppercase mb-2">{label}</p>
              <p className="text-sm font-bold text-[#e8d08a]">{value}</p>
            </div>
          ))}
        </div>

        {/* 相性 */}
        <div className="text-center mb-8 py-4" style={{ borderTop: "1px solid rgba(212,168,76,0.2)", borderBottom: "1px solid rgba(212,168,76,0.2)" }}>
          <p className="text-[9px] tracking-[0.3em] text-[#d4a84c]/45 uppercase mb-2">Best Match</p>
          <p className="text-lg font-bold text-[#e8d08a]">{data.compatibleZodiac}</p>
          <p className="text-[10px] text-[#f5eedd]/40 tracking-wider mt-1">最も相性の良い星座</p>
        </div>

        {/* 2026年の運勢 */}
        <div className="mb-12">
          <p className="text-[9px] tracking-[0.35em] text-[#d4a84c]/45 uppercase mb-4">2026年の運勢</p>
          <div style={{ borderLeft: "2px solid rgba(212,168,76,0.4)", paddingLeft: "18px" }}>
            <p className="text-sm text-[#f5eedd]/85 leading-[2.1]">{data.yearFortune}</p>
          </div>
        </div>

        {/* CTA */}
        <div
          className="p-6 text-center space-y-4"
          style={{ background: "rgba(212,168,76,0.04)", border: "1px solid rgba(212,168,76,0.25)" }}
        >
          <p className="text-[9px] tracking-[0.4em] text-[#d4a84c]/50 uppercase">Personal Reading</p>
          <p className="text-sm text-[#f0e8d8]/70 leading-relaxed">
            誕生日占いはここまで。<br />
            AIに悩みを打ち明けると、あなただけの鑑定をお届けします。
          </p>
          <Link
            href="/fortune"
            className="block w-full py-4 text-sm tracking-[0.3em] uppercase transition-all duration-300 hover:opacity-80"
            style={{
              background: "linear-gradient(135deg, rgba(212,168,76,0.18), rgba(212,168,76,0.08))",
              border: "1px solid rgba(212,168,76,0.5)",
              color: "#e8d08a",
            }}
          >
            今すぐAI鑑定を受ける →
          </Link>
          <p className="text-[10px] text-[#f0e8d8]/30 tracking-wider">登録不要・1日3回まで無料</p>
        </div>

        {/* 他の誕生日へのナビ */}
        <div className="mt-8 text-center">
          <p className="text-[9px] tracking-[0.3em] text-[#d4a84c]/40 uppercase mb-3">Other Birthdays</p>
          <div className="flex justify-center gap-4 text-xs text-[#f5eedd]/30">
            {data.day > 1 && (
              <Link
                href={`/birthday/${String(data.month).padStart(2, "0")}${String(data.day - 1).padStart(2, "0")}`}
                className="hover:text-[#d4a84c]/60 transition-colors"
              >
                ← {data.month}月{data.day - 1}日
              </Link>
            )}
            {data.day < 28 && (
              <Link
                href={`/birthday/${String(data.month).padStart(2, "0")}${String(data.day + 1).padStart(2, "0")}`}
                className="hover:text-[#d4a84c]/60 transition-colors"
              >
                {data.month}月{data.day + 1}日 →
              </Link>
            )}
          </div>
        </div>

      </div>
    </main>
  );
}
