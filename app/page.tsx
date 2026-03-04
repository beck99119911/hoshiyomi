import Link from "next/link";
import AuthButton from "@/components/AuthButton";

export default function Home() {
  return (
    <>
    <style>{`
      @keyframes barFill { from { width: 0%; } }
      .bar-anim { animation: barFill 1.2s ease forwards; }
    `}</style>
    <main className="relative z-10 min-h-screen text-[#f0e8d8]">

      {/* ── Hero ── */}
      <section className="relative flex flex-col items-center justify-center min-h-screen px-6 text-center overflow-hidden">
        {/* 背景の光 */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: [
              "radial-gradient(ellipse 65% 50% at 50% 55%, rgba(212,168,76,0.10) 0%, transparent 65%)",
              "radial-gradient(ellipse 35% 25% at 50% 40%, rgba(150,120,220,0.07) 0%, transparent 60%)",
            ].join(", "),
          }}
        />

        {/* シンボル */}
        <div className="float mb-12 relative">
          <div
            className="absolute -inset-8 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(212,168,76,0.08) 0%, transparent 70%)" }}
          />
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{
              background: "radial-gradient(circle, rgba(212,168,76,0.18) 0%, rgba(150,120,220,0.06) 60%, transparent 100%)",
              border: "1px solid rgba(212,168,76,0.4)",
              boxShadow: "0 0 40px rgba(212,168,76,0.15), inset 0 0 20px rgba(212,168,76,0.06)",
            }}
          >
            <span className="text-4xl">☽</span>
          </div>
          <div
            className="absolute -inset-3 rounded-full shimmer"
            style={{ border: "1px solid rgba(212,168,76,0.18)" }}
          />
        </div>

        {/* タイトル */}
        <p className="fade-in-up fade-in-up-1 text-[10px] tracking-[0.5em] text-[#c9a84c]/70 mb-5 uppercase">
          AI Fortune Reading
        </p>
        <h1 className="fade-in-up fade-in-up-2 text-6xl md:text-8xl font-bold mb-2 tracking-tight">
          <span className="gold-text">星詠み</span>
        </h1>
        <p className="fade-in-up fade-in-up-2 text-[11px] tracking-[0.4em] text-[#c9a84c]/40 mb-10">
          HOSHIYOMI
        </p>

        <p className="fade-in-up fade-in-up-3 text-sm md:text-base text-[#f5eedd]/60 max-w-xs leading-[2] mb-14">
          西洋占星術・数秘術・血液型——<br />
          3つの叡智が交わるとき、<br />
          あなただけの答えが現れる。
        </p>

        <div className="fade-in-up fade-in-up-4">
          <Link
            href="/fortune"
            className="group relative inline-flex items-center gap-3 px-12 py-4 text-sm tracking-widest uppercase transition-all duration-300"
            style={{
              background: "linear-gradient(135deg, rgba(201,168,76,0.12), rgba(201,168,76,0.04))",
              border: "1px solid rgba(201,168,76,0.45)",
            }}
          >
            <span className="gold-text font-bold">無料で鑑定を始める</span>
            <span className="text-[#c9a84c] group-hover:translate-x-1 transition-transform">→</span>
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ background: "linear-gradient(135deg, rgba(201,168,76,0.06), transparent)" }}
            />
          </Link>
          <p className="mt-5 text-[10px] text-[#f0e8d8]/25 tracking-widest">
            登録不要 · 1日3回まで無料
          </p>
        </div>

        {/* 右上ナビ */}
        <div className="absolute top-6 right-6 flex items-center gap-4">
          <AuthButton />
        </div>

        {/* スクロール */}
        <div className="absolute bottom-10 flex flex-col items-center gap-2 text-[#c9a84c]/30">
          <span className="text-[10px] tracking-widest">SCROLL</span>
          <div className="w-px h-10 bg-gradient-to-b from-[#c9a84c]/30 to-transparent" />
        </div>
      </section>

      {/* ── 3つの占術 ── */}
      <section className="px-6 pb-32 max-w-xl mx-auto">
        <div className="divider mb-20">Three Wisdoms</div>

        <div className="space-y-1">
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
              className="py-8 px-2 flex gap-8 items-start"
              style={{ borderBottom: "1px solid rgba(212,168,76,0.1)" }}
            >
              <div className="flex-shrink-0 w-8 text-center">
                <span
                  className="text-xl gold-text font-light"
                  style={{ fontFamily: "serif" }}
                >
                  {item.symbol}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-[9px] tracking-[0.35em] text-[#c9a84c]/45 mb-1.5 uppercase">
                  {String(i + 1).padStart(2, "0")} · {item.en}
                </p>
                <h3 className="text-base font-bold text-[#e8d08a] mb-2">{item.ja}</h3>
                <p className="text-sm text-[#f5eedd]/55 leading-[1.9]">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── サンプル鑑定 ── */}
        <div className="mt-24">
          <div className="divider mb-14">Sample Reading</div>

          <div className="space-y-7">
            <div>
              <p className="text-[9px] tracking-[0.35em] text-[#c9a84c]/50 uppercase mb-1">
                獅子座 · ライフパス6 · A型
              </p>
              <p className="text-[10px] text-[#f0e8d8]/30">2025年 今週の鑑定より</p>
            </div>

            <div className="space-y-4">
              {[
                ["総合運", 4],
                ["恋愛運", 5],
                ["仕事運", 3],
                ["金運", 3],
              ].map(([label, score]) => (
                <div key={String(label)}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-[#f0e8d8]/50">{label}</span>
                    <span className="text-[#c9a84c]/80 tracking-widest">
                      {"●".repeat(Number(score))}{"○".repeat(5 - Number(score))}
                    </span>
                  </div>
                  <div className="score-bar">
                    <div
                      className="bar-anim"
                      style={{
                        height: "100%",
                        width: `${Number(score) * 20}%`,
                        background: "linear-gradient(90deg, #d4a84c, #f0d898)",
                        borderRadius: "999px",
                      } as React.CSSProperties}
                    />
                  </div>
                </div>
              ))}
            </div>

            <p
              className="text-sm text-[#f5eedd]/70 leading-[2]"
              style={{ borderLeft: "2px solid rgba(212,168,76,0.35)", paddingLeft: "16px" }}
            >
              「木曜日の午後、普段関わりの薄い人からの一言が転機になりそうです。
              その言葉を聞き流さないでください——あなたの背中を押す鍵が、そこにあります。」
            </p>

            <p className="text-center text-[#d4a84c]/75 text-sm italic tracking-wide">
              &ldquo; 完璧なタイミングは、動いた先にある。 &rdquo;
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-20">
          <Link
            href="/fortune"
            className="group relative inline-flex items-center gap-3 px-12 py-4 text-sm tracking-widest uppercase transition-all duration-300"
            style={{
              background: "linear-gradient(135deg, rgba(201,168,76,0.12), rgba(201,168,76,0.04))",
              border: "1px solid rgba(201,168,76,0.45)",
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
