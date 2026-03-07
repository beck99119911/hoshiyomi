import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { findCustomerByUserId, getActiveSubscription } from "@/lib/payjp";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ isPremium: false });
  }

  try {
    const customer = await findCustomerByUserId(session.user.id);
    if (!customer) return NextResponse.json({ isPremium: false });

    const subscription = await getActiveSubscription(customer.id);
    return NextResponse.json({ isPremium: !!subscription });
  } catch {
    return NextResponse.json({ isPremium: false });
  }
}
