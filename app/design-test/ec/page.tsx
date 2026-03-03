import Link from "next/link";

const MOCK = {
  zodiac: "牡羊座",
  lp: 11,
  blood: "O",
  scores: { overall: 4, love: 3, work: 5, money: 4, health: 3 },
  message:
    "木曜日の午後、普段話しかけない人からの一言が転機になります。その言葉に耳を傾けてください——あなたの行動を変える力があります。今週は能動的に動くことで、思いがけないチャンスが開かれるでしょう。",
  luckyColor: "ロイヤルブルー",
  luckyItem: "古い手紙",
  caution: "火曜日",
  quote: "直感を信じて、足を止めるな",
};

const SCORES = [
  { label: "総合運", key: "overall" as const },
  { label: "恋愛運", key: "love"    as const },
  { label: "仕事運", key: "work"    as const },
  { label: "金　運", key: "money"   as const },
  { label: "健康運", key: "health"  as const },
];

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
];

export default function ECDesignPage() {
  return (
    <>
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.95; transform: scale(1.6); }
        }
        @keyframes aurora {
          0%, 100% { opacity: 0.35; transform: scale(1); }
          50% { opacity: 0.65; transform: scale(1.08); }
        }
        @keyframes barFill { from { width: 0%; } }
        .ec-star   { animation: twinkle var(--dur, 3s) ease-in-out infinite var(--delay, 0s); }
        .ec-aurora { animation: aurora 7s ease-in-out infinite; }
        .ec-bar    { animation: barFill 1.2s ease forwards var(--delay, 0s); }
      `}</style>

      {/* 背景 */}
      <div className="fixed inset-0 pointer-events-none" style={{ background: "linear-gradient(160deg, #080812 0%, #0d0e20 50%, #090814 100%)" }} />

      {/* オーロラ */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="ec-aurora absolute" style={{ width: "70vw", height: "50vh", top: "5%",  left: "15%", background: "radial-gradient(ellipse, rgba(100,80,200,0.12) 0%, transparent 70%)" }} />
        <div className="ec-aurora absolute" style={{ width: "50vw", height: "40vh", top: "55%", right: "8%", background: "radial-gradient(ellipse, rgba(212,168,76,0.07) 0%, transparent 70%)", animationDelay: "3.5s" }} />
      </div>

      {/* 星 */}
      <div className="fixed inset-0 pointer-events-none">
        {STARS.map((star, i) => (
          <div
            key={i}
            className="ec-star absolute rounded-full"
            style={{
              top: star.t, left: star.l,
              width: `${star.s}px`, height: `${star.s}px`,
              background: i % 3 === 0 ? "rgba(212,168,76,0.95)" : "rgba(255,255,255,0.85)",
              boxShadow: i % 3 === 0 ? `0 0 ${star.s * 4}px rgba(212,168,76,0.7)` : `0 0 ${star.s * 2}px rgba(255,255,255,0.5)`,
              ["--dur"   as string]: star.d,
              ["--delay" as string]: star.dl,
            } as React.CSSProperties}
          />
        ))}
      </div>

      <main className="relative z-10 min-h-screen text-[#f0e8d8] px-6 py-12">
        <div className="max-w-lg mx-auto">

          {/* ナビ */}
          <div className="flex items-center justify-between mb-12">
            <Link href="/design-test" className="text-xs tracking-[0.3em] uppercase transition-colors" style={{ color: "rgba(212,168,76,0.55)" }}>
              ← 戻る
            </Link>
            <span className="text-[9px] tracking-[0.4em] uppercase" style={{ color: "rgba(240,232,216,0.25)" }}>
              Design E+C · Test
            </span>
          </div>

          <div className="space-y-8">

            {/* ヘッダー */}
            <div className="text-center space-y-2">
              <p className="text-[10px] tracking-[0.4em] uppercase" style={{ color: "rgba(212,168,76,0.55)" }}>Your Reading</p>
              <h1 className="text-4xl font-bold" style={{
                background: "linear-gradient(135deg, #b8902e, #f0d898, #d4a84c, #f0d898, #b8902e)",
                backgroundSize: "200% auto",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>
                {MOCK.zodiac}
              </h1>
              <p className="text-xs tracking-wider" style={{ color: "rgba(245,238,221,0.45)" }}>
                ライフパス {MOCK.lp} · {MOCK.blood}型
              </p>
            </div>

            {/* スコア */}
            <div className="py-6 space-y-4" style={{ borderTop: "1px solid rgba(212,168,76,0.35)" }}>
              {SCORES.map(({ label, key }, i) => (
                <div key={key}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span style={{ color: "rgba(245,238,221,0.6)", letterSpacing: "0.1em" }}>{label}</span>
                    <span style={{ color: "rgba(212,168,76,0.8)", letterSpacing: "0.25em" }}>
                      {"●".repeat(MOCK.scores[key])}{"○".repeat(5 - MOCK.scores[key])}
                    </span>
                  </div>
                  <div style={{ height: "2px", background: "rgba(212,168,76,0.15)", borderRadius: "999px", overflow: "hidden" }}>
                    <div
                      className="ec-bar"
                      style={{
                        height: "100%",
                        width: `${MOCK.scores[key] * 20}%`,
                        background: "linear-gradient(90deg, #d4a84c, #f0d898)",
                        borderRadius: "999px",
                        boxShadow: "0 0 6px rgba(212,168,76,0.35)",
                        ["--delay" as string]: `${i * 0.12}s`,
                      } as React.CSSProperties}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* メッセージ */}
            <div className="space-y-3">
              <p className="text-[9px] tracking-[0.35em] uppercase" style={{ color: "rgba(212,168,76,0.45)" }}>Message</p>
              <div style={{ borderLeft: "2px solid rgba(212,168,76,0.4)", paddingLeft: "18px" }}>
                <p className="text-sm leading-[2.1]" style={{ color: "rgba(245,238,221,0.85)" }}>{MOCK.message}</p>
              </div>
            </div>

            {/* ラッキー */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Lucky Color", value: MOCK.luckyColor },
                { label: "Lucky Item",  value: MOCK.luckyItem  },
                { label: "Caution",     value: MOCK.caution    },
              ].map(({ label, value }) => (
                <div key={label} className="p-4 text-center" style={{ background: "rgba(212,168,76,0.04)", border: "1px solid rgba(212,168,76,0.15)" }}>
                  <p className="text-[9px] tracking-[0.2em] uppercase mb-2" style={{ color: "rgba(212,168,76,0.45)" }}>{label}</p>
                  <p className="text-sm font-bold" style={{ color: "#e8d08a" }}>{value}</p>
                </div>
              ))}
            </div>

            {/* 名言 */}
            <div className="text-center py-4">
              <div style={{ display: "flex", alignItems: "center", gap: "16px", color: "rgba(212,168,76,0.5)", fontSize: "10px", letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: "20px" }}>
                <div style={{ flex: 1, height: "1px", background: "linear-gradient(90deg, transparent, rgba(212,168,76,0.35), transparent)" }} />
                <span>Today&apos;s Words</span>
                <div style={{ flex: 1, height: "1px", background: "linear-gradient(90deg, transparent, rgba(212,168,76,0.35), transparent)" }} />
              </div>
              <p className="text-lg italic leading-relaxed" style={{ color: "rgba(232,208,138,0.85)", textShadow: "0 0 20px rgba(212,168,76,0.2)" }}>
                &ldquo;{MOCK.quote}&rdquo;
              </p>
            </div>

          </div>
        </div>
      </main>
    </>
  );
}
