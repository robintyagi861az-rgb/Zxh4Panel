import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";
import { sendWalletCreditEmail, sendWalletDebitEmail } from "@/email";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const idToken = (req.headers.get("authorization") || "").replace("Bearer ", "");
    const decoded = await adminAuth.verifyIdToken(idToken);

    const actorSnap = await adminDb.doc(`users/${decoded.uid}`).get();
    const actor = actorSnap.data();
    const isAdmin = actor?.role === "admin";
    const canEditWallets = isAdmin || (actor?.role === "subadmin" && actor?.permissions?.editWalletsAndCoupons);

    if (!canEditWallets) {
      return NextResponse.json({ error: "Not authorized to edit wallets." }, { status: 403 });
    }

    const { targetUserId, amount, type, reason } = await req.json();
    if (!targetUserId || !amount || !["credit", "debit"].includes(type)) {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    const targetRef = adminDb.doc(`users/${targetUserId}`);
    const delta = type === "credit" ? amount : -amount;

    await targetRef.update({ walletBalance: FieldValue.increment(delta) });
    await adminDb.collection("wallet_transactions").add({
      userId: targetUserId,
      type,
      amount,
      reason: reason || "",
      actorId: decoded.uid,
      createdAt: Date.now(),
    });

    const targetSnap = await targetRef.get();
    const email = targetSnap.data()?.email;
    if (email) {
      (type === "credit" ? sendWalletCreditEmail(email, amount) : sendWalletDebitEmail(email, amount)).catch(
        () => {}
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Could not adjust wallet." }, { status: 500 });
  }
}
