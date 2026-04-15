#!/usr/bin/env python3
"""
YouTubeランキング動画 週次予約投稿スクリプト（毎週月曜 03:00 JST に実行）

・総合運  → 月曜 12:00 公開
・恋愛運  → 水曜 20:00 公開
・金運仕事運 → 金曜 20:00 公開

スキップロジック: 動画ファイルと同じ場所に .uploaded マーカーが存在する場合はスキップ。

メタデータ参照元（SSoT）:
  scheduled/{yyyy}/{mm}/ranking/week_{mmdd}_{mmdd}[_{theme}].md

使い方:
  python3 upload_youtube_ranking.py           # 今週分を自動判定（月曜起点）
  python3 upload_youtube_ranking.py 2026-04-06  # 月曜日を指定
"""

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
JST = timezone(timedelta(hours=9))

# テーマ → (ラベル, タイトルテンプレート, 曜日オフセット from 月曜, 公開時)
RANKING_THEMES = {
    "":      ("総合運",    "【今週の星座運勢】{m1}/{d1}〜{m2}/{d2} 全12星座ランキング発表！#星座ランキング #今週の運勢 #占い #星座占い #hoshiyomi",  0, 12),
    "love":  ("恋愛運",    "【今週の星座恋愛運】{m1}/{d1}〜{m2}/{d2} 全12星座ランキング発表！#恋愛運 #星座ランキング #占い #星座占い #hoshiyomi",     2, 20),
    "money": ("金運仕事運", "【今週の星座金運】{m1}/{d1}〜{m2}/{d2} 全12星座ランキング発表！#金運 #星座ランキング #占い #星座占い #hoshiyomi",        4, 20),
}


def log(msg):
    now = datetime.now(JST).strftime("%Y-%m-%d %H:%M:%S JST")
    print(f"[{now}] {msg}", flush=True)


def load_ranking_meta(ranking_dir: Path, monday: date, theme: str) -> dict:
    """week_*.md からランキング動画のYouTubeメタデータを読み込む"""
    mmdd = f"{monday.month:02d}{monday.day:02d}"
    pattern = f"week_{mmdd}_*_{theme}.md" if theme else f"week_{mmdd}_[0-9][0-9][0-9][0-9].md"
    candidates = sorted(ranking_dir.glob(pattern))
    if not candidates:
        raise FileNotFoundError(f"{pattern} が見つかりません: {ranking_dir}")
    content = candidates[0].read_text(encoding="utf-8")

    caption_m = re.search(
        r"YouTube / TikTok / Instagram 共通.*?```\n(.*?)\n```", content, re.DOTALL
    )
    if not caption_m:
        raise ValueError(f"キャプションが見つかりません: {candidates[0].name}")

    tags_m   = re.search(r"\*\*ハッシュタグ\*\*\n```\n(.*?)\n```", content, re.DOTALL)
    tags_raw = tags_m.group(1).strip() if tags_m else ""
    tags     = [t.lstrip("#").strip() for t in tags_raw.split() if t.startswith("#")]

    end = monday + timedelta(days=6)
    _, title_tmpl, _, _ = RANKING_THEMES[theme]
    title = title_tmpl.format(m1=monday.month, d1=monday.day, m2=end.month, d2=end.day)

    return {
        "title":       title,
        "description": caption_m.group(1).strip(),
        "tags":        tags,
    }


def upload_ranking(monday: date, theme: str) -> tuple:
    """ランキング動画1本をアップロードする（スキップロジック付き）"""
    label, _, day_offset, hour = RANKING_THEMES[theme]
    mm           = f"{monday.month:02d}"
    mmdd         = f"{monday.month:02d}{monday.day:02d}"
    suffix       = f"_{theme}" if theme else ""
    ranking_dir  = SCHEDULED_DIR / str(monday.year) / mm / "ranking"
    video_path   = ranking_dir / "videos" / f"ranking_{monday.year}{mmdd}{suffix}.mp4"
    marker       = video_path.with_suffix(".uploaded")
    publish_date = monday + timedelta(days=day_offset)
    publish_at   = f"{publish_date.strftime('%Y-%m-%d')}T{hour:02d}:00:00+09:00"

    if not video_path.exists():
        log(f"SKIP [{label}]: 動画ファイルなし ({video_path.name})")
        return (label, "SKIP", "動画なし")

    if marker.exists():
        vid_id = marker.read_text().strip()
        log(f"SKIP [{label}]: アップロード済み ({vid_id})")
        return (label, "SKIP", f"アップロード済み {vid_id}")

    try:
        meta = load_ranking_meta(ranking_dir, monday, theme)
        vid  = upload_video(
            str(video_path),
            meta["title"],
            meta["description"],
            meta["tags"],
            publish_at,
        )
        marker.write_text(vid)
        log(f"OK [{label}] 公開予定 {publish_date} {hour:02d}:00: https://www.youtube.com/watch?v={vid}")
        return (label, "OK", vid)
    except Exception as e:
        log(f"NG [{label}]: {e}")
        return (label, "NG", str(e))


def main():
    if len(sys.argv) == 2:
        monday = datetime.strptime(sys.argv[1], "%Y-%m-%d").date()
        if monday.weekday() != 0:
            print(f"ERROR: {sys.argv[1]} は月曜日ではありません")
            sys.exit(1)
    else:
        # 月曜03:00に実行 → 今日（月曜）が対象週
        today  = date.today()
        monday = today - timedelta(days=today.weekday())

    sunday = monday + timedelta(days=6)
    log(f"=== YouTubeランキング動画 週次予約投稿 {monday} 〜 {sunday} ===")
    log(f"  総合運: {monday} 12:00 公開")
    log(f"  恋愛運: {monday + timedelta(days=2)} 20:00 公開")
    log(f"  金運:   {monday + timedelta(days=4)} 20:00 公開")

    results = [upload_ranking(monday, theme) for theme in ("", "love", "money")]

    log("\n" + "=" * 50)
    for label, status, info in results:
        log(f"  [{label}]: [{status}] {info}")
    ok = sum(1 for _, s, _ in results if s == "OK")
    log(f"\n合計: {ok}/3件成功")
    notify_telegram(
        f"▶ YouTubeランキング動画 予約投稿完了\n"
        f"対象週: {monday} 〜 {sunday}\n"
        f"成功: {ok}/3件"
    )


if __name__ == "__main__":
    main()
