"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/firebase";

export default function RegisterPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    setError("");
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName });
      await setDoc(doc(db, "users", cred.user.uid), {
        uid: cred.user.uid,
        email,
        displayName,
        role: "user",
        walletBalance: 0,
        createdAt: Date.now(),
      });
      await setDoc(doc(db, "chats", cred.user.uid), {
        userId: cred.user.uid,
        userDisplayName: displayName,
        lastMessage: "",
        lastMessageAt: Date.now(),
        unreadForAdmin: 0,
      });
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.code === "auth/email-already-in-use" ? "Email already registered." : "Registration failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="glass-card w-full max-w-sm p-8">
        <div className="text-center mb-6">
          <div className="w-10 h-10 rounded-xl bg-amethyst-gradient shadow-glowLg mx-auto mb-3" />
          <h1 className="neon-text text-xl font-bold">Create your account</h1>
        </div>

        <label className="text-xs text-white/50 mb-1 block">Full name</label>
        <input className="input-field mb-3" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />

        <label className="text-xs text-white/50 mb-1 block">Email</label>
        <input className="input-field mb-3" value={email} onChange={(e) => setEmail(e.target.value)} />

        <label className="text-xs text-white/50 mb-1 block">Password</label>
        <input
          type="password"
          className="input-field mb-4"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="text-xs text-red-400 mb-3">{error}</p>}

        <button onClick={handleRegister} disabled={loading} className="glow-btn w-full mb-4">
          {loading ? "Creating..." : "Create Account"}
        </button>

        <p className="text-xs text-white/40 text-center">
          Already have an account?{" "}
          <Link href="/login" className="text-amethyst-400 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
