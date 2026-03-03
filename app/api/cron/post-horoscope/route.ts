import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import crypto from "crypto";

const ZODIACS = [
  "牡羊座", "牡牛座", "双子座", "蟹座",
  "獅子座", "乙女座", "天秤座", "蠍座",
  "射手座", "山羊座", "水瓶座", "魚座",
];

// X API OAuth 1.0a 署名生成
function buildOAuthHeader(method: string, url: string, params: Record<string, string>) {
  const oauthParams: Record<string, string> = {
    oauth_consumer_key:     process.env.X_API_KEY!,
    oauth_nonce:            crypto.randomBytes(16).toString("hex"),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp:        Math.floor(Date.now() / 1000).toString(),
    oauth_token:            process.env.X_ACCESS_TOKEN!,
    oauth_version:          "1.0",
  };

  const allParams = { ...params, ...oauthParams };
  const paramStr = Object.keys(allParams)
    .sort()
    .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(allParams[k])}`)
    .join("&");

  const baseStr = [method.toUpperCase(), encodeURIComponent(url), encodeURIComponent(paramStr)].join("&");
  const signingKey = `${encodeURIComponent(process.env.X_API_SECRET!)}&${encodeURIComponent(process.env.X_ACCESS_TOKEN_SECRET!)}`;
  const signature = crypto.createHmac("sha1", signingKey).update(baseStr).digest("base64");

  oauthParams.oauth_signature = signature;

  const headerStr = Object.keys(oauthParams)
    .sort()
    .map((k) => `${encodeURIComponent(k)}="${encodeURIComponent(oauthParams[k])}"`)
    .join(", ");

  return `OAuth ${headerStr}`;
}

async function postTweet(text: string): Promise<boolean> {
  const url = "https://api.twitter.com/2/tweets";
  const body = JSON.stringify({ text });
  const auth = buildOAuthHeader("POST", url, {});

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: auth,
      "Content-Type": "application/json",
    },
    body,
  });

  return res.ok;
}

export async function GET(req: Request) {
  // Vercel Cron の秘密鍵チェック
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const today = new Date().toLocaleDateString("ja-JP", { month: "long", day: "numeric", weekday: "long" });
  const results: { zodiac: string; ok: boolean }[] = [];

  for (const zodiac of ZODIACS) {
    const res = await client.messages.create({
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
      const ok = await postTweet(`${text}\n\nhoshiyomi.xyz`);
      results.push({ zodiac, ok });
    }

    // レート制限対策: 5秒待機
    await new Promise((r) => setTimeout(r, 5000));
  }

  return NextResponse.json({ date: today, results });
}
