import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { image, zodiac, lifePathNumber, bloodType } = await req.json();

    if (!image) {
      return NextResponse.json({ error: "画像が必要です" }, { status: 400 });
    }

    // data URL からメディアタイプと base64 を取り出す
    const matches = image.match(/^data:(.+);base64,(.+)$/);
    if (!matches) {
      return NextResponse.json({ error: "画像形式が無効です" }, { status: 400 });
    }
    const mediaType = matches[1] as "image/jpeg" | "image/png" | "image/webp" | "image/gif";
    const base64Data = matches[2];

    const systemPrompt = `あなたは30年のキャリアを持つ手相占い師です。
手のひらの写真を見て、その人の手相を鑑定します。

【鑑定ルール】
1. 生命線・感情線・知性線・運命線の4つの主要な線を読む
2. 既に判明している星座・ライフパスナンバー・血液型と組み合わせて解釈する
3. 具体的で実用的なアドバイスを含める
4. ポジティブな要素を中心に、改善点は優しく伝える
5. 手相が見づらい場合でも、見える範囲で誠実に鑑定すること

【出力フォーマット（必ず守ること）】
以下のJSON形式で返してください。他のテキストは一切含めないこと。

{
  "lines": {
    "life":  "生命線の読み（30〜50文字）",
    "heart": "感情線の読み（30〜50文字）",
    "head":  "知性線の読み（30〜50文字）",
    "fate":  "運命線の読み（30〜50文字）"
  },
  "reading": "総合的な手相鑑定メッセージ（150〜200文字）",
  "advice":  "今週特に注目すべき手相からのアドバイス（50〜80文字）"
}`;

    const userPrompt = `この手のひらの写真を鑑定してください。

この方の情報：
星座：${zodiac || "不明"}
ライフパスナンバー：${lifePathNumber || "不明"}
血液型：${bloodType || "不明"}型

星座・数秘術の鑑定結果と組み合わせて、手相から読み取れることを教えてください。`;

    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType,
                data: base64Data,
              },
            },
            {
              type: "text",
              text: userPrompt,
            },
          ],
        },
      ],
      system: systemPrompt,
    });

    const content = response.content[0];
    if (content.type !== "text") throw new Error("Unexpected response type");
    const raw = content.text.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();
    const result = JSON.parse(raw);
    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "手相鑑定に失敗しました。もう一度お試しください。" },
      { status: 500 }
    );
  }
}
