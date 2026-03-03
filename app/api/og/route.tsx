import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const zodiac  = searchParams.get("zodiac")  || "星詠み";
  const lp      = searchParams.get("lp")      || "?";
  const blood   = searchParams.get("blood")   || "?";
  const overall = Number(searchParams.get("overall") || 3);
  const love    = Number(searchParams.get("love")    || 3);
  const work    = Number(searchParams.get("work")    || 3);
  const money   = Number(searchParams.get("money")   || 3);
  const health  = Number(searchParams.get("health")  || 3);
  const quote   = searchParams.get("quote")   || "";

  const scores = [
    { label: "総合運", score: overall },
    { label: "恋愛運", score: love },
    { label: "仕事運", score: work },
    { label: "金　運", score: money },
    { label: "健康運", score: health },
  ];

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          background: "linear-gradient(135deg, #0a0a0f 0%, #12101a 50%, #0d0a12 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "60px",
          position: "relative",
        }}
      >
        {/* 外枠 */}
        <div
          style={{
            position: "absolute",
            inset: "20px",
            border: "1px solid rgba(212,168,76,0.4)",
            display: "flex",
          }}
        />
        {/* 内枠 */}
        <div
          style={{
            position: "absolute",
            inset: "28px",
            border: "1px solid rgba(212,168,76,0.15)",
            display: "flex",
          }}
        />

        {/* ヘッダー */}
        <div
          style={{
            fontSize: "13px",
            letterSpacing: "0.45em",
            color: "rgba(201,168,76,0.55)",
            marginBottom: "20px",
            display: "flex",
          }}
        >
          ✦ AI FORTUNE READING · 星詠み ✦
        </div>

        {/* 星座 */}
        <div
          style={{
            fontSize: "62px",
            fontWeight: "bold",
            color: "#e8d08a",
            marginBottom: "10px",
            display: "flex",
          }}
        >
          {zodiac}
        </div>

        {/* ライフパス・血液型 */}
        <div
          style={{
            fontSize: "16px",
            color: "rgba(245,238,221,0.5)",
            letterSpacing: "0.25em",
            marginBottom: "44px",
            display: "flex",
          }}
        >
          ライフパス {lp} · {blood}型
        </div>

        {/* スコア */}
        <div
          style={{
            display: "flex",
            gap: "32px",
            marginBottom: "44px",
          }}
        >
          {scores.map(({ label, score }) => (
            <div
              key={label}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <div
                style={{
                  fontSize: "12px",
                  color: "rgba(201,168,76,0.55)",
                  letterSpacing: "0.1em",
                  display: "flex",
                }}
              >
                {label}
              </div>
              <div
                style={{
                  fontSize: "20px",
                  color: "#d4a84c",
                  letterSpacing: "0.05em",
                  display: "flex",
                }}
              >
                {"●".repeat(score)}{"○".repeat(5 - score)}
              </div>
            </div>
          ))}
        </div>

        {/* 名言 */}
        {quote && (
          <div
            style={{
              fontSize: "20px",
              color: "rgba(232,208,138,0.85)",
              fontStyle: "italic",
              textAlign: "center",
              maxWidth: "820px",
              lineHeight: "1.7",
              padding: "18px 40px",
              borderLeft: "2px solid rgba(212,168,76,0.5)",
              borderRight: "2px solid rgba(212,168,76,0.5)",
              display: "flex",
            }}
          >
            &ldquo; {quote} &rdquo;
          </div>
        )}

        {/* フッター */}
        <div
          style={{
            position: "absolute",
            bottom: "38px",
            fontSize: "11px",
            color: "rgba(201,168,76,0.35)",
            letterSpacing: "0.35em",
            display: "flex",
          }}
        >
          HOSHIYOMI · AI占い
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
