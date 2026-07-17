"use client";

import { signOut } from "firebase/auth";
import { auth } from "@/firebase";
import type { AppUser } from "@/types";

export default function Navbar({ profile }: { profile: AppUser | null }) {
  return (
    <header className="sticky top-0 z-30 glass-card mx-3 mt-3 rounded-2xl px-4 py-3 flex items-center justify-between md:mx-6">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-amethyst-gradient shadow-glow" />
        <span className="font-bold neon-text tracking-tight">ZXH4 Panel</span>
      </div>

      <div className="flex items-center gap-3">
        {profile && (
          <div className="badge border-amethyst-500/40 bg-amethyst-500/10 text-amethyst-400 flex items-center gap-1">
            <span className="text-white/50">Wallet</span>
            <span className="neon-text font-semibold">${profile.walletBalance.toFixed(2)}</span>
          </div>
        )}
        <div className="hidden sm:block text-sm text-white/70">{profile?.displayName}</div>
        <button
          onClick={() => signOut(auth)}
          className="text-xs text-white/50 hover:text-white transition-colors"
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
