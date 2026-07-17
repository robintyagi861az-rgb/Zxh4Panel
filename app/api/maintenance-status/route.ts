import { NextResponse } from "next/server";
import { adminDb } from "@/firebaseAdmin";

export const runtime = "nodejs";

export async function GET() {
  try {
    const snap = await adminDb.doc("system_settings/config").get();
    const maintenanceMode = snap.exists ? Boolean(snap.data()?.maintenanceMode) : false;
    return NextResponse.json({ maintenanceMode });
  } catch (err) {
    // Fail closed on the data, open on the gate (see middleware comment).
    return NextResponse.json({ maintenanceMode: false }, { status: 200 });
  }
}
