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
  { label: "OVERALL", key: "overall" as const },
  { label: "LOVE", key: "love" as const },
  { label: "WORK", key: "work" as const },
  { label: "MONEY", key: "money" as const },
  { label: "HEALTH", key: "health" as const },
];

function CyberScoreRow({ label, score }: { label: string; score: number }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1.5">
        <span style={{ color: "rgba(0,229,204,0.6)", letterSpacing: "0.2em", fontFamily: "monospace" }}>
          {label}
        </span>
        <span style={{ color: "#00e5cc", fontFamily: "monospace" }}>
          {String(score * 20).padStart(3, "0")}%
        </span>
      </div>
      <div
        style={{
          height: "2px",
          background: "rgba(0,229,204,0.1)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${score * 20}%`,
            background: "linear-gradient(90deg, #00e5cc, #9b3dfc)",
            boxShadow: "0 0 8px rgba(0,229,204,0.6)",
          }}
        />
      </div>
    </div>
  );
}

export default function CyberDesignPage() {
  return (
    <main
      className="min-h-screen px-6 py-12"
      style={{ background: "#050a14" }}
    >
      {/* スキャンライン風の背景 */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: [
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,229,204,0.015) 2px, rgba(0,229,204,0.015) 4px)",
            "radial-gradient(ellipse 70% 50% at 50% 50%, rgba(0,229,204,0.04) 0%, transparent 70%)",
          ].join(", "),
        }}
      />

      <div className="relative max-w-lg mx-auto">
        {/* ナビ */}
        <div className="flex items-center justify-between mb-12">
          <Link
            href="/design-test"
            className="text-xs tracking-[0.3em] uppercase transition-opacity hover:opacity-60"
            style={{ color: "rgba(0,229,204,0.45)", fontFamily: "monospace" }}
          >
            ← BACK
          </Link>
          <span className="text-[9px] tracking-[0.4em] uppercase" style={{ color: "rgba(0,229,204,0.25)", fontFamily: "monospace" }}>
            DESIGN_D // CYBER
          </span>
        </div>

        <div className="space-y-8">
          {/* ヘッダー */}
          <div className="space-y-2">
            <p
              className="text-[9px] tracking-[0.5em] uppercase"
              style={{ color: "rgba(0,229,204,0.4)", fontFamily: "monospace" }}
            >
              // AI_FORTUNE_ANALYSIS v2.4
            </p>
            <div
              className="p-5"
              style={{
                background: "rgba(0,229,204,0.04)",
                border: "1px solid rgba(0,229,204,0.2)",
                borderLeft: "3px solid #00e5cc",
              }}
            >
              <h1
                className="text-4xl font-bold"
                style={{
                  color: "#00e5cc",
                  fontFamily: "monospace",
                  textShadow: "0 0 20px rgba(0,229,204,0.5), 0 0 40px rgba(0,229,204,0.2)",
                  letterSpacing: "0.05em",
                }}
              >
                {MOCK.zodiac}
              </h1>
              <p
                className="text-xs mt-2"
                style={{ color: "rgba(0,229,204,0.5)", fontFamily: "monospace" }}
              >
                LP:{MOCK.lp} / BLOOD:{MOCK.blood} / STATUS:ACTIVE
              </p>
            </div>
          </div>

          {/* スコア */}
          <div
            className="p-6 space-y-4"
            style={{
              background: "rgba(0,10,20,0.6)",
              border: "1px solid rgba(0,229,204,0.15)",
            }}
          >
            <p
              className="text-[9px] tracking-[0.35em] uppercase mb-5"
              style={{ color: "rgba(0,229,204,0.4)", fontFamily: "monospace" }}
            >
              FORTUNE_METRICS
            </p>
            {SCORES.map(({ label, key }) => (
              <CyberScoreRow key={key} label={label} score={MOCK.scores[key]} />
            ))}
          </div>

          {/* メッセージ */}
          <div
            className="p-6"
            style={{
              background: "rgba(155,61,252,0.06)",
              border: "1px solid rgba(155,61,252,0.2)",
              borderLeft: "2px solid rgba(155,61,252,0.6)",
            }}
          >
            <p
              className="text-[9px] tracking-[0.35em] uppercase mb-3"
              style={{ color: "rgba(155,61,252,0.55)", fontFamily: "monospace" }}
            >
              &gt; ORACLE_OUTPUT
            </p>
            <p className="text-sm leading-[2]" style={{ color: "rgba(224,248,255,0.75)" }}>
              {MOCK.message}
            </p>
          </div>

          {/* ラッキー */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "COLOR", value: MOCK.luckyColor },
              { label: "ITEM", value: MOCK.luckyItem },
              { label: "CAUTION", value: MOCK.caution },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="p-4 text-center"
                style={{
                  background: "rgba(0,229,204,0.04)",
                  border: "1px solid rgba(0,229,204,0.12)",
                }}
              >
                <p
                  className="text-[8px] tracking-[0.25em] mb-2 uppercase"
                  style={{ color: "rgba(0,229,204,0.4)", fontFamily: "monospace" }}
                >
                  {label}
                </p>
                <p className="text-xs font-bold" style={{ color: "#00e5cc", fontFamily: "monospace" }}>
                  {value}
                </p>
              </div>
            ))}
          </div>

          {/* 名言 */}
          <div
            className="p-5 text-center"
            style={{
              background: "rgba(0,229,204,0.03)",
              border: "1px solid rgba(0,229,204,0.1)",
            }}
          >
            <p
              className="text-[9px] tracking-[0.3em] uppercase mb-3"
              style={{ color: "rgba(0,229,204,0.35)", fontFamily: "monospace" }}
            >
              &gt; KEY_PHRASE
            </p>
            <p
              className="text-base"
              style={{
                color: "#00e5cc",
                fontFamily: "monospace",
                textShadow: "0 0 12px rgba(0,229,204,0.4)",
              }}
            >
              &ldquo;{MOCK.quote}&rdquo;
            </p>
          </div>

          {/* フッター */}
          <div className="text-center">
            <p
              className="text-[9px] tracking-[0.4em] uppercase"
              style={{ color: "rgba(0,229,204,0.2)", fontFamily: "monospace" }}
            >
              HOSHIYOMI_AI // END_OF_REPORT
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
