import { NextRequest, NextResponse } from "next/server";

function toSSML(text: string): string {
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  const marked = escaped
    .replace(/。/g, '。<break time="650ms"/>')
    .replace(/、/g, '、<break time="250ms"/>')
    .replace(/…/g, '<break time="900ms"/>')
    .replace(/！/g, '！<break time="400ms"/>')
    .replace(/？/g, '？<break time="400ms"/>');
  return `<speak>${marked}</speak>`;
}

export async function POST(req: NextRequest) {
  const { text, voice = "ja-JP-Neural2-D", pitch = -4, speakingRate = 0.88 } = await req.json();
  if (!text) {
    return NextResponse.json({ error: "テキストが必要です" }, { status: 400 });
  }

  const response = await fetch(
    `https://texttospeech.googleapis.com/v1/text:synthesize?key=${process.env.GOOGLE_TTS_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        input: { ssml: toSSML(text) },
        voice: { languageCode: "ja-JP", name: voice },
        audioConfig: { audioEncoding: "MP3", speakingRate, pitch },
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
