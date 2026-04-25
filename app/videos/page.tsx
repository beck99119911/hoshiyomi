import Link from "next/link";
import { fetchTodayBirthday, fetchLatestRankings, YTVideo } from "@/lib/youtube";
import type { Metadata } from "next";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "星詠み - 動画で占いを見る",
  description: "今日の誕生日占い動画と今週の星座ランキング動画。AIが本格鑑定します。",
};

const GOLD = "#c8944a";
const GOLD_BRIGHT = "#e8c078";
const BG = "#0a0815";
const CARD_BG = "rgba(255,255,255,0.04)";
const CARD_BORDER = "rgba(200,148,74,0.2)";

function VideoCard({ video, label }: { video: YTVideo; label: string }) {
  return (
    <div style={{
      background: CARD_BG,
      border: `1px solid ${CARD_BORDER}`,
      borderRadius: 12,
      overflow: "hidden",
    }}>
      <div style={{ padding: "8px 12px", borderBottom: `1px solid ${CARD_BORDER}` }}>
        <span style={{ color: GOLD, fontSize: 11, fontWeight: 600, letterSpacing: "0.08em" }}>
          {label}
        </span>
      </div>
      <div style={{ position: "relative", paddingTop: "56.25%" }}>
        <iframe
          src={`https://www.youtube.com/embed/${video.videoId}`}
          title={video.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{
            position: "absolute", top: 0, left: 0,
            width: "100%", height: "100%", border: "none",
          }}
        />
      </div>
      <p style={{
        margin: 0, padding: "10px 12px",
        color: "#d4c4a0", fontSize: 13, lineHeight: 1.4,
      }}>
        {video.title.split("#")[0].trim()}
      </p>
    </div>
  );
}

function EmptyCard({ label }: { label: string }) {
  return (
    <div style={{
      background: CARD_BG,
      border: `1px solid ${CARD_BORDER}`,
      borderRadius: 12, padding: "32px 16px",
      textAlign: "center", color: "#6b5e4e", fontSize: 14,
    }}>
      <div style={{ marginBottom: 8, color: GOLD, fontSize: 11, fontWeight: 600 }}>{label}</div>
      動画を準備中です
    </div>
  );
}

export default async function VideosPage() {
  const [birthday, rankings] = await Promise.all([
    fetchTodayBirthday(),
    fetchLatestRankings(),
  ]);

  return (
    <main style={{
      minHeight: "100vh",
      background: BG,
      color: "#f3e9d2",
      fontFamily: "sans-serif",
    }}>
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "40px 16px 80px" }}>

        {/* ヘッダー */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontSize: 28, marginBottom: 6 }}>🌙</div>
          <h1 style={{
            margin: 0, fontSize: 22, fontWeight: 700,
            color: GOLD_BRIGHT, letterSpacing: "0.1em",
          }}>
            星詠み 占い動画
          </h1>
          <p style={{ margin: "8px 0 0", color: "#a89878", fontSize: 14 }}>
            今日の誕生日占い＆今週の星座ランキング
          </p>
        </div>

        {/* CTA */}
        <div style={{
          display: "flex", gap: 12, marginBottom: 40,
          flexWrap: "wrap", justifyContent: "center",
        }}>
          <Link href="/fortune" style={{
            display: "inline-block",
            padding: "14px 28px",
            background: `linear-gradient(135deg, ${GOLD}, #a06820)`,
            color: "#fff", fontWeight: 700, fontSize: 15,
            borderRadius: 40, textDecoration: "none",
            boxShadow: `0 4px 20px rgba(200,148,74,0.4)`,
            letterSpacing: "0.05em",
          }}>
            ✨ 今すぐ無料で占う
          </Link>
          <Link href="/" style={{
            display: "inline-block",
            padding: "14px 28px",
            background: "rgba(255,255,255,0.06)",
            border: `1px solid ${CARD_BORDER}`,
            color: "#d4c4a0", fontWeight: 600, fontSize: 14,
            borderRadius: 40, textDecoration: "none",
          }}>
            サービス詳細はこちら
          </Link>
        </div>

        {/* 今日の誕生日動画 */}
        <section style={{ marginBottom: 40 }}>
          <h2 style={{
            margin: "0 0 16px",
            fontSize: 15, fontWeight: 700,
            color: GOLD, letterSpacing: "0.08em",
            borderLeft: `3px solid ${GOLD}`, paddingLeft: 10,
          }}>
            今日の誕生日占い
          </h2>
          {birthday
            ? <VideoCard video={birthday} label="TODAY'S BIRTHDAY" />
            : <EmptyCard label="TODAY'S BIRTHDAY" />}
        </section>

        {/* 今週のランキング */}
        <section style={{ marginBottom: 48 }}>
          <h2 style={{
            margin: "0 0 16px",
            fontSize: 15, fontWeight: 700,
            color: GOLD, letterSpacing: "0.08em",
            borderLeft: `3px solid ${GOLD}`, paddingLeft: 10,
          }}>
            今週の星座ランキング
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {rankings.length > 0
              ? rankings.map((v, i) => {
                  const labels = ["WEEKLY RANKING 総合運", "WEEKLY RANKING 恋愛運", "WEEKLY RANKING 金運"];
                  return <VideoCard key={v.videoId} video={v} label={labels[i] ?? "WEEKLY RANKING"} />;
                })
              : <EmptyCard label="WEEKLY RANKING" />}
          </div>
        </section>

        {/* 下部CTA */}
        <div style={{
          textAlign: "center",
          padding: "32px 20px",
          background: "rgba(200,148,74,0.06)",
          border: `1px solid ${CARD_BORDER}`,
          borderRadius: 16,
        }}>
          <p style={{ margin: "0 0 6px", color: GOLD_BRIGHT, fontWeight: 700, fontSize: 16 }}>
            AIが本格鑑定します
          </p>
          <p style={{ margin: "0 0 20px", color: "#a89878", fontSize: 13 }}>
            生年月日・血液型・今の悩みを入れるだけ。無料で3回まで。
          </p>
          <Link href="/fortune" style={{
            display: "inline-block",
            padding: "14px 36px",
            background: `linear-gradient(135deg, ${GOLD}, #a06820)`,
            color: "#fff", fontWeight: 700, fontSize: 15,
            borderRadius: 40, textDecoration: "none",
            boxShadow: `0 4px 20px rgba(200,148,74,0.4)`,
          }}>
            ✨ 無料で占ってみる
          </Link>
        </div>

      </div>
    </main>
  );
}
