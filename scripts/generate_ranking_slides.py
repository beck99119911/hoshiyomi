#!/usr/bin/env python3
"""
ランキングスライド一括生成スクリプト

対象月の ranking/week_*.md を検索し、スライドが未生成の週について
create-ranking-slides.mjs を呼び出してスライドを生成する。

スライド出力先:
  ranking/slides/week_{mmdd}/   （週別・6枚）

week_*.md → スライドへの変換フロー:
  1. ランキング表（| 順位 | 星座 | コメント |）をパース
  2. 星座記号を ZODIAC_SYMBOLS マップで付与
  3. 週ラベル・フックラインを自動生成
  4. create-ranking-slides.mjs を --data/--month/--week で呼び出し

■ 参照
  uranai-app/docs/spec/video_tool_interface.md

使い方:
  python3 generate_ranking_slides.py          # 翌月分を生成
  python3 generate_ranking_slides.py 2026 04  # 月を指定
"""

import json
import os
import re
import subprocess
import sys
import tempfile
from datetime import date
from dateutil.relativedelta import relativedelta
import urllib.parse
import urllib.request
from pathlib import Path

SCRIPT_DIR    = Path(__file__).parent
SCHEDULED_DIR = SCRIPT_DIR.parent / "scheduled"


TELEGRAM_BOT_TOKEN = "8631104030:AAGVQqHjXVbXcJOa2j5G4fHfH5IjOckLj7c"
TELEGRAM_CHAT_ID   = "7066974028"


def notify_telegram(msg: str) -> None:
    try:
        params = urllib.parse.urlencode({"chat_id": TELEGRAM_CHAT_ID, "text": msg})
        url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage?{params}"
        urllib.request.urlopen(url, timeout=10)
    except Exception as e:
        print(f"Telegram通知失敗: {e}")
MJS_SCRIPT    = SCRIPT_DIR / "create-ranking-slides.mjs"

ZODIAC_SYMBOLS = {
    "牡羊座": "♈", "牡牛座": "♉", "双子座": "♊", "蟹座": "♋",
    "獅子座": "♌", "乙女座": "♍", "天秤座": "♎", "蠍座": "♏",
    "射手座": "♐", "山羊座": "♑", "水瓶座": "♒", "魚座": "♓",
}


def log(msg):
    print(msg, flush=True)


def parse_ranking(content: str) -> list[dict]:
    """week_*.md のランキング表からデータを抽出する"""
    rows = []
    for line in content.split('\n'):
        m = re.match(r'\|\s*(\d+)位\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|', line)
        if m:
            rank = int(m.group(1))
            name = m.group(2).strip()
            comment = m.group(3).strip()
            symbol = ZODIAC_SYMBOLS.get(name, "★")
            rows.append({"rank": rank, "name": name, "symbol": symbol, "comment": comment})
    if not rows:
        raise ValueError("ランキング表が見つかりません")
    if len(rows) != 12:
        raise ValueError(f"ランキング件数が不正: {len(rows)}件（12件必要）")
    return sorted(rows, key=lambda r: r['rank'])


def derive_week_label(monday_mmdd: str, sunday_mmdd: str) -> str:
    """MMDD 形式から週ラベルを生成する（例: "3/30（月）〜 4/5（日）"）"""
    mm1, dd1 = int(monday_mmdd[:2]), int(monday_mmdd[2:])
    mm2, dd2 = int(sunday_mmdd[:2]), int(sunday_mmdd[2:])
    return f"{mm1}/{dd1}（月）〜 {mm2}/{dd2}（日）"


def derive_hook_lines(ranking: list[dict]) -> tuple[str, str]:
    """1位星座からフックラインを自動生成する"""
    rank1 = next(r for r in ranking if r['rank'] == 1)
    return "今週の衝撃！", f"{rank1['name']}が1位！"


