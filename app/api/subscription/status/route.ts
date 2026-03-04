import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { stripe } from "@/lib/stripe";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ isPremium: false });
  }

  try {
    const customers = await stripe.customers.search({
      query: `metadata['userId']:'${session.user.id}'`,
      limit: 1,
    });

    if (customers.data.length === 0) {
      return NextResponse.json({ isPremium: false });
    }

    const subscriptions = await stripe.subscriptions.list({
      customer: customers.data[0].id,
      status: "active",
      limit: 1,
    });

    return NextResponse.json({ isPremium: subscriptions.data.length > 0 });
  } catch {
    return NextResponse.json({ isPremium: false });
  }
}
