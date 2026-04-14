const KOMOJU_SECRET_KEY = process.env.KOMOJU_SECRET_KEY!;
const KOMOJU_BASE_URL = "https://komoju.com/api/v1";

function authHeader() {
  return "Basic " + Buffer.from(KOMOJU_SECRET_KEY + ":").toString("base64");
}

async function komojuPost(path: string, body: Record<string, unknown>) {
  const res = await fetch(`${KOMOJU_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      Authorization: authHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  return res.json();
}

export async function createCheckoutSession({
  userId,
  email,
  returnUrl,
  cancelUrl,
}: {
  userId: string;
  email?: string;
  returnUrl: string;
  cancelUrl: string;
}) {
  return komojuPost("/sessions", {
    default_locale: "ja",
    currency: "JPY",
    amount: 980,
    email,
    metadata: { userId },
    subscription: {
      period: "month",
      period_count: 1,
    },
    return_url: returnUrl,
    cancel_url: cancelUrl,
    payment_types: ["credit_card"],
  });
}
