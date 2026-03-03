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
  { label: "恋愛運", key: "love" as const },
  { label: "仕事運", key: "work" as const },
  { label: "金　運", key: "money" as const },
  { label: "健康運", key: "health" as const },
];

export default function ParticleDesignPage() {
  return (
    <>
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.4); }
        }
        @keyframes drift {
          0% { transform: translateY(0px) translateX(0px); }
          33% { transform: translateY(-8px) translateX(4px); }
          66% { transform: translateY(4px) translateX(-6px); }
          100% { transform: translateY(0px) translateX(0px); }
        }
        @keyframes aurora {
          0%, 100% { opacity: 0.4; transform: scale(1) rotate(0deg); }
          50% { opacity: 0.7; transform: scale(1.1) rotate(3deg); }
        }
        @keyframes barFill {
          from { width: 0%; }
        }
        .star-t { animation: twinkle var(--dur, 3s) ease-in-out infinite var(--delay, 0s); }
        .drift { animation: drift var(--dur, 8s) ease-in-out infinite var(--delay, 0s); }
        .aurora { animation: aurora 7s ease-in-out infinite; }
        .bar-anim { animation: barFill 1.2s ease forwards var(--delay, 0s); }
      `}</style>

      {/* 強化された星背景 */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: "linear-gradient(160deg, #080812 0%, #0d0e20 50%, #090814 100%)",
        }}
      />

      {/* オーロラ光 */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="aurora absolute"
          style={{
            width: "70vw", height: "50vh",
            top: "5%", left: "15%",
            background: "radial-gradient(ellipse, rgba(100,80,200,0.14) 0%, transparent 70%)",
          }}
        />
        <div
          className="aurora absolute"
          style={{
            width: "50vw", height: "40vh",
            top: "50%", right: "10%",
            background: "radial-gradient(ellipse, rgba(212,168,76,0.08) 0%, transparent 70%)",
            animationDelay: "3.5s",
          }}
        />
      </div>

      {/* きらめく星 */}
      <div className="fixed inset-0 pointer-events-none">
        {[
          { t: "12%", l: "8%",  s: 2,   d: "1.2s", dl: "0s" },
          { t: "25%", l: "85%", s: 1.5, d: "2.1s", dl: "0.4s" },
          { t: "8%",  l: "55%", s: 2,   d: "1.8s", dl: "0.8s" },
          { t: "45%", l: "18%", s: 1.5, d: "2.5s", dl: "0.2s" },
          { t: "35%", l: "72%", s: 1,   d: "1.5s", dl: "1.1s" },
          { t: "70%", l: "30%", s: 2,   d: "3.0s", dl: "0.6s" },
          { t: "60%", l: "90%", s: 1.5, d: "2.2s", dl: "1.4s" },
          { t: "80%", l: "60%", s: 1,   d: "1.9s", dl: "0.3s" },
          { t: "15%", l: "40%", s: 1.5, d: "2.7s", dl: "0.9s" },
          { t: "90%", l: "15%", s: 1,   d: "1.6s", dl: "0.5s" },
          { t: "55%", l: "45%", s: 2,   d: "2.3s", dl: "1.2s" },
          { t: "3%",  l: "75%", s: 1,   d: "1.4s", dl: "0.7s" },
        ].map((star, i) => (
          <div
            key={i}
            className="star-t absolute rounded-full"
            style={{
              top: star.t, left: star.l,
              width: `${star.s}px`, height: `${star.s}px`,
              background: i % 3 === 0 ? "rgba(212,168,76,0.9)" : "rgba(255,255,255,0.85)",
              boxShadow: i % 3 === 0 ? `0 0 ${star.s * 3}px rgba(212,168,76,0.7)` : `0 0 ${star.s * 2}px rgba(255,255,255,0.5)`,
              "--dur": star.d,
              "--delay": star.dl,
            } as React.CSSProperties}
          />
        ))}
      </div>

      <main className="relative z-10 min-h-screen text-[#f0e8d8] px-6 py-12">
        <div className="max-w-lg mx-auto">
          {/* ナビ */}
          <div className="flex items-center justify-between mb-12">
            <Link
              href="/design-test"
              className="text-xs tracking-[0.3em] uppercase transition-colors"
              style={{ color: "rgba(212,168,76,0.55)" }}
            >
              ← 戻る
            </Link>
            <span className="text-[9px] tracking-[0.4em] uppercase" style={{ color: "rgba(240,232,216,0.25)" }}>
              Design E · Particle
            </span>
          </div>

          <div className="space-y-8">
            {/* ヘッダー */}
            <div className="text-center space-y-2">
              <p className="text-[10px] tracking-[0.4em] text-[#d4a84c]/60 uppercase">Your Reading</p>
              <h1
                className="text-4xl font-bold drift"
                style={{
                  background: "linear-gradient(135deg, #b8902e, #f0d898, #d4a84c, #f0d898, #b8902e)",
                  backgroundSize: "200% auto",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  "--dur": "10s",
                  "--delay": "0s",
                } as React.CSSProperties}
              >
                {MOCK.zodiac}
              </h1>
              <p className="text-xs text-[#f5eedd]/50 tracking-wider">
                ライフパス {MOCK.lp} · {MOCK.blood}型
              </p>
            </div>

            {/* スコア - アニメーション付きバー */}
            <div
              className="p-7 space-y-5"
              style={{
                background: "rgba(212,168,76,0.05)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(212,168,76,0.35)",
                borderTop: "1px solid rgba(212,168,76,0.5)",
              }}
            >
              {SCORES.map(({ label, key }, i) => (
                <div key={key}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-[#f5eedd]/70 tracking-wider">{label}</span>
                    <span className="text-[#d4a84c] tracking-widest">
                      {"●".repeat(MOCK.scores[key])}{"○".repeat(5 - MOCK.scores[key])}
                    </span>
                  </div>
                  <div style={{ height: "2px", background: "rgba(212,168,76,0.2)", borderRadius: "999px", overflow: "hidden" }}>
                    <div
                      className="bar-anim"
                      style={{
                        height: "100%",
                        width: `${MOCK.scores[key] * 20}%`,
                        background: "linear-gradient(90deg, #d4a84c, #f0d898)",
                        borderRadius: "999px",
                        boxShadow: "0 0 8px rgba(212,168,76,0.4)",
                        "--delay": `${i * 0.15}s`,
                      } as React.CSSProperties}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* メッセージ */}
            <div
              className="p-7"
              style={{
                background: "rgba(212,168,76,0.04)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(212,168,76,0.2)",
                borderLeft: "2px solid rgba(212,168,76,0.5)",
              }}
            >
              <p className="text-[9px] tracking-[0.3em] text-[#d4a84c]/50 uppercase mb-3">Message</p>
              <p className="text-sm text-[#f5eedd]/90 leading-[2]">{MOCK.message}</p>
            </div>

            {/* ラッキー */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Lucky Color", value: MOCK.luckyColor },
                { label: "Lucky Item", value: MOCK.luckyItem },
                { label: "Caution", value: MOCK.caution },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="p-4 text-center"
                  style={{
                    background: "rgba(212,168,76,0.05)",
                    backdropFilter: "blur(12px)",
                    border: "1px solid rgba(212,168,76,0.2)",
                  }}
                >
                  <p className="text-[9px] tracking-[0.2em] text-[#d4a84c]/50 uppercase mb-2">{label}</p>
                  <p className="text-sm font-bold text-[#e8d08a]">{value}</p>
                </div>
              ))}
            </div>

            {/* 名言 */}
            <div className="text-center py-6">
              <div
                style={{
                  display: "flex", alignItems: "center", gap: "16px",
                  color: "rgba(212,168,76,0.7)", fontSize: "11px",
                  letterSpacing: "0.25em", textTransform: "uppercase",
                  marginBottom: "24px",
                }}
              >
                <div style={{ flex: 1, height: "1px", background: "linear-gradient(90deg, transparent, rgba(212,168,76,0.5), transparent)" }} />
                <span>Today&apos;s Words</span>
                <div style={{ flex: 1, height: "1px", background: "linear-gradient(90deg, transparent, rgba(212,168,76,0.5), transparent)" }} />
              </div>
              <p
                className="text-lg italic leading-relaxed"
                style={{
                  color: "rgba(232,208,138,0.9)",
                  textShadow: "0 0 20px rgba(212,168,76,0.3)",
                }}
              >
                &ldquo;{MOCK.quote}&rdquo;
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
