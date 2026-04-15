#!/usr/bin/env python3
"""
Instagram Reels auto-poster for 星詠み（CDP方式）

前提: Chrome が CDP モードで起動済みであること
  PowerShell: C:\\Users\\admin\\start_chrome_cdp.ps1

Usage:
  python3 instagram_post.py                        # 誕生日動画投稿（today JST）
  python3 instagram_post.py 2026-04-06             # 日付指定
  python3 instagram_post.py --ranking main         # 総合ランキング投稿（月曜）
  python3 instagram_post.py --ranking love         # 恋愛運ランキング投稿（水曜）
  python3 instagram_post.py --ranking money        # 金運ランキング投稿（金曜）
  python3 instagram_post.py --no-delay             # ランダム遅延スキップ（テスト用）
  python3 instagram_post.py --dry-run              # 投稿直前で停止・スクリーンショット保存
"""

import base64
import json
import math
import platform
import random
import re
import subprocess
import sys
import time
import urllib.request
import urllib.parse
from pathlib import Path
from datetime import datetime, timezone, timedelta

from playwright.sync_api import sync_playwright

# ── Paths ─────────────────────────────────────────────────────────────────────
SCRIPT_DIR    = Path(__file__).parent
PROJECT_DIR   = SCRIPT_DIR.parent
SCHEDULED_DIR = PROJECT_DIR / "scheduled"
LOG_FILE      = SCRIPT_DIR / "instagram_post.log"

JST = timezone(timedelta(hours=9))

TELEGRAM_BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN", "")
TELEGRAM_CHAT_ID   = os.environ.get("TELEGRAM_CHAT_ID", "")

# キャプション末尾に追加するCTA
CAPTION_CTA = "\n\nフォローして毎日の運勢をチェック✨\nあなたの星座をコメントで教えて🔮"


# ── Telegram通知 ───────────────────────────────────────────────────────────────

def notify_telegram(msg: str) -> None:
    try:
        params = urllib.parse.urlencode({"chat_id": TELEGRAM_CHAT_ID, "text": msg})
        url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage?{params}"
        urllib.request.urlopen(url, timeout=10)
    except Exception as e:
        log(f"Telegram通知失敗: {e}")


# ── CDP URL 解決 ───────────────────────────────────────────────────────────────

def _get_cdp_url() -> str:
    """CDP URLを返す（WSL2ミラーネットワークモード対応: localhost固定）"""
    return "http://localhost:9222"

CDP_URL = _get_cdp_url()


# ── Utilities ──────────────────────────────────────────────────────────────────

def log(msg: str) -> None:
    now = datetime.now(JST).strftime("%Y-%m-%d %H:%M:%S JST")
    line = f"[{now}] {msg}"
    print(line, flush=True)
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(line + "\n")


def parse_meta(date_str: str) -> dict | None:
    """メタファイルから指定日のキャプション・ハッシュタグを取得する"""
    year, month, _ = date_str.split("-")
    meta_dir = SCHEDULED_DIR / year / month
    candidates = sorted(meta_dir.glob("youtube_meta*.md"))
    if not candidates:
        log(f"ERROR: No meta file found in {meta_dir}")
        return None

    section = None
    for meta_file in candidates:
        content = meta_file.read_text(encoding="utf-8")
        m = re.search(
            rf"## {re.escape(date_str)}.*?(?=\n## 20|\Z)", content, re.DOTALL
        )
        if m:
            section = m.group()
            log(f"Meta file: {meta_file.name}")
            break

    if not section:
        log(f"ERROR: Date {date_str} not found in any meta file")
        return None

    caption_match = re.search(
        r"\*\*(?:キャプション|YouTube / TikTok 説明・キャプション)\*\*\n```\n(.*?)\n```",
        section, re.DOTALL
    )
    # InstagramハッシュタグがあればそれをInstagram投稿に使用（なければ通常ハッシュタグにフォールバック）
    ig_hashtag_match = re.search(r"\*\*Instagramハッシュタグ\*\*\n```\n(.*?)\n```", section, re.DOTALL)
    hashtag_match    = re.search(r"\*\*ハッシュタグ\*\*\n```\n(.*?)\n```", section, re.DOTALL)
    if not caption_match or not hashtag_match:
        log(f"ERROR: Could not parse caption/hashtag for {date_str}")
        return None

    caption  = caption_match.group(1).strip()
    hashtags = (ig_hashtag_match or hashtag_match).group(1).strip()
    if ig_hashtag_match:
        log(f"  Instagramハッシュタグ使用（{len(hashtags.split())}個）")
    return {"caption": f"{caption}\n\n{hashtags}{CAPTION_CTA}"}