def process_week(week_path: Path, ranking_dir: Path, year: int, month: int) -> None:
    """1週分のランキングスライドを生成する"""
    m = re.match(r"week_(\d{4})_(\d{4})(?:_(love|money))?\.md", week_path.name)
    if not m:
        raise ValueError(f"ファイル名フォーマット不正: {week_path.name}")

    monday_mmdd = m.group(1)
    sunday_mmdd = m.group(2)
    theme       = m.group(3)  # None / "love" / "money"

    slides_key = f"week_{monday_mmdd}_{theme}" if theme else f"week_{monday_mmdd}"
    slides_dir = ranking_dir / "slides" / slides_key
    if slides_dir.exists():
        existing = list(slides_dir.glob("rank_slide_*.png"))
        if len(existing) == 6:
            log(f"  SKIP: スライド生成済み → slides/{slides_key}/")
            return

    log(f"\n=== {slides_key} スライド生成 ===")

    content = week_path.read_text(encoding="utf-8")
    ranking = parse_ranking(content)
    week_label = derive_week_label(monday_mmdd, sunday_mmdd)
    hook1, hook2 = derive_hook_lines(ranking)

    output_dir = str((ranking_dir / "slides" / slides_key).resolve())
    data = {
        "weekDateLabel": week_label,
        "hookLine1": hook1,
        "hookLine2": hook2,
        "ranking": ranking,
        "outputDir": output_dir,
        "theme": theme or "general",
    }
    log(f"  週ラベル: {week_label}")
    log(f"  フック: {hook1} / {hook2}")
    log(f"  1位: {ranking[0]['name']}  12位: {ranking[11]['name']}")

    tmp_path = None
    try:
        with tempfile.NamedTemporaryFile(
            mode='w', suffix='.json', delete=False, encoding='utf-8'
        ) as f:
            json.dump(data, f, ensure_ascii=False)
            tmp_path = f.name

        month_str = f"{year}{month:02d}"
        node_bin = "/home/user/.nvm/versions/node/v25.7.0/bin/node"
        cmd = [
            node_bin, str(MJS_SCRIPT),
            "--month", month_str,
            "--week", monday_mmdd,
            "--data", tmp_path,
        ]
        log(f"  実行: node create-ranking-slides.mjs --month {month_str} --week {monday_mmdd} --data <json> (theme={theme})")
        result = subprocess.run(
            cmd, capture_output=True, text=True, timeout=120,
            cwd=str(SCHEDULED_DIR),
        )
        if result.returncode != 0:
            raise RuntimeError(f"create-ranking-slides.mjs 失敗:\n{result.stderr}")
        log(result.stdout.strip())
    finally:
        if tmp_path and os.path.exists(tmp_path):
            os.unlink(tmp_path)


def main():
    if len(sys.argv) == 3:
        year, month = int(sys.argv[1]), int(sys.argv[2])
    else:
        next_m = date.today() + relativedelta(months=1)
        year, month = next_m.year, next_m.month

    ranking_dir = SCHEDULED_DIR / str(year) / f"{month:02d}" / "ranking"
    if not ranking_dir.exists():
        log(f"ERROR: ランキングディレクトリが存在しません: {ranking_dir}")
        sys.exit(1)

    week_files = sorted(ranking_dir.glob("week_*.md"))
    if not week_files:
        log(f"ERROR: week_*.md が見つかりません: {ranking_dir}")
        sys.exit(1)

    log(f"=== ランキングスライド生成 {year}/{month:02d} ({len(week_files)}週分) ===")

    results = []
    for week_path in week_files:
        try:
            process_week(week_path, ranking_dir, year, month)
            results.append((week_path.name, "OK"))
        except Exception as e:
            log(f"  ERROR: {e}")
            results.append((week_path.name, f"ERROR: {e}"))

    log("\n" + "=" * 50)
    for name, status in results:
        log(f"  {name}: [{status}]")
    ok = sum(1 for _, s in results if s == "OK")
    log(f"\n合計: {ok}/{len(results)} 件成功")
    notify_telegram(
        f"🖼 ランキングスライド生成完了\n"
        f"成功: {ok}/{len(results)} 件"
    )


if __name__ == "__main__":
    main()
