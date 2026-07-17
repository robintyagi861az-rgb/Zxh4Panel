"use client";

import { useEffect, useState } from "react";
import { collection, doc, onSnapshot, query, updateDoc, where } from "firebase/firestore";
import { db } from "@/firebase";
import type { AppUser, SubAdminPermissions } from "@/types";

const permissionLabels: { key: keyof SubAdminPermissions; label: string }[] = [
  { key: "manageChats", label: "Manage Chats" },
  { key: "editWalletsAndCoupons", label: "Edit User Wallets / Coupons" },
  { key: "sendPromoEmails", label: "Send SMTP Promo Emails" },
  { key: "viewFinancialLogs", label: "View Financial Logs" },
];

export default function SubAdminManager() {
  const [subAdmins, setSubAdmins] = useState<AppUser[]>([]);
  const [promoteEmail, setPromoteEmail] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    const q = query(collection(db, "users"), where("role", "==", "subadmin"));
    const unsub = onSnapshot(q, (snap) => setSubAdmins(snap.docs.map((d) => d.data() as AppUser)));
    return () => unsub();
  }, []);

  async function promote() {
    // Looks up a user by email and flips their role to sub-admin with all
    // permissions off by default; the super admin then toggles access.
    const { getDocs } = await import("firebase/firestore");
    const q = query(collection(db, "users"), where("email", "==", promoteEmail.trim()));
    const snap = await getDocs(q);
    if (snap.empty) {
      setStatus("No user found with that email.");
      return;
    }
    const target = snap.docs[0];
    await updateDoc(doc(db, "users", target.id), {
      role: "subadmin",
      permissions: {
        manageChats: false,
        editWalletsAndCoupons: false,
        sendPromoEmails: false,
        viewFinancialLogs: false,
      },
    });
    setStatus(`${promoteEmail} is now a sub-admin.`);
    setPromoteEmail("");
  }

  async function togglePermission(uid: string, key: keyof SubAdminPermissions, current: SubAdminPermissions) {
    await updateDoc(doc(db, "users", uid), {
      permissions: { ...current, [key]: !current[key] },
    });
  }

  return (
    <div className="space-y-4">
      <div className="glass-card p-5">
        <h3 className="neon-text font-semibold text-sm mb-3">Promote to Sub-Admin</h3>
        <div className="flex gap-2">
          <input
            className="input-field"
            placeholder="User email"
            value={promoteEmail}
            onChange={(e) => setPromoteEmail(e.target.value)}
          />
          <button onClick={promote} className="glow-btn text-sm whitespace-nowrap">
            Promote
          </button>
        </div>
        {status && <p className="text-xs text-white/60 mt-2">{status}</p>}
      </div>

      {subAdmins.map((sa) => (
        <div key={sa.uid} className="glass-card p-5">
          <p className="text-sm text-white/80 mb-3">{sa.displayName} · {sa.email}</p>
          <div className="grid grid-cols-2 gap-2">
            {permissionLabels.map(({ key, label }) => (
              <label key={key} className="flex items-center gap-2 text-xs text-white/60">
                <input
                  type="checkbox"
                  checked={Boolean(sa.permissions?.[key])}
                  onChange={() => togglePermission(sa.uid, key, sa.permissions!)}
                />
                {label}
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
