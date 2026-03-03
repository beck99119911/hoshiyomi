import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "星詠み - AIによる本格占い鑑定";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: "linear-gradient(135deg, #0d0e20 0%, #1a1830 50%, #0d0e20 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        {/* 星 */}
        {[
          [120, 80], [980, 60], [200, 520], [1050, 480], [600, 40],
          [350, 200], [820, 150], [100, 350], [1100, 280], [450, 560],
          [750, 520], [300, 420], [900, 400], [650, 180], [150, 220],
        ].map(([x, y], i) => (
          <div key={i} style={{
            position: "absolute", left: x, top: y,
            width: i % 3 === 0 ? 3 : 2, height: i % 3 === 0 ? 3 : 2,
            borderRadius: "50%",
            background: i % 4 === 0 ? "rgba(212,168,76,0.9)" : "rgba(255,255,255,0.7)",
          }} />
        ))}

        {/* 月 */}
        <div style={{
          fontSize: 80, marginBottom: 24,
          filter: "drop-shadow(0 0 20px rgba(212,168,76,0.6))",
        }}>
          ☽
        </div>

        {/* タイトル */}
        <div style={{
          fontSize: 80, fontWeight: 700,
          background: "linear-gradient(135deg, #b8902e, #f0d898, #d4a84c)",
          backgroundClip: "text",
          color: "transparent",
          marginBottom: 16,
        }}>
          星詠み
        </div>

        {/* サブタイトル */}
        <div style={{
          fontSize: 24, color: "rgba(212,168,76,0.7)",
          letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: 32,
        }}>
          HOSHIYOMI
        </div>

        {/* 説明 */}
        <div style={{
          fontSize: 22, color: "rgba(240,232,216,0.75)",
          textAlign: "center", lineHeight: 1.8, maxWidth: 700,
        }}>
          西洋占星術・数秘術・血液型を組み合わせた
          AIによる本格占い鑑定
        </div>

        {/* URL */}
        <div style={{
          position: "absolute", bottom: 40,
          fontSize: 18, color: "rgba(212,168,76,0.5)",
          letterSpacing: "0.2em",
        }}>
          hoshiyomi.xyz
        </div>
      </div>
    ),
    { ...size }
  );
}
