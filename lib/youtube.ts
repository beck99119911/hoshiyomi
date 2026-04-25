const CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID!;
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const YT_API = "https://www.googleapis.com/youtube/v3";

async function getAccessToken(): Promise<string> {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.YOUTUBE_CLIENT_ID!,
      client_secret: process.env.YOUTUBE_CLIENT_SECRET!,
      refresh_token: process.env.YOUTUBE_REFRESH_TOKEN!,
      grant_type: "refresh_token",
    }),
  });
  const data = await res.json();
  return data.access_token;
}

export interface YTVideo {
  videoId: string;
  title: string;
  publishedAt: string;
}

async function searchVideos(query: string, maxResults: number, token: string): Promise<YTVideo[]> {
  const params = new URLSearchParams({
    part: "snippet",
    channelId: CHANNEL_ID,
    q: query,
    type: "video",
    order: "date",
    maxResults: String(maxResults),
    access_token: token,
  });
  const res = await fetch(`${YT_API}/search?${params}`);
  const data = await res.json();
  return (data.items ?? []).map((item: Record<string, unknown>) => {
    const snippet = item.snippet as Record<string, string>;
    const id = item.id as Record<string, string>;
    return {
      videoId: id.videoId,
      title: snippet.title,
      publishedAt: snippet.publishedAt,
    };
  });
}

function todayLabel(): string {
  const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Tokyo" }));
  return `${now.getMonth() + 1}月${now.getDate()}日`;
}

export async function fetchTodayBirthday(): Promise<YTVideo | null> {
  try {
    const token = await getAccessToken();
    const videos = await searchVideos(todayLabel(), 3, token);
    return videos.find((v) => v.title.includes("生まれ")) ?? null;
  } catch {
    return null;
  }
}

export async function fetchLatestRankings(): Promise<YTVideo[]> {
  try {
    const token = await getAccessToken();
    const videos = await searchVideos("全12星座ランキング", 6, token);
    const seen = new Set<string>();
    const result: YTVideo[] = [];
    const types = ["星座運勢", "星座恋愛運", "星座金運"];
    for (const t of types) {
      const match = videos.find((v) => v.title.includes(t) && !seen.has(v.videoId));
      if (match) { seen.add(match.videoId); result.push(match); }
    }
    if (result.length < 3) {
      for (const v of videos) {
        if (!seen.has(v.videoId) && result.length < 3) {
          seen.add(v.videoId);
          result.push(v);
        }
      }
    }
    return result;
  } catch {
    return [];
  }
}
