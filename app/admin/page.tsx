"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/useAuth";
import Navbar from "@/Navbar";
import AdminSidebar, { type AdminTab } from "@/AdminSidebar";
import ChatDesk from "@/ChatDesk";
import CouponCreator from "@/CouponCreator";
import WalletQuickAction from "@/WalletQuickAction";
import SettingsPanel from "@/SettingsPanel";
import SubAdminManager from "@/SubAdminManager";
import BroadcastCenter from "@/BroadcastCenter";

export default function AdminPage() {
  const router = useRouter();
  const { firebaseUser, profile, loading } = useAuth();
  const [tab, setTab] = useState<AdminTab>("chats");

  useEffect(() => {
    if (loading) return;
    if (!firebaseUser) {
      router.replace("/login");
      return;
    }
    if (profile && profile.role !== "admin" && profile.role !== "subadmin") {
      router.replace("/dashboard");
    }
  }, [loading, firebaseUser, profile, router]);

  if (loading || !profile || (profile.role !== "admin" && profile.role !== "subadmin")) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 rounded-xl bg-amethyst-gradient shadow-glowLg animate-pulse" />
      </main>
    );
  }

  const isSuperAdmin = profile.role === "admin";
  const canEditWallets = isSuperAdmin || profile.permissions?.editWalletsAndCoupons;
  const canBroadcast = isSuperAdmin || profile.permissions?.sendPromoEmails;

  return (
    <main className="min-h-screen pb-10">
      <Navbar profile={profile} />

      <div className="max-w-6xl mx-auto px-4 md:px-6 mt-6 grid grid-cols-1 md:grid-cols-[220px_1fr] gap-4">
        <AdminSidebar active={tab} onChange={setTab} isSuperAdmin={isSuperAdmin} />

        <div>
          {tab === "chats" && <ChatDesk actor={profile} />}

          {tab === "wallets" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {canEditWallets ? (
                <>
                  <CouponCreator actor={profile} />
                  <WalletQuickAction />
                </>
              ) : (
                <p className="text-white/40 text-sm">You don&apos;t have permission to manage wallets or coupons.</p>
              )}
            </div>
          )}

          {tab === "settings" && (isSuperAdmin ? <SettingsPanel /> : <p className="text-white/40 text-sm">Only the super admin can change global settings.</p>)}

          {tab === "subadmins" && isSuperAdmin && <SubAdminManager />}

          {tab === "broadcast" &&
            (canBroadcast ? <BroadcastCenter /> : <p className="text-white/40 text-sm">You don&apos;t have permission to send broadcasts.</p>)}
        </div>
      </div>
    </main>
  );
}
