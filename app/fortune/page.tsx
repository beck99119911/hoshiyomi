"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

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

type PalmResult = {
  lines: { life: string; heart: string; head: string; fate: string };
  reading: string;
  advice: string;
};

const SCORE_LABELS = [
  { key: "overall", label: "総合運" },
  { key: "love",    label: "恋愛運" },
  { key: "work",    label: "仕事運" },
  { key: "money",   label: "金　運" },
  { key: "health",  label: "健康運" },
];

function CopyButton({ shareUrl, onCopy }: { shareUrl: string; onCopy: () => void }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      onCopy();
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard API が使えない場合は無視
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="flex-1 py-3 text-sm tracking-wider text-center transition-all duration-200 hover:opacity-80"
      style={{
        background: "rgba(212,168,76,0.06)",
        border: "1px solid rgba(212,168,76,0.2)",
        color: copied ? "#d4a84c" : "rgba(240,232,216,0.6)",
      }}
    >
      {copied ? "✓ コピー完了" : "🔗 URLをコピー"}
    </button>
  );
}

function ScoreRow({ label, score, delay = "0s" }: { label: string; score: number; delay?: string }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1.5">
        <span className="text-[#f5eedd]/60 tracking-wider">{label}</span>
        <span className="text-[#d4a84c]/80 tracking-widest">
          {"●".repeat(score)}{"○".repeat(5 - score)}
        </span>
      </div>
      <div className="score-bar">
        <div
          className="bar-anim"
          style={{
            height: "100%",
            width: `${score * 20}%`,
            background: "linear-gradient(90deg, #d4a84c, #f0d898)",
            borderRadius: "999px",
            boxShadow: "0 0 6px rgba(212,168,76,0.35)",
            ["--delay" as string]: delay,
          } as React.CSSProperties}
        />
      </div>
    </div>
  );
}

