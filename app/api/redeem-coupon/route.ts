import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";
import { sendWalletCreditEmail } from "@/email";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const idToken = (req.headers.get("authorization") || "").replace("Bearer ", "");
    const decoded = await adminAuth.verifyIdToken(idToken);
    const uid = decoded.uid;

    const { code } = await req.json();
    if (!code) return NextResponse.json({ error: "Coupon code is required." }, { status: 400 });

    const couponRef = adminDb.doc(`coupons/${code.trim().toUpperCase()}`);
    const userRef = adminDb.doc(`users/${uid}`);

    const creditAmount: number = await adminDb.runTransaction(async (tx) => {
      const couponSnap = await tx.get(couponRef);
      if (!couponSnap.exists) throw new Error("INVALID_COUPON");

      const coupon = couponSnap.data()!;
      const claimedBy: string[] = coupon.claimedBy || [];

      if (Date.now() > coupon.expiryDate) throw new Error("EXPIRED_COUPON");
      if (claimedBy.length >= coupon.claimLimit) throw new Error("CLAIM_LIMIT_REACHED");
      if (claimedBy.includes(uid)) throw new Error("ALREADY_CLAIMED");

      tx.update(couponRef, { claimedBy: FieldValue.arrayUnion(uid) });
      tx.update(userRef, { walletBalance: FieldValue.increment(coupon.creditAmount) });

      return coupon.creditAmount;
    });

    const userSnap = await userRef.get();
    const email = userSnap.data()?.email;
    if (email) sendWalletCreditEmail(email, creditAmount).catch(() => {});

    return NextResponse.json({ creditAmount });
  } catch (err: any) {
    const messages: Record<string, string> = {
      INVALID_COUPON: "That coupon code doesn't exist.",
      EXPIRED_COUPON: "This coupon has expired.",
      CLAIM_LIMIT_REACHED: "This coupon has reached its claim limit.",
      ALREADY_CLAIMED: "You've already redeemed this coupon.",
    };
    return NextResponse.json(
      { error: messages[err.message] || "Could not redeem coupon." },
      { status: 400 }
    );
  }
}
