"use client";

import { useMemo, useState } from "react";
import { auth } from "@/firebase";
import type { Service } from "@/types";

export default function BuyModal({
  service,
  onClose,
  onSuccess,
  onMaintenance,
}: {
  service: Service | null;
  onClose: () => void;
  onSuccess: () => void;
  onMaintenance: () => void;
}) {
  const [targetLink, setTargetLink] = useState("");
  const [quantity, setQuantity] = useState<number>(service?.min ?? 100);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const total = useMemo(() => {
    if (!service) return 0;
    return (service.ratePer1000 * quantity) / 1000;
  }, [service, quantity]);

  if (!service) return null;

  async function submit() {
    setError("");
    if (quantity < service!.min || quantity > service!.max) {
      setError(`Quantity must be between ${service!.min} and ${service!.max}.`);
      return;
    }
    if (!targetLink.trim()) {
      setError("Target link is required.");
      return;
    }

    setSubmitting(true);
    try {
      const idToken = await auth.currentUser?.getIdToken();
      const res = await fetch("/api/place-order", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ serviceId: service!.id, targetLink, quantity }),
      });
      const data = await res.json();

      if (res.status === 503 && data.maintenance) {
        onMaintenance();
        return;
      }
      if (!res.ok) {
        setError(data.error || "Order failed.");
        return;
      }
      onSuccess();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="glass-card max-w-md w-full p-6">
        <h3 className="neon-text font-semibold mb-1">{service.name}</h3>
        <p className="text-xs text-white/50 mb-5">${service.ratePer1000.toFixed(2)} per 1000</p>

        <label className="text-xs text-white/50 mb-1 block">Target Link</label>
        <input
          className="input-field mb-4"
          placeholder="https://instagram.com/yourprofile"
          value={targetLink}
          onChange={(e) => setTargetLink(e.target.value)}
        />

        <label className="text-xs text-white/50 mb-1 block">
          Quantity (min {service.min}, max {service.max})
        </label>
        <input
          type="number"
          className="input-field mb-4"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
        />

        <div className="flex items-center justify-between glass-card px-4 py-3 mb-4">
          <span className="text-sm text-white/60">Total cost</span>
          <span className="neon-text font-bold text-lg">${total.toFixed(2)}</span>
        </div>

        {error && <p className="text-xs text-red-400 mb-3">{error}</p>}

        <div className="flex gap-3">
          <button onClick={onClose} className="ghost-btn flex-1">
            Cancel
          </button>
          <button onClick={submit} disabled={submitting} className="glow-btn flex-1">
            {submitting ? "Placing..." : "Confirm Order"}
          </button>
        </div>
      </div>
    </div>
  );
}
