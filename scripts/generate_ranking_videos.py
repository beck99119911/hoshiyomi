#!/usr/bin/env python3
"""
ランキング動画一括生成スクリプト

対象月の ranking/week_*.md を検索し、動画未生成の週について
スライド画像 → video_tool API の順で動画を生成する。

スライドの探索順:
  1. ranking/slides/week_{mmdd}/ （週別保存）
  2. ranking/slides/               （共有ディレクトリ・フォールバック）

キャプションは week_*.md のナレーションスクリプト（【】付き）を
script= に直渡し（SSoT）。AI生成はスキップ。

■ 参照
  uranai-app/docs/spec/video_tool_interface.md

使い方:
  python3 generate_ranking_videos.py          # 翌月分を生成
  python3 generate_ranking_videos.py 2026 05  # 月を指定
"""

import json
import os
import re
import shutil
import subprocess
import sys
import time
from datetime import date
from dateutil.relativedelta import relativedelta
import urllib.parse
import urllib.request
from pathlib import Path

SCRIPT_DIR    = Path(__file__).parent
SCHEDULED_DIR = SCRIPT_DIR.parent / "scheduled"


TELEGRAM_BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN", "")
TELEGRAM_CHAT_ID   = os.environ.get("TELEGRAM_CHAT_ID", "")


def notify_telegram(msg: str) -> None:
    try:
        params = urllib.parse.urlencode({"chat_id": TELEGRAM_CHAT_ID, "text": msg})
        url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage?{params}"
        urllib.request.urlopen(url, timeout=10)
    except Exception as e:
        print(f"Telegram通知失敗: {e}")
VIDEO_TOOL_OUTPUT = Path("/home/user/video_tool/output/local")
API_BASE      = os.environ.get("VIDEO_TOOL_BASE", "http://localhost:8080")

SPEC_TEXT = """【仕様】キャプション = ナレーション

この動画のナレーションは week_*.md の「ナレーションスクリプト」をそのまま使用しています。

■ 理由
video_tool の script= パラメータはAI生成をスキップし、渡したスクリプトを直接TTSに使用します。
【セクションラベル】が含まれている場合、各セクションごとに個別TTS生成→画像切替が行われます。

■ データの流れ
  week_*.md ナレーション → script= → TTS直接生成 → 動画ナレーション

■ 参照
  uranai-app/docs/spec/video_tool_interface.md
"""


def log(msg):
    print(msg, flush=True)


def make_tiktok_narration(script: str) -> str:
    """CTAセクションにInstagram誘導を追加する"""
    return script.rstrip() + "\nInstagram @hoshiyomi_xyz\n毎週更新中！"


def extract_narration(week_path: Path) -> str:
    """week_*.md からナレーションスクリプト（【】付き）を抽出する"""
    content = week_path.read_text(encoding="utf-8")
    m = re.search(r"ナレーションスクリプト[\s\S]*?```\n([\s\S]*?)\n```", content)
    if not m:
        raise ValueError(f"ナレーションスクリプトが見つかりません: {week_path}")
    return m.group(1).strip()


def find_slides(ranking_dir: Path, slides_key: str) -> list[Path]:
    """スライド画像を探索する（週別 → 共有の順）"""
    week_slides_dir = ranking_dir / "slides" / f"week_{slides_key}"
    shared_slides_dir = ranking_dir / "slides"

    for slides_dir in [week_slides_dir, shared_slides_dir]:
        if slides_dir.exists():
            slides = sorted(slides_dir.glob("rank_slide_*.png"))
            if len(slides) == 6:
                if slides_dir == week_slides_dir:
                    log(f"    スライド: 週別 ({slides_dir.name}/)")
                else:
                    log(f"    スライド: 共有 (slides/) ⚠️ 週別スライドが未作成")
                return slides
    raise FileNotFoundError(
        f"スライドが見つかりません。先に create-ranking-slides.mjs を実行してください。\n"
        f"  期待パス: {week_slides_dir}/ または {shared_slides_dir}/"
    )


def upload_slides(slides: list[Path]) -> list[str]:
    cmd = ["curl", "-s", "-X", "POST", f"{API_BASE}/upload"]
    for p in slides:
        cmd += ["-F", f"files=@{p}"]
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
    if result.returncode != 0:
        raise RuntimeError(f"upload failed: {result.stderr}")
    return json.loads(result.stdout)["paths"]


