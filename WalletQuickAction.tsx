"use client";

import { useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db, auth } from "@/firebase";
import type { AppUser } from "@/types";

export default function WalletQuickAction() {
  const [email, setEmail] = useState("");
  const [foundUser, setFoundUser] = useState<AppUser | null>(null);
  const [amount, setAmount] = useState(10);
  const [reason, setReason] = useState("");
  const [status, setStatus] = useState("");

  async function lookup() {
    setStatus("");
    setFoundUser(null);
    const q = query(collection(db, "users"), where("email", "==", email.trim()));
    const snap = await getDocs(q);
    if (snap.empty) {
      setStatus("No user found with that email.");
      return;
    }
    setFoundUser(snap.docs[0].data() as AppUser);
  }

  async function adjust(type: "credit" | "debit") {
    if (!foundUser) return;
    const idToken = await auth.currentUser?.getIdToken();
    const res = await fetch("/api/admin-adjust-wallet", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
      body: JSON.stringify({ targetUserId: foundUser.uid, amount, type, reason }),
    });
    const data = await res.json();
    setStatus(res.ok ? `${type === "credit" ? "Credited" : "Debited"} $${amount.toFixed(2)}.` : data.error);
  }

  return (
    <div className="glass-card p-5">
      <h3 className="neon-text font-semibold text-sm mb-3">Quick Action Wallet Panel</h3>
      <div className="flex gap-2 mb-3">
        <input
          className="input-field"
          placeholder="User email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button onClick={lookup} className="ghost-btn text-xs whitespace-nowrap">
          Find
        </button>
      </div>

      {foundUser && (
        <div className="bg-obsidian2/60 rounded-xl p-3 mb-3">
          <p className="text-sm text-white/80">{foundUser.displayName}</p>
          <p className="text-xs text-white/40">
            Balance: <span className="neon-text">${foundUser.walletBalance.toFixed(2)}</span>
          </p>
        </div>
      )}

      <input
        type="number"
        className="input-field mb-3"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
      />
      <input
        className="input-field mb-3"
        placeholder="Reason (optional)"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
      />

      <div className="flex gap-2">
        <button disabled={!foundUser} onClick={() => adjust("credit")} className="glow-btn flex-1 text-sm">
          Credit
        </button>
        <button disabled={!foundUser} onClick={() => adjust("debit")} className="ghost-btn flex-1 text-sm">
          Debit
        </button>
      </div>

      {status && <p className="text-xs text-white/60 mt-2">{status}</p>}
    </div>
  );
}
