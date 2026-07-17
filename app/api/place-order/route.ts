import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/firebaseAdmin";
import { placeSmmVaultOrder, MaintenanceInterceptError } from "@/smmvault";
import { FieldValue } from "firebase-admin/firestore";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization") || "";
    const idToken = authHeader.replace("Bearer ", "");
    const decoded = await adminAuth.verifyIdToken(idToken);
    const uid = decoded.uid;

    const { serviceId, targetLink, quantity } = await req.json();
    if (!serviceId || !targetLink || !quantity || quantity <= 0) {
      return NextResponse.json({ error: "Missing or invalid order fields." }, { status: 400 });
    }

    const serviceSnap = await adminDb.doc(`services/${serviceId}`).get();
    if (!serviceSnap.exists) {
      return NextResponse.json({ error: "Service not found." }, { status: 404 });
    }
    const service = serviceSnap.data()!;
    const charge = (service.ratePer1000 * quantity) / 1000;

    const userRef = adminDb.doc(`users/${uid}`);

    // Reserve funds atomically so two simultaneous orders can't both pass
    // a stale balance check.
    await adminDb.runTransaction(async (tx) => {
      const userSnap = await tx.get(userRef);
      const balance = userSnap.data()?.walletBalance ?? 0;
      if (balance < charge) {
        throw new Error("INSUFFICIENT_WALLET_BALANCE");
      }
      tx.update(userRef, { walletBalance: FieldValue.increment(-charge) });
    });

    let smmVaultOrderId: string | undefined;
    try {
      const result = await placeSmmVaultOrder({
        smmVaultServiceId: service.smmVaultServiceId,
        link: targetLink,
        quantity,
      });
      smmVaultOrderId = String(result.order);
    } catch (err) {
      // Refund the reserved wallet funds if the upstream order failed for
      // any reason, including the intercepted "maintenance" case.
      await userRef.update({ walletBalance: FieldValue.increment(charge) });
      if (err instanceof MaintenanceInterceptError) {
        return NextResponse.json({ maintenance: true, error: err.message }, { status: 503 });
      }
      throw err;
    }

    const orderRef = await adminDb.collection("orders").add({
      userId: uid,
      serviceId,
      serviceName: service.name,
      targetLink,
      quantity,
      charge,
      status: "pending",
      smmVaultOrderId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return NextResponse.json({ orderId: orderRef.id });
  } catch (err: any) {
    if (err.message === "INSUFFICIENT_WALLET_BALANCE") {
      return NextResponse.json({ error: "Insufficient wallet balance." }, { status: 402 });
    }
    return NextResponse.json({ error: "Order failed. Please try again." }, { status: 500 });
  }
}
