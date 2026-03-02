"use client";

import { useState } from "react";
import Link from "next/link";

const BLOOD_TYPES = ["A", "B", "O", "AB"];
const MAX_DAILY = 3;
const SHARE_BONUS = 2;
const STORAGE_KEY = "uranai_count";
const SHARE_KEY = "uranai_shared";

function getDailyData(): { count: number; bonus: number } {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return { count: 0, bonus: 0 };
    const { date, count, bonus = 0 } = JSON.parse(stored);
    if (date !== new Date().toDateString()) return { count: 0, bonus: 0 };
    return { count, bonus };
  } catch {
    return { count: 0, bonus: 0 };
  }
}

function getDailyCount(): number {
  return getDailyData().count;
}

function getMaxDaily(): number {
  return MAX_DAILY + getDailyData().bonus;
}

function incrementDailyCount() {
  const { count, bonus } = getDailyData();
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ date: new Date().toDateString(), count: count + 1, bonus })
  );
}

function addShareBonus() {
  const today = new Date().toDateString();
  const shared = localStorage.getItem(SHARE_KEY);
  if (shared === today) return false; // 1日1回まで
  const { count, bonus } = getDailyData();
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ date: today, count, bonus: bonus + SHARE_BONUS })
  );
  localStorage.setItem(SHARE_KEY, today);
  return true;
}

type FortuneResult = {
  scores: { overall: number; love: number; work: number; money: number; health: number };
  message: string;
  luckyColor: string;
  luckyItem: string;
  cautionDay: string;
  quote: string;
  zodiac: string;
  lifePathNumber: number;
};

const SCORE_LABELS = [
  { key: "overall", label: "総合運" },
  { key: "love",    label: "恋愛運" },
  { key: "work",    label: "仕事運" },
  { key: "money",   label: "金　運" },
  { key: "health",  label: "健康運" },
];

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

