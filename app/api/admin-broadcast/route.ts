import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/firebaseAdmin";
import { sendBroadcastEmail } from "@/email";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const idToken = (req.headers.get("authorization") || "").replace("Bearer ", "");
    const decoded = await adminAuth.verifyIdToken(idToken);

    const actorSnap = await adminDb.doc(`users/${decoded.uid}`).get();
    const actor = actorSnap.data();
    const isAdmin = actor?.role === "admin";
    const canBroadcast = isAdmin || (actor?.role === "subadmin" && actor?.permissions?.sendPromoEmails);

    if (!canBroadcast) {
      return NextResponse.json({ error: "Not authorized to send broadcasts." }, { status: 403 });
    }

    const { subject, bodyHtml } = await req.json();
    if (!subject || !bodyHtml) {
      return NextResponse.json({ error: "Subject and body are required." }, { status: 400 });
    }

    const usersSnap = await adminDb.collection("users").where("disabled", "!=", true).get();
    const recipients = usersSnap.docs.map((d) => d.data().email).filter(Boolean);

    await sendBroadcastEmail(recipients, subject, bodyHtml);

    return NextResponse.json({ ok: true, sentTo: recipients.length });
  } catch {
    return NextResponse.json({ error: "Broadcast failed." }, { status: 500 });
  }
}