def get_video_path(date_str: str) -> Path | None:
    year, month, _ = date_str.split("-")
    video = SCHEDULED_DIR / year / month / date_str / "output.mp4"
    if not video.exists():
        log(f"ERROR: Video not found: {video}")
        return None
    return video


def get_week_monday(date_str: str) -> str:
    """指定日が属する週の月曜日(YYYY-MM-DD)を返す"""
    d = datetime.strptime(date_str, "%Y-%m-%d")
    monday = d - timedelta(days=d.weekday())
    return monday.strftime("%Y-%m-%d")


def get_ranking_video_path(date_str: str, theme: str = "") -> Path | None:
    """ランキング動画のパスを返す
    theme: "" = 総合運, "love" = 恋愛運, "money" = 金運・仕事運
    動画ファイルはその週の月曜日付で命名されている
    """
    year, month, _ = date_str.split("-")
    monday_str = get_week_monday(date_str)
    _, mon_month, mon_day = monday_str.split("-")
    suffix = f"_{theme}" if theme else ""
    video = SCHEDULED_DIR / year / month / "ranking" / "videos" / f"ranking_{year}{mon_month}{mon_day}{suffix}.mp4"
    if not video.exists():
        log(f"SKIP: Ranking video not found: {video}")
        return None
    return video


def parse_ranking_meta(date_str: str, theme: str = "") -> dict | None:
    """ランキングキャプションを week_*.md から取得する
    theme: "" = 総合運, "love" = 恋愛運, "money" = 金運・仕事運
    """
    year, month, _ = date_str.split("-")
    monday_str = get_week_monday(date_str)
    _, mon_month, mon_day = monday_str.split("-")
    mmdd = f"{mon_month}{mon_day}"
    ranking_dir = SCHEDULED_DIR / year / month / "ranking"

    if theme:
        candidates = sorted(ranking_dir.glob(f"week_{mmdd}_*_{theme}.md"))
    else:
        candidates = sorted(ranking_dir.glob(f"week_{mmdd}_[0-9][0-9][0-9][0-9].md"))

    if not candidates:
        log(f"SKIP: No ranking week file found for {date_str} (theme={theme or 'main'})")
        return None

    content = candidates[0].read_text(encoding="utf-8")
    caption_match = re.search(
        r"### YouTube / TikTok / Instagram 共通\s*```\n(.*?)\n```",
        content, re.DOTALL
    )
    hashtag_match = re.search(r"\*\*ハッシュタグ\*\*\s*```\n(.*?)\n```", content, re.DOTALL)
    if not caption_match or not hashtag_match:
        log(f"SKIP: Could not parse ranking caption for {date_str}")
        return None

    caption  = caption_match.group(1).strip()
    hashtags = hashtag_match.group(1).strip()
    return {"caption": f"{caption}\n\n{hashtags}{CAPTION_CTA}"}


# ── Browser helpers ────────────────────────────────────────────────────────────

def screenshot(page, label: str) -> None:
    path = SCRIPT_DIR / f"ig_{label}_{datetime.now(JST).strftime('%H%M%S')}.png"
    page.screenshot(path=str(path))
    log(f"Screenshot: {path.name}")


def click_first(page, selectors: list[str], timeout: int = 5000) -> bool:
    for sel in selectors:
        try:
            loc = page.locator(sel).first
            loc.wait_for(state="visible", timeout=timeout)
            human_click(page, loc)
            return True
        except Exception:
            continue
    return False


# ── Human-like behavior helpers ────────────────────────────────────────────────

def setup_page(page) -> None:
    """webdriverフラグを隠す（navigator.webdriver検出対策）"""
    page.add_init_script(
        "Object.defineProperty(navigator, 'webdriver', {get: () => undefined})"
    )


def human_type(page, text: str) -> None:
    """文字ごとにランダムな遅延を入れて人間らしくタイプする"""
    for char in text:
        page.keyboard.type(char)
        time.sleep(random.uniform(0.04, 0.16))


