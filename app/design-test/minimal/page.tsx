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

function MinimalScoreRow({ label, score }: { label: string; score: number }) {
  return (
    <div className="flex items-center gap-4">
      <span
        className="text-xs w-16 flex-shrink-0"
        style={{ color: "rgba(26,26,26,0.45)", letterSpacing: "0.1em" }}
      >
        {label}
      </span>
      <div className="flex-1" style={{ height: "1px", background: "rgba(26,26,26,0.08)" }}>
        <div
          style={{
            height: "100%",
            width: `${score * 20}%`,
            background: "#1a1a1a",
          }}
        />
      </div>
      <span className="text-xs w-6 text-right" style={{ color: "rgba(26,26,26,0.35)" }}>
        {score}
      </span>
    </div>
  );
}

export default function MinimalDesignPage() {
  return (
    <main
      className="min-h-screen px-8 py-12"
      style={{ background: "#faf8f5", color: "#1a1a1a" }}
    >
      <div className="max-w-lg mx-auto">
        {/* ナビ */}
        <div className="flex items-center justify-between mb-16">
          <Link
            href="/design-test"
            className="text-xs tracking-[0.3em] uppercase transition-opacity hover:opacity-60"
            style={{ color: "rgba(26,26,26,0.35)" }}
          >
            ← 戻る
          </Link>
          <span className="text-[9px] tracking-[0.4em] uppercase" style={{ color: "rgba(26,26,26,0.25)" }}>
            Design C · Minimal
          </span>
        </div>

        <div className="space-y-14">
          {/* ヘッダー */}
          <div className="space-y-4">
            <p
              className="text-[9px] tracking-[0.5em] uppercase"
              style={{ color: "rgba(201,168,76,0.7)" }}
            >
              AI Fortune Reading
            </p>
            <h1
              className="text-5xl font-bold tracking-tight"
              style={{ color: "#1a1a1a", fontFamily: "serif" }}
            >
              {MOCK.zodiac}
            </h1>
            <p className="text-xs tracking-widest" style={{ color: "rgba(26,26,26,0.35)" }}>
              Life Path {MOCK.lp} · {MOCK.blood}
            </p>
            <div style={{ width: "32px", height: "1px", background: "rgba(201,168,76,0.6)" }} />
          </div>

          {/* スコア */}
          <div className="space-y-5">
            <p className="text-[9px] tracking-[0.4em] uppercase" style={{ color: "rgba(26,26,26,0.3)" }}>
              Scores
            </p>
            {SCORES.map(({ label, key }) => (
              <MinimalScoreRow key={key} label={label} score={MOCK.scores[key]} />
            ))}
          </div>

          {/* 区切り */}
          <div style={{ height: "1px", background: "rgba(26,26,26,0.08)" }} />

          {/* メッセージ */}
          <div className="space-y-4">
            <p className="text-[9px] tracking-[0.4em] uppercase" style={{ color: "rgba(26,26,26,0.3)" }}>
              Message
            </p>
            <p className="text-sm leading-[2.4]" style={{ color: "rgba(26,26,26,0.75)" }}>
              {MOCK.message}
            </p>
          </div>

          {/* ラッキー */}
          <div className="grid grid-cols-3 gap-px" style={{ background: "rgba(26,26,26,0.08)" }}>
            {[
              { label: "Color", value: MOCK.luckyColor },
              { label: "Item", value: MOCK.luckyItem },
              { label: "Caution", value: MOCK.caution },
            ].map(({ label, value }) => (
              <div key={label} className="p-5 text-center" style={{ background: "#faf8f5" }}>
                <p
                  className="text-[9px] tracking-[0.3em] uppercase mb-2"
                  style={{ color: "rgba(26,26,26,0.3)" }}
                >
                  {label}
                </p>
                <p className="text-sm" style={{ color: "#1a1a1a", fontFamily: "serif" }}>
                  {value}
                </p>
              </div>
            ))}
          </div>

          {/* 名言 */}
          <div className="py-8 text-center space-y-3">
            <div style={{ width: "1px", height: "32px", background: "rgba(201,168,76,0.4)", margin: "0 auto" }} />
            <p
              className="text-xl leading-relaxed"
              style={{ color: "#1a1a1a", fontFamily: "serif", fontStyle: "italic" }}
            >
              &ldquo;{MOCK.quote}&rdquo;
            </p>
            <div style={{ width: "1px", height: "32px", background: "rgba(201,168,76,0.4)", margin: "0 auto" }} />
          </div>

          {/* フッター */}
          <div className="text-center">
            <p className="text-[9px] tracking-[0.5em] uppercase" style={{ color: "rgba(26,26,26,0.2)" }}>
              Hoshiyomi
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
