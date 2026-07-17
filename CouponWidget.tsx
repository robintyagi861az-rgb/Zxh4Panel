"use client";

import { useState } from "react";
import { auth } from "@/firebase";

export default function CouponWidget() {
  const [code, setCode] = useState("");
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function redeem() {
    if (!code.trim()) return;
    setSubmitting(true);
    setMessage(null);
    try {
      const idToken = await auth.currentUser?.getIdToken();
      const res = await fetch("/api/redeem-coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ text: data.error, ok: false });
      } else {
        setMessage({ text: `$${data.creditAmount.toFixed(2)} added to your wallet!`, ok: true });
        setCode("");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="glass-card p-5">
      <h3 className="neon-text font-semibold mb-3 text-sm">Redeem Coupon</h3>
      <div className="flex gap-2">
        <input
          className="input-field"
          placeholder="Enter coupon code"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
        />
        <button onClick={redeem} disabled={submitting} className="glow-btn whitespace-nowrap">
          {submitting ? "..." : "Redeem"}
        </button>
      </div>
      {message && (
        <p className={`text-xs mt-2 ${message.ok ? "text-emerald-400" : "text-red-400"}`}>{message.text}</p>
      )}
    </div>
  );
}
