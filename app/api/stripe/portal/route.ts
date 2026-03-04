import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { stripe } from "@/lib/stripe";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }

  const customers = await stripe.customers.search({
    query: `metadata['userId']:'${session.user.id}'`,
    limit: 1,
  });

  if (customers.data.length === 0) {
    return NextResponse.json({ error: "サブスクリプションが見つかりません" }, { status: 404 });
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: customers.data[0].id,
    return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/fortune`,
  });

  return NextResponse.json({ url: portalSession.url });
}
