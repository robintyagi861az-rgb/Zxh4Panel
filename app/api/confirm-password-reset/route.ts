import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/firebaseAdmin";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { email, code, newPassword } = await req.json();
    if (!email || !code || !newPassword) {
      return NextResponse.json({ error: "Missing fields." }, { status: 400 });
    }

    const user = await adminAuth.getUserByEmail(email).catch(() => null);
    if (!user) return NextResponse.json({ error: "Invalid code." }, { status: 400 });

    const resetRef = adminDb.doc(`password_resets/${user.uid}`);
    const snap = await resetRef.get();
    const reset = snap.data();

    if (!reset || reset.used || reset.code !== code || Date.now() > reset.expiresAt) {
      return NextResponse.json({ error: "Invalid or expired code." }, { status: 400 });
    }

    await adminAuth.updateUser(user.uid, { password: newPassword });
    await resetRef.update({ used: true });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Could not reset password." }, { status: 500 });
  }
}
