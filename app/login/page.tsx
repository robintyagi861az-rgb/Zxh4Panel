"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/firebase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setError("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch {
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setError("");
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
      router.push("/dashboard");
    } catch {
      setError("Google sign-in failed or is currently disabled.");
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="glass-card w-full max-w-sm p-8">
        <div className="text-center mb-6">
          <div className="w-10 h-10 rounded-xl bg-amethyst-gradient shadow-glowLg mx-auto mb-3" />
          <h1 className="neon-text text-xl font-bold">Welcome back</h1>
          <p className="text-xs text-white/50 mt-1">Sign in to ZXH4 Panel</p>
        </div>

        <label className="text-xs text-white/50 mb-1 block">Email</label>
        <input className="input-field mb-3" value={email} onChange={(e) => setEmail(e.target.value)} />

        <label className="text-xs text-white/50 mb-1 block">Password</label>
        <input
          type="password"
          className="input-field mb-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div className="text-right mb-4">
          <Link href="/forgot-password" className="text-xs text-amethyst-400 hover:underline">
            Forgot password?
          </Link>
        </div>

        {error && <p className="text-xs text-red-400 mb-3">{error}</p>}

        <button onClick={handleLogin} disabled={loading} className="glow-btn w-full mb-3">
          {loading ? "Signing in..." : "Sign In"}
        </button>

        <button onClick={handleGoogleLogin} className="ghost-btn w-full mb-4">
          Continue with Google
        </button>

        <p className="text-xs text-white/40 text-center">
          No account?{" "}
          <Link href="/register" className="text-amethyst-400 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </main>
  );
}