def human_scroll(page) -> None:
    """自然なスクロール（寄り道シグナル）"""
    amount = random.randint(120, 350)
    page.mouse.wheel(0, amount)
    time.sleep(random.uniform(0.3, 0.7))
    page.mouse.wheel(0, -random.randint(40, amount // 2))
    time.sleep(random.uniform(0.2, 0.5))


def bezier_mouse_move(page, x1: float, y1: float, x2: float, y2: float, steps: int = 25) -> None:
    """二次ベジェ曲線でマウスを移動（直線移動の回避）"""
    cx = (x1 + x2) / 2 + random.uniform(-70, 70)
    cy = (y1 + y2) / 2 + random.uniform(-70, 70)
    for i in range(steps + 1):
        t = i / steps
        x = (1 - t) ** 2 * x1 + 2 * (1 - t) * t * cx + t ** 2 * x2
        y = (1 - t) ** 2 * y1 + 2 * (1 - t) * t * cy + t ** 2 * y2
        page.mouse.move(x, y)
        time.sleep(random.uniform(0.004, 0.018))


def human_click(page, locator) -> None:
    """ベジェ曲線でマウス移動してからクリック"""
    try:
        box = locator.bounding_box(timeout=5000)
        if box:
            tx = box["x"] + box["width"] / 2 + random.uniform(-4, 4)
            ty = box["y"] + box["height"] / 2 + random.uniform(-4, 4)
            cur = page.evaluate("() => ({x: window.scrollX + 150, y: window.scrollY + 250})")
            bezier_mouse_move(page, cur["x"], cur["y"], tx, ty)
            time.sleep(random.uniform(0.05, 0.15))
            page.mouse.click(tx, ty)
            return
    except Exception:
        pass
    locator.click()


# ── Instagram posting ──────────────────────────────────────────────────────────

def dismiss_modals(page) -> None:
    """予期しないポップアップを閉じる（投稿フローの×は押さない）"""
    selectors = [
        'button:has-text("OK")',
        'button:has-text("後で")',
        'button:has-text("今はしない")',
    ]
    for sel in selectors:
        try:
            loc = page.locator(sel).first
            if loc.is_visible(timeout=2000):
                human_click(page, loc)
                log(f"ポップアップを閉じました: {sel}")
                time.sleep(1)
        except Exception:
            continue


def post_reel(page, video_path: Path, caption: str, date_str: str, dry_run: bool = False) -> bool:
    setup_page(page)
    log("Instagramに移動...")
    page.goto("https://www.instagram.com/", wait_until="networkidle", timeout=30000)
    time.sleep(2)
    dismiss_modals(page)
    human_scroll(page)  # 寄り道: ページを少しスクロール

    if dry_run:
        screenshot(page, "01_home")

    # 投稿（+）ボタン
    log("投稿ボタンをクリック...")
    human_scroll(page)  # 寄り道: ボタンクリック前にスクロール
    created = click_first(page, [
        '[aria-label="新しい投稿"]',
        '[aria-label="新規投稿"]',
        '[aria-label="作成"]',
        '[aria-label*="新しい投稿"]',
        '[aria-label*="新規"]',
        '[aria-label*="作成"]',
    ], timeout=8000)
    if not created:
        log("ERROR: 投稿ボタンが見つかりません")
        screenshot(page, "error_no_create_button")
        return False

    # サブメニューが出る前に閉じないよう、すぐにクリック
    time.sleep(0.3)
    # クリエイターアカウント: 「新しい投稿」→サブメニュー「投稿」（左側に出現）
    # x座標が小さい（サイドバー付近）要素を優先してクリック
    try:
        page.wait_for_selector('a:has-text("投稿"), span:has-text("投稿")', timeout=2000)
        # 左端（x<300）にある「投稿」テキストを探してクリック
        clicked = page.evaluate("""
            () => {
                const els = [...document.querySelectorAll('a, span, div')].filter(el => {
                    const rect = el.getBoundingClientRect();
                    return el.textContent.trim() === '投稿' && rect.x < 300 && rect.width > 0;
                });
                if (els.length > 0) { els[0].click(); return true; }
                return false;
            }
        """)
        log(f"サブメニュー「投稿」クリック: {'成功' if clicked else 'スキップ'}")
    except Exception:
        log("サブメニューなし（スキップ）")

    time.sleep(2)
    if dry_run:
        screenshot(page, "02_after_post_submenu")

    # リール選択
    click_first(page, ['button:has-text("リール")'], timeout=4000)
    time.sleep(1)
    if dry_run:
        screenshot(page, "03_after_reel_select")

    # 動画アップロード
    log(f"動画をアップロード: {video_path.name}")
    file_input = page.locator('input[type="file"]').first
    file_input.set_input_files(str(video_path))
    log("動画処理中... (15秒待機)")
    time.sleep(15)
    dismiss_modals(page)
    if dry_run:
        screenshot(page, "04_after_upload")

    # 「次へ」を最大2回（切り取る→編集→キャプション）
    for step in range(2):
        dismiss_modals(page)
        if click_first(page, [
            'button:has-text("次へ")',
            'div[role="button"]:has-text("次へ")',
            '[role="button"]:has-text("次へ")',
            'a:has-text("次へ")',
        ], timeout=8000):
            log(f"次へ ({step + 1}/2)")
            time.sleep(8)
            dismiss_modals(page)
            if dry_run:
                screenshot(page, f"05_next_{step + 1}")
        else:
            break

    # キャプション入力
    dismiss_modals(page)
    log("キャプションを入力...")
    if dry_run:
        screenshot(page, "06_before_caption")
    caption_filled = False
    for sel in ['[aria-label*="キャプション"]', '[aria-label*="caption"]', '[contenteditable="true"]', 'textarea']:
        try:
            loc = page.locator(sel).first
            human_click(page, loc)
            time.sleep(0.5)
            # フォーカスを確実に取得してから入力開始
            time.sleep(2)
            # 通常行: keyboard.type() で一括入力
            # ハッシュタグ行（#で始まる行）: 行全体を一括入力 → 最後に1回Escapeで確定
            # ※ハッシュタグごとにEscape+再フォーカスするとカーソル位置がリセットされ
            #   2個目以降のハッシュタグが消えるため、一括入力方式を採用
            lines = caption.split('\n')
            for i, line in enumerate(lines):
                if i > 0:
                    page.keyboard.press('Enter')
                    time.sleep(random.uniform(0.08, 0.2))
                if not line:
                    continue
                if line.startswith('#'):
                    # ハッシュタグ行: 全体を一括入力し最後に1回Escapeで全ハッシュタグを確定
                    page.keyboard.type(line)
                    time.sleep(0.3)
                    page.keyboard.press('Escape')
                    time.sleep(0.5)
                else:
                    human_type(page, line)  # 人間らしいタイピング速度
                    time.sleep(random.uniform(0.1, 0.3))
            time.sleep(1)
            log(f"キャプション入力完了: {sel}")
            caption_filled = True
            break
        except Exception:
            continue
    if not caption_filled:
        log("WARNING: キャプション入力に失敗しました")

    # 投稿直前で停止（dry-run）
    if dry_run:
        screenshot(page, "07_dryrun_final")
        log("[DRY-RUN] 投稿直前で停止。スクリーンショットを確認してください。")
        return True

    # 投稿実行（JSクリックで確実に押す）
    log("投稿実行...")
    try:
        page.evaluate("""
            const el = [...document.querySelectorAll('div[role="button"]')].find(e => e.textContent.trim() === 'シェア');
            if (el) el.click();
            else throw new Error('シェアボタンが見つかりません');
        """)
        log("シェアボタンをクリックしました")
    except Exception as e:
        log(f"ERROR: {e}")
        screenshot(page, "error_no_share_button")
        return False

    time.sleep(40)
    log("投稿完了!")
    notify_telegram(f"【星詠み】Instagram投稿完了 {date_str}\nキャプションを確認・編集してください。\nhttps://www.instagram.com/hoshiyomi_xyz/")
    return True


# ── Main ───────────────────────────────────────────────────────────────────────

def main() -> None:
    args = sys.argv[1:]
    no_delay = "--no-delay" in args
    dry_run  = "--dry-run"  in args
    date_args = [a for a in args if re.match(r"\d{4}-\d{2}-\d{2}", a)]

    # --ranking {main|love|money} でランキング投稿モードに切り替え
    ranking_theme = None
    if "--ranking" in args:
        idx = args.index("--ranking")
        if idx + 1 < len(args) and args[idx + 1] in ("main", "love", "money"):
            ranking_theme = args[idx + 1]
        else:
            log("ERROR: --ranking の引数が不正です。main / love / money を指定してください")
            sys.exit(1)

    # テスト実行時は古いスクリーンショットを削除
    if dry_run or no_delay:
        old_shots = list(SCRIPT_DIR.glob("ig_*.png"))
        if old_shots:
            for f in old_shots:
                f.unlink()
            log(f"古いスクリーンショット {len(old_shots)} 件を削除しました")

    # ランダム遅延（最大20分）
    if not no_delay:
        delay = random.randint(0, 20 * 60)
        log(f"ランダム遅延: {delay // 60}分{delay % 60}秒")
        time.sleep(delay)

    date_str = date_args[0] if date_args else datetime.now(JST).strftime("%Y-%m-%d")

    # ── ランキング投稿モード ──────────────────────────────────────────────────────
    if ranking_theme is not None:
        theme = "" if ranking_theme == "main" else ranking_theme
        label = {"main": "総合運", "love": "恋愛運", "money": "金運・仕事運"}[ranking_theme]
        log(f"=== Instagram ランキング投稿開始（{label}）: {date_str} ===")
        log(f"CDP URL: {CDP_URL}")

        ranking_video = get_ranking_video_path(date_str, theme)
        ranking_meta  = parse_ranking_meta(date_str, theme)
        if not ranking_video or not ranking_meta:
            sys.exit(1)

        log(f"投稿キャプション:\n{ranking_meta['caption']}")

        with sync_playwright() as p:
            try:
                browser = p.chromium.connect_over_cdp(CDP_URL)
            except Exception as e:
                log(f"ERROR: CDP接続失敗 - {e}")
                log("PowerShell: C:\\Users\\admin\\start_chrome_cdp.ps1")
                sys.exit(1)

            context = browser.contexts[0]
            page = context.new_page()
            try:
                success = post_reel(page, ranking_video, ranking_meta["caption"], date_str, dry_run=dry_run)
                if not success:
                    screenshot(page, f"ranking_error_{datetime.now(JST).strftime('%H%M%S')}")
                    sys.exit(1)
            except Exception as e:
                log(f"ERROR: {e}")
                try:
                    page.screenshot(path=str(SCRIPT_DIR / f"ig_ranking_error_{datetime.now(JST).strftime('%H%M%S')}.png"))
                except Exception:
                    pass
                sys.exit(1)
            finally:
                page.close()

        log(f"=== 完了: {date_str} ({label}) ===")
        return

    # ── 誕生日投稿モード ──────────────────────────────────────────────────────────
    log(f"=== Instagram 投稿開始: {date_str} ===")
    log(f"CDP URL: {CDP_URL}")

    meta = parse_meta(date_str)
    if not meta:
        sys.exit(1)

    video = get_video_path(date_str)
    if not video:
        sys.exit(1)

    log(f"投稿キャプション:\n{meta['caption']}")

    with sync_playwright() as p:
        try:
            browser = p.chromium.connect_over_cdp(CDP_URL)
        except Exception as e:
            log(f"ERROR: CDP接続失敗 - {e}")
            log("Chrome が CDP モードで起動しているか確認してください")
            log("PowerShell: C:\\Users\\admin\\start_chrome_cdp.ps1")
            sys.exit(1)

        context = browser.contexts[0]
        page = context.new_page()

        try:
            success = post_reel(page, video, meta["caption"], date_str, dry_run=dry_run)
            if not success:
                screenshot(page, f"error_final_{datetime.now(JST).strftime('%H%M%S')}")
                sys.exit(1)

        except Exception as e:
            log(f"ERROR: {e}")
            try:
                path = SCRIPT_DIR / f"ig_error_{datetime.now(JST).strftime('%H%M%S')}.png"
                page.screenshot(path=str(path))
                log(f"Screenshot: {path.name}")
            except Exception as se:
                log(f"Screenshot failed: {se}")
            sys.exit(1)
        finally:
            page.close()

    log(f"=== 完了: {date_str} ===")


if __name__ == "__main__":
    main()
