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

const CARDS = [
  { label: "総合運", key: "overall" as const, symbol: "☉" },
  { label: "恋愛運", key: "love" as const, symbol: "♀" },
  { label: "仕事運", key: "work" as const, symbol: "♂" },
  { label: "金　運", key: "money" as const, symbol: "♃" },
  { label: "健康運", key: "health" as const, symbol: "⊕" },
];

function TarotCard({ label, symbol, score }: { label: string; symbol: string; score: number }) {
  return (
    <div
      className="flex flex-col items-center gap-3 p-5"
      style={{
        background: "linear-gradient(160deg, rgba(80,40,140,0.35), rgba(40,15,80,0.5))",
        border: "1px solid rgba(150,100,255,0.25)",
        borderTop: "1px solid rgba(200,168,255,0.4)",
      }}
    >
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
        style={{
          background: "rgba(150,100,255,0.15)",
          border: "1px solid rgba(150,100,255,0.3)",
          color: "#c9a84c",
        }}
      >
        {symbol}
      </div>
      <p className="text-[9px] tracking-[0.3em]" style={{ color: "rgba(200,180,255,0.55)" }}>
        {label}
      </p>
      <div className="space-y-1.5 w-full">
        <div className="flex justify-center gap-1">
          {Array.from({ length: 5 }, (_, i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full"
              style={{
                background: i < score
                  ? "linear-gradient(135deg, #c9a84c, #f0d898)"
                  : "rgba(150,100,255,0.15)",
                boxShadow: i < score ? "0 0 4px rgba(201,168,76,0.5)" : "none",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function TarotDesignPage() {
  return (
    <main
      className="min-h-screen px-6 py-12"
      style={{ background: "linear-gradient(160deg, #0d0318 0%, #120828 50%, #0a0120 100%)" }}
    >
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: [
            "radial-gradient(ellipse 60% 40% at 30% 20%, rgba(100,60,200,0.08) 0%, transparent 70%)",
            "radial-gradient(ellipse 40% 30% at 75% 70%, rgba(60,30,150,0.06) 0%, transparent 70%)",
          ].join(", "),
        }}
      />

      <div className="relative max-w-lg mx-auto">
        {/* ナビ */}
        <div className="flex items-center justify-between mb-12">
          <Link
            href="/design-test"
            className="text-xs tracking-[0.3em] uppercase transition-colors"
            style={{ color: "rgba(150,100,255,0.55)" }}
          >
            ← 戻る
          </Link>
          <span className="text-[9px] tracking-[0.4em] uppercase" style={{ color: "rgba(200,180,255,0.3)" }}>
            Design B · Tarot
          </span>
        </div>

        <div className="space-y-8">
          {/* ヘッダー */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2 mb-3">
              <div style={{ flex: 1, height: "1px", background: "linear-gradient(90deg, transparent, rgba(201,168,76,0.4))" }} />
              <span className="text-[9px] tracking-[0.4em] uppercase" style={{ color: "rgba(201,168,76,0.55)" }}>
                The Reading
              </span>
              <div style={{ flex: 1, height: "1px", background: "linear-gradient(90deg, rgba(201,168,76,0.4), transparent)" }} />
            </div>
            <h1
              className="text-4xl font-bold"
              style={{
                background: "linear-gradient(135deg, #9b6dff, #f0d898, #c9a84c)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                letterSpacing: "0.08em",
              }}
            >
              {MOCK.zodiac}
            </h1>
            <p className="text-xs tracking-wider" style={{ color: "rgba(200,180,255,0.45)" }}>
              ライフパス {MOCK.lp} · {MOCK.blood}型
            </p>
          </div>

          {/* タロットカード グリッド */}
          <div className="grid grid-cols-3 gap-3">
            {CARDS.slice(0, 3).map(({ label, key, symbol }) => (
              <TarotCard key={key} label={label} symbol={symbol} score={MOCK.scores[key]} />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3 mx-6">
            {CARDS.slice(3).map(({ label, key, symbol }) => (
              <TarotCard key={key} label={label} symbol={symbol} score={MOCK.scores[key]} />
            ))}
          </div>

          {/* メッセージ */}
          <div
            className="p-7"
            style={{
              background: "linear-gradient(160deg, rgba(80,40,140,0.2), rgba(40,15,80,0.3))",
              border: "1px solid rgba(150,100,255,0.2)",
              borderLeft: "2px solid rgba(201,168,76,0.5)",
            }}
          >
            <p className="text-[9px] tracking-[0.35em] uppercase mb-3" style={{ color: "rgba(201,168,76,0.5)" }}>
              Oracle Message
            </p>
            <p className="text-sm leading-[2]" style={{ color: "rgba(240,232,255,0.85)" }}>
              {MOCK.message}
            </p>
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
                  background: "rgba(80,40,140,0.15)",
                  border: "1px solid rgba(150,100,255,0.18)",
                }}
              >
                <p className="text-[9px] tracking-[0.2em] mb-2" style={{ color: "rgba(201,168,76,0.5)" }}>
                  {label}
                </p>
                <p className="text-sm font-bold" style={{ color: "#d4b8ff" }}>
                  {value}
                </p>
              </div>
            ))}
          </div>

          {/* 名言 */}
          <div className="text-center py-4">
            <p
              className="text-lg italic leading-relaxed px-4"
              style={{
                color: "rgba(201,168,76,0.9)",
                borderLeft: "2px solid rgba(150,100,255,0.3)",
                borderRight: "2px solid rgba(150,100,255,0.3)",
              }}
            >
              &ldquo;{MOCK.quote}&rdquo;
            </p>
          </div>

          {/* フッター */}
          <div className="text-center">
            <p className="text-[9px] tracking-[0.4em] uppercase" style={{ color: "rgba(150,100,255,0.3)" }}>
              HOSHIYOMI · AI Fortune
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
