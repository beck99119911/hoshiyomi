"use client";

import { useState, useRef, useEffect, useCallback } from "react";

// ── 相性診断ページ ──
type PersonInput = { birthYear: string; birthMonth: string; birthDay: string; bloodType: string };
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
const COMPAT_SCORE_LABELS = [
  { key: "overall", label: "総合相性" },
  { key: "love",    label: "恋愛相性" },
  { key: "values",  label: "価値観" },
  { key: "future",  label: "将来性" },
];

function CompatScoreRow({ label, score, delay = "0s" }: { label: string; score: number; delay?: string }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1.5">
        <span className="text-[#f5eedd]/60 tracking-wider">{label}</span>
        <span className="text-[#d4a84c]/80 tracking-widest">{"●".repeat(score)}{"○".repeat(5 - score)}</span>
      </div>
      <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(212,168,76,0.12)" }}>
        <div className="bar-anim h-full rounded-full" style={{ width: `${score * 20}%`, background: "linear-gradient(90deg, #d4a84c, #f0d898)", boxShadow: "0 0 6px rgba(212,168,76,0.35)", ["--delay" as string]: delay } as React.CSSProperties} />
      </div>
    </div>
  );
}

function getDates(start: number, end: number, label: string) {
  return Array.from({ length: end - start + 1 }, (_, i) => ({ value: String(start + i), label: `${start + i}${label}` }));
}

function PersonForm({ label, value, onChange }: { label: string; value: PersonInput; onChange: (v: PersonInput) => void }) {
  return (
    <div className="space-y-4">
      <p className="text-[10px] tracking-[0.35em] text-[#d4a84c]/60 uppercase">{label}</p>
      <div className="grid grid-cols-3 gap-2">
        {[
          { field: "birthYear" as const, placeholder: "年", opts: getDates(1924, 2010, "年").reverse() },
          { field: "birthMonth" as const, placeholder: "月", opts: getDates(1, 12, "月") },
          { field: "birthDay" as const, placeholder: "日", opts: getDates(1, 31, "日") },
        ].map(({ field, placeholder, opts }) => (
          <select key={field} value={value[field]} onChange={(e) => onChange({ ...value, [field]: e.target.value })} className="w-full px-2 py-3 text-sm focus:outline-none appearance-none text-center" style={{ background: "rgba(212,168,76,0.04)", border: "1px solid rgba(212,168,76,0.25)", color: value[field] ? "#f0e8d8" : "rgba(240,232,216,0.3)" }}>
            <option value="">{placeholder}</option>
            {opts.map((o) => <option key={o.value} value={o.value} style={{ background: "#0d0e20" }}>{o.label}</option>)}
          </select>
        ))}
      </div>
      <div className="grid grid-cols-4 gap-2">
        {["A", "B", "O", "AB"].map((type) => (
          <button key={type} type="button" onClick={() => onChange({ ...value, bloodType: type })} className="py-2 text-sm tracking-wider transition-all" style={value.bloodType === type ? { background: "rgba(212,168,76,0.15)", border: "1px solid rgba(212,168,76,0.7)", color: "#e8d08a" } : { background: "rgba(212,168,76,0.03)", border: "1px solid rgba(212,168,76,0.15)", color: "rgba(240,232,216,0.4)" }}>
            {type}型
          </button>
        ))}
      </div>
    </div>
  );
}

