import Link from "next/link";
import { fetchTodayBirthday, fetchLatestRankings, YTVideo } from "@/lib/youtube";
import type { Metadata } from "next";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "星詠み - 占い動画",
  description: "今日の誕生日占い動画と今週の星座ランキング動画。AIが本格鑑定します。",
};

const GOLD = "#c8944a";
const GOLD_BRIGHT = "#e8c078";
const CARD_BG = "rgba(255,255,255,0.04)";
const CARD_BORDER = "rgba(200,148,74,0.25)";

function SectionLabel({ text }: { text: string }) {
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 8,
      background: `linear-gradient(135deg, rgba(200,148,74,0.15), rgba(200,148,74,0.05))`,
      border: `1px solid ${CARD_BORDER}`,
      borderRadius: 20, padding: "4px 14px",
      color: GOLD, fontSize: 11, fontWeight: 700,
      letterSpacing: "0.12em", textTransform: "uppercase",
    }}>
      {text}
    </div>
  );
}

function VideoCard({ video, label, emoji }: { video: YTVideo; label: string; emoji: string }) {
  const title = video.title.split("#")[0].trim();
  return (
    <div style={{
      background: CARD_BG,
      border: `1px solid ${CARD_BORDER}`,
      borderRadius: 16,
      overflow: "hidden",
      boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
    }}>
      {/* ラベル */}
      <div style={{
        padding: "10px 16px",
        borderBottom: `1px solid ${CARD_BORDER}`,
        display: "flex", alignItems: "center", gap: 8,
      }}>
        <span style={{ fontSize: 16 }}>{emoji}</span>
        <span style={{ color: GOLD, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em" }}>
          {label}
        </span>
      </div>

      {/* 縦型動画 9:16 */}
      <div style={{ display: "flex", justifyContent: "center", padding: "16px 16px 12px", background: "rgba(0,0,0,0.2)" }}>
        <div style={{ width: "100%", maxWidth: 280, position: "relative", paddingTop: "calc(280px * 1.7778)" }}>
          <iframe
            src={`https://www.youtube.com/embed/${video.videoId}`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{
              position: "absolute", top: 0, left: 0,
              width: "100%", height: "100%", border: "none",
              borderRadius: 8,
            }}
          />
        </div>
      </div>

      {/* タイトル */}
      <div style={{ padding: "12px 16px 16px" }}>
        <p style={{ margin: 0, color: "#d4c4a0", fontSize: 13, lineHeight: 1.5 }}>
          {title}
        </p>
      </div>
    </div>
  );
}

function EmptyCard({ label, emoji }: { label: string; emoji: string }) {
  return (
    <div style={{
      background: CARD_BG,
      border: `1px solid ${CARD_BORDER}`,
      borderRadius: 16, padding: "48px 16px",
      textAlign: "center",
    }}>
      <div style={{ fontSize: 32, marginBottom: 12 }}>{emoji}</div>
      <div style={{ color: GOLD, fontSize: 11, fontWeight: 700, marginBottom: 8, letterSpacing: "0.1em" }}>{label}</div>
      <div style={{ color: "#6b5e4e", fontSize: 14 }}>動画を準備中です</div>
    </div>
  );
}

export default async function VideosPage() {
  const [birthday, rankings] = await Promise.all([
    fetchTodayBirthday(),
    fetchLatestRankings(),
  ]);

  const rankingLabels = [
    { label: "今週の総合運ランキング", emoji: "🌟" },
    { label: "今週の恋愛運ランキング", emoji: "💕" },
    { label: "今週の金運ランキング",   emoji: "💰" },
  ];

  return (
    <main style={{ minHeight: "100vh", color: "#f3e9d2", position: "relative", zIndex: 1 }}>
      <div style={{ maxWidth: 560, margin: "0 auto", padding: "32px 16px 80px" }}>

        {/* ヘッダー */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>🌙</div>
          <h1 style={{
            margin: "0 0 8px", fontSize: 24, fontWeight: 700,
            color: GOLD_BRIGHT, letterSpacing: "0.12em",
            textShadow: "0 0 20px rgba(200,148,74,0.4)",
          }}>
            星詠み 占い動画
          </h1>
          <p style={{ margin: 0, color: "#a89878", fontSize: 14, lineHeight: 1.6 }}>
            今日の誕生日占い・今週の星座ランキング
          </p>
        </div>

        {/* メインCTA */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <Link href="/fortune" style={{
            display: "inline-block",
            padding: "15px 36px",
            background: `linear-gradient(135deg, ${GOLD}, #a06820)`,
            color: "#fff", fontWeight: 700, fontSize: 15,
            borderRadius: 40, textDecoration: "none",
            boxShadow: `0 4px 24px rgba(200,148,74,0.5)`,
            letterSpacing: "0.06em",
          }}>
            ✨ 今すぐ無料で占う
          </Link>
        </div>

        {/* 区切り */}
        <div style={{
          display: "flex", alignItems: "center", gap: 12, marginBottom: 28,
        }}>
          <div style={{ flex: 1, height: 1, background: CARD_BORDER }} />
          <SectionLabel text="Today's Birthday" />
          <div style={{ flex: 1, height: 1, background: CARD_BORDER }} />
        </div>

        {/* 誕生日動画 */}
        <div style={{ marginBottom: 40 }}>
          {birthday
            ? <VideoCard video={birthday} label="今日の誕生日占い" emoji="🎂" />
            : <EmptyCard label="TODAY'S BIRTHDAY" emoji="🎂" />}
        </div>

        {/* 区切り */}
        <div style={{
          display: "flex", alignItems: "center", gap: 12, marginBottom: 28,
        }}>
          <div style={{ flex: 1, height: 1, background: CARD_BORDER }} />
          <SectionLabel text="Weekly Ranking" />
          <div style={{ flex: 1, height: 1, background: CARD_BORDER }} />
        </div>

        {/* ランキング動画 */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24, marginBottom: 48 }}>
          {rankings.length > 0
            ? rankings.map((v, i) => (
                <VideoCard
                  key={v.videoId}
                  video={v}
                  label={rankingLabels[i]?.label ?? "今週のランキング"}
                  emoji={rankingLabels[i]?.emoji ?? "⭐"}
                />
              ))
            : <EmptyCard label="WEEKLY RANKING" emoji="🏆" />}
        </div>

        {/* 下部CTA */}
        <div style={{
          textAlign: "center",
          padding: "32px 20px",
          background: "linear-gradient(135deg, rgba(200,148,74,0.08), rgba(200,148,74,0.03))",
          border: `1px solid ${CARD_BORDER}`,
          borderRadius: 20,
        }}>
          <div style={{ fontSize: 28, marginBottom: 10 }}>✨</div>
          <p style={{ margin: "0 0 4px", color: GOLD_BRIGHT, fontWeight: 700, fontSize: 17 }}>
            あなたの運勢を鑑定します
          </p>
          <p style={{ margin: "0 0 20px", color: "#a89878", fontSize: 13, lineHeight: 1.6 }}>
            生年月日・血液型・今の悩みを入力するだけ。<br />無料で3回まで体験できます。
          </p>
          <Link href="/fortune" style={{
            display: "inline-block",
            padding: "14px 36px",
            background: `linear-gradient(135deg, ${GOLD}, #a06820)`,
            color: "#fff", fontWeight: 700, fontSize: 15,
            borderRadius: 40, textDecoration: "none",
            boxShadow: `0 4px 20px rgba(200,148,74,0.4)`,
          }}>
            無料で占ってみる →
          </Link>
        </div>

      </div>
    </main>
  );
}
