#!/usr/bin/env python3
"""
誕生日動画一括生成スクリプト
対象: 4/5 〜 4/30 (26日分)

キャプションは scheduled/2026/04/youtube_meta_0401_0430.md から実行時に読み込む。
ハードコードしない（SSoT: Single Source of Truth）

使い方:
  python3 generate_birthday_videos.py                        # 4/5-4/30 全件（既存スキップ）
  python3 generate_birthday_videos.py --dates 2026-04-13,2026-04-14  # 指定日のみ
  python3 generate_birthday_videos.py --dates 2026-04-13 --force     # 強制上書き
"""

import argparse
import subprocess
import os
import re
import json
import shutil
import sys
import time
import urllib.parse
import urllib.request
import calendar
from datetime import datetime, timezone, timedelta

SCHEDULED_DIR = "/home/user/uranai-app/scheduled"
VIDEO_TOOL_OUTPUT = "/home/user/video_tool/output/local"
API_BASE = "http://localhost:8080"

TELEGRAM_BOT_TOKEN = "8631104030:AAGVQqHjXVbXcJOa2j5G4fHfH5IjOckLj7c"
TELEGRAM_CHAT_ID   = "7066974028"


def notify_telegram(msg: str) -> None:
    try:
        params = urllib.parse.urlencode({"chat_id": TELEGRAM_CHAT_ID, "text": msg})
        url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage?{params}"
        urllib.request.urlopen(url, timeout=10)
    except Exception as e:
        print(f"Telegram通知失敗: {e}")


def _get_youtube_meta_path():
    """翌月のyoutube_metaファイルパスを動的に返す"""
    JST = timezone(timedelta(hours=9))
    now = datetime.now(JST)
    year = now.year
    m = now.month + 1 if now.month < 12 else 1
    if now.month == 12:
        year += 1
    mm = str(m).zfill(2)
    days = calendar.monthrange(year, m)[1]
    dd_end = str(days).zfill(2)
    return f"{SCHEDULED_DIR}/{year}/{mm}/youtube_meta_{mm}01_{mm}{dd_end}.md"

YOUTUBE_META_PATH = _get_youtube_meta_path()


def load_captions(meta_path):
    """youtube_meta ファイルからキャプションを読み込む（SSoT）"""
    with open(meta_path, encoding="utf-8") as f:
        content = f.read()
    pattern = r"## 2026-04-(\d{2}).*?\*\*キャプション\*\*\n```\n(.*?)\n```"
    matches = re.findall(pattern, content, re.DOTALL)
    if not matches:
        raise RuntimeError(f"キャプションが見つかりません: {meta_path}")
    return {int(day): caption for day, caption in matches}


CAPTIONS = load_captions(YOUTUBE_META_PATH)

ZODIAC_SLUG = {
    "牡羊座": "aries", "牡牛座": "taurus", "双子座": "gemini", "蟹座": "cancer",
    "獅子座": "leo",   "乙女座": "virgo",  "天秤座": "libra",  "蠍座":  "scorpio",
    "射手座": "sagittarius", "山羊座": "capricorn", "水瓶座": "aquarius", "魚座": "pisces",
}

def get_zodiac(m, d):
    if (m == 3 and d >= 21) or (m == 4 and d <= 19):
        return "牡羊座"
    if (m == 4 and d >= 20) or (m == 5 and d <= 20):
        return "牡牛座"
    return "牡羊座"  # fallback

def capture_screenshots(month, day):
    """capture-birthday.mjs を実行してSS取得"""
    result = subprocess.run(
        ["node", "../scripts/capture-birthday.mjs", str(month), str(day)],
        cwd=f"{SCHEDULED_DIR}",
        capture_output=True,
        text=True,
        timeout=60
    )
    if result.returncode != 0:
        raise RuntimeError(f"capture failed: {result.stderr}")
    return result.stdout

def upload_files(paths):
    """curl で /upload にファイルをPOST"""
    cmd = ["curl", "-s", "-X", "POST", f"{API_BASE}/upload"]
    for p in paths:
        cmd += ["-F", f"files=@{p}"]
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
    if result.returncode != 0:
        raise RuntimeError(f"upload curl failed: {result.stderr}")
    data = json.loads(result.stdout)
    return data["paths"]

def generate_video(order_paths, theme):
    """curl で /generate にPOST"""
    order = "|||".join(order_paths)
    cmd = [
        "curl", "-s", "-X", "POST", f"{API_BASE}/generate",
        "--data-urlencode", f"order={order}",
        "--data-urlencode", "template=感情訴求",
        "--data-urlencode", "bgm=神秘的アンビエント",
        "--data-urlencode", f"theme={theme}",
    ]
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
    if result.returncode != 0:
        raise RuntimeError(f"generate curl failed: {result.stderr}")
    data = json.loads(result.stdout)
    if "video_url" not in data:
        raise RuntimeError(f"no video_url in response: {result.stdout}")
    return data["video_url"]

