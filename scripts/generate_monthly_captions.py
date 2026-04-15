#!/usr/bin/env python3
"""
月次キャプション生成スクリプト
実行: 毎月15日 09:00 JST（cronで自動実行）
生成対象: 翌月分の
  - youtube_meta_{mm01}_{mmDD}.md  （生年月日 YouTube/Instagram キャプション）
  - x_meta_{mm01}_{mmDD}.md        （生年月日 X キャプション）
  - ranking/week_{mmdd}_{mmdd}.md  （ランキング週次キャプション）
"""

import calendar
import urllib.parse
import urllib.request
import json
import os
import re
import subprocess
import sys
import tempfile
from datetime import date, timedelta
from pathlib import Path

import anthropic
from dateutil.relativedelta import relativedelta

# ── 定数 ──────────────────────────────────────────────────────────────────────

SCRIPT_DIR    = Path(__file__).parent
PROJECT_DIR   = SCRIPT_DIR.parent
SCHEDULED_DIR = PROJECT_DIR / "scheduled"
LOG_FILE      = SCRIPT_DIR / "generate_monthly_captions.log"

TELEGRAM_BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN", "")
TELEGRAM_CHAT_ID   = os.environ.get("TELEGRAM_CHAT_ID", "")


def notify_telegram(msg: str) -> None:
    try:
        params = urllib.parse.urlencode({"chat_id": TELEGRAM_CHAT_ID, "text": msg})
        url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage?{params}"
        urllib.request.urlopen(url, timeout=10)
    except Exception as e:
        print(f"Telegram通知失敗: {e}")


ZODIAC_LIST = [
    ((3, 21), (4, 19),  "牡羊座", "♈"),
    ((4, 20), (5, 20),  "牡牛座", "♉"),
    ((5, 21), (6, 21),  "双子座", "♊"),
    ((6, 22), (7, 22),  "蟹座",   "♋"),
    ((7, 23), (8, 22),  "獅子座", "♌"),
    ((8, 23), (9, 22),  "乙女座", "♍"),
    ((9, 23), (10, 23), "天秤座", "♎"),
    ((10, 24),(11, 22), "蠍座",   "♏"),
    ((11, 23),(12, 21), "射手座", "♐"),
    ((12, 22),(1, 19),  "山羊座", "♑"),
    ((1, 20), (2, 18),  "水瓶座", "♒"),
    ((2, 19), (3, 20),  "魚座",   "♓"),
]

# ランキング方針: 開幕週のみシーズン星座1位 / 2週目以降は別の星座
SEASON_RANKINGS = {
    "牡羊座": {
        "opening_top3": ["牡羊座", "射手座", "獅子座"],
        "alt_top3_pool": [["獅子座", "牡羊座", "双子座"],
                          ["射手座", "牡羊座", "天秤座"],
                          ["蟹座",   "牡羊座", "双子座"]],
    },
    "牡牛座": {
        "opening_top3": ["牡牛座", "乙女座", "山羊座"],
        "alt_top3_pool": [["蟹座",   "牡牛座", "天秤座"],
                          ["乙女座", "牡牛座", "山羊座"],
                          ["天秤座", "牡牛座", "蟹座"]],
    },
    "双子座": {
        "opening_top3": ["双子座", "天秤座", "水瓶座"],
        "alt_top3_pool": [["天秤座", "双子座", "牡羊座"],
                          ["水瓶座", "双子座", "射手座"],
                          ["牡羊座", "双子座", "獅子座"]],
    },
    "蟹座": {
        "opening_top3": ["蟹座", "魚座", "蠍座"],
        "alt_top3_pool": [["魚座",   "蟹座", "牡牛座"],
                          ["蠍座",   "蟹座", "魚座"],
                          ["牡牛座", "蟹座", "乙女座"]],
    },
    "獅子座": {
        "opening_top3": ["獅子座", "牡羊座", "射手座"],
        "alt_top3_pool": [["牡羊座", "獅子座", "双子座"],
                          ["射手座", "獅子座", "牡羊座"],
                          ["双子座", "獅子座", "天秤座"]],
    },
    "乙女座": {
        "opening_top3": ["乙女座", "牡牛座", "山羊座"],
        "alt_top3_pool": [["牡牛座", "乙女座", "蟹座"],
                          ["山羊座", "乙女座", "牡牛座"],
                          ["蟹座",   "乙女座", "天秤座"]],
    },
    "天秤座": {
        "opening_top3": ["天秤座", "双子座", "水瓶座"],
        "alt_top3_pool": [["双子座", "天秤座", "獅子座"],
                          ["水瓶座", "天秤座", "双子座"],
                          ["獅子座", "天秤座", "射手座"]],
    },
    "蠍座": {
        "opening_top3": ["蠍座", "魚座", "蟹座"],
        "alt_top3_pool": [["魚座",   "蠍座", "山羊座"],
                          ["蟹座",   "蠍座", "魚座"],
                          ["山羊座", "蠍座", "牡牛座"]],
    },
    "射手座": {
        "opening_top3": ["射手座", "牡羊座", "獅子座"],
        "alt_top3_pool": [["牡羊座", "射手座", "双子座"],
                          ["獅子座", "射手座", "牡羊座"],
                          ["双子座", "射手座", "水瓶座"]],
    },
    "山羊座": {
        "opening_top3": ["山羊座", "牡牛座", "乙女座"],
        "alt_top3_pool": [["牡牛座", "山羊座", "魚座"],
                          ["乙女座", "山羊座", "牡牛座"],
                          ["魚座",   "山羊座", "蠍座"]],
    },
    "水瓶座": {
        "opening_top3": ["水瓶座", "双子座", "天秤座"],
        "alt_top3_pool": [["双子座", "水瓶座", "牡羊座"],
                          ["天秤座", "水瓶座", "双子座"],
                          ["牡羊座", "水瓶座", "射手座"]],
    },
    "魚座": {
        "opening_top3": ["魚座", "蟹座", "蠍座"],
        "alt_top3_pool": [["蟹座",   "魚座", "牡牛座"],
                          ["蠍座",   "魚座", "蟹座"],
                          ["牡牛座", "魚座", "乙女座"]],
    },
}

