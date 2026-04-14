import { NextRequest, NextResponse } from "next/server";
import * as crypto from "crypto";
import { prisma } from "@/lib/prisma";

function verifySignature(body: string, signature: string): boolean {
  const secret = process.env.KOMOJU_WEBHOOK_SECRET!;
  const hash = crypto.createHmac("sha256", secret).update(body).digest("hex");
  return hash === signature;
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("x-komoju-signature") ?? "";

  if (!verifySignature(body, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(body);

  // 決済完了: isPremiumをtrueに
  const capturedEvents = ["payment.captured", "subscription.created", "subscription.captured"];
  if (capturedEvents.includes(event.type)) {
    const userId = event.data?.metadata?.userId;
    const customerId = event.data?.customer_id ?? null;
    if (userId) {
      await prisma.user.update({
        where: { id: userId },
        data: { isPremium: true, komojuCustomerId: customerId },
      });
    }
  }

  // サブスクリプション停止・削除: isPremiumをfalseに
  const cancelledEvents = ["subscription.suspended", "subscription.deleted"];
  if (cancelledEvents.includes(event.type)) {
    const userId = event.data?.metadata?.userId;
    if (userId) {
      await prisma.user.update({
        where: { id: userId },
        data: { isPremium: false },
      });
    }
  }

  return NextResponse.json({ received: true });
}
