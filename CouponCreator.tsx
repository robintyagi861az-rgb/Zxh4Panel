"use client";

import { useState } from "react";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/firebase";
import type { AppUser } from "@/types";

export default function CouponCreator({ actor }: { actor: AppUser }) {
  const [code, setCode] = useState("");
  const [creditAmount, setCreditAmount] = useState(10);
  const [expiryDate, setExpiryDate] = useState("");
  const [claimLimit, setClaimLimit] = useState(1);
  const [status, setStatus] = useState("");

  async function createCoupon() {
    if (!code.trim() || !expiryDate) {
      setStatus("Code and expiry date are required.");
      return;
    }
    const normalized = code.trim().toUpperCase();
    await setDoc(doc(db, "coupons", normalized), {
      code: normalized,
      creditAmount,
      expiryDate: new Date(expiryDate).getTime(),
      claimLimit,
      claimedBy: [],
      createdAt: Date.now(),
      createdBy: actor.uid,
    });
    setStatus(`Coupon ${normalized} created.`);
    setCode("");
  }

  return (
    <div className="glass-card p-5">
      <h3 className="neon-text font-semibold text-sm mb-3">Create Coupon</h3>
      <div className="grid grid-cols-2 gap-3">
        <input
          className="input-field col-span-2"
          placeholder="Code (e.g. WELCOME10)"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
        />
        <input
          type="number"
          className="input-field"
          placeholder="Credit amount"
          value={creditAmount}
          onChange={(e) => setCreditAmount(Number(e.target.value))}
        />
        <input
          type="number"
          className="input-field"
          placeholder="Claim limit"
          value={claimLimit}
          onChange={(e) => setClaimLimit(Number(e.target.value))}
        />
        <input
          type="date"
          className="input-field col-span-2"
          value={expiryDate}
          onChange={(e) => setExpiryDate(e.target.value)}
        />
      </div>
      <button onClick={createCoupon} className="glow-btn text-sm mt-3">
        Create Coupon
      </button>
      {status && <p className="text-xs text-white/60 mt-2">{status}</p>}
    </div>
  );
}
