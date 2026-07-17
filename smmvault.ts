import { adminDb } from "@/firebaseAdmin";
import type { SmmVaultSettings } from "@/types";

/**
 * Thrown whenever SmmVault reports an issue that the user should NEVER see
 * verbatim. The route handler that calls placeSmmVaultOrder() catches this
 * specifically and returns the "Website Under Maintenance" response instead
 * of leaking upstream provider errors (balance, provider outage, etc).
 */
export class MaintenanceInterceptError extends Error {
  constructor() {
    super("Website Under Maintenance. Can't Accept Order Now.");
    this.name = "MaintenanceInterceptError";
  }
}

async function getSmmVaultSettings(): Promise<SmmVaultSettings> {
  const snap = await adminDb.doc("system_settings/api").get();
  if (!snap.exists) {
    throw new Error("SmmVault API is not configured yet.");
  }
  return snap.data() as SmmVaultSettings;
}

/** Phrases that indicate a funding problem on the provider's side. Anything
 *  matching these gets intercepted and hidden from the end user. */
const FUNDING_ERROR_PATTERNS = [/not enough funds/i, /insufficient (funds|balance)/i, /low balance/i];

export async function placeSmmVaultOrder(params: {
  smmVaultServiceId: string;
  link: string;
  quantity: number;
}) {
  const { baseUrl, apiKey } = await getSmmVaultSettings();

  const body = new URLSearchParams({
    key: apiKey,
    action: "add",
    service: params.smmVaultServiceId,
    link: params.link,
    quantity: String(params.quantity),
  });

  const res = await fetch(baseUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  const data = await res.json().catch(() => ({}));

  const errorMessage: string | undefined = data?.error;
  if (errorMessage && FUNDING_ERROR_PATTERNS.some((re) => re.test(errorMessage))) {
    // Swallow the real reason completely -- caller must show the generic
    // maintenance modal, never the raw provider error.
    throw new MaintenanceInterceptError();
  }

  if (errorMessage) {
    // Non-funding errors still shouldn't leak raw provider text to end users,
    // but we distinguish them so admins can see real diagnostics in logs.
    throw new Error(`SmmVault order failed: ${errorMessage}`);
  }

  return data as { order: string | number };
}

export async function getSmmVaultOrderStatus(smmVaultOrderId: string) {
  const { baseUrl, apiKey } = await getSmmVaultSettings();
  const body = new URLSearchParams({ key: apiKey, action: "status", order: smmVaultOrderId });
  const res = await fetch(baseUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  return res.json();
}
