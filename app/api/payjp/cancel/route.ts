import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { findCustomerByUserId, getActiveSubscription, payjpDelete } from "@/lib/payjp";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }

  const customer = await findCustomerByUserId(session.user.id);
  if (!customer) {
    return NextResponse.json({ error: "サブスクリプションが見つかりません" }, { status: 404 });
  }

  const subscription = await getActiveSubscription(customer.id);
  if (!subscription) {
    return NextResponse.json({ error: "アクティブなサブスクリプションがありません" }, { status: 404 });
  }

  await payjpDelete(`/subscriptions/${subscription.id}`);

  return NextResponse.json({ success: true });
}
