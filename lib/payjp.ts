const PAYJP_SECRET_KEY = process.env.PAYJP_SECRET_KEY!;
const PAYJP_BASE_URL = "https://api.pay.jp/v1";
const PLAN_ID = "hoshiyomi_premium";

function authHeader() {
  return "Basic " + Buffer.from(PAYJP_SECRET_KEY + ":").toString("base64");
}

export async function payjpPost(path: string, params: Record<string, string>) {
  const res = await fetch(`${PAYJP_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      Authorization: authHeader(),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(params).toString(),
  });
  return res.json();
}

export async function payjpGet(path: string) {
  const res = await fetch(`${PAYJP_BASE_URL}${path}`, {
    headers: { Authorization: authHeader() },
  });
  return res.json();
}

export async function payjpDelete(path: string) {
  const res = await fetch(`${PAYJP_BASE_URL}${path}`, {
    method: "DELETE",
    headers: { Authorization: authHeader() },
  });
  return res.json();
}

// プランが存在しなければ作成し、プランIDを返す
export async function ensurePlan(): Promise<string> {
  const existing = await payjpGet(`/plans/${PLAN_ID}`);
  if (!existing.error) return PLAN_ID;

  await payjpPost("/plans", {
    id: PLAN_ID,
    amount: "980",
    currency: "jpy",
    interval: "month",
    name: "星詠みプレミアム",
  });
  return PLAN_ID;
}

// userIdに対応するPAY.JP顧客を検索
export async function findCustomerByUserId(userId: string) {
  let offset = 0;
  const limit = 100;

  while (true) {
    const data = await payjpGet(`/customers?limit=${limit}&offset=${offset}`);
    if (!data.data || data.data.length === 0) break;

    const customer = data.data.find(
      (c: { metadata?: Record<string, string> }) => c.metadata?.userId === userId
    );
    if (customer) return customer;

    if (!data.has_more) break;
    offset += limit;
  }

  return null;
}

// 顧客のアクティブなサブスクリプションを取得
export async function getActiveSubscription(customerId: string) {
  const data = await payjpGet(`/subscriptions?customer=${customerId}&status=active&limit=1`);
  return data.data?.[0] ?? null;
}
