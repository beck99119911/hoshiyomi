import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { text } = await req.json();
  if (!text) {
    return NextResponse.json({ error: "テキストが必要です" }, { status: 400 });
  }

  const response = await fetch(
    `https://texttospeech.googleapis.com/v1/text:synthesize?key=${process.env.GOOGLE_TTS_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        input: { text },
        voice: {
          languageCode: "ja-JP",
          name: "ja-JP-Neural2-B", // 自然な女性声
        },
        audioConfig: {
          audioEncoding: "MP3",
          speakingRate: 0.95,
          pitch: 1.0,
        },
      }),
    }
  );

  if (!response.ok) {
    const err = await response.text();
    return NextResponse.json({ error: err }, { status: 500 });
  }

  const { audioContent } = await response.json();
  const audio = Buffer.from(audioContent, "base64");

  return new NextResponse(audio, {
    headers: { "Content-Type": "audio/mpeg" },
  });
}
