"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/firebase";
import { useAuth } from "@/useAuth";
import Navbar from "@/Navbar";
import ServiceCard from "@/ServiceCard";
import BuyModal from "@/BuyModal";
import CouponWidget from "@/CouponWidget";
import ChatPanel from "@/ChatPanel";
import OrderHistory from "@/OrderHistory";
import MaintenanceModal from "@/MaintenanceModal";
import type { Service } from "@/types";

export default function DashboardPage() {
  const router = useRouter();
  const { firebaseUser, profile, loading } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [category, setCategory] = useState("All");
  const [buying, setBuying] = useState<Service | null>(null);
  const [showMaintenance, setShowMaintenance] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  useEffect(() => {
    if (!loading && !firebaseUser) router.replace("/login");
  }, [loading, firebaseUser, router]);

  useEffect(() => {
    const q = query(collection(db, "services"), where("active", "==", true));
    const unsub = onSnapshot(q, (snap) => {
      setServices(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Service)));
    });
    return () => unsub();
  }, []);

  const categories = useMemo(() => ["All", ...Array.from(new Set(services.map((s) => s.category)))], [services]);
  const visibleServices = category === "All" ? services : services.filter((s) => s.category === category);

  if (loading || !profile) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 rounded-xl bg-amethyst-gradient shadow-glowLg animate-pulse" />
      </main>
    );
  }

  return (
    <main className="min-h-screen pb-10">
      <Navbar profile={profile} />

      <div className="max-w-6xl mx-auto px-4 md:px-6 mt-6 space-y-6">
        {orderPlaced && (
          <div className="glass-card px-4 py-3 text-sm text-emerald-300 border-emerald-400/30">
            Order placed successfully! Track it in your order history below.
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`badge transition-colors ${
                category === c
                  ? "bg-amethyst-gradient text-white border-transparent"
                  : "border-white/10 text-white/50 hover:text-white"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleServices.map((s) => (
            <ServiceCard key={s.id} service={s} onBuy={setBuying} />
          ))}
          {visibleServices.length === 0 && (
            <p className="text-white/40 text-sm col-span-full">No services available in this category yet.</p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <CouponWidget />
          <ChatPanel chatId={profile.uid} senderId={profile.uid} senderRole="user" />
          <OrderHistory userId={profile.uid} />
        </div>
      </div>

      <BuyModal
        service={buying}
        onClose={() => setBuying(null)}
        onSuccess={() => {
          setBuying(null);
          setOrderPlaced(true);
          setTimeout(() => setOrderPlaced(false), 4000);
        }}
        onMaintenance={() => {
          setBuying(null);
          setShowMaintenance(true);
        }}
      />
      <MaintenanceModal open={showMaintenance} onClose={() => setShowMaintenance(false)} />
    </main>
  );
}
