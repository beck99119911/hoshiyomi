import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { TwitterApi } from "twitter-api-v2";

export const maxDuration = 60;

const ZODIACS = [
  "牡羊座", "牡牛座", "双子座", "蟹座",
  "獅子座", "乙女座", "天秤座", "蠍座",
  "射手座", "山羊座", "水瓶座", "魚座",
];

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const testMode = url.searchParams.get("test") === "1";
  const targets = testMode ? [ZODIACS[0]] : ZODIACS;

  const twitter = new TwitterApi({
    appKey:            process.env.X_API_KEY!,
    appSecret:         process.env.X_API_SECRET!,
    accessToken:       process.env.X_ACCESS_TOKEN!,
    accessSecret:      process.env.X_ACCESS_TOKEN_SECRET!,
  });

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const now = new Date();
  const today = now.toLocaleDateString("ja-JP", { timeZone: "Asia/Tokyo", month: "long", day: "numeric", weekday: "long" });
  // 曜日ごとにテーマを変える（0=日〜6=土）
  const THEMES = [
    "今日の総合運と気をつけるべきこと",       // 日
    "今週の仕事運・チャンスをつかむヒント",    // 月
    "人間関係・コミュニケーションの運勢",      // 火
    "恋愛運・パートナーシップについて",        // 水
    "金運・買い物・投資のタイミング",          // 木
    "健康運・体と心のケアアドバイス",          // 金
    "今週の振り返りと来週への準備",            // 土
  ];
  const theme = THEMES[now.getDay()];

  // 星座ごとに異なるフォーマットを使う
  const FORMATS = [
    "今日のラッキーアクションを1つ具体的に（時間帯・場所・行動）",
    "注意すべきことと、それを乗り越えるコツ",
    "今日のキーワードを1語挙げて、その理由を一言で",
    "朝・昼・夜のどの時間帯に運気が高まるか",
    "今日関わると良い人のタイプや出会いのヒント",
  ];

  // 全星座のツイートテキストを並列生成
  const generated = await Promise.all(
    targets.map(async (zodiac) => {
      const format = FORMATS[ZODIACS.indexOf(zodiac) % FORMATS.length];
      try {
        const res = await anthropic.messages.create({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 256,
          messages: [{
            role: "user",
            content: `${today}の${zodiac}について、テーマ「${theme}」でツイートを1件作成してください。

フォーカス：${format}

条件：
・140文字以内
・具体的な描写を含む（数字・時間帯・行動・場所など）
・抽象的な表現（「良い運気」「チャンス到来」など）は禁止
・最後に「#星詠み #AI占い #${zodiac}」を付ける
・絵文字を1〜2個使う
・URLは含めない
・ツイート本文のみ出力`,
          }],
        });
        const text = res.content[0].type === "text" ? res.content[0].text.trim() : null;
        return { zodiac, text };
      } catch (err) {
        return { zodiac, text: null, error: String(err) };
      }
    })
  );

  // ツイートを順番に投稿（Twitter API負荷分散のため1秒間隔）
  const results: { zodiac: string; ok: boolean; error?: string }[] = [];
  for (const { zodiac, text, error } of generated) {
    if (!text) {
      results.push({ zodiac, ok: false, error });
      continue;
    }
    try {
      await twitter.v2.tweet(`${text}\n\nhoshiyomi.xyz`);
      results.push({ zodiac, ok: true });
    } catch (err) {
      results.push({ zodiac, ok: false, error: String(err) });
    }
    await new Promise((r) => setTimeout(r, 1000));
  }

  return NextResponse.json({ date: today, results });
}