def generate_video(upload_paths: list[str], script: str, word_wrap: bool = False) -> str:
    order = "|||".join(upload_paths)
    cmd = [
        "curl", "-s", "-X", "POST", f"{API_BASE}/generate",
        "--data-urlencode", f"order={order}",
        "--data-urlencode", "template=バズり系",
        "--data-urlencode", "bgm=アップビート",
        "--data-urlencode", f"script={script}",
    ]
    if word_wrap:
        cmd += ["--data-urlencode", "word_wrap=yes"]
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
    if result.returncode != 0:
        raise RuntimeError(f"generate failed: {result.stderr}")
    data = json.loads(result.stdout)
    if "video_url" not in data:
        raise RuntimeError(f"no video_url: {result.stdout}")
    return data["video_url"]


def copy_video(video_url: str, dest: Path) -> None:
    """video_tool の出力ファイルを dest にコピーする"""
    timestamp = video_url.replace("/output/local/", "").replace(".mp4", "")
    src_mp4 = VIDEO_TOOL_OUTPUT / f"{timestamp}.mp4"
    for _ in range(10):
        if src_mp4.exists():
            break
        time.sleep(2)
    if not src_mp4.exists():
        raise FileNotFoundError(f"生成済みファイルが見つかりません: {src_mp4}")
    dest.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(src_mp4, dest)


def process_week(week_path: Path, ranking_dir: Path) -> None:
    """1週分のランキング動画を生成する（通常版 + TikTok版）"""
    # week_0406_0412.md / week_0406_0412_love.md → monday = 0406
    m = re.match(r"week_(\d{4})_\d{4}(?:_(love|money))?\.md", week_path.name)
    if not m:
        raise ValueError(f"ファイル名フォーマット不正: {week_path.name}")

    mmdd   = m.group(1)
    theme  = m.group(2)  # None / "love" / "money"
    year   = ranking_dir.parent.parent.name  # scheduled/2026/04/ranking
    mm     = ranking_dir.parent.name
    monday_date = f"{year}-{mm}-{mmdd[0:2]}-{mmdd[2:4]}"  # 表示用
    suffix = f"_{theme}" if theme else ""

    output_mp4 = ranking_dir / "videos" / f"ranking_{year}{mmdd[0:2]}{mmdd[2:4]}{suffix}.mp4"
    tiktok_mp4 = ranking_dir / "videos" / f"ranking_{year}{mmdd[0:2]}{mmdd[2:4]}{suffix}_tiktok.mp4"

    theme_label = f" [{theme}]" if theme else ""
    log(f"\n=== {monday_date[0:7]}/{mmdd[0:2]}/{mmdd[2:4]}{theme_label} 処理開始 ===")

    if output_mp4.exists() and tiktok_mp4.exists():
        log(f"  SKIP: 両バージョン生成済み → {output_mp4.name} / {tiktok_mp4.name}")
        return

    # ステップ1: ナレーション抽出
    log("  [1] ナレーション抽出中...")
    script = extract_narration(week_path)
    log(f"      {len(script)}文字")

    # ステップ2: スライド探索
    log("  [2] スライド探索中...")
    slides_key = f"{mmdd}_{theme}" if theme else mmdd
    slides = find_slides(ranking_dir, slides_key)

    # ステップ3: アップロード（通常版・TikTok版で共有）
    log("  [3] アップロード中...")
    upload_paths = upload_slides(slides)

    # ステップ4 & 5: 通常版
    if not output_mp4.exists():
        log("  [4] 動画生成中（通常版）...")
        video_url = generate_video(upload_paths, script)
        log(f"      -> {video_url}")
        copy_video(video_url, output_mp4)
        size_mb = output_mp4.stat().st_size / (1024 * 1024)
        log(f"  完了（通常版）: {output_mp4.name} ({size_mb:.1f}MB)")

    # ステップ4 & 5: TikTok版（CTAにインスタ告知追加）
    if not tiktok_mp4.exists():
        log("  [4] 動画生成中（TikTok版）...")
        tiktok_script = make_tiktok_narration(script)
        video_url = generate_video(upload_paths, tiktok_script, word_wrap=True)
        log(f"      -> {video_url}")
        copy_video(video_url, tiktok_mp4)
        size_mb = tiktok_mp4.stat().st_size / (1024 * 1024)
        log(f"  完了（TikTok版）: {tiktok_mp4.name} ({size_mb:.1f}MB)")

    # 仕様ファイル自動生成
    spec_txt = ranking_dir / "videos" / "キャプション=ナレーションが仕様.txt"
    if not spec_txt.exists():
        spec_txt.write_text(SPEC_TEXT, encoding="utf-8")


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

    log(f"=== ランキング動画生成 {year}/{month:02d} ({len(week_files)}週分) ===")

    results = []
    for week_path in week_files:
        try:
            process_week(week_path, ranking_dir)
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
        f"🎬 ランキング動画生成完了\n"
        f"成功: {ok}/{len(results)} 件"
    )


if __name__ == "__main__":
    main()
