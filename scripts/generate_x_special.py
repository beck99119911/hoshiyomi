#!/usr/bin/env python3
"""
月次 X特別投稿 自動生成スクリプト

実行: 毎月20日 01:00 JST（cronで自動実行）
処理: Claude API + Web検索で対象月の天文・季節イベントを調査し、X投稿ドラフトを生成
出力: scheduled/{yyyy}/{mm}/x_special_{mm}.md（X投稿ドラフト2〜4本）

使い方:
  python3 generate_x_special.py          # 翌月分を自動判定
  python3 generate_x_special.py 2026 04  # 年・月を指定
"""

import os
import re
import sys
import urllib.parse
import urllib.request
from datetime import date, datetime, timedelta, timezone
from pathlib import Path

import anthropic

JST        = timezone(timedelta(hours=9))
SCRIPT_DIR = Path(__file__).parent
SCHED_DIR  = SCRIPT_DIR.parent / "scheduled"
LOG_FILE   = SCRIPT_DIR / "generate_x_special.log"

TELEGRAM_BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN", "")
TELEGRAM_CHAT_ID   = os.environ.get("TELEGRAM_CHAT_ID", "")

# 投稿タイプ別推奨時間
POST_TIME_RULES = [
    (re.compile(r"満月|ピンクムーン|スーパームーン|流星群|こと座|ふたご座|ペルセウス"), "20:00"),
]
DEFAULT_POST_TIME = "07:30"


def log(msg: str) -> None:
    now = datetime.now(JST).strftime("%Y-%m-%d %H:%M:%S JST")
    line = f"[{now}] {msg}"
    print(line, flush=True)
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(line + "\n")


def notify_telegram(msg: str) -> None:
    try:
        params = urllib.parse.urlencode({"chat_id": TELEGRAM_CHAT_ID, "text": msg})
        url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage?{params}"
        urllib.request.urlopen(url, timeout=10)
    except Exception as e:
        log(f"Telegram通知失敗: {e}")


def _post_time(title: str) -> str:
    """投稿タイプから推奨時間を返す"""
    for pattern, time in POST_TIME_RULES:
        if pattern.search(title):
            return time
    return DEFAULT_POST_TIME


def build_telegram_message(year: int, month: int, content: str, out_path: Path) -> str:
    """生成結果からTelegram通知メッセージを組み立てる"""
    lines = [f"【星詠み】{year}年{month}月 X特別投稿ドラフト生成完了\n"]

    # 投稿①〜⑤ を抽出（タイトルと推奨日の間に空行がある場合も対応）
    for m in re.finditer(
        r"## 投稿[①-⑩\d]+: (.+?)\n\n?投稿推奨日: (.+?)\n", content
    ):
        title = m.group(1).strip()
        date_hint = m.group(2).strip()
        post_time = _post_time(title)
        lines.append(f"📌 {title}")
        lines.append(f"   推奨: {date_hint} {post_time}")

    lines.append(f"\nファイル: {out_path.name}")
    return "\n".join(lines)


def get_target_month() -> tuple[int, int]:
    """引数なし時は翌月を返す"""
    if len(sys.argv) == 3:
        return int(sys.argv[1]), int(sys.argv[2])
    today = date.today()
    if today.month == 12:
        return today.year + 1, 1
    return today.year, today.month + 1


def load_api_key() -> str:
    api_key = os.environ.get("ANTHROPIC_API_KEY", "").strip()
    if not api_key:
        env_path = SCRIPT_DIR / ".env.captions"
        if env_path.exists():
            for line in env_path.read_text().splitlines():
                if line.startswith("ANTHROPIC_API_KEY="):
                    api_key = line.split("=", 1)[1].strip()
    if not api_key:
        log("ERROR: ANTHROPIC_API_KEY が設定されていません")
        sys.exit(1)
    return api_key


