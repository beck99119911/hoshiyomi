import Link from "next/link";

export default function Home() {
  return (
    <>
      <div className="stars" />
      <main className="relative z-10 min-h-screen text-[#f0e8d8]">

        {/* ── Hero ── */}
        <section className="relative flex flex-col items-center justify-center min-h-screen px-6 text-center overflow-hidden">
          {/* 背景の光 */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: [
                "radial-gradient(ellipse 70% 55% at 50% 55%, rgba(212,168,76,0.12) 0%, transparent 65%)",
                "radial-gradient(ellipse 40% 30% at 50% 40%, rgba(150,120,220,0.08) 0%, transparent 60%)",
              ].join(", "),
            }}
          />

          {/* シンボル */}
          <div className="float mb-10 relative">
            {/* 外側の大きなグロー */}
            <div
              className="absolute -inset-8 rounded-full shimmer"
              style={{ background: "radial-gradient(circle, rgba(212,168,76,0.12) 0%, transparent 70%)" }}
            />
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center"
              style={{
                background: "radial-gradient(circle, rgba(212,168,76,0.22) 0%, rgba(150,120,220,0.08) 60%, transparent 100%)",
                border: "1px solid rgba(212,168,76,0.5)",
                boxShadow: "0 0 30px rgba(212,168,76,0.2), inset 0 0 20px rgba(212,168,76,0.08)",
              }}
            >
              <span className="text-5xl">☽</span>
            </div>
            <div
              className="absolute -inset-3 rounded-full shimmer"
              style={{ border: "1px solid rgba(212,168,76,0.25)" }}
            />
          </div>

          {/* タイトル */}
          <p className="fade-in-up fade-in-up-1 text-xs tracking-[0.4em] text-[#c9a84c] mb-4 uppercase">
            AI Fortune Reading
          </p>
          <h1 className="fade-in-up fade-in-up-2 text-5xl md:text-7xl font-bold mb-2 tracking-tight">
            <span className="gold-text">星詠み</span>
          </h1>
          <p className="fade-in-up fade-in-up-2 text-sm tracking-[0.3em] text-[#c9a84c]/60 mb-8">
            HOSHIYOMI
          </p>

          <p className="fade-in-up fade-in-up-3 text-base md:text-lg text-[#f5eedd]/80 max-w-sm leading-relaxed mb-12">
            西洋占星術・数秘術・血液型——<br />
            3つの叡智が交わるとき、<br />
            あなただけの答えが現れる。
          </p>

          <div className="fade-in-up fade-in-up-4">
            <Link
              href="/fortune"
              className="group relative inline-flex items-center gap-3 px-10 py-4 text-sm tracking-widest uppercase transition-all duration-300"
              style={{
                background: "linear-gradient(135deg, rgba(201,168,76,0.15), rgba(201,168,76,0.05))",
                border: "1px solid rgba(201,168,76,0.5)",
              }}
            >
              <span className="gold-text font-bold">無料で鑑定を始める</span>
              <span className="text-[#c9a84c] group-hover:translate-x-1 transition-transform">→</span>
              {/* ホバー効果 */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: "linear-gradient(135deg, rgba(201,168,76,0.08), transparent)" }}
              />
            </Link>
            <p className="mt-4 text-xs text-[#f0e8d8]/30 tracking-wider">
              登録不要 · 1日3回まで無料
            </p>
          </div>

          {/* スクロール */}
          <div className="absolute bottom-10 flex flex-col items-center gap-2 text-[#c9a84c]/40">
            <span className="text-xs tracking-widest">SCROLL</span>
            <div className="w-px h-12 bg-gradient-to-b from-[#c9a84c]/40 to-transparent" />
          </div>
        </section>

        {/* ── 3つの占術 ── */}
        <section className="px-6 pb-32 max-w-2xl mx-auto">
          <div className="divider mb-16">Three Wisdoms</div>

          <div className="space-y-6">
            {[
              {
                symbol: "♈︎",
                en: "Western Astrology",
                ja: "西洋占星術",
                desc: "生年月日から読み取る星座と天体の配置が、あなたの本質と今の運気の流れを映し出します。",
              },
              {
                symbol: "∞",
                en: "Numerology",
                ja: "数秘術",
                desc: "生年月日から導かれるライフパスナンバーが、あなたの魂の使命と今週の指針を示します。",
              },
              {
                symbol: "◈",
                en: "Blood Type",
                ja: "血液型占い",
                desc: "日本固有の占い文化に根ざした血液型の特性を加え、3つの叡智が交わる独自の鑑定を実現します。",
              },
            ].map((item, i) => (
              <div
                key={item.ja}
                className="glass gold-border rounded-none p-8 flex gap-6 items-start"
                style={{ borderLeft: "2px solid rgba(201,168,76,0.4)" }}
              >
                <div className="flex-shrink-0">
                  <span
                    className="text-2xl gold-text font-light"
                    style={{ fontFamily: "serif" }}
                  >
                    {item.symbol}
                  </span>
                </div>
                <div>
                  <p className="text-[10px] tracking-[0.3em] text-[#c9a84c]/60 mb-1 uppercase">
                    {String(i + 1).padStart(2, "0")} · {item.en}
                  </p>
                  <h3 className="text-lg font-bold text-[#e8d08a] mb-2">{item.ja}</h3>
                  <p className="text-sm text-[#f5eedd]/70 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ── サンプル鑑定 ── */}
          <div className="mt-20">
            <div className="divider mb-12">Sample Reading</div>

            <div
              className="glass gold-border p-8 space-y-6"
              style={{ borderTop: "1px solid rgba(201,168,76,0.5)" }}
            >
              <div>
                <p className="text-[10px] tracking-[0.3em] text-[#c9a84c]/60 uppercase mb-1">
                  獅子座 · ライフパス6 · A型
                </p>
                <p className="text-xs text-[#f0e8d8]/40">2025年 今週の鑑定より</p>
              </div>

              <div className="space-y-3">
                {[
                  ["総合運", 4],
                  ["恋愛運", 5],
                  ["仕事運", 3],
                  ["金運", 3],
                ].map(([label, score]) => (
                  <div key={String(label)}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[#f0e8d8]/60">{label}</span>
                      <span className="text-[#c9a84c]">{"●".repeat(Number(score))}{"○".repeat(5 - Number(score))}</span>
                    </div>
                    <div className="score-bar">
                      <div className="score-bar-fill" style={{ width: `${Number(score) * 20}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-sm text-[#f5eedd]/75 leading-relaxed border-l-2 border-[#d4a84c]/45 pl-4">
                「木曜日の午後、普段関わりの薄い人からの一言が転機になりそうです。
                その言葉を聞き流さないでください——あなたの背中を押す鍵が、そこにあります。」
              </p>

              <p className="text-center text-[#d4a84c]/85 text-sm italic tracking-wide">
                &ldquo; 完璧なタイミングは、動いた先にある。 &rdquo;
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-16">
            <Link
              href="/fortune"
              className="group relative inline-flex items-center gap-3 px-10 py-4 text-sm tracking-widest uppercase transition-all duration-300"
              style={{
                background: "linear-gradient(135deg, rgba(201,168,76,0.15), rgba(201,168,76,0.05))",
                border: "1px solid rgba(201,168,76,0.5)",
              }}
            >
              <span className="gold-text font-bold">鑑定を始める</span>
              <span className="text-[#c9a84c] group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
