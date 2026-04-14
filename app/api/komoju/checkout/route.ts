import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createCheckoutSession } from "@/lib/komoju";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL!;
  const data = await createCheckoutSession({
    userId: session.user.id,
    email: session.user.email ?? undefined,
    returnUrl: `${baseUrl}/fortune?upgraded=true`,
    cancelUrl: `${baseUrl}/fortune`,
  });

  const url = data.session_url ?? data.url;
  if (!url) {
    console.error("KOMOJU checkout error:", JSON.stringify(data));
    return NextResponse.json({ error: "決済セッションの作成に失敗しました", detail: data }, { status: 500 });
  }

  return NextResponse.json({ url });
}
