/**
 * 12星座ページのコンテンツを生成
 * 実行: node scripts/generate-zodiac-pages.mjs
 */
import Anthropic from "@anthropic-ai/sdk";
import { writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, "../data/zodiac");

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export const ZODIACS = [
  { slug: "aries",       name: "牡羊座",  period: "3/21〜4/19",  symbol: "♈", element: "火" },
  { slug: "taurus",      name: "牡牛座",  period: "4/20〜5/20",  symbol: "♉", element: "土" },
  { slug: "gemini",      name: "双子座",  period: "5/21〜6/21",  symbol: "♊", element: "風" },
  { slug: "cancer",      name: "蟹座",    period: "6/22〜7/22",  symbol: "♋", element: "水" },
  { slug: "leo",         name: "獅子座",  period: "7/23〜8/22",  symbol: "♌", element: "火" },
  { slug: "virgo",       name: "乙女座",  period: "8/23〜9/22",  symbol: "♍", element: "土" },
  { slug: "libra",       name: "天秤座",  period: "9/23〜10/23", symbol: "♎", element: "風" },
  { slug: "scorpio",     name: "蠍座",    period: "10/24〜11/22",symbol: "♏", element: "水" },
  { slug: "sagittarius", name: "射手座",  period: "11/23〜12/21",symbol: "♐", element: "火" },
  { slug: "capricorn",   name: "山羊座",  period: "12/22〜1/19", symbol: "♑", element: "土" },
  { slug: "aquarius",    name: "水瓶座",  period: "1/20〜2/18",  symbol: "♒", element: "風" },
  { slug: "pisces",      name: "魚座",    period: "2/19〜3/20",  symbol: "♓", element: "水" },
];

async function generateContent(zodiac) {
  const prompt = `${zodiac.name}（${zodiac.period}）の占い情報を生成してください。

以下のJSON形式で返してください。他のテキストは一切含めないこと。

{
  "keyword": "この星座を表す一言（10文字以内）",
  "personality": "性格・特徴（200〜250文字）",
  "love": "恋愛傾向（100〜120文字）",
  "work": "仕事・才能（100〜120文字）",
  "money": "金運傾向（100〜120文字）",
  "health": "健康傾向（80〜100文字）",
  "luckyColor": "ラッキーカラー",
  "luckyNumber": ラッキーナンバー（1〜9）,
  "luckyItem": "ラッキーアイテム（10文字以内）",
  "compatibleSigns": ["相性の良い星座1", "相性の良い星座2"],
  "weekFortune": "今週の運勢（150〜200文字）",
  "yearFortune2026": "2026年の運勢（200〜250文字）"
}`;

  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1500,
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.content[0].text.trim();
  const raw = text.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();
  return { ...zodiac, ...JSON.parse(raw) };
}

async function main() {
  for (const zodiac of ZODIACS) {
    const outPath = join(OUTPUT_DIR, `${zodiac.slug}.json`);
    if (existsSync(outPath)) { console.log(`スキップ: ${zodiac.name}`); continue; }
    process.stdout.write(`生成中: ${zodiac.name}... `);
    const data = await generateContent(zodiac);
    writeFileSync(outPath, JSON.stringify(data, null, 2), "utf-8");
    console.log("✓");
    await new Promise((r) => setTimeout(r, 300));
  }
  console.log("完了");
}

main().catch(console.error);