ALL_SIGNS = ["牡羊座","牡牛座","双子座","蟹座","獅子座","乙女座",
             "天秤座","蠍座","射手座","山羊座","水瓶座","魚座"]

# テーマ別ランキングプール（love=恋愛運 / money=金運・仕事運）
THEME_RANKING_POOLS = {
    "love": [
        ["蟹座","蠍座","魚座","天秤座","牡牛座","双子座","獅子座","牡羊座","水瓶座","射手座","乙女座","山羊座"],
        ["天秤座","魚座","蟹座","牡牛座","蠍座","水瓶座","射手座","双子座","牡羊座","獅子座","山羊座","乙女座"],
        ["蠍座","蟹座","天秤座","双子座","牡牛座","魚座","牡羊座","獅子座","山羊座","水瓶座","射手座","乙女座"],
        ["魚座","天秤座","蠍座","蟹座","双子座","獅子座","牡牛座","水瓶座","牡羊座","射手座","乙女座","山羊座"],
    ],
    "money": [
        ["山羊座","牡牛座","乙女座","蠍座","獅子座","牡羊座","蟹座","双子座","射手座","天秤座","魚座","水瓶座"],
        ["牡牛座","山羊座","蠍座","乙女座","牡羊座","獅子座","天秤座","蟹座","水瓶座","双子座","射手座","魚座"],
        ["乙女座","蠍座","山羊座","牡牛座","獅子座","牡羊座","双子座","天秤座","射手座","蟹座","水瓶座","魚座"],
        ["蠍座","乙女座","牡牛座","山羊座","牡羊座","蟹座","獅子座","双子座","魚座","射手座","天秤座","水瓶座"],
    ],
}

ZODIAC_SYMBOLS = {
    "牡羊座": "♈", "牡牛座": "♉", "双子座": "♊", "蟹座":   "♋",
    "獅子座": "♌", "乙女座": "♍", "天秤座": "♎", "蠍座":   "♏",
    "射手座": "♐", "山羊座": "♑", "水瓶座": "♒", "魚座":   "♓",
}

# ── ユーティリティ ─────────────────────────────────────────────────────────────

def log(msg: str) -> None:
    from datetime import datetime, timezone, timedelta
    JST = timezone(timedelta(hours=9))
    line = f"[{datetime.now(JST).strftime('%Y-%m-%d %H:%M:%S JST')}] {msg}"
    print(line, flush=True)
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(line + "\n")


def get_zodiac(month: int, day: int) -> dict:
    """日付から星座情報を返す"""
    for (sm, sd), (em, ed), name, symbol in ZODIAC_LIST:
        # 年をまたぐ山羊座対応
        if sm > em:
            if (month == sm and day >= sd) or (month == em and day <= ed) or \
               (sm < month <= 12) or (1 <= month < em):
                return {"name": name, "symbol": symbol}
        else:
            if (month == sm and day >= sd) or (month == em and day <= ed) or \
               (sm < month < em):
                return {"name": name, "symbol": symbol}
    return {"name": "不明", "symbol": "?"}


