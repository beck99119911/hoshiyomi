import Link from "next/link";

const ROWS = [
  { label: "販売業者", value: "茂木正之" },
  { label: "代表者名", value: "茂木正之" },
  { label: "所在地", value: "千葉県松戸市新松戸" },
  { label: "電話番号", value: "090-4435-5595" },
  { label: "メールアドレス", value: "homenote.net@gmail.com" },
  { label: "サービス名", value: "星詠み（hoshiyomi.xyz）" },
  { label: "販売価格", value: "プレミアムプラン ¥980 / 月（税込）" },
  { label: "お支払い方法", value: "クレジットカード（Visa・Mastercard・American Express・JCB）" },
  { label: "お支払い時期", value: "ご購入時に即時決済" },
  { label: "サービス提供時期", value: "決済完了後、即時ご利用いただけます。" },
  {
    label: "返金・キャンセルについて",
    value:
      "デジタルコンテンツの性質上、原則として返金・キャンセルはお受けできません。ただし、サービス側の重大な不具合が原因である場合はこの限りではありません。",
  },
  {
    label: "動作環境",
    value:
      "インターネット接続環境のあるスマートフォン・PC・タブレット。推奨ブラウザ：Chrome・Safari・Edge（各最新版）",
  },
];

export default function TokushoPage() {
  return (
    <main className="relative z-10 min-h-screen text-[#f0e8d8] px-6 py-12">
      <div className="max-w-lg mx-auto">

        <div className="flex items-center justify-between mb-12">
          <Link
            href="/"
            className="text-xs tracking-[0.3em] text-[#d4a84c]/60 hover:text-[#d4a84c] transition-colors uppercase"
          >
            ← Hoshiyomi
          </Link>
        </div>

        <div className="text-center mb-10">
          <p className="text-[10px] tracking-[0.4em] text-[#d4a84c]/60 uppercase mb-3">Legal</p>
          <h1 className="text-2xl font-bold text-[#e8d08a]">特定商取引法に基づく表記</h1>
        </div>

        <div className="space-y-0" style={{ border: "1px solid rgba(212,168,76,0.2)" }}>
          {ROWS.map(({ label, value }) => (
            <div
              key={label}
              className="grid grid-cols-3 gap-4 px-5 py-4"
              style={{ borderBottom: "1px solid rgba(212,168,76,0.1)" }}
            >
              <p className="text-xs text-[#d4a84c]/70 tracking-wider leading-relaxed">{label}</p>
              <p className="col-span-2 text-xs text-[#f5eedd]/75 leading-relaxed">{value}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 flex justify-center gap-6 text-[10px] tracking-[0.2em] text-[#f5eedd]/30">
          <Link href="/terms" className="hover:text-[#d4a84c]/60 transition-colors">利用規約</Link>
          <Link href="/privacy" className="hover:text-[#d4a84c]/60 transition-colors">プライバシーポリシー</Link>
        </div>
      </div>
    </main>
  );
}
