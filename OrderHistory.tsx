"use client";

import { useEffect, useState } from "react";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase";
import type { Order } from "@/types";

const statusStyles: Record<string, string> = {
  pending: "border-amber-400/40 bg-amber-400/10 text-amber-300",
  in_progress: "border-blue-400/40 bg-blue-400/10 text-blue-300",
  completed: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
  canceled: "border-red-400/40 bg-red-400/10 text-red-300",
  partial: "border-orange-400/40 bg-orange-400/10 text-orange-300",
};

export default function OrderHistory({ userId }: { userId: string }) {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const q = query(collection(db, "orders"), where("userId", "==", userId), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Order)));
    });
    return () => unsub();
  }, [userId]);

  return (
    <div className="glass-card p-5">
      <h3 className="neon-text font-semibold text-sm mb-3">Order History</h3>
      <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
        {orders.length === 0 && <p className="text-xs text-white/40">No orders yet.</p>}
        {orders.map((o) => (
          <div key={o.id} className="flex items-center justify-between px-3 py-2 rounded-xl bg-obsidian2/60">
            <div>
              <p className="text-sm text-white/80">{o.serviceName}</p>
              <p className="text-xs text-white/40">
                Qty {o.quantity} · ${o.charge.toFixed(2)}
              </p>
            </div>
            <span className={`badge ${statusStyles[o.status] || ""}`}>{o.status.replace("_", " ")}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
