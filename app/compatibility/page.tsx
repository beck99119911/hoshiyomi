"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const BLOOD_TYPES = ["A", "B", "O", "AB"];
const MAX_DAILY = 3;
const STORAGE_KEY = "uranai_count";

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

function getDailyCount(): number { return getDailyData().count; }
function getMaxDaily(): number { return MAX_DAILY + getDailyData().bonus; }
function incrementDailyCount() {
  const { count, bonus } = getDailyData();
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: new Date().toDateString(), count: count + 1, bonus }));
}

function getDates(start: number, end: number, label: string) {
  return Array.from({ length: end - start + 1 }, (_, i) => ({
    value: String(start + i),
    label: `${start + i}${label}`,
  }));
}

type PersonInput = {
  birthYear: string;
  birthMonth: string;
  birthDay: string;
  bloodType: string;
};

type CompatibilityResult = {
  scores: { overall: number; love: number; values: number; future: number };
  percentage: number;
  message: string;
  strength: string;
  challenge: string;
  advice: string;
  keyword: string;
  personA: { zodiac: string; lifePathNumber: number; bloodType: string };
  personB: { zodiac: string; lifePathNumber: number; bloodType: string };
};

const SCORE_LABELS = [
  { key: "overall", label: "総合相性" },
  { key: "love",    label: "恋愛相性" },
  { key: "values",  label: "価値観" },
  { key: "future",  label: "将来性" },
];

function ScoreRow({ label, score, delay = "0s" }: { label: string; score: number; delay?: string }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1.5">
        <span className="text-[#f5eedd]/60 tracking-wider">{label}</span>
        <span className="text-[#d4a84c]/80 tracking-widest">
          {"●".repeat(score)}{"○".repeat(5 - score)}
        </span>
      </div>
      <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(212,168,76,0.12)" }}>
        <div
          className="bar-anim h-full rounded-full"
          style={{
            width: `${score * 20}%`,
            background: "linear-gradient(90deg, #d4a84c, #f0d898)",
            boxShadow: "0 0 6px rgba(212,168,76,0.35)",
            ["--delay" as string]: delay,
          } as React.CSSProperties}
        />
      </div>
    </div>
  );
}

function PersonForm({
  label,
  value,
  onChange,
}: {
  label: string;
  value: PersonInput;
  onChange: (v: PersonInput) => void;
}) {
  return (
    <div className="space-y-4">
      <p className="text-[10px] tracking-[0.35em] text-[#d4a84c]/60 uppercase">{label}</p>

      {/* 生年月日 */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { field: "birthYear" as const, placeholder: "年", opts: getDates(1924, 2010, "年").reverse() },
          { field: "birthMonth" as const, placeholder: "月", opts: getDates(1, 12, "月") },
          { field: "birthDay" as const, placeholder: "日", opts: getDates(1, 31, "日") },
        ].map(({ field, placeholder, opts }) => (
          <select
            key={field}
            value={value[field]}
            onChange={(e) => onChange({ ...value, [field]: e.target.value })}
            className="w-full px-2 py-3 text-sm focus:outline-none appearance-none text-center"
            style={{
              background: "rgba(212,168,76,0.04)",
              border: "1px solid rgba(212,168,76,0.25)",
              color: value[field] ? "#f0e8d8" : "rgba(240,232,216,0.3)",
            }}
          >
            <option value="">{placeholder}</option>
            {opts.map((o) => (
              <option key={o.value} value={o.value} style={{ background: "#0d0e20" }}>
                {o.label}
              </option>
            ))}
          </select>
        ))}
      </div>

      {/* 血液型 */}
      <div className="grid grid-cols-4 gap-2">
        {BLOOD_TYPES.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => onChange({ ...value, bloodType: type })}
            className="py-2 text-sm tracking-wider transition-all"
            style={
              value.bloodType === type
                ? { background: "rgba(212,168,76,0.15)", border: "1px solid rgba(212,168,76,0.7)", color: "#e8d08a" }
                : { background: "rgba(212,168,76,0.03)", border: "1px solid rgba(212,168,76,0.15)", color: "rgba(240,232,216,0.4)" }
            }
          >
            {type}型
          </button>
        ))}
      </div>
    </div>
  );
}

