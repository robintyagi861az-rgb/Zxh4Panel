"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/useAuth";

export default function HomePage() {
  const router = useRouter();
  const { firebaseUser, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    router.replace(firebaseUser ? "/dashboard" : "/login");
  }, [firebaseUser, loading, router]);

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 rounded-xl bg-amethyst-gradient shadow-glowLg animate-pulse" />
    </main>
  );
}