def process_day(month, day, force=False):
    mm = str(month).zfill(2)
    dd = str(day).zfill(2)
    date_str = f"2026-{mm}-{dd}"
    mmdd = f"{mm}{dd}"

    zodiac = get_zodiac(month, day)
    slug = ZODIAC_SLUG[zodiac]
    caption = CAPTIONS[day]

    ss_dir = f"{SCHEDULED_DIR}/2026/{mm}/{date_str}/screenshots"
    birthday_png = f"{ss_dir}/birthday_{mmdd}.png"
    zodiac_png = f"{ss_dir}/zodiac_{slug}.png"
    out_mp4 = f"{SCHEDULED_DIR}/2026/{mm}/{date_str}/output.mp4"

    # 既存動画チェック
    if os.path.exists(out_mp4) and not force:
        size_mb = os.path.getsize(out_mp4) / (1024 * 1024)
        print(f"  [SKIP] 既存動画あり: {out_mp4} ({size_mb:.1f}MB)")
        return os.path.getsize(out_mp4), True  # (size, skipped)

    # ステップ1: スクリーンショット取得
    print(f"  [1] SS取得中...")
    capture_screenshots(month, day)

    # ファイル存在確認
    if not os.path.exists(birthday_png):
        raise FileNotFoundError(f"birthday SS not found: {birthday_png}")
    if not os.path.exists(zodiac_png):
        raise FileNotFoundError(f"zodiac SS not found: {zodiac_png}")

    # ステップ2: アップロード
    print(f"  [2] アップロード中...")
    upload_paths = upload_files([birthday_png, zodiac_png])
    print(f"      -> {upload_paths}")

    # ステップ3: 動画生成
    print(f"  [3] 動画生成中...")
    video_url = generate_video(upload_paths, caption)
    print(f"      -> {video_url}")

    # ステップ4: コピー
    timestamp = video_url.replace("/output/local/", "").replace(".mp4", "")
    src_mp4 = f"{VIDEO_TOOL_OUTPUT}/{timestamp}.mp4"

    for _ in range(10):
        if os.path.exists(src_mp4):
            break
        time.sleep(2)

    if not os.path.exists(src_mp4):
        raise FileNotFoundError(f"generated mp4 not found: {src_mp4}")

    shutil.copy2(src_mp4, out_mp4)

    # 仕様ファイル自動生成
    spec_txt = f"{SCHEDULED_DIR}/2026/{mm}/{date_str}/キャプション≠ナレーション_上下8文字制限による仕様.txt"
    with open(spec_txt, "w", encoding="utf-8") as f:
        f.write("""【仕様】キャプション ≠ ナレーション

この動画のナレーションは youtube_meta の「キャプション」をそのまま読み上げていません。

■ 理由
video_tool の theme= パラメータはナレーション生成の「テーマ」として扱われます。
AIが縦型ショート動画向け（上下8文字程度）に最適化したスクリプトを新規生成します。

■ データの流れ
  youtube_meta キャプション → theme= → AI生成 → 動画ナレーション

■ 参照
  uranai-app/docs/spec/video_tool_interface.md
""")

    size = os.path.getsize(out_mp4)
    return size, False  # (size, skipped)

def main():
    parser = argparse.ArgumentParser(description="誕生日動画生成スクリプト")
    parser.add_argument(
        "--dates",
        type=str,
        help="対象日をカンマ区切りで指定 (例: 2026-04-13,2026-04-14)。省略時は4/5-4/30全件"
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="既存動画があっても上書き生成する"
    )
    args = parser.parse_args()

    # 翌月を動的に計算（毎月15日に翌月分を生成）
    JST = timezone(timedelta(hours=9))
    now = datetime.now(JST)
    if now.month == 12:
        month = 1
    else:
        month = now.month + 1
    days_in_month = calendar.monthrange(now.year, month)[1]

    if args.dates:
        target_days = []
        for d in args.dates.split(","):
            d = d.strip()
            try:
                parts = d.split("-")
                target_days.append(int(parts[2]))
            except (IndexError, ValueError):
                print(f"日付フォーマット不正: {d} (例: 2026-05-13)")
                sys.exit(1)
    else:
        target_days = list(range(1, days_in_month + 1))

    results = []
    for day in target_days:
        print(f"\n=== {month}/{day} 処理開始 ===")
        try:
            size, skipped = process_day(month, day, force=args.force)
            size_mb = size / (1024 * 1024)
            status = "SKIP" if skipped else "OK"
            print(f"{month}/{day} {'スキップ' if skipped else '完了'}: {size_mb:.1f}MB")
            results.append((day, status, f"{size_mb:.1f}MB"))
        except Exception as e:
            print(f"{month}/{day} エラー: {e}")
            results.append((day, "ERROR", str(e)))

    print("\n" + "="*50)
    print("全日付 結果一覧")
    print("="*50)
    for day, status, info in results:
        print(f"  {month}/{day:2d}: [{status}] {info}")

    ok_count  = sum(1 for _, s, _ in results if s == "OK")
    skip_count = sum(1 for _, s, _ in results if s == "SKIP")
    err_count  = sum(1 for _, s, _ in results if s == "ERROR")
    print(f"\n合計: 生成={ok_count} スキップ={skip_count} エラー={err_count} / {len(results)}件")

    # Telegram通知はフル実行（--dates 未指定）かつ生成件数が1件以上の場合のみ
    if not args.dates and ok_count > 0:
        notify_telegram(
            f"🎬 誕生日動画生成完了\n"
            f"生成: {ok_count}件 / スキップ: {skip_count}件\n"
            f"失敗: {[f'{d}日' for d, s, _ in results if s == 'ERROR'] or 'なし'}"
        )

if __name__ == "__main__":
    main()
