import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// 生年月日から星座を計算
function getZodiacSign(birthDate: string): string {
  const date = new Date(birthDate);
  const month = date.getMonth() + 1;
  const day = date.getDate();

  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return "牡羊座";
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return "牡牛座";
  if ((month === 5 && day >= 21) || (month === 6 && day <= 21)) return "双子座";
  if ((month === 6 && day >= 22) || (month === 7 && day <= 22)) return "蟹座";
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return "獅子座";
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return "乙女座";
  if ((month === 9 && day >= 23) || (month === 10 && day <= 23)) return "天秤座";
  if ((month === 10 && day >= 24) || (month === 11 && day <= 22)) return "蠍座";
  if ((month === 11 && day >= 23) || (month === 12 && day <= 21)) return "射手座";
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return "山羊座";
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return "水瓶座";
  return "魚座";
}

// 生年月日からライフパスナンバーを計算
function getLifePathNumber(birthDate: string): number {
  const digits = birthDate.replace(/-/g, "").split("").map(Number);
  let sum = digits.reduce((a, b) => a + b, 0);
  while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
    sum = sum
      .toString()
      .split("")
      .map(Number)
      .reduce((a, b) => a + b, 0);
  }
  return sum;
}

// 今週の日付範囲を取得
function getWeekRange(): { start: string; end: string } {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const fmt = (d: Date) =>
    `${d.getMonth() + 1}月${d.getDate()}日`;
  return { start: fmt(monday), end: fmt(sunday) };
}

export async function POST(req: NextRequest) {
  try {
    const { birthDate, bloodType, concern } = await req.json();

    if (!birthDate || !bloodType || !concern) {
      return NextResponse.json({ error: "入力が不足しています" }, { status: 400 });
    }

    const zodiac = getZodiacSign(birthDate);
    const lifePathNumber = getLifePathNumber(birthDate);
    const week = getWeekRange();

    const systemPrompt = `あなたは25年のキャリアを持つ占い師です。
西洋占星術・数秘術・血液型占いを独自に組み合わせた鑑定を行います。

【鑑定ルール】
1. 必ず星座・ライフパスナンバー・血液型の3つを組み合わせて鑑定すること
2. 具体性を必ず含めること
   NG：「良い運気が訪れます」
   OK：「水曜日の午後、普段話しかけない人からの一言が転機になりそうです」
3. ユーザーの悩みに必ず正面から答えること。悩みを無視した一般論は禁止
4. 文体は温かみがあり、友人の占い師に相談している感覚で
5. 断言する箇所と示唆する箇所を自然に混ぜること
6. 難しい占い用語は使わない

【出力フォーマット（必ず守ること）】
以下のJSON形式で返してください。他のテキストは一切含めないこと。

{
  "scores": {
    "overall": 4,
    "love": 5,
    "work": 3,
    "money": 3,
    "health": 4
  },
  "message": "鑑定メッセージ（200〜300文字）",
  "luckyColor": "ラッキーカラー",
  "luckyItem": "ラッキーアイテム",
  "cautionDay": "注意すべき曜日",
  "quote": "シェアしたくなる名言（20文字以内）"
}

scoresの値は1〜5の整数。`;

    const userPrompt = `以下の情報をもとに今週の運勢を鑑定してください。

生年月日：${birthDate}
星座：${zodiac}
ライフパスナンバー：${lifePathNumber}
血液型：${bloodType}型
今の悩み・知りたいこと：${concern}

今週（${week.start}〜${week.end}）の運勢を鑑定してください。`;

    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      messages: [{ role: "user", content: userPrompt }],
      system: systemPrompt,
    });
    const content = response.content[0];
    if (content.type !== "text") throw new Error("Unexpected response type");
    const raw = content.text.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();
    const result = JSON.parse(raw);
    return NextResponse.json({ ...result, zodiac, lifePathNumber });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "鑑定に失敗しました。もう一度お試しください。" }, { status: 500 });
  }
}
