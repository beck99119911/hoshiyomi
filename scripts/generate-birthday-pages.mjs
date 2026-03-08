/**
 * 365日分の誕生日占いコンテンツを生成するスクリプト
 * 実行: node scripts/generate-birthday-pages.mjs
 * 環境変数: ANTHROPIC_API_KEY
 */

import Anthropic from "@anthropic-ai/sdk";
import { writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, "../data/birthday");

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function getZodiacSign(month, day) {
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

function getDaysInMonth(month) {
  // 閏年を考慮しない（誕生日ページなので2月は28日まで）
  return [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
}

function padZero(n) {
  return String(n).padStart(2, "0");
}

async function generateContent(month, day) {
  const zodiac = getZodiacSign(month, day);
  const dateStr = `${month}月${day}日`;

  const prompt = `${dateStr}生まれの人の占い情報を生成してください。

以下のJSON形式で返してください。他のテキストは一切含めないこと。

{
  "keyword": "その誕生日を表す一言キーワード（例：「信念の人」「輝く直感」など10文字以内）",
  "personality": "性格・特徴の説明（150〜200文字。星座の特性を活かした具体的な描写）",
  "love": "恋愛傾向（80〜100文字。この誕生日の人の恋愛スタイル）",
  "work": "仕事・才能（80〜100文字。向いている仕事や活かせる才能）",
  "money": "金運・お金との関係（80〜100文字）",
  "luckyColor": "ラッキーカラー（色の名前のみ）",
  "luckyNumber": ラッキーナンバー（1〜9の整数）,
  "luckyItem": "ラッキーアイテム（物の名前のみ、10文字以内）",
  "compatibleZodiac": "相性の良い星座（星座名のみ）",
  "yearFortune": "2026年の運勢（150〜200文字。今年特に意識すべきことや運気の流れ）"
}

星座：${zodiac}
誕生日：${dateStr}

各誕生日ごとに異なる個性的な内容にしてください。`;

  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.content[0].text.trim();
  const raw = text.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();
  const data = JSON.parse(raw);

  return {
    month,
    day,
    zodiac,
    ...data,
  };
}

async function main() {
  const args = process.argv.slice(2);
  const targetMonth = args[0] ? parseInt(args[0]) : null;
  const targetDay   = args[1] ? parseInt(args[1]) : null;

  // 単一日付モード: node scripts/generate-birthday-pages.mjs 1 1
  if (targetMonth && targetDay) {
    const key = `${padZero(targetMonth)}${padZero(targetDay)}`;
    const outPath = join(OUTPUT_DIR, `${key}.json`);
    console.log(`生成中: ${targetMonth}月${targetDay}日...`);
    const data = await generateContent(targetMonth, targetDay);
    writeFileSync(outPath, JSON.stringify(data, null, 2), "utf-8");
    console.log(`✓ ${outPath}`);
    return;
  }

  // 全365日モード
  let count = 0;
  let skipped = 0;

  for (let month = 1; month <= 12; month++) {
    const days = getDaysInMonth(month);
    for (let day = 1; day <= days; day++) {
      const key = `${padZero(month)}${padZero(day)}`;
      const outPath = join(OUTPUT_DIR, `${key}.json`);

      if (existsSync(outPath)) {
        skipped++;
        continue;
      }

      try {
        process.stdout.write(`生成中: ${month}月${day}日... `);
        const data = await generateContent(month, day);
        writeFileSync(outPath, JSON.stringify(data, null, 2), "utf-8");
        count++;
        console.log(`✓`);

        // レート制限対策: 300ms待機
        await new Promise((r) => setTimeout(r, 300));
      } catch (err) {
        console.error(`✗ エラー: ${err.message}`);
        // エラーが出ても続行
        await new Promise((r) => setTimeout(r, 1000));
      }
    }
  }

  console.log(`\n完了: ${count}件生成, ${skipped}件スキップ`);
}

main().catch(console.error);