export default function CompatibilityPage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const [isPremium, setIsPremium] = useState(false);
  const [premiumChecked, setPremiumChecked] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    if (sessionStatus === "loading") return;
    if (!session?.user) { setPremiumChecked(true); return; }

    const cached = localStorage.getItem(`premium_${session.user.id}`);
    if (cached === "1") { setIsPremium(true); setPremiumChecked(true); }

    fetch("/api/subscription/status")
      .then((r) => r.json())
      .then((d) => {
        setIsPremium(d.isPremium);
        setPremiumChecked(true);
        const uid = session?.user?.id;
        if (uid) {
          if (d.isPremium) localStorage.setItem(`premium_${uid}`, "1");
          else localStorage.removeItem(`premium_${uid}`);
        }
      })
      .catch(() => setPremiumChecked(true));
  }, [session, sessionStatus]);

  function handleUpgrade() {
    if (!session?.user) return;
    router.push("/subscribe");
  }

  const emptyPerson: PersonInput = { birthYear: "", birthMonth: "", birthDay: "", bloodType: "" };
  const [personA, setPersonA] = useState<PersonInput>(emptyPerson);
  const [personB, setPersonB] = useState<PersonInput>(emptyPerson);
  const [result, setResult] = useState<CompatibilityResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isValid = (p: PersonInput) => p.birthYear && p.birthMonth && p.birthDay && p.bloodType;
  const canSubmit = isValid(personA) && isValid(personB);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!isPremium) {
      const count = getDailyCount();
      const max = getMaxDaily();
      if (count >= max) {
        setError(`本日の鑑定（${max}回）に達しました。プレミアムプランで無制限に鑑定できます。`);
        return;
      }
    }

    setLoading(true);
    try {
      const toBirthDate = (p: PersonInput) =>
        `${p.birthYear}-${p.birthMonth.padStart(2, "0")}-${p.birthDay.padStart(2, "0")}`;

      const res = await fetch("/api/compatibility", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personA: { birthDate: toBirthDate(personA), bloodType: personA.bloodType },
          personB: { birthDate: toBirthDate(personB), bloodType: personB.bloodType },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (!isPremium) incrementDailyCount();
      setResult(data);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
    <style>{`
      @keyframes barFill { from { width: 0%; } }
      .bar-anim { animation: barFill 1.2s ease forwards var(--delay, 0s); }
    `}</style>
    <main className="relative z-10 min-h-screen text-[#f0e8d8] px-6 py-12">
      <div className="max-w-lg mx-auto">

        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-12">
          <Link
            href="/fortune"
            className="text-xs tracking-[0.3em] text-[#d4a84c]/60 hover:text-[#d4a84c] transition-colors uppercase"
          >
            ← Fortune
          </Link>
          {isPremium && (
            <span className="text-[9px] tracking-[0.3em] uppercase" style={{ color: "#d4a84c", border: "1px solid rgba(212,168,76,0.4)", padding: "4px 10px" }}>
              ✦ Premium
            </span>
          )}
        </div>

        {result ? (
          /* ── 結果画面 ── */
          <div className="scale-in space-y-8">
            <div className="text-center space-y-2">
              <p className="text-[10px] tracking-[0.4em] text-[#d4a84c]/60 uppercase">Compatibility</p>
              <h1 className="text-5xl font-bold gold-text">{result.percentage}%</h1>
              <p className="text-sm text-[#f5eedd]/50 tracking-wider">{result.keyword}</p>
            </div>

            {/* 二人の情報 */}
            <div className="grid grid-cols-2 gap-3 text-center text-xs">
              {[
                { label: "あなた", data: result.personA },
                { label: "相手",   data: result.personB },
              ].map(({ label, data }) => (
                <div
                  key={label}
                  className="py-4 space-y-1"
                  style={{ background: "rgba(212,168,76,0.04)", border: "1px solid rgba(212,168,76,0.15)" }}
                >
                  <p className="text-[9px] tracking-widest text-[#d4a84c]/50 uppercase">{label}</p>
                  <p className="text-[#e8d08a] font-bold">{data.zodiac}</p>
                  <p className="text-[#f5eedd]/40">LP {data.lifePathNumber} · {data.bloodType}型</p>
                </div>
              ))}
            </div>

            {/* スコア */}
            <div className="space-y-4 py-6" style={{ borderTop: "1px solid rgba(212,168,76,0.25)" }}>
              {SCORE_LABELS.map(({ key, label }, i) => (
                <ScoreRow key={key} label={label} score={result.scores[key as keyof typeof result.scores]} delay={`${i * 0.12}s`} />
              ))}
            </div>

            {/* 強み・課題 */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "二人の強み", value: result.strength, color: "rgba(212,168,76,0.15)" },
                { label: "気をつけること", value: result.challenge, color: "rgba(180,100,100,0.1)" },
              ].map(({ label, value, color }) => (
                <div
                  key={label}
                  className="p-4 text-center"
                  style={{ background: color, border: "1px solid rgba(212,168,76,0.15)" }}
                >
                  <p className="text-[9px] tracking-[0.2em] text-[#d4a84c]/45 uppercase mb-2">{label}</p>
                  <p className="text-xs text-[#e8d08a] leading-relaxed">{value}</p>
                </div>
              ))}
            </div>

            {/* メッセージ（プレミアムのみ） */}
            {isPremium ? (
              <div className="space-y-3">
                <p className="text-[9px] tracking-[0.35em] text-[#d4a84c]/45 uppercase">Message</p>
                <div style={{ borderLeft: "2px solid rgba(212,168,76,0.4)", paddingLeft: "18px" }}>
                  <p className="text-sm text-[#f5eedd]/85 leading-[2.1]">{result.message}</p>
                </div>
                <div className="text-center pt-2">
                  <p className="text-[9px] tracking-[0.25em] text-[#d4a84c]/55 uppercase mb-2">Advice</p>
                  <p className="text-sm text-[#e8d08a]/85 italic">&ldquo;{result.advice}&rdquo;</p>
                </div>
              </div>
            ) : (
              <div className="relative space-y-3">
                <p className="text-[9px] tracking-[0.35em] text-[#d4a84c]/45 uppercase">Message</p>
                <div className="relative" style={{ borderLeft: "2px solid rgba(212,168,76,0.4)", paddingLeft: "18px" }}>
                  <p className="text-sm text-[#f5eedd]/85 leading-[2.1] blur-sm select-none">
                    {result.message}
                  </p>
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                    <p className="text-xs text-[#d4a84c]/80 tracking-wider">✦ プレミアムで全文を見る</p>
                    {session?.user ? (
                      <button
                        onClick={handleUpgrade}
                        disabled={checkoutLoading}
                        className="px-5 py-2 text-xs tracking-widest uppercase transition-all hover:opacity-80 disabled:opacity-50"
                        style={{ background: "linear-gradient(135deg, rgba(212,168,76,0.18), rgba(212,168,76,0.08))", border: "1px solid rgba(212,168,76,0.5)", color: "#e8d08a" }}
                      >
                        {checkoutLoading ? "処理中..." : "プレミアムに登録 →"}
                      </button>
                    ) : (
                      <Link
                        href="/fortune"
                        className="px-5 py-2 text-xs tracking-widest uppercase transition-all hover:opacity-80"
                        style={{ background: "linear-gradient(135deg, rgba(212,168,76,0.18), rgba(212,168,76,0.08))", border: "1px solid rgba(212,168,76,0.5)", color: "#e8d08a" }}
                      >
                        ログインして見る →
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={() => setResult(null)}
              className="w-full text-xs tracking-[0.3em] text-[#f5eedd]/40 hover:text-[#f0e8d8]/50 py-3 uppercase transition-colors"
            >
              もう一度診断する
            </button>
          </div>

        ) : (
          /* ── 入力フォーム ── */
          <div>
            <div className="text-center mb-12">
              <p className="text-[10px] tracking-[0.4em] text-[#d4a84c]/60 uppercase mb-3">Compatibility</p>
              <h1 className="text-3xl font-bold"><span className="gold-text">相性診断</span></h1>
              <p className="text-xs text-[#f0e8d8]/30 tracking-wider mt-2">
                星座 · 数秘術 · 血液型で二人の縁を読む
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <PersonForm label="あなた" value={personA} onChange={setPersonA} />

              <div className="flex items-center gap-4">
                <div className="flex-1 h-px" style={{ background: "rgba(212,168,76,0.2)" }} />
                <span className="text-[#d4a84c]/40 text-xs tracking-widest">×</span>
                <div className="flex-1 h-px" style={{ background: "rgba(212,168,76,0.2)" }} />
              </div>

              <PersonForm label="相手" value={personB} onChange={setPersonB} />

              {error && (
                <p className="text-xs text-red-400/80 text-center tracking-wider">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading || !canSubmit}
                className="w-full py-4 text-sm tracking-[0.3em] uppercase transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
                style={{
                  background: loading
                    ? "rgba(212,168,76,0.08)"
                    : "linear-gradient(135deg, rgba(212,168,76,0.18), rgba(212,168,76,0.08))",
                  border: "1px solid rgba(212,168,76,0.5)",
                  color: "#e8d08a",
                }}
              >
                {loading ? <span className="shimmer inline-block">鑑定中 ...</span> : "相性を診断する →"}
              </button>
            </form>
          </div>
        )}
      </div>
    </main>
    </>
  );
}