def build_prompt(year: int, month: int) -> str:
    today_str = datetime.now(JST).strftime("%Y年%m月%d日")
    return f"""あなたは占いSNSアカウント「星詠み（hoshiyomi）」のSNS担当ライターです。
{today_str}時点での最新情報をWeb検索して、以下の作業を行ってください。

## 対象月
{year}年{month}月

## 調査内容
{year}年{month}月に起こる天文・星座・季節イベントを Web検索で調べてください。
例: 新月・満月・惑星の移動・逆行・順行・春分・夏至・秋分・冬至・季節の変わり目 など

## X投稿ドラフトの作成
調査した中から「X（旧Twitter）でバズりやすい」ネタを2〜4本選び、X投稿ドラフトを作成してください。

### X投稿の形式ルール
- Xの文字数カウントで280以内（全角=2カウント・半角=1カウント・改行=1カウント）
  → 日本語のみなら約130〜135文字を目安にすること（全角140文字で280カウントが上限）
- 外部リンクを本文に入れない（リプライに入れる想定）
- ハッシュタグは1〜2個のみ（多すぎるとリーチが下がる）
- 末尾に必ず参加型CTA（「あなたは何座？リプで教えてください」等）
- 占いジャンルの切り口で書く（天文イベント×星座運勢の組み合わせ）

### 良い投稿の例
```
花見には「縁を結ぶ」不思議な力があります🌸

桜の木の下では出会いが起こりやすい。
それは偶然ではなく、春分後のエネルギーが
人と人を引き寄せているから。

今週は牡羊座新月明けで「動き出した人」に
新しいステージが開く特別な週。

あなたは何座？リプで教えてください🌸

#花見
```

## 出力形式

以下のマークダウン形式で出力してください：

```
# {year}年{month}月 X特別投稿ドラフト
生成日: {today_str}

---

## 投稿①: [イベント名・テーマ]
投稿推奨日: {month}/○○ ごろ
投稿推奨時間: 07:30 or 20:00（満月・流星群は20:00、それ以外は07:30）

[本文]

★リプライ（外部リンク）:
詳しくはこちら → https://hoshiyomi.xyz

---

## 投稿②: ...
（以下同様）
```

Web検索で{year}年{month}月の天文イベントを調べてから作成してください。"""


def run_research(prompt: str, client: anthropic.Anthropic) -> str:
    messages = [{"role": "user", "content": prompt}]
    tools = [{"type": "web_search_20250305", "name": "web_search"}]

    while True:
        response = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=8000,
            tools=tools,
            messages=messages,
        )

        if response.stop_reason == "end_turn":
            parts = [block.text for block in response.content if hasattr(block, "text")]
            return "\n".join(parts)

        if response.stop_reason == "tool_use":
            for block in response.content:
                if block.type == "tool_use":
                    query = getattr(block, "input", {}).get("query", "...")
                    log(f"  Web検索中: {query}")
            messages.append({"role": "assistant", "content": response.content})
            messages.append({"role": "user", "content": "続けてください"})
        else:
            log(f"  予期しない stop_reason: {response.stop_reason}")
            break

    return ""


def main() -> None:
    year, month = get_target_month()
    log(f"=== X特別投稿生成: {year}年{month}月 ===")

    out_dir = SCHED_DIR / str(year) / f"{month:02d}"
    out_dir.mkdir(parents=True, exist_ok=True)

    out_path = out_dir / f"x_special_{month:02d}.md"
    if out_path.exists():
        log(f"SKIP: 既に存在します → {out_path}")
        return

    client = anthropic.Anthropic(api_key=load_api_key())
    prompt = build_prompt(year, month)

    log("Claude API + Web検索でイベント調査中...")
    result = run_research(prompt, client)

    if not result:
        log("ERROR: 生成に失敗しました")
        sys.exit(1)

    out_path.write_text(result, encoding="utf-8")
    log(f"保存: {out_path}")

    msg = build_telegram_message(year, month, result, out_path)
    notify_telegram(msg)
    log("Telegram通知送信")
    log("=== 完了 ===")


if __name__ == "__main__":
    main()
