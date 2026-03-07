import Link from "next/link";

const SECTIONS = [
  {
    title: "第1条（適用）",
    body: "本利用規約（以下「本規約」）は、星詠み（hoshiyomi.xyz、以下「本サービス」）の利用条件を定めるものです。ユーザーは本規約に同意のうえ、本サービスをご利用ください。",
  },
  {
    title: "第2条（利用登録）",
    body: "本サービスへの登録は、GoogleアカウントまたはLINEアカウントによる認証をもって完了します。登録にあたり虚偽の情報を提供することを禁止します。",
  },
  {
    title: "第3条（サービス内容）",
    body: "本サービスは、西洋占星術・数秘術・血液型占いをAIで組み合わせた鑑定結果を提供するエンターテインメントサービスです。鑑定結果は娯楽目的のものであり、医療・法律・投資等の専門的判断の代替とはなりません。",
  },
  {
    title: "第4条（有料プラン）",
    body: "プレミアムプランは月額¥980（税込）です。Stripeを通じてクレジットカードで決済されます。プランは毎月自動更新されます。解約はいつでもマイページから行うことができ、解約後は当該請求期間の終了まで引き続きご利用いただけます。",
  },
  {
    title: "第5条（禁止事項）",
    body: [
      "本サービスの利用にあたり、以下の行為を禁止します。",
      "・法令または公序良俗に違反する行為",
      "・本サービスのコンテンツを無断で複製・転載・商業利用する行為",
      "・本サービスのシステムに過度な負荷をかける行為",
      "・他のユーザーまたは第三者に不利益・損害を与える行為",
      "・その他、当サービス運営者が不適切と判断する行為",
    ].join("\n"),
  },
  {
    title: "第6条（免責事項）",
    body: "本サービスの鑑定結果はAIによって生成されるエンターテインメントコンテンツです。鑑定結果の正確性・完全性を保証するものではなく、利用者が鑑定結果に基づいて行った行動の結果について、当サービス運営者は一切の責任を負いません。",
  },
  {
    title: "第7条（サービスの変更・停止）",
    body: "当サービス運営者は、ユーザーへの事前通知なく本サービスの内容を変更・停止することがあります。これによってユーザーに生じた損害について、当サービス運営者は責任を負いません。",
  },
  {
    title: "第8条（準拠法・管轄裁判所）",
    body: "本規約は日本法に準拠します。本サービスに関する紛争については、当サービス運営者の所在地を管轄する裁判所を専属的合意管轄とします。",
  },
  {
    title: "第9条（規約の変更）",
    body: "当サービス運営者は、必要に応じて本規約を変更することができます。変更後の規約は本サービス上に掲載した時点で効力を生じます。",
  },
];

export default function TermsPage() {
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
          <h1 className="text-2xl font-bold text-[#e8d08a]">利用規約</h1>
          <p className="text-[10px] text-[#f5eedd]/30 tracking-wider mt-3">最終更新：2025年6月</p>
        </div>

        <div className="space-y-8">
          {SECTIONS.map(({ title, body }) => (
            <div key={title} style={{ borderLeft: "2px solid rgba(212,168,76,0.2)", paddingLeft: "16px" }}>
              <p className="text-xs font-bold text-[#d4a84c]/80 tracking-wider mb-2">{title}</p>
              <p className="text-xs text-[#f5eedd]/65 leading-[2] whitespace-pre-line">{body}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 flex justify-center gap-6 text-[10px] tracking-[0.2em] text-[#f5eedd]/30">
          <Link href="/tokusho" className="hover:text-[#d4a84c]/60 transition-colors">特定商取引法</Link>
          <Link href="/privacy" className="hover:text-[#d4a84c]/60 transition-colors">プライバシーポリシー</Link>
        </div>
      </div>
    </main>
  );
}
