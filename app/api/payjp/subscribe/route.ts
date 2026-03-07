import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { ensurePlan, findCustomerByUserId, getActiveSubscription, payjpPost } from "@/lib/payjp";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }

  const { token } = await req.json();
  if (!token) {
    return NextResponse.json({ error: "カード情報が不正です" }, { status: 400 });
  }

  const userId = session.user.id;

  // すでにサブスク済みか確認
  const existing = await findCustomerByUserId(userId);
  if (existing) {
    const sub = await getActiveSubscription(existing.id);
    if (sub) {
      return NextResponse.json({ error: "すでにプレミアム会員です" }, { status: 400 });
    }
  }

  // プランを確認/作成
  const planId = await ensurePlan();

  // 顧客を作成
  const customerParams: Record<string, string> = {
    card: token,
    "metadata[userId]": userId,
  };
  if (session.user.email) customerParams.email = session.user.email;

  const customer = existing ?? (await payjpPost("/customers", customerParams));
  if (customer.error) {
    return NextResponse.json({ error: "顧客の作成に失敗しました" }, { status: 500 });
  }

  // サブスクリプションを作成
  const subscription = await payjpPost("/subscriptions", {
    customer: customer.id,
    plan: planId,
  });

  if (subscription.error) {
    return NextResponse.json({ error: "サブスクリプションの作成に失敗しました" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
