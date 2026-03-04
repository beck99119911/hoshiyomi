import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { stripe } from "@/lib/stripe";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
    ...(session.user.email ? { customer_email: session.user.email } : {}),
    metadata: { userId: session.user.id },
    subscription_data: { metadata: { userId: session.user.id } },
    success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/fortune?upgraded=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/fortune`,
  });

  return NextResponse.json({ url: checkoutSession.url });
}
