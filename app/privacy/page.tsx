import Link from "next/link";

const SECTIONS = [
  {
    title: "1. 取得する情報",
    body: [
      "本サービスでは、以下の情報を取得します。",
      "・Googleアカウントまたは LINEアカウントによるログイン時に提供されるプロフィール情報（名前・メールアドレス・アカウントID）",
      "・入力いただいた生年月日・血液型・お悩みなどの鑑定情報",
      "・本サービスの利用状況（アクセスログ、利用回数など）",
      "・お支払い情報（決済処理はStripeが行うため、カード情報は当サービスに保存されません）",
    ].join("\n"),
  },
  {
    title: "2. 情報の利用目的",
    body: [
      "取得した情報は以下の目的で利用します。",
      "・本サービスの提供・改善",
      "・プレミアムプランの管理・決済処理",
      "・お問い合わせへの対応",
      "・不正利用の防止",
    ].join("\n"),
  },
  {
    title: "3. 第三者への提供",
    body: "当サービス運営者は、法令に基づく場合を除き、ユーザーの個人情報を第三者に提供しません。ただし、サービス運営のために以下の事業者と情報を共有する場合があります。\n・Google LLC（認証・分析）\n・LINE株式会社（認証）\n・Stripe, Inc.（決済処理）\n・Vercel Inc.（サービスホスティング）",
  },
  {
    title: "4. Cookieについて",
    body: "本サービスはセッション管理・認証のためにCookieを使用します。ブラウザの設定によりCookieを無効にすることができますが、一部機能が正常に動作しない場合があります。",
  },
  {
    title: "5. 情報の保管・管理",
    body: "取得した個人情報は適切なセキュリティ対策を講じて管理します。不要になった情報は速やかに削除します。",
  },
  {
    title: "6. 開示・訂正・削除",
    body: "ユーザーは自身の個人情報の開示・訂正・削除を請求できます。ご要望の場合はお問い合わせ先までご連絡ください。アカウントの削除により、関連する個人情報は削除されます。",
  },
  {
    title: "7. お問い合わせ",
    body: "個人情報の取り扱いに関するお問い合わせ：homenote.net@gmail.com",
  },
  {
    title: "8. 改定",
    body: "本プライバシーポリシーは、法令の変更やサービス内容の変化に応じて改定することがあります。重要な変更がある場合は本サービス上でお知らせします。",
  },
];

export default function PrivacyPage() {
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
          <h1 className="text-2xl font-bold text-[#e8d08a]">プライバシーポリシー</h1>
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
          <Link href="/terms" className="hover:text-[#d4a84c]/60 transition-colors">利用規約</Link>
        </div>
      </div>
    </main>
  );
}
