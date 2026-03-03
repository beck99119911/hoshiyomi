import Link from "next/link";

const MOCK = {
  zodiac: "牡羊座",
  lp: 11,
  blood: "O",
  scores: { overall: 4, love: 3, work: 5, money: 4, health: 3 },
  message:
    "木曜日の午後、普段話しかけない人からの一言が転機になります。その言葉に耳を傾けてください——あなたの行動を変える力があります。今週は能動的に動くことで、思いがけないチャンスが開かれるでしょう。",
  luckyColor: "深緋",
  luckyItem: "古い手紙",
  caution: "火曜日",
  quote: "直感を信じて、足を止めるな",
};

const SCORES = [
  { label: "総合運", key: "overall" },
  { label: "恋愛運", key: "love" },
  { label: "仕事運", key: "work" },
  { label: "金　運", key: "money" },
  { label: "健康運", key: "health" },
] as const;

function WashiScoreRow({ label, score }: { label: string; score: number }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1.5">
        <span style={{ color: "#6b3d2a", letterSpacing: "0.2em" }}>{label}</span>
        <span style={{ color: "#8b1a1a", letterSpacing: "0.05em" }}>
          {"●".repeat(score)}{"○".repeat(5 - score)}
        </span>
      </div>
      <div style={{ height: "2px", background: "rgba(44,24,16,0.12)", borderRadius: "999px", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${score * 20}%`, background: "linear-gradient(90deg, #8b1a1a, #c0392b)", borderRadius: "999px" }} />
      </div>
    </div>
  );
}

export default function WashiDesignPage() {
  return (
    <main
      className="min-h-screen px-6 py-12"
      style={{
        background: "linear-gradient(160deg, #f5f0e8 0%, #ede5d6 50%, #f5f0e8 100%)",
        color: "#2c1810",
      }}
    >
      {/* 背景の和紙感 */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: [
            "radial-gradient(ellipse 60% 40% at 20% 30%, rgba(139,26,26,0.04) 0%, transparent 70%)",
            "radial-gradient(ellipse 40% 30% at 80% 70%, rgba(139,26,26,0.03) 0%, transparent 70%)",
          ].join(", "),
        }}
      />

      <div className="relative max-w-lg mx-auto">
        {/* ナビ */}
        <div className="flex items-center justify-between mb-12">
          <Link
            href="/design-test"
            className="text-xs tracking-[0.3em] uppercase transition-colors"
            style={{ color: "rgba(139,26,26,0.5)", letterSpacing: "0.25em" }}
          >
            ← 戻る
          </Link>
          <span className="text-[9px] tracking-[0.4em] uppercase" style={{ color: "rgba(44,24,16,0.3)" }}>
            Design A · 和紙 × 水墨
          </span>
        </div>

        <div className="space-y-10">
          {/* ヘッダー */}
          <div className="text-center space-y-3">
            <p
              className="text-[9px] tracking-[0.5em] uppercase"
              style={{ color: "rgba(139,26,26,0.5)" }}
            >
              ✦ AI 占術鑑定 ✦
            </p>
            <h1
              className="text-4xl font-bold"
              style={{ color: "#2c1810", fontFamily: "serif", letterSpacing: "0.1em" }}
            >
              {MOCK.zodiac}
            </h1>
            <p className="text-xs tracking-wider" style={{ color: "rgba(44,24,16,0.45)" }}>
              ライフパス {MOCK.lp} · {MOCK.blood}型
            </p>
            {/* 朱色の区切り線 */}
            <div className="flex items-center gap-3 justify-center">
              <div style={{ flex: 1, height: "1px", background: "linear-gradient(90deg, transparent, rgba(139,26,26,0.3), transparent)" }} />
              <span style={{ color: "#8b1a1a", fontSize: "10px" }}>✦</span>
              <div style={{ flex: 1, height: "1px", background: "linear-gradient(90deg, transparent, rgba(139,26,26,0.3), transparent)" }} />
            </div>
          </div>

          {/* スコア */}
          <div
            className="p-7 space-y-4"
            style={{
              background: "rgba(255,255,255,0.5)",
              border: "1px solid rgba(44,24,16,0.12)",
              borderTop: "2px solid rgba(139,26,26,0.3)",
            }}
          >
            {SCORES.map(({ label, key }) => (
              <WashiScoreRow key={key} label={label} score={MOCK.scores[key]} />
            ))}
          </div>

          {/* メッセージ */}
          <div
            className="p-7"
            style={{
              background: "rgba(255,255,255,0.4)",
              border: "1px solid rgba(44,24,16,0.1)",
              borderLeft: "3px solid rgba(139,26,26,0.4)",
            }}
          >
            <p className="text-[9px] tracking-[0.35em] uppercase mb-3" style={{ color: "rgba(139,26,26,0.5)" }}>
              鑑定メッセージ
            </p>
            <p className="text-sm leading-[2.2]" style={{ color: "#3a2010" }}>
              {MOCK.message}
            </p>
          </div>

          {/* ラッキー */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "吉色", value: MOCK.luckyColor },
              { label: "吉物", value: MOCK.luckyItem },
              { label: "注意日", value: MOCK.caution },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="p-4 text-center"
                style={{
                  background: "rgba(255,255,255,0.45)",
                  border: "1px solid rgba(44,24,16,0.1)",
                }}
              >
                <p className="text-[9px] tracking-[0.3em] mb-2" style={{ color: "rgba(139,26,26,0.5)" }}>
                  {label}
                </p>
                <p className="text-sm font-bold" style={{ color: "#2c1810", fontFamily: "serif" }}>
                  {value}
                </p>
              </div>
            ))}
          </div>

          {/* 名言 */}
          <div className="text-center py-6 space-y-3">
            <div className="flex items-center gap-3">
              <div style={{ flex: 1, height: "1px", background: "linear-gradient(90deg, transparent, rgba(139,26,26,0.25), transparent)" }} />
              <span className="text-[9px] tracking-[0.3em]" style={{ color: "rgba(139,26,26,0.45)" }}>
                今週の言葉
              </span>
              <div style={{ flex: 1, height: "1px", background: "linear-gradient(90deg, transparent, rgba(139,26,26,0.25), transparent)" }} />
            </div>
            <p
              className="text-xl leading-relaxed px-4"
              style={{ color: "#8b1a1a", fontFamily: "serif", letterSpacing: "0.08em" }}
            >
              「{MOCK.quote}」
            </p>
          </div>

          {/* 印章風フッター */}
          <div className="text-center">
            <div
              className="inline-block px-6 py-2"
              style={{
                border: "1px solid rgba(139,26,26,0.3)",
                color: "rgba(139,26,26,0.45)",
                fontSize: "9px",
                letterSpacing: "0.4em",
              }}
            >
              星詠み · HOSHIYOMI
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
