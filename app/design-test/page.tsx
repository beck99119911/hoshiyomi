import Link from "next/link";

const DESIGNS = [
  {
    id: "washi",
    name: "A. 和紙 × 水墨",
    desc: "日本の伝統美。和紙テクスチャ × 墨と朱のコントラスト",
    dot: "#8b1a1a",
    tag: "日本らしさ",
  },
  {
    id: "tarot",
    name: "B. タロットカード",
    desc: "各運勢をカードとして表示。ドラマチックな体験 × シェア映え",
    dot: "#9b3dfc",
    tag: "SNS映え",
  },
  {
    id: "minimal",
    name: "C. ラグジュアリーミニマル",
    desc: "白 × 金の高級感。GINZA路線。余白が語る品格",
    dot: "#c9a84c",
    tag: "高単価層向け",
  },
  {
    id: "cyber",
    name: "D. サイバー占い師",
    desc: "ネオン × AI感を前面に。「占い＝テック」という新しい世界観",
    dot: "#00e5cc",
    tag: "20代男性向け",
  },
  {
    id: "particle",
    name: "E. 動く星空",
    desc: "現デザインにアニメーションで差をつける。最もリスクが低い改修",
    dot: "#d4a84c",
    tag: "現行ベース",
  },
];

export default function DesignTestPage() {
  return (
    <>
      <div className="stars" />
      <main className="relative z-10 min-h-screen text-[#f0e8d8] px-6 py-12">
        <div className="max-w-lg mx-auto">

          <div className="flex items-center justify-between mb-12">
            <Link
              href="/"
              className="text-xs tracking-[0.3em] text-[#d4a84c]/60 hover:text-[#d4a84c] transition-colors uppercase"
            >
              ← Home
            </Link>
            <span className="text-xs tracking-widest text-[#f5eedd]/30 uppercase">Design Test</span>
          </div>

          <div className="text-center mb-10">
            <p className="text-[10px] tracking-[0.4em] text-[#d4a84c]/60 uppercase mb-2">Preview</p>
            <h1 className="text-2xl font-bold">
              <span className="gold-text">デザイン比較</span>
            </h1>
            <p className="text-xs text-[#f5eedd]/40 mt-2 tracking-wider">
              各パターンをタップしてフルプレビュー
            </p>
          </div>

          <div className="space-y-2">
            {DESIGNS.map((d) => (
              <Link
                key={d.id}
                href={`/design-test/${d.id}`}
                className="flex items-center gap-5 p-6 transition-all duration-200 hover:opacity-75 group"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ background: d.dot, boxShadow: `0 0 8px ${d.dot}80` }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-bold text-[#f0e8d8]">{d.name}</p>
                    <span
                      className="text-[9px] tracking-wider px-1.5 py-0.5"
                      style={{
                        background: `${d.dot}18`,
                        border: `1px solid ${d.dot}40`,
                        color: d.dot,
                      }}
                    >
                      {d.tag}
                    </span>
                  </div>
                  <p className="text-xs text-[#f5eedd]/45 leading-relaxed">{d.desc}</p>
                </div>
                <span className="text-[#d4a84c]/50 text-sm group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </Link>
            ))}
          </div>

          <p className="text-center text-[10px] text-[#f5eedd]/25 tracking-wider mt-8">
            ※ 各ページはダミーデータで表示しています
          </p>
        </div>
      </main>
    </>
  );
}