function PalmScanner({
  onScan,
  loading,
}: {
  onScan: (image: string) => void;
  loading: boolean;
}) {
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxSize = 800;
        let { width, height } = img;
        if (width > maxSize || height > maxSize) {
          if (width > height) {
            height = Math.round((height / width) * maxSize);
            width = maxSize;
          } else {
            width = Math.round((width / height) * maxSize);
            height = maxSize;
          }
        }
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);
        onScan(canvas.toDataURL("image/jpeg", 0.8));
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  if (loading) {
    return (
      <div
        className="w-full py-4 text-sm tracking-wider text-center"
        style={{ border: "1px solid rgba(212,168,76,0.2)", color: "rgba(232,208,138,0.6)" }}
      >
        <span className="shimmer inline-block">手相を読み解いています ...</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" onChange={handleFileChange} className="hidden" />
      <input ref={galleryRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
      <button
        onClick={() => cameraRef.current?.click()}
        className="w-full py-4 text-sm tracking-wider transition-all duration-200 hover:opacity-80"
        style={{
          background: "linear-gradient(135deg, rgba(212,168,76,0.12), rgba(212,168,76,0.05))",
          border: "1px solid rgba(212,168,76,0.45)",
          color: "#e8d08a",
        }}
      >
        📷 カメラで撮影して鑑定する
      </button>
      <button
        onClick={() => galleryRef.current?.click()}
        className="w-full py-3 text-xs tracking-wider transition-all duration-200 hover:opacity-80"
        style={{
          background: "rgba(212,168,76,0.03)",
          border: "1px solid rgba(212,168,76,0.2)",
          color: "rgba(240,232,216,0.45)",
        }}
      >
        🖼️ アルバムから選択
      </button>
    </div>
  );
}

export default function FortunePage() {
  const { data: session, status: sessionStatus } = useSession();
  const [isPremium, setIsPremium] = useState(false);
  const [premiumChecked, setPremiumChecked] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    if (sessionStatus === "loading") return;

    if (!session?.user) {
      setPremiumChecked(true);
      return;
    }

    const upgraded = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("upgraded") === "true";

    if (upgraded) {
      setIsPremium(true);
      setPremiumChecked(true);
      localStorage.setItem(`premium_${session.user.id}`, "1");
      window.history.replaceState({}, "", "/fortune");
      return;
    }

    // キャッシュがあれば即座に反映
    const cached = localStorage.getItem(`premium_${session.user.id}`);
    if (cached === "1") {
      setIsPremium(true);
      setPremiumChecked(true);
    }

    // バックグラウンドで確認（キャッシュ更新）
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

  async function handleUpgrade() {
    if (!session?.user) return;
    setCheckoutLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      setCheckoutLoading(false);
    }
  }

  async function handlePortal() {
    setCheckoutLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      setCheckoutLoading(false);
    }
  }

  const [birthYear, setBirthYear] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthDay, setBirthDay] = useState("");
  const birthDate =
    birthYear && birthMonth && birthDay
      ? `${birthYear}-${birthMonth.padStart(2, "0")}-${birthDay.padStart(2, "0")}`
      : "";
  const [bloodType, setBloodType] = useState("");
  const [concern, setConcern] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FortuneResult | null>(null);
  const [error, setError] = useState("");
  const [shareBonusGiven, setShareBonusGiven] = useState(false);
  const [palmResult, setPalmResult] = useState<PalmResult | null>(null);
  const [palmLoading, setPalmLoading] = useState(false);
  const [palmImage, setPalmImage] = useState<string | null>(null);
  const [palmError, setPalmError] = useState("");

  async function handlePalmScan(image: string) {
    setPalmImage(image);
    setPalmError("");
    setPalmLoading(true);
    try {
      const res = await fetch("/api/palm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image,
          zodiac: result?.zodiac,
          lifePathNumber: result?.lifePathNumber,
          bloodType,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPalmResult(data);
    } catch (err) {
      setPalmError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setPalmLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
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

  // シェアURL（OG画像付き）を構築
  const shareUrl = result
    ? (() => {
        const base =
          typeof window !== "undefined"
            ? window.location.origin
            : "https://hoshiyomi.xyz";
        const q = new URLSearchParams({
          zodiac:  result.zodiac,
          lp:      String(result.lifePathNumber),
          blood:   bloodType,
          overall: String(result.scores.overall),
          love:    String(result.scores.love),
          work:    String(result.scores.work),
          money:   String(result.scores.money),
          health:  String(result.scores.health),
          quote:   result.quote,
        });
        return `${base}/share?${q.toString()}`;
      })()
    : "";

  const shareText = result
    ? `🔮 星詠み AI鑑定【今週の運勢】\n${result.zodiac} × ライフパス${result.lifePathNumber} × ${bloodType}型\n\n総合運 ${"●".repeat(result.scores.overall)}${"○".repeat(5 - result.scores.overall)}\n恋愛運 ${"●".repeat(result.scores.love)}${"○".repeat(5 - result.scores.love)}\n\n"${result.quote}"\n\n#星詠み #AI占い #今週の運勢`
    : "";

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
              href="/"
              className="text-xs tracking-[0.3em] text-[#d4a84c]/60 hover:text-[#d4a84c] transition-colors uppercase"
            >
              ← Hoshiyomi
            </Link>
            {isPremium ? (
              <button
                onClick={handlePortal}
                disabled={checkoutLoading}
                className="text-[9px] tracking-[0.3em] uppercase transition-colors hover:opacity-80 disabled:opacity-50"
                style={{ color: "#d4a84c", border: "1px solid rgba(212,168,76,0.4)", padding: "4px 10px" }}
              >
                ✦ Premium
              </button>
            ) : (
              <span className="text-xs tracking-widest text-[#f5eedd]/35 uppercase">
                Free Reading
              </span>
            )}
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
                className="py-6 space-y-4"
                style={{ borderTop: "1px solid rgba(212,168,76,0.35)" }}
              >
                {SCORE_LABELS.map(({ key, label }, i) => (
                  <ScoreRow
                    key={key}
                    label={label}
                    score={result.scores[key as keyof typeof result.scores]}
                    delay={`${i * 0.12}s`}
                  />
                ))}
              </div>

              {/* メッセージ */}
              <div className="space-y-3">
                <p className="text-[9px] tracking-[0.35em] text-[#d4a84c]/45 uppercase">Message</p>
                <div style={{ borderLeft: "2px solid rgba(212,168,76,0.4)", paddingLeft: "18px" }}>
                  <p className="text-sm text-[#f5eedd]/85 leading-[2.1]">{result.message}</p>
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
                    className="p-4 text-center"
                    style={{ background: "rgba(212,168,76,0.04)", border: "1px solid rgba(212,168,76,0.15)" }}
                  >
                    <p className="text-[9px] tracking-[0.2em] text-[#d4a84c]/45 uppercase mb-2">{label}</p>
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
                  {!shareBonusGiven ? (
                    <p className="text-[10px] text-[#d4a84c]/70 tracking-wider">
                      シェアすると本日の鑑定回数が +{SHARE_BONUS}回 増えます
                    </p>
                  ) : (
                    <p className="text-[10px] text-[#d4a84c] tracking-wider">
                      ✨ +{SHARE_BONUS}回プレゼントしました！
                    </p>
                  )}
                </div>

                {/* X シェア（メイン） */}
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => { if (addShareBonus()) setShareBonusGiven(true); }}
                  className="flex items-center justify-center gap-2 w-full py-4 text-sm tracking-widest transition-all duration-200 hover:opacity-80"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.18)",
                  }}
                >
                  <span>𝕏</span>
                  <span className="text-[#f0e8d8]">結果をポストする</span>
                  <span className="text-[10px] text-[#f0e8d8]/40 tracking-wider ml-1">← カード画像付き</span>
                </a>

                {/* LINE + URLコピー */}
                <div className="flex gap-3">
                  <a
                    href={`https://line.me/R/share?text=${encodeURIComponent(shareText + "\n" + shareUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => { if (addShareBonus()) setShareBonusGiven(true); }}
                    className="flex-1 py-3 text-sm tracking-wider text-center transition-all duration-200 hover:opacity-80"
                    style={{
                      background: "rgba(0,195,0,0.08)",
                      border: "1px solid rgba(0,195,0,0.2)",
                    }}
                  >
                    LINE でシェア
                  </a>
                  <CopyButton shareUrl={shareUrl} onCopy={() => { if (addShareBonus()) setShareBonusGiven(true); }} />
                </div>
              </div>

              {/* 手相スキャン */}
              <div className="space-y-4">
                <div className="divider">Palm Reading</div>
                <p className="text-center text-xs text-[#f5eedd]/50 tracking-wider">
                  手のひらを撮影して、さらに深い鑑定を
                </p>

                {!palmResult && (
                  <PalmScanner onScan={handlePalmScan} loading={palmLoading} />
                )}

                {palmImage && palmLoading && (
                  <div className="flex justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={palmImage}
                      alt="手相"
                      className="w-32 h-32 object-cover opacity-50"
                      style={{ border: "1px solid rgba(212,168,76,0.2)" }}
                    />
                  </div>
                )}

                {palmError && (
                  <p className="text-xs text-red-400/80 text-center tracking-wider">{palmError}</p>
                )}

                {palmResult && (
                  <div className="space-y-4 scale-in">
                    {palmImage && (
                      <div className="flex justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={palmImage}
                          alt="手相"
                          className="w-28 h-28 object-cover"
                          style={{ border: "1px solid rgba(212,168,76,0.35)" }}
                        />
                      </div>
                    )}

                    {/* 4線 */}
                    <div
                      className="py-5 space-y-4"
                      style={{ borderTop: "1px solid rgba(212,168,76,0.3)" }}
                    >
                      {[
                        { label: "生命線", value: palmResult.lines.life },
                        { label: "感情線", value: palmResult.lines.heart },
                        { label: "知性線", value: palmResult.lines.head },
                        { label: "運命線", value: palmResult.lines.fate },
                      ].map(({ label, value }) => (
                        <div key={label}>
                          <p className="text-[9px] tracking-[0.3em] text-[#d4a84c]/45 uppercase mb-1">
                            {label}
                          </p>
                          <p className="text-xs text-[#f5eedd]/80 leading-relaxed">{value}</p>
                        </div>
                      ))}
                    </div>

                    {/* 総合鑑定 */}
                    <div style={{ borderLeft: "2px solid rgba(212,168,76,0.4)", paddingLeft: "18px" }}>
                      <p className="text-[9px] tracking-[0.25em] text-[#d4a84c]/45 uppercase mb-2">
                        総合鑑定
                      </p>
                      <p className="text-sm text-[#f5eedd]/85 leading-[2.1]">{palmResult.reading}</p>
                    </div>

                    {/* アドバイス */}
                    <div className="text-center py-2">
                      <p className="text-[9px] tracking-[0.25em] text-[#d4a84c]/55 uppercase mb-2">
                        今週のアドバイス
                      </p>
                      <p className="text-sm text-[#e8d08a]/85 italic leading-relaxed">
                        &ldquo;{palmResult.advice}&rdquo;
                      </p>
                    </div>

                    <button
                      onClick={() => { setPalmResult(null); setPalmImage(null); setPalmError(""); }}
                      className="w-full text-xs tracking-[0.3em] text-[#f5eedd]/30 hover:text-[#f0e8d8]/50 py-2 uppercase transition-colors"
                    >
                      手相を撮り直す
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={() => { setResult(null); setPalmResult(null); setPalmImage(null); }}
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
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      {
                        value: birthYear,
                        onChange: setBirthYear,
                        placeholder: "年",
                        options: Array.from({ length: 87 }, (_, i) => {
                          const y = 2010 - i;
                          return { value: String(y), label: `${y}年` };
                        }),
                      },
                      {
                        value: birthMonth,
                        onChange: setBirthMonth,
                        placeholder: "月",
                        options: Array.from({ length: 12 }, (_, i) => ({
                          value: String(i + 1),
                          label: `${i + 1}月`,
                        })),
                      },
                      {
                        value: birthDay,
                        onChange: setBirthDay,
                        placeholder: "日",
                        options: Array.from({ length: 31 }, (_, i) => ({
                          value: String(i + 1),
                          label: `${i + 1}日`,
                        })),
                      },
                    ].map(({ value, onChange, placeholder, options }) => (
                      <select
                        key={placeholder}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        className="w-full px-3 py-4 text-sm focus:outline-none appearance-none text-center"
                        style={{
                          background: "rgba(212,168,76,0.04)",
                          border: "1px solid rgba(212,168,76,0.25)",
                          color: value ? "#f0e8d8" : "rgba(240,232,216,0.3)",
                        }}
                      >
                        <option value="">{placeholder}</option>
                        {options.map((o) => (
                          <option key={o.value} value={o.value} style={{ background: "#0d0e20" }}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    ))}
                  </div>
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

              {/* プレミアムバナー */}
              {premiumChecked && !isPremium && session?.user && (
                <div
                  className="mt-10 p-6 text-center space-y-3"
                  style={{ border: "1px solid rgba(212,168,76,0.2)", background: "rgba(212,168,76,0.03)" }}
                >
                  <p className="text-[9px] tracking-[0.4em] text-[#d4a84c]/50 uppercase">Premium</p>
                  <p className="text-sm text-[#f0e8d8]/70 leading-relaxed">
                    無制限に鑑定 · 手相スキャン優先 · 深い洞察
                  </p>
                  <p className="text-xs text-[#d4a84c]/60">¥980 / 月</p>
                  <button
                    onClick={handleUpgrade}
                    disabled={checkoutLoading}
                    className="w-full py-3 text-sm tracking-widest uppercase transition-all duration-300 hover:opacity-80 disabled:opacity-50"
                    style={{
                      background: "linear-gradient(135deg, rgba(212,168,76,0.18), rgba(212,168,76,0.08))",
                      border: "1px solid rgba(212,168,76,0.5)",
                      color: "#e8d08a",
                    }}
                  >
                    {checkoutLoading ? "処理中..." : "プレミアムに登録する →"}
                  </button>
                </div>
              )}

              {premiumChecked && !isPremium && !session?.user && (
                <p className="mt-8 text-center text-[10px] text-[#f0e8d8]/30 tracking-wider">
                  ログインするとプレミアムプランをご利用いただけます（¥980/月）
                </p>
              )}
            </div>
          )}
        </div>
      </main>
    </>
  );
}

