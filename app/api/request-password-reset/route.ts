import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/firebaseAdmin";
import { sendPasswordResetEmail } from "@/email";

export const runtime = "nodejs";

function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "Email is required." }, { status: 400 });

    // Don't reveal whether an account exists -- always respond the same way.
    const user = await adminAuth.getUserByEmail(email).catch(() => null);
    if (user) {
      const code = generateCode();
      await adminDb.doc(`password_resets/${user.uid}`).set({
        code,
        expiresAt: Date.now() + 15 * 60 * 1000,
        used: false,
      });
      await sendPasswordResetEmail(email, code);
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true }); // still don't leak existence on error
  }
}
