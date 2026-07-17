import { NextRequest, NextResponse } from "next/server";

// Middleware runs on the Edge runtime, so it can't use firebase-admin
// directly. Instead it calls a small Node-runtime API route that reads
// system_settings/config from Firestore, then redirects here.
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Never gate these paths, or we'd create a redirect loop / break admin access.
  const alwaysAllowed =
    pathname.startsWith("/maintenance") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/admin") || // admins/sub-admins must bypass maintenance entirely
    pathname === "/favicon.ico";

  if (alwaysAllowed) return NextResponse.next();

  try {
    const statusRes = await fetch(new URL("/api/maintenance-status", req.url), {
      cache: "no-store",
    });
    const { maintenanceMode } = await statusRes.json();

    // Admins/sub-admins bypass via a signed session cookie set at login.
    const role = req.cookies.get("zxh4_role")?.value;
    const isAdminOrSubAdmin = role === "admin" || role === "subadmin";

    if (maintenanceMode && !isAdminOrSubAdmin) {
      return NextResponse.redirect(new URL("/maintenance", req.url));
    }
  } catch {
    // If the settings fetch itself fails, fail open rather than locking
    // everyone out because of a transient Firestore/network hiccup.
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
