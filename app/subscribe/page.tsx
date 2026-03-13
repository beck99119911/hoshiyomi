import Link from "next/link";

export default function SubscribePage() {
  return (
    <main className="relative z-10 min-h-screen text-[#f0e8d8] px-6 py-12">
      <div className="max-w-md mx-auto">

        <div className="flex items-center justify-between mb-12">
          <Link
            href="/fortune"
            className="text-xs tracking-[0.3em] text-[#d4a84c]/60 hover:text-[#d4a84c] transition-colors uppercase"
          >
            ← Fortune
          </Link>
        </div>

        <div className="text-center mb-10">
          <p className="text-[10px] tracking-[0.4em] text-[#d4a84c]/60 uppercase mb-3">Premium Plan</p>
          <h1 className="text-3xl font-bold"><span className="gold-text">プレミアムに登録</span></h1>
          <p className="text-xs text-[#f0e8d8]/30 tracking-wider mt-2">月額 ¥980（税込）· いつでも解約可能</p>
        </div>

        {/* プラン内容 */}
        <div
          className="mb-8 p-6 space-y-3"
          style={{ background: "rgba(212,168,76,0.04)", border: "1px solid rgba(212,168,76,0.2)" }}
        >
          {[
            "運勢・手相を1日何度でも（無制限）",
            "鑑定メッセージ全文を音声で聴ける",
            "相性診断の全結果表示",
            "相性診断のAIアドバイス全表示",
          ].map((item) => (
            <div key={item} className="flex items-center gap-3 text-sm text-[#f5eedd]/70">
              <span className="text-[#d4a84c]">✦</span>
              <span>{item}</span>
            </div>
          ))}
        </div>

        {/* 決済準備中 */}
        <div
          className="py-10 text-center space-y-4"
          style={{ border: "1px solid rgba(212,168,76,0.2)", background: "rgba(212,168,76,0.03)" }}
        >
          <p className="text-2xl">🔧</p>
          <p className="text-sm tracking-widest text-[#d4a84c]/80">決済機能 準備中</p>
          <p className="text-xs text-[#f0e8d8]/40 leading-relaxed">
            現在、決済システムの導入手続きを進めています。<br />
            準備が整い次第、ご利用いただけます。
          </p>
        </div>

        <p className="text-center text-[10px] text-[#f0e8d8]/20 tracking-wider leading-relaxed mt-6">
          もうしばらくお待ちください。
        </p>
      </div>
    </main>
  );
}
