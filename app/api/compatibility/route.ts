import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

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

function getLifePathNumber(birthDate: string): number {
  const digits = birthDate.replace(/-/g, "").split("").map(Number);
  let sum = digits.reduce((a, b) => a + b, 0);
  while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
    sum = sum.toString().split("").map(Number).reduce((a, b) => a + b, 0);
  }
  return sum;
}

export async function POST(req: NextRequest) {
  try {
    const { personA, personB } = await req.json();

    if (!personA?.birthDate || !personA?.bloodType || !personB?.birthDate || !personB?.bloodType) {
      return NextResponse.json({ error: "入力が不足しています" }, { status: 400 });
    }

    const zodiacA = getZodiacSign(personA.birthDate);
    const zodiacB = getZodiacSign(personB.birthDate);
    const lpA = getLifePathNumber(personA.birthDate);
    const lpB = getLifePathNumber(personB.birthDate);

    const systemPrompt = `あなたは25年のキャリアを持つ占い師です。
西洋占星術・数秘術・血液型占いを組み合わせた相性鑑定を行います。

【出力フォーマット（必ず守ること）】
以下のJSON形式のみ返してください。他のテキストは一切含めないこと。

{
  "scores": {
    "overall": 4,
    "love": 5,
    "values": 3,
    "future": 4
  },
  "percentage": 82,
  "message": "相性の全体的な鑑定（150〜200文字、具体的なエピソードや場面を含む）",
  "strength": "この二人の一番の強み（30文字以内）",
  "challenge": "気をつけるべきこと（30文字以内）",
  "advice": "二人へのアドバイス（50文字以内）",
  "keyword": "この縁を表すキーワード（10文字以内）"
}

scoresは1〜5の整数。percentageは0〜100の整数。`;

    const userPrompt = `以下の二人の相性を鑑定してください。

【あなた】
星座：${zodiacA} / ライフパス：${lpA} / 血液型：${personA.bloodType}型

【相手】
星座：${zodiacB} / ライフパス：${lpB} / 血液型：${personB.bloodType}型`;

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

    return NextResponse.json({
      ...result,
      personA: { zodiac: zodiacA, lifePathNumber: lpA, bloodType: personA.bloodType },
      personB: { zodiac: zodiacB, lifePathNumber: lpB, bloodType: personB.bloodType },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "鑑定に失敗しました。もう一度お試しください。" }, { status: 500 });
  }
}
