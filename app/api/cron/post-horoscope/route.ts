import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { TwitterApi } from "twitter-api-v2";

export const maxDuration = 60;

// 曜日ごとのテーマ（0=日〜6=土）
const THEMES = [
  "今日の総合的な星の流れと、全員に共通する気づき",
  "新しい週の始まりに、背中を押す星のメッセージ",
  "人間関係・言葉のやり取りにまつわる星の動き",
  "感情・恋愛・大切な人への星からのヒント",
  "金運・選択・決断のタイミングについての星の声",
  "体と心のケア、週末前の自分を整えるメッセージ",
  "今週の振り返りと、来週への星のエール",
];

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const twitter = new TwitterApi({
    appKey:        process.env.X_API_KEY!,
    appSecret:     process.env.X_API_SECRET!,
    accessToken:   process.env.X_ACCESS_TOKEN!,
    accessSecret:  process.env.X_ACCESS_TOKEN_SECRET!,
  });

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const now = new Date();
  const jstDate = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Tokyo" }));
  const today = now.toLocaleDateString("ja-JP", { timeZone: "Asia/Tokyo", month: "long", day: "numeric", weekday: "long" });
  const theme = THEMES[now.getDay()];

  // URLに日付パラメータを付けてbot判定を回避
  const dateParam = `${jstDate.getFullYear()}${String(jstDate.getMonth() + 1).padStart(2, "0")}${String(jstDate.getDate()).padStart(2, "0")}`;
  const siteUrl = `hoshiyomi.xyz/?d=${dateParam}`;

  // 誘導文をランダム化
  const CTA_TEMPLATES = [
    `あなただけの鑑定は → ${siteUrl}`,
    `詳しい鑑定はこちら👇 ${siteUrl}`,
    `AIで個別鑑定 → ${siteUrl}`,
    `あなたの運勢を診る → ${siteUrl}`,
    `今日の詳細はこちら → ${siteUrl}`,
  ];
  const cta = CTA_TEMPLATES[Math.floor(Math.random() * CTA_TEMPLATES.length)];

  const res = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 300,
    messages: [{
      role: "user",
      content: `${today}の星の流れをテーマに、占いアカウントのツイートを1件作成してください。

テーマ：${theme}

条件：
・全星座共通の内容（特定の星座名を出さない）
・詩的で温かみがあり、読んだ人が少し前向きになれる文章
・2〜4行の短い本文
・最後の行は必ずこの一文をそのまま使う：「${cta}」
・ハッシュタグは「#今日の運勢 #星詠み #占い」の3つのみ
・絵文字を1〜2個
・本文のみ出力（前置き不要）`,
    }],
  });

  const text = res.content[0].type === "text" ? res.content[0].text.trim() : null;
  if (!text) {
    return NextResponse.json({ error: "生成失敗" }, { status: 500 });
  }

  try {
    await twitter.v2.tweet(text);
    return NextResponse.json({ date: today, ok: true, text });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err), text }, { status: 500 });
  }
}
