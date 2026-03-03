import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { TwitterApi } from "twitter-api-v2";

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
  const today = new Date().toLocaleDateString("ja-JP", { month: "long", day: "numeric", weekday: "long" });
  const results: { zodiac: string; ok: boolean; error?: string }[] = [];

  for (const zodiac of targets) {
    try {
      const res = await anthropic.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 256,
        messages: [{
          role: "user",
          content: `${today}の${zodiac}の運勢を、以下の条件でツイートを1件作成してください。
・140文字以内
・具体的な一言アドバイスを含む（曜日・時間帯・行動など）
・最後に「#星詠み #AI占い #${zodiac}」を付ける
・絵文字を2〜3個使う
・URLは含めない
・ツイート本文のみ出力（説明文不要）`,
        }],
      });

      const text = res.content[0].type === "text" ? res.content[0].text.trim() : null;
      if (text) {
        await twitter.v2.tweet(`${text}\n\nhoshiyomi.xyz`);
        results.push({ zodiac, ok: true });
      }
    } catch (err) {
      results.push({ zodiac, ok: false, error: String(err) });
    }

    await new Promise((r) => setTimeout(r, 5000));
  }

  return NextResponse.json({ date: today, results });
}