function CompatibilityPage({ onBack }: { onBack: () => void }) {
  const emptyPerson: PersonInput = { birthYear: "", birthMonth: "", birthDay: "", bloodType: "" };
  const [personA, setPersonA] = useState<PersonInput>(emptyPerson);
  const [personB, setPersonB] = useState<PersonInput>(emptyPerson);
  const [result, setResult] = useState<CompatibilityResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isValid = (p: PersonInput) => p.birthYear && p.birthMonth && p.birthDay && p.bloodType;
  const canSubmit = isValid(personA) && isValid(personB);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      const toBirthDate = (p: PersonInput) => `${p.birthYear}-${p.birthMonth.padStart(2, "0")}-${p.birthDay.padStart(2, "0")}`;
      const res = await fetch("/api/compatibility", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ personA: { birthDate: toBirthDate(personA), bloodType: personA.bloodType }, personB: { birthDate: toBirthDate(personB), bloodType: personB.bloodType } }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) { setError(err instanceof Error ? err.message : "エラーが発生しました"); }
    finally { setLoading(false); }
  }

  return (
    <>
      <style>{`@keyframes barFill { from { width: 0%; } } .bar-anim { animation: barFill 1.2s ease forwards var(--delay, 0s); }`}</style>
      <main className="relative z-10 min-h-screen text-[#f0e8d8] px-6 py-12">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-12">
            <button onClick={onBack} className="text-xs tracking-[0.3em] text-[#d4a84c]/60 hover:text-[#d4a84c] transition-colors uppercase">← Fortune</button>
            <span className="text-[9px] tracking-[0.3em] uppercase" style={{ color: "#d4a84c", border: "1px solid rgba(212,168,76,0.4)", padding: "4px 10px" }}>✦ Premium</span>
          </div>

          {result ? (
            <div className="scale-in space-y-8">
              <div className="text-center space-y-2">
                <p className="text-[10px] tracking-[0.4em] text-[#d4a84c]/60 uppercase">Compatibility</p>
                <h1 className="text-5xl font-bold gold-text">{result.percentage}%</h1>
                <p className="text-sm text-[#f5eedd]/50 tracking-wider">{result.keyword}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-center text-xs">
                {[{ label: "あなた", data: result.personA }, { label: "相手", data: result.personB }].map(({ label, data }) => (
                  <div key={label} className="py-4 space-y-1" style={{ background: "rgba(212,168,76,0.04)", border: "1px solid rgba(212,168,76,0.15)" }}>
                    <p className="text-[9px] tracking-widest text-[#d4a84c]/50 uppercase">{label}</p>
                    <p className="text-[#e8d08a] font-bold">{data.zodiac}</p>
                    <p className="text-[#f5eedd]/40">LP {data.lifePathNumber} · {data.bloodType}型</p>
                  </div>
                ))}
              </div>
              <div className="space-y-4 py-6" style={{ borderTop: "1px solid rgba(212,168,76,0.25)" }}>
                {COMPAT_SCORE_LABELS.map(({ key, label }, i) => (
                  <CompatScoreRow key={key} label={label} score={result.scores[key as keyof typeof result.scores]} delay={`${i * 0.12}s`} />
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[{ label: "二人の強み", value: result.strength, color: "rgba(212,168,76,0.15)" }, { label: "気をつけること", value: result.challenge, color: "rgba(180,100,100,0.1)" }].map(({ label, value, color }) => (
                  <div key={label} className="p-4 text-center" style={{ background: color, border: "1px solid rgba(212,168,76,0.15)" }}>
                    <p className="text-[9px] tracking-[0.2em] text-[#d4a84c]/45 uppercase mb-2">{label}</p>
                    <p className="text-xs text-[#e8d08a] leading-relaxed">{value}</p>
                  </div>
                ))}
              </div>
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
              <button onClick={() => setResult(null)} className="w-full text-xs tracking-[0.3em] text-[#f5eedd]/40 hover:text-[#f0e8d8]/50 py-3 uppercase transition-colors">もう一度診断する</button>
            </div>
          ) : (
            <div>
              <div className="text-center mb-12">
                <p className="text-[10px] tracking-[0.4em] text-[#d4a84c]/60 uppercase mb-3">Compatibility</p>
                <h1 className="text-3xl font-bold"><span className="gold-text">相性診断</span></h1>
                <p className="text-xs text-[#f0e8d8]/30 tracking-wider mt-2">星座 · 数秘術 · 血液型で二人の縁を読む</p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-8">
                <PersonForm label="あなた" value={personA} onChange={setPersonA} />
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-px" style={{ background: "rgba(212,168,76,0.2)" }} />
                  <span className="text-[#d4a84c]/40 text-xs tracking-widest">×</span>
                  <div className="flex-1 h-px" style={{ background: "rgba(212,168,76,0.2)" }} />
                </div>
                <PersonForm label="相手" value={personB} onChange={setPersonB} />
                {error && <p className="text-xs text-red-400/80 text-center tracking-wider">{error}</p>}
                <button type="submit" disabled={loading || !canSubmit} className="w-full py-4 text-sm tracking-[0.3em] uppercase transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed" style={{ background: loading ? "rgba(212,168,76,0.08)" : "linear-gradient(135deg, rgba(212,168,76,0.18), rgba(212,168,76,0.08))", border: "1px solid rgba(212,168,76,0.5)", color: "#e8d08a" }}>
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

type MouthState = "closed" | "half" | "open";

const FACE_SRC: Record<MouthState, string> = {
  closed: "/character/face_closed.png",
  half:   "/character/face_half.png",
  open:   "/character/face_half.png",
};

function Character({ mouth }: { mouth: MouthState }) {
  return (
    <div className="relative mx-auto" style={{ width: 220, height: 250 }}>
      <div className="absolute inset-0 blur-2xl opacity-15 pointer-events-none" style={{ background: "radial-gradient(circle at 50% 40%, #7850c8, transparent 70%)" }} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={FACE_SRC[mouth]} alt="占い師" className="w-full h-full object-cover" style={{ objectPosition: "50% 15%" }} />
    </div>
  );
}

const BLOOD_TYPES = ["A", "B", "O", "AB"];

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

function ScoreRow({ label, score, delay = "0s" }: { label: string; score: number; delay?: string }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1.5">
        <span className="text-[#f5eedd]/60 tracking-wider">{label}</span>
        <span className="text-[#d4a84c]/80 tracking-widest">{"●".repeat(score)}{"○".repeat(5 - score)}</span>
      </div>
      <div className="score-bar">
        <div className="bar-anim" style={{ height: "100%", width: `${score * 20}%`, background: "linear-gradient(90deg, #d4a84c, #f0d898)", borderRadius: "999px", boxShadow: "0 0 6px rgba(212,168,76,0.35)", ["--delay" as string]: delay } as React.CSSProperties} />
      </div>
    </div>
  );
}

function PalmScanner({ onScan, loading }: { onScan: (image: string) => void; loading: boolean }) {
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
          if (width > height) { height = Math.round((height / width) * maxSize); width = maxSize; }
          else { width = Math.round((width / height) * maxSize); height = maxSize; }
        }
        canvas.width = width; canvas.height = height;
        canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);
        onScan(canvas.toDataURL("image/jpeg", 0.8));
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  if (loading) {
    return (
      <div className="w-full py-4 text-sm tracking-wider text-center" style={{ border: "1px solid rgba(212,168,76,0.2)", color: "rgba(232,208,138,0.6)" }}>
        <span className="shimmer inline-block">手相を読み解いています ...</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" onChange={handleFileChange} className="hidden" />
      <input ref={galleryRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
      <button onClick={() => cameraRef.current?.click()} className="w-full py-4 text-sm tracking-wider transition-all duration-200 hover:opacity-80" style={{ background: "linear-gradient(135deg, rgba(212,168,76,0.12), rgba(212,168,76,0.05))", border: "1px solid rgba(212,168,76,0.45)", color: "#e8d08a" }}>
        📷 カメラで撮影して鑑定する
      </button>
      <button onClick={() => galleryRef.current?.click()} className="w-full py-3 text-xs tracking-wider transition-all duration-200 hover:opacity-80" style={{ background: "rgba(212,168,76,0.03)", border: "1px solid rgba(212,168,76,0.2)", color: "rgba(240,232,216,0.45)" }}>
        🖼️ アルバムから選択
      </button>
    </div>
  );
}

// ── ログイン画面 ──
function LoginGate({ onLogin }: { onLogin: () => void }) {
  const [id, setId] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (id === "beck99119911" && pass === "5404") { onLogin(); }
    else { setError(true); }
  }

  return (
    <main className="relative z-10 min-h-screen flex items-center justify-center px-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-6">
        <div className="text-center mb-8">
          <p className="text-[10px] tracking-[0.4em] text-[#d4a84c]/60 uppercase">Demo Access</p>
        </div>
        <div>
          <label className="block text-[10px] tracking-[0.3em] text-[#d4a84c]/60 uppercase mb-2">ID</label>
          <input type="text" value={id} onChange={(e) => { setId(e.target.value); setError(false); }} className="w-full px-4 py-3 text-sm text-[#f0e8d8] bg-transparent focus:outline-none" style={{ background: "rgba(212,168,76,0.04)", border: "1px solid rgba(212,168,76,0.25)" }} />
        </div>
        <div>
          <label className="block text-[10px] tracking-[0.3em] text-[#d4a84c]/60 uppercase mb-2">Password</label>
          <input type="password" value={pass} onChange={(e) => { setPass(e.target.value); setError(false); }} className="w-full px-4 py-3 text-sm text-[#f0e8d8] bg-transparent focus:outline-none" style={{ background: "rgba(212,168,76,0.04)", border: "1px solid rgba(212,168,76,0.25)" }} />
        </div>
        {error && <p className="text-xs text-red-400/80 text-center tracking-wider">IDまたはパスワードが違います</p>}
        <button type="submit" className="w-full py-4 text-sm tracking-[0.3em] uppercase transition-all duration-300 hover:opacity-80" style={{ background: "linear-gradient(135deg, rgba(212,168,76,0.18), rgba(212,168,76,0.08))", border: "1px solid rgba(212,168,76,0.5)", color: "#e8d08a" }}>
          Enter →
        </button>
      </form>
    </main>
  );
}

// ── TOPページ ──
function TopPage({ onStart }: { onStart: () => void }) {
  return (
    <>
      <style>{`
        @keyframes barFill { from { width: 0%; } }
        .bar-anim { animation: barFill 1.2s ease forwards; }
      `}</style>
      <main className="relative z-10 min-h-screen text-[#f0e8d8]">
        <section className="relative flex flex-col items-center justify-center min-h-screen px-6 text-center overflow-hidden">
          <div className="absolute inset-0 pointer-events-none" style={{ background: ["radial-gradient(ellipse 65% 50% at 50% 55%, rgba(212,168,76,0.10) 0%, transparent 65%)", "radial-gradient(ellipse 35% 25% at 50% 40%, rgba(150,120,220,0.07) 0%, transparent 60%)"].join(", ") }} />

          <div className="float mb-12 relative">
            <div className="absolute -inset-8 rounded-full" style={{ background: "radial-gradient(circle, rgba(212,168,76,0.08) 0%, transparent 70%)" }} />
            <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: "radial-gradient(circle, rgba(212,168,76,0.18) 0%, rgba(150,120,220,0.06) 60%, transparent 100%)", border: "1px solid rgba(212,168,76,0.4)", boxShadow: "0 0 40px rgba(212,168,76,0.15), inset 0 0 20px rgba(212,168,76,0.06)" }}>
              <span className="text-4xl">☽</span>
            </div>
            <div className="absolute -inset-3 rounded-full shimmer" style={{ border: "1px solid rgba(212,168,76,0.18)" }} />
          </div>

          <p className="fade-in-up fade-in-up-1 text-[10px] tracking-[0.5em] text-[#c9a84c]/70 mb-5 uppercase">AI Fortune Reading</p>
          <h1 className="fade-in-up fade-in-up-2 text-6xl md:text-8xl font-bold mb-2 tracking-tight">
            <span className="gold-text">星詠み</span>
          </h1>
          <p className="fade-in-up fade-in-up-2 text-[11px] tracking-[0.4em] text-[#c9a84c]/40 mb-10">HOSHIYOMI</p>

          <p className="fade-in-up fade-in-up-3 text-sm md:text-base text-[#f5eedd]/60 max-w-xs leading-[2] mb-14">
            西洋占星術・数秘術・血液型——<br />
            3つの叡智が交わるとき、<br />
            あなただけの答えが現れる。
          </p>

          <div className="fade-in-up fade-in-up-4">
            <button onClick={onStart} className="group relative inline-flex items-center gap-3 px-12 py-4 text-sm tracking-widest uppercase transition-all duration-300" style={{ background: "linear-gradient(135deg, rgba(201,168,76,0.12), rgba(201,168,76,0.04))", border: "1px solid rgba(201,168,76,0.45)" }}>
              <span className="gold-text font-bold">無料で鑑定を始める</span>
              <span className="text-[#c9a84c] group-hover:translate-x-1 transition-transform">→</span>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: "linear-gradient(135deg, rgba(201,168,76,0.06), transparent)" }} />
            </button>
            <p className="mt-5 text-[10px] text-[#f0e8d8]/25 tracking-widest">登録不要 · 1日3回まで無料</p>
          </div>
        </section>

        <section className="px-6 pb-32 max-w-xl mx-auto">
          <div className="divider mb-20">Three Wisdoms</div>
          <div className="space-y-1">
            {[
              { symbol: "♈︎", en: "Western Astrology", ja: "西洋占星術", desc: "生年月日から読み取る星座と天体の配置が、あなたの本質と今の運気の流れを映し出します。" },
              { symbol: "∞", en: "Numerology", ja: "数秘術", desc: "生年月日から導かれるライフパスナンバーが、あなたの魂の使命と今週の指針を示します。" },
              { symbol: "◈", en: "Blood Type", ja: "血液型占い", desc: "日本固有の占い文化に根ざした血液型の特性を加え、3つの叡智が交わる独自の鑑定を実現します。" },
            ].map((item, i) => (
              <div key={item.ja} className="py-8 px-2 flex gap-8 items-start" style={{ borderBottom: "1px solid rgba(212,168,76,0.1)" }}>
                <div className="flex-shrink-0 w-8 text-center">
                  <span className="text-xl gold-text font-light" style={{ fontFamily: "serif" }}>{item.symbol}</span>
                </div>
                <div className="flex-1">
                  <p className="text-[9px] tracking-[0.35em] text-[#c9a84c]/45 mb-1.5 uppercase">{String(i + 1).padStart(2, "0")} · {item.en}</p>
                  <h3 className="text-base font-bold text-[#e8d08a] mb-2">{item.ja}</h3>
                  <p className="text-sm text-[#f5eedd]/55 leading-[1.9]">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-24">
            <div className="divider mb-14">Sample Reading</div>
            <div className="space-y-7">
              <div>
                <p className="text-[9px] tracking-[0.35em] text-[#c9a84c]/50 uppercase mb-1">獅子座 · ライフパス6 · A型</p>
                <p className="text-[10px] text-[#f0e8d8]/30">2025年 今週の鑑定より</p>
              </div>
              <div className="space-y-4">
                {[["総合運", 4], ["恋愛運", 5], ["仕事運", 3], ["金運", 3]].map(([label, score]) => (
                  <div key={String(label)}>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-[#f0e8d8]/50">{label}</span>
                      <span className="text-[#c9a84c]/80 tracking-widest">{"●".repeat(Number(score))}{"○".repeat(5 - Number(score))}</span>
                    </div>
                    <div className="score-bar">
                      <div className="bar-anim" style={{ height: "100%", width: `${Number(score) * 20}%`, background: "linear-gradient(90deg, #d4a84c, #f0d898)", borderRadius: "999px" } as React.CSSProperties} />
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-sm text-[#f5eedd]/70 leading-[2]" style={{ borderLeft: "2px solid rgba(212,168,76,0.35)", paddingLeft: "16px" }}>
                「木曜日の午後、普段関わりの薄い人からの一言が転機になりそうです。その言葉を聞き流さないでください——あなたの背中を押す鍵が、そこにあります。」
              </p>
              <p className="text-center text-[#d4a84c]/75 text-sm italic tracking-wide">&ldquo; 完璧なタイミングは、動いた先にある。 &rdquo;</p>
            </div>
          </div>

          <div className="text-center mt-20">
            <button onClick={onStart} className="group relative inline-flex items-center gap-3 px-12 py-4 text-sm tracking-widest uppercase transition-all duration-300" style={{ background: "linear-gradient(135deg, rgba(201,168,76,0.12), rgba(201,168,76,0.04))", border: "1px solid rgba(201,168,76,0.45)" }}>
              <span className="gold-text font-bold">鑑定を始める</span>
              <span className="text-[#c9a84c] group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </div>
        </section>
      </main>
    </>
  );
}

// ── 鑑定ページ ──
function FortunePage({ onBack, onCompatibility }: { onBack: () => void; onCompatibility: () => void }) {
  const [mouth, setMouth] = useState<MouthState>("closed");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [ttsReady, setTtsReady] = useState(false);
  const cachedAudioRef = useRef<ArrayBuffer | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const animFrameRef = useRef<number>(0);

  const stopAudio = useCallback(() => {
    sourceRef.current?.stop();
    cancelAnimationFrame(animFrameRef.current);
    audioCtxRef.current?.close();
    audioCtxRef.current = null;
    setMouth("closed");
    setIsSpeaking(false);
  }, []);

  const playAudio = useCallback(async () => {
    if (isSpeaking || !cachedAudioRef.current) return;
    setIsSpeaking(true);
    const audioCtx = new AudioContext();
    audioCtxRef.current = audioCtx;
    const audioBuffer = await audioCtx.decodeAudioData(cachedAudioRef.current.slice(0));
    const source = audioCtx.createBufferSource();
    sourceRef.current = source;
    source.buffer = audioBuffer;
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 512;
    source.connect(analyser);
    analyser.connect(audioCtx.destination);
    const timeData = new Uint8Array(analyser.fftSize);
    const animate = () => {
      analyser.getByteTimeDomainData(timeData);
      let sum = 0;
      for (const v of timeData) { const n = (v - 128) / 128; sum += n * n; }
      const rms = Math.sqrt(sum / timeData.length);
      setMouth(rms > 0.08 ? "open" : rms > 0.02 ? "half" : "closed");
      animFrameRef.current = requestAnimationFrame(animate);
    };
    source.start();
    animate();
    source.onended = () => {
      cancelAnimationFrame(animFrameRef.current);
      setMouth("closed");
      setIsSpeaking(false);
      audioCtx.close();
    };
  }, [isSpeaking]);

  const [birthYear, setBirthYear] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthDay, setBirthDay] = useState("");
  const birthDate = birthYear && birthMonth && birthDay ? `${birthYear}-${birthMonth.padStart(2, "0")}-${birthDay.padStart(2, "0")}` : "";
  const [bloodType, setBloodType] = useState("");
  const [concern, setConcern] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FortuneResult | null>(null);
  const [error, setError] = useState("");
  const [palmResult, setPalmResult] = useState<PalmResult | null>(null);
  const [palmLoading, setPalmLoading] = useState(false);
  const [palmImage, setPalmImage] = useState<string | null>(null);
  const [palmError, setPalmError] = useState("");

  useEffect(() => {
    if (!result) return;
    cachedAudioRef.current = null;
    setTtsReady(false);
    setMouth("closed");
    fetch("/api/tts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: result.message }) })
      .then((r) => r.arrayBuffer())
      .then((buf) => { cachedAudioRef.current = buf; setTtsReady(true); })
      .catch(() => {});
  }, [result]);

  async function handlePalmScan(image: string) {
    setPalmImage(image); setPalmError(""); setPalmLoading(true);
    try {
      const res = await fetch("/api/palm", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ image, zodiac: result?.zodiac, lifePathNumber: result?.lifePathNumber, bloodType }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPalmResult(data);
    } catch (err) { setPalmError(err instanceof Error ? err.message : "エラーが発生しました"); }
    finally { setPalmLoading(false); }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      const res = await fetch("/api/fortune", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ birthDate, bloodType, concern }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) { setError(err instanceof Error ? err.message : "エラーが発生しました"); }
    finally { setLoading(false); }
  }

  return (
    <>
      <style>{`
        @keyframes barFill { from { width: 0%; } }
        .bar-anim { animation: barFill 1.2s ease forwards var(--delay, 0s); }
      `}</style>
      <main className="relative z-10 min-h-screen text-[#f0e8d8] px-6 py-12">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-12">
            <button onClick={onBack} className="text-xs tracking-[0.3em] text-[#d4a84c]/60 hover:text-[#d4a84c] transition-colors uppercase">← Hoshiyomi</button>
            <span className="text-[9px] tracking-[0.3em] uppercase" style={{ color: "#d4a84c", border: "1px solid rgba(212,168,76,0.4)", padding: "4px 10px" }}>✦ Premium</span>
          </div>

          {result ? (
            <div className="scale-in space-y-8">
              <div className="flex flex-col items-center gap-3">
                <Character mouth={mouth} />
                <button onClick={isSpeaking ? stopAudio : playAudio} disabled={!ttsReady} className="px-6 py-2 text-xs tracking-[0.3em] uppercase border transition-all disabled:opacity-30" style={{ borderColor: isSpeaking ? "rgba(212,168,76,0.6)" : "rgba(212,168,76,0.3)", color: isSpeaking ? "#d4a84c" : "rgba(240,232,216,0.5)", background: isSpeaking ? "rgba(212,168,76,0.08)" : "transparent" }}>
                  {!ttsReady ? "準備中..." : isSpeaking ? "■ 停止" : "▶ 読み上げ"}
                </button>
              </div>

              <div className="text-center space-y-2">
                <p className="text-[10px] tracking-[0.4em] text-[#d4a84c]/60 uppercase">Your Reading</p>
                <h1 className="text-3xl font-bold"><span className="gold-text">{result.zodiac}</span></h1>
                <p className="text-xs text-[#f5eedd]/55 tracking-wider">ライフパス {result.lifePathNumber} の鑑定</p>
              </div>

              <div className="py-6 space-y-4" style={{ borderTop: "1px solid rgba(212,168,76,0.35)" }}>
                {SCORE_LABELS.map(({ key, label }, i) => (
                  <ScoreRow key={key} label={label} score={result.scores[key as keyof typeof result.scores]} delay={`${i * 0.12}s`} />
                ))}
              </div>

              <div className="space-y-3">
                <p className="text-[9px] tracking-[0.35em] text-[#d4a84c]/45 uppercase">Message</p>
                <div style={{ borderLeft: "2px solid rgba(212,168,76,0.4)", paddingLeft: "18px" }}>
                  <p className="text-sm text-[#f5eedd]/85 leading-[2.1]">{result.message}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[{ label: "Lucky Color", value: result.luckyColor }, { label: "Lucky Item", value: result.luckyItem }, { label: "Caution", value: result.cautionDay }].map(({ label, value }) => (
                  <div key={label} className="p-4 text-center" style={{ background: "rgba(212,168,76,0.04)", border: "1px solid rgba(212,168,76,0.15)" }}>
                    <p className="text-[9px] tracking-[0.2em] text-[#d4a84c]/45 uppercase mb-2">{label}</p>
                    <p className="text-sm font-bold text-[#e8d08a]">{value}</p>
                  </div>
                ))}
              </div>

              <div className="text-center py-6">
                <div className="divider mb-6">Today&apos;s Words</div>
                <p className="text-lg text-[#e8d08a]/90 italic leading-relaxed">&ldquo;{result.quote}&rdquo;</p>
              </div>

              <button
                onClick={() => { onCompatibility(); window.scrollTo({ top: 0 }); }}
                className="flex items-center justify-between w-full px-5 py-4 transition-all hover:opacity-80"
                style={{ background: "rgba(212,168,76,0.05)", border: "1px solid rgba(212,168,76,0.2)" }}
              >
                <div>
                  <p className="text-xs tracking-[0.2em] text-[#d4a84c]/70 uppercase mb-0.5">Compatibility</p>
                  <p className="text-sm text-[#f0e8d8]/70">気になる相手との相性を診断する</p>
                </div>
                <span className="text-[#d4a84c]/50 text-lg">→</span>
              </button>

              <div className="space-y-4">
                <div className="divider">Palm Reading</div>
                <p className="text-center text-xs text-[#f5eedd]/50 tracking-wider">手のひらを撮影して、さらに深い鑑定を</p>
                {!palmResult && <PalmScanner onScan={handlePalmScan} loading={palmLoading} />}
                {palmImage && palmLoading && (
                  <div className="flex justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={palmImage} alt="手相" className="w-32 h-32 object-cover opacity-50" style={{ border: "1px solid rgba(212,168,76,0.2)" }} />
                  </div>
                )}
                {palmError && <p className="text-xs text-red-400/80 text-center tracking-wider">{palmError}</p>}
                {palmResult && (
                  <div className="space-y-4 scale-in">
                    {palmImage && (
                      <div className="flex justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={palmImage} alt="手相" className="w-28 h-28 object-cover" style={{ border: "1px solid rgba(212,168,76,0.35)" }} />
                      </div>
                    )}
                    <div className="py-5 space-y-4" style={{ borderTop: "1px solid rgba(212,168,76,0.3)" }}>
                      {[{ label: "生命線", value: palmResult.lines.life }, { label: "感情線", value: palmResult.lines.heart }, { label: "知性線", value: palmResult.lines.head }, { label: "運命線", value: palmResult.lines.fate }].map(({ label, value }) => (
                        <div key={label}>
                          <p className="text-[9px] tracking-[0.3em] text-[#d4a84c]/45 uppercase mb-1">{label}</p>
                          <p className="text-xs text-[#f5eedd]/80 leading-relaxed">{value}</p>
                        </div>
                      ))}
                    </div>
                    <div style={{ borderLeft: "2px solid rgba(212,168,76,0.4)", paddingLeft: "18px" }}>
                      <p className="text-[9px] tracking-[0.25em] text-[#d4a84c]/45 uppercase mb-2">総合鑑定</p>
                      <p className="text-sm text-[#f5eedd]/85 leading-[2.1]">{palmResult.reading}</p>
                    </div>
                    <div className="text-center py-2">
                      <p className="text-[9px] tracking-[0.25em] text-[#d4a84c]/55 uppercase mb-2">今週のアドバイス</p>
                      <p className="text-sm text-[#e8d08a]/85 italic leading-relaxed">&ldquo;{palmResult.advice}&rdquo;</p>
                    </div>
                    <button onClick={() => { setPalmResult(null); setPalmImage(null); setPalmError(""); }} className="w-full text-xs tracking-[0.3em] text-[#f5eedd]/30 hover:text-[#f0e8d8]/50 py-2 uppercase transition-colors">手相を撮り直す</button>
                  </div>
                )}
              </div>

              <button onClick={() => { setResult(null); setPalmResult(null); setPalmImage(null); }} className="w-full text-xs tracking-[0.3em] text-[#f5eedd]/40 hover:text-[#f0e8d8]/50 py-3 uppercase transition-colors">
                もう一度鑑定する
              </button>
            </div>

          ) : (
            <div>
              <div className="text-center mb-12">
                <p className="text-[10px] tracking-[0.4em] text-[#d4a84c]/60 uppercase mb-3">Premium Reading</p>
                <h1 className="text-3xl font-bold"><span className="gold-text">プレミアム鑑定</span></h1>
                <p className="text-xs text-[#f0e8d8]/30 tracking-wider mt-2">無制限 · プレミアム会員</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div>
                  <label className="block text-[10px] tracking-[0.3em] text-[#d4a84c]/60 uppercase mb-3">Birth Date · 生年月日</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: birthYear, onChange: setBirthYear, placeholder: "年", options: Array.from({ length: 87 }, (_, i) => { const y = 2010 - i; return { value: String(y), label: `${y}年` }; }) },
                      { value: birthMonth, onChange: setBirthMonth, placeholder: "月", options: Array.from({ length: 12 }, (_, i) => ({ value: String(i + 1), label: `${i + 1}月` })) },
                      { value: birthDay, onChange: setBirthDay, placeholder: "日", options: Array.from({ length: 31 }, (_, i) => ({ value: String(i + 1), label: `${i + 1}日` })) },
                    ].map(({ value, onChange, placeholder, options }) => (
                      <select key={placeholder} value={value} onChange={(e) => onChange(e.target.value)} className="w-full px-3 py-4 text-sm focus:outline-none appearance-none text-center" style={{ background: "rgba(212,168,76,0.04)", border: "1px solid rgba(212,168,76,0.25)", color: value ? "#f0e8d8" : "rgba(240,232,216,0.3)" }}>
                        <option value="">{placeholder}</option>
                        {options.map((o) => <option key={o.value} value={o.value} style={{ background: "#0d0e20" }}>{o.label}</option>)}
                      </select>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] tracking-[0.3em] text-[#d4a84c]/60 uppercase mb-3">Blood Type · 血液型</label>
                  <div className="grid grid-cols-4 gap-2">
                    {BLOOD_TYPES.map((type) => (
                      <button key={type} type="button" onClick={() => setBloodType(type)} className="py-3 text-sm tracking-wider transition-all duration-200" style={bloodType === type ? { background: "rgba(212,168,76,0.15)", border: "1px solid rgba(212,168,76,0.7)", color: "#e8d08a" } : { background: "rgba(212,168,76,0.03)", border: "1px solid rgba(212,168,76,0.15)", color: "rgba(240,232,216,0.4)" }}>
                        {type}型
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] tracking-[0.3em] text-[#d4a84c]/60 uppercase mb-3">Your Question · 今の悩み</label>
                  <textarea value={concern} onChange={(e) => setConcern(e.target.value)} required placeholder="今、気になっていること・聞きたいことを教えてください" rows={4} className="w-full px-5 py-4 text-sm text-[#f0e8d8] placeholder-[#f0e8d8]/20 bg-transparent focus:outline-none resize-none" style={{ background: "rgba(212,168,76,0.04)", border: "1px solid rgba(212,168,76,0.25)" }} />
                </div>

                {error && <p className="text-xs text-red-400/80 text-center tracking-wider">{error}</p>}

                <button type="submit" disabled={loading || !birthDate || !bloodType || !concern} className="w-full py-4 text-sm tracking-[0.3em] uppercase transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed" style={{ background: loading ? "rgba(212,168,76,0.08)" : "linear-gradient(135deg, rgba(212,168,76,0.18), rgba(212,168,76,0.08))", border: "1px solid rgba(212,168,76,0.5)", color: "#e8d08a" }}>
                  {loading ? <span className="shimmer inline-block">鑑定中 ...</span> : "鑑定する →"}
                </button>
              </form>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

// ── メイン ──
export default function DemoPage() {
  const [view, setView] = useState<"login" | "top" | "fortune" | "compatibility">("login");

  if (view === "login") return <LoginGate onLogin={() => setView("top")} />;
  if (view === "top") return <TopPage onStart={() => { setView("fortune"); window.scrollTo({ top: 0 }); }} />;
  if (view === "compatibility") return <CompatibilityPage onBack={() => { setView("fortune"); window.scrollTo({ top: 0 }); }} />;
  return <FortunePage onBack={() => { setView("top"); window.scrollTo({ top: 0 }); }} onCompatibility={() => setView("compatibility")} />;
}