def get_mondays(year: int, month: int) -> list[date]:
    """指定月の月曜日リストを返す"""
    days_in_month = calendar.monthrange(year, month)[1]
    return [date(year, month, d) for d in range(1, days_in_month + 1)
            if date(year, month, d).weekday() == 0]


def get_season_sign(month: int, day: int) -> str:
    return get_zodiac(month, day)["name"]


def build_ranking_for_week(monday: date, season_sign: str, week_index: int) -> dict:
    """週のランキングデータを構築する"""
    policy = SEASON_RANKINGS.get(season_sign, SEASON_RANKINGS["牡羊座"])

    if week_index == 0:
        top3 = policy["opening_top3"]
        is_opening = True
    else:
        pool = policy["alt_top3_pool"]
        top3 = pool[(week_index - 1) % len(pool)]
        is_opening = False

    # TOP3以外の残り星座をランダム順に並べる（再現性のため week_index でシード）
    remaining = [s for s in ALL_SIGNS if s not in top3]
    import random
    rng = random.Random(monday.toordinal())
    rng.shuffle(remaining)

    ranked = top3 + remaining
    return {"ranked": ranked, "is_opening": is_opening, "season_sign": season_sign}


def build_ranking_for_week_themed(monday: date, theme: str) -> dict:
    """テーマ別（love/money）の週ランキングデータを構築する"""
    pool = THEME_RANKING_POOLS[theme]
    week_index = (monday.toordinal() // 7) % len(pool)
    return {"ranked": pool[week_index], "theme": theme}


# ── ランキングスライド生成 ──────────────────────────────────────────────────────

def extract_week_slide_data(week_path: Path, monday: date) -> dict:
    """week_*.md からスライド生成データを抽出する（SSoT）"""
    content = week_path.read_text(encoding="utf-8")

    # WEEK_DATE_LABEL
    end = monday + timedelta(days=6)
    week_date_label = f"{monday.month}/{monday.day}（月）〜 {end.month}/{end.day}（日）"

    # HOOK_LINE1/2: ナレーション 【フック】セクションから抽出
    hook_m = re.search(r"【フック】\n(.*?)(?=\n【)", content, re.DOTALL)
    hook_line1, hook_line2 = "", ""
    if hook_m:
        hook_text = hook_m.group(1).strip()
        lines = [l.strip() for l in hook_text.splitlines() if l.strip()]
        if len(lines) >= 2:
            hook_line1, hook_line2 = lines[0], lines[1]
        elif "——" in lines[0]:
            parts = lines[0].split("——", 1)
            hook_line1 = parts[0].strip()
            hook_line2 = parts[1].strip()
        else:
            hook_line1 = lines[0]

    # RANKING: 「今週のランキング」テーブルから抽出（ヘッダー後の空行数に依存しない）
    ranking = []
    table_m = re.search(r"((?:\| *\d+位.*\n)+)", content)
    if table_m:
        for row in table_m.group(1).splitlines():
            cols = [c.strip() for c in row.split("|") if c.strip()]
            if len(cols) >= 3 and cols[0].endswith("位"):
                rank_num = int(cols[0].replace("位", ""))
                name    = cols[1]
                comment = cols[2]
                ranking.append({
                    "rank":    rank_num,
                    "name":    name,
                    "symbol":  ZODIAC_SYMBOLS.get(name, "★"),
                    "comment": comment,
                })
        ranking.sort(key=lambda x: x["rank"])

    return {
        "weekDateLabel": week_date_label,
        "hookLine1":     hook_line1,
        "hookLine2":     hook_line2,
        "ranking":       ranking,
    }


def generate_slides_for_week_themed(week_path: Path, monday: date, ranking_dir: Path, theme: str) -> None:
    """テーマ別 week_*.md からスライド6枚を生成する"""
    mmdd = f"{monday.month:02d}{monday.day:02d}"
    output_dir = ranking_dir.resolve() / "slides" / f"week_{mmdd}_{theme}"
    output_dir.mkdir(parents=True, exist_ok=True)

    slide_data = extract_week_slide_data(week_path, monday)
    slide_data["outputDir"] = str(output_dir)

    mjs_path = SCRIPT_DIR / "create-ranking-slides.mjs"

    with tempfile.NamedTemporaryFile(
        mode="w", suffix=".json", delete=False, encoding="utf-8"
    ) as f:
        json.dump(slide_data, f, ensure_ascii=False)
        tmp_path = f.name

    try:
        result = subprocess.run(
            ["node", str(mjs_path), "--data", tmp_path],
            cwd=str(SCHEDULED_DIR),
            capture_output=True, text=True, timeout=120,
        )
        if result.returncode != 0:
            raise RuntimeError(result.stderr.strip())
        log(f"    スライド生成完了: slides/week_{mmdd}_{theme}/ (6枚)")
    finally:
        Path(tmp_path).unlink(missing_ok=True)


def generate_slides_for_week(week_path: Path, monday: date, ranking_dir: Path) -> None:
    """week_*.md からスライド6枚を生成し ranking/slides/week_{mmdd}/ に保存する"""
    mmdd = f"{monday.month:02d}{monday.day:02d}"
    # 絶対パスで指定（相対パスだとcwdとの組み合わせでズレる）
    output_dir = ranking_dir.resolve() / "slides" / f"week_{mmdd}"
    output_dir.mkdir(parents=True, exist_ok=True)

    slide_data = extract_week_slide_data(week_path, monday)
    slide_data["outputDir"] = str(output_dir)

    mjs_path      = SCRIPT_DIR / "create-ranking-slides.mjs"
    scheduled_dir = SCHEDULED_DIR  # 絶対パス定数を使用

    with tempfile.NamedTemporaryFile(
        mode="w", suffix=".json", delete=False, encoding="utf-8"
    ) as f:
        json.dump(slide_data, f, ensure_ascii=False)
        tmp_path = f.name

    try:
        result = subprocess.run(
            ["node", str(mjs_path), "--data", tmp_path],
            cwd=str(scheduled_dir),
            capture_output=True, text=True, timeout=120,
        )
        if result.returncode != 0:
            raise RuntimeError(result.stderr.strip())
        log(f"    スライド生成完了: slides/week_{mmdd}/ (6枚)")
    finally:
        Path(tmp_path).unlink(missing_ok=True)


# ── ナレーション検証 ────────────────────────────────────────────────────────────

def validate_narration_script(content: str) -> tuple[bool, list[str]]:
    """
    week_*.md のナレーションスクリプト部分を検証する。

    Args:
        content: week_*.md の全文
    Returns:
        (is_valid, error_messages)
    """
    errors = []

    match = re.search(
        r"## ナレーションスクリプト[^\n]*\n.*?```\n(.*?)```",
        content,
        re.DOTALL,
    )
    if not match:
        return False, ["ナレーションスクリプトのコードブロックが見つかりません"]

    script = match.group(1).strip()
    non_empty_lines = [l for l in script.splitlines() if l.strip()]

    if len(non_empty_lines) > 20:
        errors.append(
            f"ナレーション行数が制限超過: {len(non_empty_lines)}行（上限20行）"
        )

    section_12to8 = re.search(r"【12位〜8位】\n(.*?)(?=【|$)", script, re.DOTALL)
    if section_12to8:
        lines = [l for l in section_12to8.group(1).strip().splitlines() if l.strip()]
        if len(lines) != 1:
            errors.append(
                f"【12位〜8位】は1行必要ですが、{len(lines)}行あります"
            )
    else:
        errors.append("【12位〜8位】セクションが見つかりません")

    section_7to3 = re.search(r"【7位〜3位】\n(.*?)(?=【|$)", script, re.DOTALL)
    if section_7to3:
        lines = [l for l in section_7to3.group(1).strip().splitlines() if l.strip()]
        if len(lines) != 5:
            errors.append(
                f"【7位〜3位】は5行必要ですが、{len(lines)}行あります"
            )
    else:
        errors.append("【7位〜3位】セクションが見つかりません")

    # 【2位】と【1位】が独立したセクションであること（スライド6枚構成に対応）
    # 【2位・1位】のようにまとめると5セクション→6枚スライドとズレが発生する
    if re.search(r"【2位[・＆&／/]1位】|【2位.*?1位】", script):
        errors.append(
            "【2位・1位】のように2位と1位を1セクションにまとめないこと。"
            "【2位】と【1位】を別々のセクションにしてください（スライド6枚構成に対応）"
        )
    if not re.search(r"【2位】", script):
        errors.append("【2位】セクションが見つかりません")
    if not re.search(r"【1位】", script):
        errors.append("【1位】セクションが見つかりません")

    return len(errors) == 0, errors


# ── Claude API 呼び出し ────────────────────────────────────────────────────────

def generate_youtube_meta(year: int, month: int, client) -> str:
    days_in_month = calendar.monthrange(year, month)[1]

    day_info = []
    for day in range(1, days_in_month + 1):
        z = get_zodiac(month, day)
        day_info.append({
            "date":     f"{year}-{month:02d}-{day:02d}",
            "display":  f"{month}月{day}日",
            "zodiac":   z["name"],
        })

    prompt = f"""あなたは占いSNSアカウント「星詠み（hoshiyomi）」のコンテンツライターです。

{year}年{month}月の生年月日動画用メタデータを生成してください。

## タイトルの作り方（共感フック型）
- `{month}月○日生まれ｜【視聴者が「わかる！」と思う性格・行動の特徴（30文字以内）】【星詠みAI鑑定】`
- 【】の中は**日常の言葉**で書く。専門用語・詩的表現は使わない
- 例: `【やさしさと情熱のギャップがすごい人】`／`【つい全力出しちゃう愛されキャラ】`／`【人の気持ちに気づきすぎて疲れちゃうやさしい人】`
- NG例: `【銀河の鼓動を宿す不屈の魂】`（詩的すぎ）／`【火星×牡羊座第2デークの表現者】`（専門用語）

## 共通ルール
- キャプション: 3〜4行。末尾必ず `詳しくはプロフィールから🔗`
- ハッシュタグ（YouTube/TikTok用）: `#{month}月○日生まれ #星座名 #誕生日占い #星座占い #hoshiyomi`（5個固定）
- Instagramハッシュタグ: 8〜10個。上記5個＋`#占い #運勢 #今日の運勢` を基本とし、星座・季節に応じて適切なタグを追加

## 各日の情報
{json.dumps(day_info, ensure_ascii=False, indent=2)}

## 出力形式（厳守）
---

## {year}-MM-DD（星座名）

**YouTube タイトル**
```
タイトル
```
**キャプション**
```
キャプション本文（3〜4行）

詳しくはプロフィールから🔗
```
**ハッシュタグ**
```
#○月○日生まれ #星座名 #誕生日占い #星座占い #hoshiyomi
```
**Instagramハッシュタグ**
```
#○月○日生まれ #星座名 #誕生日占い #星座占い #hoshiyomi #占い #運勢 #今日の運勢 #タグ9 #タグ10
```

---

（全{days_in_month}日分を上記形式で出力してください）"""

    log(f"YouTube/Instagram メタデータ生成中 ({year}/{month:02d})...")
    response = client.messages.create(
        model="claude-opus-4-6",
        max_tokens=16000,
        messages=[{"role": "user", "content": prompt}],
    )
    return response.content[0].text


def generate_x_meta(year: int, month: int, youtube_meta_content: str, client) -> str:
    days_in_month = calendar.monthrange(year, month)[1]

    # ハッシュタグの開始を前月末から引き継ぐ（奇数月は#今日の運勢スタート）
    first_hashtag = "#今日の運勢" if month % 2 == 1 else "#星座占い"

    prompt = f"""あなたは占いSNSアカウント「星詠み（hoshiyomi）」のX（旧Twitter）担当ライターです。

以下のYouTube/Instagramメタデータを参考に、{year}年{month}月のX投稿文（全{days_in_month}日分）を生成してください。

## X投稿ルール
- 本文にURLを絶対に入れない（リーチ抑制のため）
- 280文字以内（日本語）
- ハッシュタグは1個のみ: {first_hashtag} から交互に使用（{first_hashtag}→次は異なる方→交互）
- 末尾: `あなたの誕生日をリプで教えてください🔮`
- 語り口: 引きつける一言 + 短い説明 + CTA（YouTubeより短く、テンポよく）

## 参考: YouTube/Instagramメタデータ
{youtube_meta_content}

## 出力形式（厳守）
---

## {year}-MM-DD（星座名）

**投稿本文**
```
投稿本文（URL禁止、ハッシュタグ1個）

あなたの誕生日をリプで教えてください🔮

#ハッシュタグ
```

**★投稿後にリプライ追加**
```
詳しい鑑定はこちら → https://hoshiyomi.xyz
```

---

（全{days_in_month}日分を出力してください）"""

    log(f"X メタデータ生成中 ({year}/{month:02d})...")
    response = client.messages.create(
        model="claude-opus-4-6",
        max_tokens=12000,
        messages=[{"role": "user", "content": prompt}],
    )
    return response.content[0].text


def generate_ranking_week(monday: date, ranking_data: dict, client) -> str:
    season_sign = ranking_data["season_sign"]
    ranked      = ranking_data["ranked"]
    is_opening  = ranking_data["is_opening"]

    end_date    = monday + timedelta(days=6)
    week_label  = f"{monday.month}/{monday.day}〜{end_date.month}/{end_date.day}"

    top3        = ranked[:3]
    opening_str = "（シーズン開幕週）" if is_opening else f"（{season_sign}シーズン継続中）"

    prompt = f"""あなたは占いSNSアカウント「星詠み（hoshiyomi）」のコンテンツライターです。

以下の条件で{week_label}週のランキング動画用コンテンツ素材を生成してください。

## 条件
- 星座シーズン: {season_sign}{opening_str}
- 確定ランキング（変更不可）:
{chr(10).join(f"  {i+1}位: {s}" for i, s in enumerate(ranked))}

## ランキングポリシー
- 開幕週はシーズン星座が1位でよい。2週目以降はシーズン星座は2〜3位に留め、別の星座が1位
- フックは「意外性」を重視（例: 「{season_sign}シーズンなのに…{top3[0]}が急上昇!?」）
- 開幕週は「{season_sign}シーズン開幕！」を強調するフックでOK

## 出力形式（厳守・以下のMarkdown形式で全セクションを出力）

# 星座週間ランキング コンテンツ素材（{week_label}週）
投稿日: {monday.strftime('%Y-%m-%d')}（月）

---

## 今週のランキング（{week_label}）

（テーマ説明1行）

| 順位 | 星座 | 一言コメント |
|------|------|------------|
（全12位分の表）

---

## ナレーションスクリプト（動画用）

> 各【】で画像1枚を使用。ナレーションが終わるまで画像は切り替えない。

```
【フック】
（1〜2文のみ。例: 「今週の星座運勢——あなたの星座は何位？」）

【12位〜8位】
（星座名を続けて読み上げるだけ。コメントなし。例: 「12位 ○○座、11位 ○○座、10位 ○○座、9位 ○○座、8位 ○○座」）

【7位〜3位】
（各星座1文・15字以内の短いコメント付き。例: 「7位は○○座。〜な週。」）

【2位】
（2〜3文以内）

【1位】
（3〜4文以内のクライマックス）

【CTA】
あなたの星座は何位でしたか？
コメントで教えてください！
```

⚠️ ナレーション制約（厳守）:
- 合計20行以内
- 【12位〜8位】は星座名の列挙のみ（1行）
- 【7位〜3位】は各星座1文ずつ（計5行）
- 動画尺目安: 15〜30秒相当の短さを保つこと

---

## キャプション

### YouTube / TikTok / Instagram 共通

```
（共通キャプション・絵文字OK・3〜5行）
```

**ハッシュタグ**
```
#星座ランキング #今週の運勢 #占い #星座占い #{season_sign} #2026年運勢 #AI占い #hoshiyomi #週間運勢 #星詠み
```

---

### X（旧Twitter）投稿本文

```
【今週の星座運勢ランキング {week_label}】

1位 {ranked[0]}
2位 {ranked[1]}
3位 {ranked[2]}

（煽り文1行）
あなたの星座は何位？リプで教えてください🔮

#今週の運勢
```

**★投稿後にリプライ追加**
```
全12星座のランキング詳細はこちら → https://hoshiyomi.xyz
```"""

    log(f"  ランキング週生成中: {week_label}...")
    response = client.messages.create(
        model="claude-opus-4-6",
        max_tokens=4000,
        messages=[{"role": "user", "content": prompt}],
    )
    content = response.content[0].text

    is_valid, errors = validate_narration_script(content)
    if not is_valid:
        for err in errors:
            log(f"  [警告] ナレーション制約違反: {err}")

    return content


def generate_ranking_week_themed(monday: date, ranking_data: dict, client, theme: str) -> str:
    """テーマ別（love/money）ランキング週コンテンツを生成する"""
    ranked    = ranking_data["ranked"]
    end_date  = monday + timedelta(days=6)
    week_label = f"{monday.month}/{monday.day}〜{end_date.month}/{end_date.day}"

    theme_configs = {
        "love": {
            "title": "恋愛運",
            "post_day": "水",
            "hook_example": "「今週モテ期の星座は？恋愛運ランキング発表！」",
            "comment_hint": "恋愛・出会い・関係性に関するコメント",
            "hashtags": "#恋愛運 #星座ランキング #今週の運勢 #占い #星座占い #恋愛占い #2026年運勢 #AI占い #hoshiyomi #星詠み",
            "x_hook": "今週モテるのはどの星座？",
        },
        "money": {
            "title": "金運・仕事運",
            "post_day": "金",
            "hook_example": "「今週金運が爆上がりの星座は？仕事運ランキング発表！」",
            "comment_hint": "金運・仕事・副業・収入に関するコメント",
            "hashtags": "#金運 #仕事運 #星座ランキング #今週の運勢 #占い #星座占い #2026年運勢 #AI占い #hoshiyomi #星詠み",
            "x_hook": "今週金運が最強の星座は？",
        },
    }
    cfg = theme_configs[theme]

    prompt = f"""あなたは占いSNSアカウント「星詠み（hoshiyomi）」のコンテンツライターです。

以下の条件で{week_label}週の{cfg['title']}ランキング動画用コンテンツ素材を生成してください。

## 条件
- テーマ: 今週の{cfg['title']}ランキング
- 確定ランキング（変更不可）:
{chr(10).join(f"  {i+1}位: {s}" for i, s in enumerate(ranked))}

## 出力形式（厳守・以下のMarkdown形式で全セクションを出力）

# 星座週間{cfg['title']}ランキング コンテンツ素材（{week_label}週）
投稿日: {monday.strftime('%Y-%m-%d')}（{cfg['post_day']}）

---

## 今週の{cfg['title']}ランキング（{week_label}）

（テーマ説明1行）

| 順位 | 星座 | 一言コメント |
|------|------|------------|
（全12位分の表・{cfg['comment_hint']}）

---

## ナレーションスクリプト（動画用）

> 各【】で画像1枚を使用。ナレーションが終わるまで画像は切り替えない。

```
【フック】
（1〜2文のみ。例: {cfg['hook_example']}）

【12位〜8位】
（星座名を続けて読み上げるだけ。コメントなし。例: 「12位 ○○座、11位 ○○座、10位 ○○座、9位 ○○座、8位 ○○座」）

【7位〜3位】
（各星座1文・15字以内の短いコメント付き。例: 「7位は○○座。〜な週。」）

【2位】
（2〜3文以内）

【1位】
（3〜4文以内のクライマックス）

【CTA】
あなたの星座は何位でしたか？
コメントで教えてください！
```

⚠️ ナレーション制約（厳守）:
- 合計20行以内
- 【12位〜8位】は星座名の列挙のみ（1行）
- 【7位〜3位】は各星座1文ずつ（計5行）
- 動画尺目安: 15〜30秒相当の短さを保つこと

---

## キャプション

### YouTube / TikTok / Instagram 共通

```
（共通キャプション・絵文字OK・3〜5行）
```

**ハッシュタグ**
```
{cfg['hashtags']}
```

---

### X（旧Twitter）投稿本文

```
【今週の星座{cfg['title']}ランキング {week_label}】

1位 {ranked[0]}
2位 {ranked[1]}
3位 {ranked[2]}

{cfg['x_hook']}
あなたの星座は何位？リプで教えてください🔮

#今週の運勢
```

**★投稿後にリプライ追加**
```
全12星座のランキング詳細はこちら → https://hoshiyomi.xyz
```"""

    log(f"  {cfg['title']}ランキング週生成中: {week_label}...")
    response = client.messages.create(
        model="claude-opus-4-6",
        max_tokens=4000,
        messages=[{"role": "user", "content": prompt}],
    )
    content = response.content[0].text

    is_valid, errors = validate_narration_script(content)
    if not is_valid:
        for err in errors:
            log(f"  [警告] ナレーション制約違反 ({theme}): {err}")

    return content


# ── メイン処理 ─────────────────────────────────────────────────────────────────

def main() -> None:
    api_key = os.environ.get("ANTHROPIC_API_KEY", "").strip()
    if not api_key:
        env_path = SCRIPT_DIR / ".env.captions"
        if env_path.exists():
            for line in env_path.read_text().splitlines():
                if line.startswith("ANTHROPIC_API_KEY="):
                    api_key = line.split("=", 1)[1].strip()
    if not api_key:
        log("ERROR: ANTHROPIC_API_KEY が設定されていません")
        log(f"  → {SCRIPT_DIR}/.env.captions に ANTHROPIC_API_KEY=sk-ant-... を記載してください")
        sys.exit(1)

    client = anthropic.Anthropic(api_key=api_key)

    # 翌月を計算
    today      = date.today()
    next_month = today + relativedelta(months=1)
    year, month = next_month.year, next_month.month
    days_in_month = calendar.monthrange(year, month)[1]

    mm_start = f"{month:02d}01"
    mm_end   = f"{month:02d}{days_in_month:02d}"

    log(f"=== 月次キャプション生成開始: {year}/{month:02d} ===")

    # 出力先ディレクトリ
    out_dir         = SCHEDULED_DIR / str(year) / f"{month:02d}"
    ranking_dir     = out_dir / "ranking"
    out_dir.mkdir(parents=True, exist_ok=True)
    ranking_dir.mkdir(parents=True, exist_ok=True)

    # ── 1. YouTube/Instagram メタデータ生成 ──────────────────────────────────
    youtube_meta_path = out_dir / f"youtube_meta_{mm_start}_{mm_end}.md"
    youtube_meta_content = generate_youtube_meta(year, month, client)

    header = f"""# YouTube / TikTok / Instagram 投稿メタデータ（{month}/1〜{month}/{days_in_month}）
# タイトル: 共感フック型（口語調・日常の言葉で視聴者の性格・特徴を描写）

"""
    youtube_meta_path.write_text(header + youtube_meta_content, encoding="utf-8")
    log(f"  保存: {youtube_meta_path}")

    # ── 2. X メタデータ生成 ──────────────────────────────────────────────────
    x_meta_path = out_dir / f"x_meta_{mm_start}_{mm_end}.md"
    x_meta_content = generate_x_meta(year, month, youtube_meta_content, client)

    x_header = f"""# X（旧Twitter）投稿メタデータ（{month}/1〜{month}/{days_in_month}）
#
# 【X投稿ルール】
# - 本文にURLを入れない（アルゴリズムがリーチを抑制するため）
# - 投稿後すぐにリプライで「詳しい鑑定はこちら → https://hoshiyomi.xyz」を追加
# - ハッシュタグは1〜2個のみ
# - #今日の運勢 と #星座占い を交互に使用
# - 投稿時間：09:00

"""
    x_meta_path.write_text(x_header + x_meta_content, encoding="utf-8")
    log(f"  保存: {x_meta_path}")

    # ── 3. ランキング週次ファイル生成 ─────────────────────────────────────────
    mondays = get_mondays(year, month)
    log(f"  {month}月の月曜日: {[str(m) for m in mondays]}")

    # 月内のシーズン開幕日を特定（開幕週のインデックス管理）
    season_week_counts: dict[str, int] = {}

    for monday in mondays:
        season_sign = get_season_sign(monday.month, monday.day)
        week_index  = season_week_counts.get(season_sign, 0)
        season_week_counts[season_sign] = week_index + 1

        ranking_data = build_ranking_for_week(monday, season_sign, week_index)

        end_date  = monday + timedelta(days=6)
        filename  = f"week_{monday.month:02d}{monday.day:02d}_{end_date.month:02d}{end_date.day:02d}.md"
        week_path = ranking_dir / filename

        content = generate_ranking_week(monday, ranking_data, client)
        week_path.write_text(content, encoding="utf-8")
        log(f"  保存: {week_path}")

        try:
            generate_slides_for_week(week_path, monday, ranking_dir)
        except Exception as e:
            log(f"  [警告] スライド生成失敗（手動で create-ranking-slides.mjs を実行してください）: {e}")

        # テーマ別ランキング生成（恋愛運・金運）
        for theme in ["love", "money"]:
            themed_ranking_data = build_ranking_for_week_themed(monday, theme)
            themed_filename = f"week_{monday.month:02d}{monday.day:02d}_{end_date.month:02d}{end_date.day:02d}_{theme}.md"
            themed_week_path = ranking_dir / themed_filename
            themed_content = generate_ranking_week_themed(monday, themed_ranking_data, client, theme)
            themed_week_path.write_text(themed_content, encoding="utf-8")
            log(f"  保存: {themed_week_path}")
            try:
                generate_slides_for_week_themed(themed_week_path, monday, ranking_dir, theme)
            except Exception as e:
                log(f"  [警告] テーマ別スライド生成失敗 ({theme}): {e}")

    log(f"=== 生成完了: {year}/{month:02d} ===")
    notify_telegram(
        f"✍ キャプション・ナレーション生成完了\n"
        f"{year}/{month:02d} 分を生成しました"
    )


if __name__ == "__main__":
    main()
