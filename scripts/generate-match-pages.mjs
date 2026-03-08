/**
 * 144相性ページのコンテンツを生成
 * 実行: node scripts/generate-match-pages.mjs
 */
import Anthropic from "@anthropic-ai/sdk";
import { writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, "../data/match");

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const ZODIACS = [
  { slug: "aries",       name: "牡羊座" },
  { slug: "taurus",      name: "牡牛座" },
  { slug: "gemini",      name: "双子座" },
  { slug: "cancer",      name: "蟹座"   },
  { slug: "leo",         name: "獅子座" },
  { slug: "virgo",       name: "乙女座" },
  { slug: "libra",       name: "天秤座" },
  { slug: "scorpio",     name: "蠍座"   },
  { slug: "sagittarius", name: "射手座" },
  { slug: "capricorn",   name: "山羊座" },
  { slug: "aquarius",    name: "水瓶座" },
  { slug: "pisces",      name: "魚座"   },
];

async function generateContent(sign1, sign2) {
  const prompt = `${sign1.name}と${sign2.name}の相性占い情報を生成してください。

以下のJSON形式で返してください。他のテキストは一切含めないこと。

{
  "score": 相性スコア（0〜100の整数）,
  "keyword": "この組み合わせを表す一言（15文字以内）",
  "summary": "相性の概要（150〜180文字）",
  "love": "恋愛相性（100〜120文字）",
  "friendship": "友情・人間関係の相性（100〜120文字）",
  "work": "仕事・ビジネス相性（100〜120文字）",
  "strength": "この組み合わせの強み（50〜80文字）",
  "challenge": "気をつけること（50〜80文字）",
  "advice": "うまくいくためのアドバイス（80〜100文字）"
}

${sign1.name}と${sign2.name}の組み合わせについて、占星術的な観点から具体的に分析してください。`;

  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.content[0].text.trim();
  const raw = text.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();
  return {
    slug1: sign1.slug, slug2: sign2.slug,
    name1: sign1.name, name2: sign2.name,
    ...JSON.parse(raw),
  };
}

async function main() {
  let count = 0, skipped = 0;
  for (const sign1 of ZODIACS) {
    for (const sign2 of ZODIACS) {
      const key = `${sign1.slug}-${sign2.slug}`;
      const outPath = join(OUTPUT_DIR, `${key}.json`);
      if (existsSync(outPath)) { skipped++; continue; }
      process.stdout.write(`生成中: ${sign1.name} × ${sign2.name}... `);
      try {
        const data = await generateContent(sign1, sign2);
        writeFileSync(outPath, JSON.stringify(data, null, 2), "utf-8");
        count++;
        console.log("✓");
        await new Promise((r) => setTimeout(r, 300));
      } catch (err) {
        console.error(`✗ ${err.message}`);
        await new Promise((r) => setTimeout(r, 1000));
      }
    }
  }
  console.log(`\n完了: ${count}件生成, ${skipped}件スキップ`);
}

main().catch(console.error);
