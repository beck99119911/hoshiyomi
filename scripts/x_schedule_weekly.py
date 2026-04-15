#!/usr/bin/env python3
"""
X週次一括予約スクリプト（土曜 20:00 実行）

翌週（月〜日）の誕生日投稿 7日分 + ランキング 3本をまとめて予約し、
完了後に Telegram で通知する。

Usage:
  python3 x_schedule_weekly.py              # 翌週（次の月曜〜日曜）
  python3 x_schedule_weekly.py 2026-04-13   # 月曜日を直接指定
  python3 x_schedule_weekly.py --dry-run
"""

import re
import subprocess
import sys
import urllib.parse
import urllib.request
from datetime import datetime, timezone, timedelta
from pathlib import Path

SCRIPT_DIR = Path(__file__).parent
LOG_FILE   = SCRIPT_DIR / "x_schedule_weekly.log"
JST        = timezone(timedelta(hours=9))

TELEGRAM_BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN", "")
TELEGRAM_CHAT_ID   = os.environ.get("TELEGRAM_CHAT_ID", "")


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
        log("Telegram通知送信完了")
    except Exception as e:
        log(f"Telegram通知失敗: {e}")


def run_x_post(args: list[str]) -> tuple[bool, str]:
    cmd    = ["/usr/bin/python3", str(SCRIPT_DIR / "x_post.py")] + args
    log(f"実行: python3 x_post.py {' '.join(args)}")
    result = subprocess.run(cmd, capture_output=True, text=True)
    output = result.stdout + result.stderr
    for line in output.strip().splitlines():
        log(f"  {line}")
    return result.returncode == 0, output


def parse_count(output: str) -> str:
    m = re.search(r"合計: (\d+)/(\d+) 件", output)
    return f"{m.group(1)}/{m.group(2)} 件" if m else "?"


def main():
    args    = sys.argv[1:]
    dry_run = "--dry-run" in args
    args    = [a for a in args if a != "--dry-run"]

    # 翌週月曜を決定（引数 or 土曜から+2日）
    if args and re.match(r"\d{4}-\d{2}-\d{2}", args[0]):
        monday_str = args[0]
    else:
        today          = datetime.now(JST).date()
        days_to_monday = (7 - today.weekday()) % 7
        if days_to_monday == 0:
            days_to_monday = 7
        monday_str = (today + timedelta(days=days_to_monday)).strftime("%Y-%m-%d")

    monday    = datetime.strptime(monday_str, "%Y-%m-%d")
    sunday    = monday + timedelta(days=6)
    sunday_str = sunday.strftime("%Y-%m-%d")

    log(f"=== X週次一括予約 {'[DRY-RUN]' if dry_run else ''} ===")
    log(f"対象週: {monday_str} (月) 〜 {sunday_str} (日)")

    # ── 誕生日投稿（月〜日 7日分）────────────────────────────────────────────
    log("\n[1/2] 誕生日投稿 (7日分)...")
    bday_args = ["--week", monday_str] + (["--dry-run"] if dry_run else [])
    _, bday_out = run_x_post(bday_args)
    bday_result = parse_count(bday_out)

    # ── ランキング投稿（3本）──────────────────────────────────────────────────
    log("\n[2/2] ランキング投稿 (3本)...")
    rank_args = ["--ranking", monday_str] + (["--dry-run"] if dry_run else [])
    _, rank_out = run_x_post(rank_args)
    rank_result = parse_count(rank_out)

    # ── Telegram通知 ──────────────────────────────────────────────────────────
    status = "✅ 完了" if not dry_run else "🔍 DRY-RUN"
    msg = (
        f"⭐ X週次予約投稿 {status}\n\n"
        f"対象週: {monday_str}(月) 〜 {sunday_str}(日)\n"
        f"誕生日: {bday_result}\n"
        f"ランキング: {rank_result}"
    )
    notify_telegram(msg)
    log(f"\n完了: 誕生日 {bday_result} / ランキング {rank_result}")


if __name__ == "__main__":
    main()
