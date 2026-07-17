"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<"request" | "confirm">("request");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function requestCode() {
    setLoading(true);
    setMessage("");
    try {
      await fetch("/api/request-password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setStep("confirm");
      setMessage("If that email is registered, a 6-digit code has been sent.");
    } finally {
      setLoading(false);
    }
  }

  async function confirmReset() {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/confirm-password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error);
        return;
      }
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="glass-card w-full max-w-sm p-8">
        <h1 className="neon-text text-xl font-bold mb-1">Reset password</h1>
        <p className="text-xs text-white/50 mb-6">
          {step === "request" ? "We'll email you a 6-digit code." : "Enter the code and your new password."}
        </p>

        {step === "request" ? (
          <>
            <label className="text-xs text-white/50 mb-1 block">Email</label>
            <input className="input-field mb-4" value={email} onChange={(e) => setEmail(e.target.value)} />
            <button onClick={requestCode} disabled={loading} className="glow-btn w-full">
              {loading ? "Sending..." : "Send Code"}
            </button>
          </>
        ) : (
          <>
            <label className="text-xs text-white/50 mb-1 block">6-digit code</label>
            <input className="input-field mb-3" value={code} onChange={(e) => setCode(e.target.value)} />
            <label className="text-xs text-white/50 mb-1 block">New password</label>
            <input
              type="password"
              className="input-field mb-4"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <button onClick={confirmReset} disabled={loading} className="glow-btn w-full">
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </>
        )}

        {message && <p className="text-xs text-white/60 mt-3">{message}</p>}
      </div>
    </main>
  );
}
