#!/usr/bin/env python3
"""
YouTube誕生日動画 週次予約投稿スクリプト（毎週日曜 03:00 JST に実行）

・来週月〜日の誕生日動画を各日09:00 JSTで予約投稿

メタデータ参照元（SSoT）:
  誕生日動画: scheduled/{yyyy}/{mm}/youtube_meta_{mm01}_{mmDD}.md

使い方:
  python3 upload_youtube_weekly.py          # 来週分を自動判定
  python3 upload_youtube_weekly.py 2026-04-07  # 月曜日を指定
"""

import os
import re
import sys
from datetime import date, datetime, timedelta, timezone
import urllib.parse
import urllib.request
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from upload_youtube import upload_video

SCHEDULED_DIR = Path(__file__).parent.parent / "scheduled"


TELEGRAM_BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN", "")
TELEGRAM_CHAT_ID   = os.environ.get("TELEGRAM_CHAT_ID", "")


def notify_telegram(msg: str) -> None:
    try:
        params = urllib.parse.urlencode({"chat_id": TELEGRAM_CHAT_ID, "text": msg})
        url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage?{params}"
        urllib.request.urlopen(url, timeout=10)
    except Exception as e:
        print(f"Telegram通知失敗: {e}")


def revalidate_videos() -> None:
    secret = os.environ.get("REVALIDATE_SECRET", "")
    if not secret:
        return
    try:
        req = urllib.request.Request(
            "https://hoshiyomi.xyz/api/revalidate-videos",
            method="POST",
            headers={"x-revalidate-secret": secret, "Content-Length": "0"},
        )
        urllib.request.urlopen(req, timeout=10)
    except Exception as e:
        print(f"revalidate失敗: {e}")


JST = timezone(timedelta(hours=9))


def log(msg):
    now = datetime.now(JST).strftime("%Y-%m-%d %H:%M:%S JST")
    print(f"[{now}] {msg}", flush=True)


# ── メタデータ読み込み ─────────────────────────────────────────────────────────

def load_birthday_meta(year: int, month: int) -> dict:
    """youtube_meta ファイルから全日付のメタデータを読み込む"""
    mm = f"{month:02d}"
    candidates = sorted((SCHEDULED_DIR / str(year) / mm).glob("youtube_meta_*.md"))
    if not candidates:
        raise FileNotFoundError(f"youtube_meta ファイルが見つかりません: {SCHEDULED_DIR}/{year}/{mm}/")
    meta_path = candidates[0]

    content = meta_path.read_text(encoding="utf-8")
    result = {}

    day_blocks = re.split(r"(?=## \d{4}-\d{2}-\d{2})", content)
    for block in day_blocks:
        date_m = re.match(r"## (\d{4}-\d{2}-\d{2})", block)
        if not date_m:
            continue
        d = date_m.group(1)

        title_m   = re.search(r"\*\*YouTube タイトル\*\*\n```\n(.*?)\n```", block, re.DOTALL)
        caption_m = re.search(r"\*\*キャプション\*\*\n```\n(.*?)\n```", block, re.DOTALL)
        tags_m    = re.search(r"\*\*ハッシュタグ\*\*\n```\n(.*?)\n```", block, re.DOTALL)

        if title_m and caption_m:
            tags_raw = tags_m.group(1).strip() if tags_m else ""
            tags = [t.lstrip("#").strip() for t in tags_raw.split() if t.startswith("#")]
            result[d] = {
                "title":       title_m.group(1).strip(),
                "description": caption_m.group(1).strip(),
                "tags":        tags,
            }
    return result


# ── アップロード ───────────────────────────────────────────────────────────────

def upload_birthday_week(monday: date, meta_map: dict) -> list[tuple]:
    results = []
    for i in range(7):
        d = monday + timedelta(days=i)
        date_str   = d.strftime("%Y-%m-%d")
        mm         = d.strftime("%m")
        video_path = SCHEDULED_DIR / str(d.year) / mm / date_str / "output.mp4"
        marker     = video_path.with_suffix(".uploaded")
        publish_at = f"{date_str}T09:00:00+09:00"

        if not video_path.exists():
            log(f"SKIP {date_str}: 動画ファイルなし")
            results.append((date_str, "SKIP", "動画なし"))
            continue

        if marker.exists():
            vid_id = marker.read_text().strip()
            log(f"SKIP {date_str}: アップロード済み ({vid_id})")
            results.append((date_str, "SKIP", f"アップロード済み {vid_id}"))
            continue

        meta = meta_map.get(date_str)
        if not meta:
            log(f"SKIP {date_str}: youtube_meta にメタデータなし")
            results.append((date_str, "SKIP", "メタデータなし"))
            continue

        try:
            vid = upload_video(
                str(video_path),
                meta["title"],
                meta["description"],
                meta["tags"],
                publish_at,
            )
            marker.write_text(vid)
            log(f"OK {date_str}: https://www.youtube.com/watch?v={vid} (公開予定: {publish_at})")
            results.append((date_str, "OK", vid))
        except Exception as e:
            log(f"NG {date_str}: {e}")
            results.append((date_str, "NG", str(e)))

    return results


# ── メイン ─────────────────────────────────────────────────────────────────────

def main():
    if len(sys.argv) == 2:
        monday = datetime.strptime(sys.argv[1], "%Y-%m-%d").date()
        if monday.weekday() != 0:
            print(f"ERROR: {sys.argv[1]} は月曜日ではありません")
            sys.exit(1)
    else:
        today = date.today()
        days_until_monday = (7 - today.weekday()) % 7 or 7
        monday = today + timedelta(days=days_until_monday)

    sunday = monday + timedelta(days=6)
    log(f"=== YouTube誕生日動画 週次予約投稿 {monday} 〜 {sunday} ===")

    # 月跨ぎ対応
    months_in_week = set()
    for i in range(7):
        d = monday + timedelta(days=i)
        months_in_week.add((d.year, d.month))

    meta_map = {}
    for year, month in months_in_week:
        try:
            meta_map.update(load_birthday_meta(year, month))
        except FileNotFoundError as e:
            log(f"WARNING: {e}")

    log("\n--- 誕生日動画 ---")
    results = upload_birthday_week(monday, meta_map)

    log("\n" + "=" * 50)
    for date_str, status, info in results:
        log(f"  {date_str}: [{status}] {info}")
    ok = sum(1 for _, s, _ in results if s == "OK")
    log(f"\n合計: {ok}/7件成功")
    if ok > 0:
        revalidate_videos()
    notify_telegram(
        f"▶ YouTube誕生日動画 予約投稿完了\n"
        f"対象週: {monday} 〜 {sunday}\n"
        f"成功: {ok}/7件"
    )


if __name__ == "__main__":
    main()