export default function FortunePage() {
  const [birthDate, setBirthDate] = useState("");
  const [bloodType, setBloodType] = useState("");
  const [concern, setConcern] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FortuneResult | null>(null);
  const [error, setError] = useState("");
  const [shareBonusGiven, setShareBonusGiven] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const count = getDailyCount();
    const max = getMaxDaily();
    if (count >= max) {
      setError(`本日の鑑定（${max}回）に達しました。また明日お越しください。`);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/fortune", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ birthDate, bloodType, concern }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      incrementDailyCount();
      setResult(data);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }

  const shareText = result
    ? `🔮 星詠みで今週の運勢を鑑定しました\n${result.zodiac} × ライフパス${result.lifePathNumber}\n\n"${result.quote}"\n\n#星詠み #AI占い`
    : "";

  return (
    <>
      <div className="stars" />
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
            <span className="text-xs tracking-widest text-[#f5eedd]/35 uppercase">
              Free Reading
            </span>
          </div>

          {/* ── 結果画面 ── */}
          {result ? (
            <div className="scale-in space-y-8">

              {/* ヘッダー */}
              <div className="text-center space-y-2">
                <p className="text-[10px] tracking-[0.4em] text-[#d4a84c]/60 uppercase">
                  Your Reading
                </p>
                <h1 className="text-3xl font-bold">
                  <span className="gold-text">{result.zodiac}</span>
                </h1>
                <p className="text-xs text-[#f5eedd]/55 tracking-wider">
                  ライフパス {result.lifePathNumber} の鑑定
                </p>
              </div>

              {/* スコア */}
              <div
                className="glass gold-border p-7 space-y-4"
                style={{ borderTop: "1px solid rgba(212,168,76,0.5)" }}
              >
                {SCORE_LABELS.map(({ key, label }) => (
                  <ScoreRow
                    key={key}
                    label={label}
                    score={result.scores[key as keyof typeof result.scores]}
                  />
                ))}
              </div>

              {/* メッセージ */}
              <div className="space-y-1">
                <p className="text-[10px] tracking-[0.3em] text-[#d4a84c]/50 uppercase">Message</p>
                <div
                  className="glass gold-border p-7"
                  style={{ borderLeft: "2px solid rgba(212,168,76,0.5)" }}
                >
                  <p className="text-sm text-[#f5eedd]/90 leading-[2]">{result.message}</p>
                </div>
              </div>

              {/* ラッキー情報 */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Lucky Color", value: result.luckyColor },
                  { label: "Lucky Item",  value: result.luckyItem },
                  { label: "Caution",     value: result.cautionDay },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="glass gold-border p-4 text-center"
                  >
                    <p className="text-[9px] tracking-[0.2em] text-[#d4a84c]/50 uppercase mb-2">{label}</p>
                    <p className="text-sm font-bold text-[#e8d08a]">{value}</p>
                  </div>
                ))}
              </div>

              {/* 名言 */}
              <div className="text-center py-6">
                <div className="divider mb-6">Today&apos;s Words</div>
                <p className="text-lg text-[#e8d08a]/90 italic leading-relaxed">
                  &ldquo;{result.quote}&rdquo;
                </p>
              </div>

              {/* シェア */}
              <div className="space-y-3">
                <div className="text-center space-y-1">
                  <p className="text-[10px] tracking-[0.3em] text-[#d4a84c]/50 uppercase">Share</p>
                  {!shareBonusGiven && (
                    <p className="text-[10px] text-[#d4a84c]/70 tracking-wider">
                      シェアすると本日の鑑定回数が +{SHARE_BONUS}回 増えます
                    </p>
                  )}
                  {shareBonusGiven && (
                    <p className="text-[10px] text-[#d4a84c] tracking-wider">
                      ✨ +{SHARE_BONUS}回プレゼントしました！
                    </p>
                  )}
                </div>
                <div className="flex gap-3">
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => { if (addShareBonus()) setShareBonusGiven(true); }}
                    className="flex-1 py-3 text-sm tracking-wider text-center transition-all"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.12)",
                    }}
                  >
                    𝕏 でシェア
                  </a>
                  <a
                    href={`https://line.me/R/share?text=${encodeURIComponent(shareText)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => { if (addShareBonus()) setShareBonusGiven(true); }}
                    className="flex-1 py-3 text-sm tracking-wider text-center transition-all"
                    style={{
                      background: "rgba(0,195,0,0.08)",
                      border: "1px solid rgba(0,195,0,0.2)",
                    }}
                  >
                    LINE でシェア
                  </a>
                </div>
              </div>

              <button
                onClick={() => setResult(null)}
                className="w-full text-xs tracking-[0.3em] text-[#f5eedd]/40 hover:text-[#f0e8d8]/50 py-3 uppercase transition-colors"
              >
                もう一度鑑定する
              </button>
            </div>

          ) : (
            /* ── 入力フォーム ── */
            <div>
              <div className="text-center mb-12">
                <p className="text-[10px] tracking-[0.4em] text-[#d4a84c]/60 uppercase mb-3">
                  Free Reading
                </p>
                <h1 className="text-3xl font-bold">
                  <span className="gold-text">無料鑑定</span>
                </h1>
                <p className="text-xs text-[#f0e8d8]/30 tracking-wider mt-2">
                  1日3回まで · 登録不要
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">

                {/* 生年月日 */}
                <div>
                  <label className="block text-[10px] tracking-[0.3em] text-[#d4a84c]/60 uppercase mb-3">
                    Birth Date · 生年月日
                  </label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    required
                    max={new Date().toISOString().split("T")[0]}
                    className="w-full px-5 py-4 text-sm text-[#f0e8d8] bg-transparent focus:outline-none"
                    style={{
                      background: "rgba(212,168,76,0.04)",
                      border: "1px solid rgba(212,168,76,0.25)",
                    }}
                  />
                </div>

                {/* 血液型 */}
                <div>
                  <label className="block text-[10px] tracking-[0.3em] text-[#d4a84c]/60 uppercase mb-3">
                    Blood Type · 血液型
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {BLOOD_TYPES.map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setBloodType(type)}
                        className="py-3 text-sm tracking-wider transition-all duration-200"
                        style={
                          bloodType === type
                            ? {
                                background: "rgba(212,168,76,0.15)",
                                border: "1px solid rgba(212,168,76,0.7)",
                                color: "#e8d08a",
                              }
                            : {
                                background: "rgba(212,168,76,0.03)",
                                border: "1px solid rgba(212,168,76,0.15)",
                                color: "rgba(240,232,216,0.4)",
                              }
                        }
                      >
                        {type}型
                      </button>
                    ))}
                  </div>
                </div>

                {/* 悩み */}
                <div>
                  <label className="block text-[10px] tracking-[0.3em] text-[#d4a84c]/60 uppercase mb-3">
                    Your Question · 今の悩み
                  </label>
                  <textarea
                    value={concern}
                    onChange={(e) => setConcern(e.target.value)}
                    required
                    placeholder="今、気になっていること・聞きたいことを教えてください"
                    rows={4}
                    className="w-full px-5 py-4 text-sm text-[#f0e8d8] placeholder-[#f0e8d8]/20 bg-transparent focus:outline-none resize-none"
                    style={{
                      background: "rgba(212,168,76,0.04)",
                      border: "1px solid rgba(212,168,76,0.25)",
                    }}
                  />
                </div>

                {error && (
                  <p className="text-xs text-red-400/80 text-center tracking-wider">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading || !birthDate || !bloodType || !concern}
                  className="w-full py-4 text-sm tracking-[0.3em] uppercase transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{
                    background: loading
                      ? "rgba(212,168,76,0.08)"
                      : "linear-gradient(135deg, rgba(212,168,76,0.18), rgba(212,168,76,0.08))",
                    border: "1px solid rgba(212,168,76,0.5)",
                    color: "#e8d08a",
                  }}
                >
                  {loading ? (
                    <span className="shimmer inline-block">鑑定中 ...</span>
                  ) : (
                    "鑑定する →"
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
