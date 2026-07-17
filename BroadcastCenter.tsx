"use client";

import { useState } from "react";
import { auth } from "@/firebase";

export default function BroadcastCenter() {
  const [subject, setSubject] = useState("");
  const [bodyHtml, setBodyHtml] = useState("");
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState("");

  async function send() {
    if (!subject.trim() || !bodyHtml.trim()) {
      setStatus("Subject and message body are required.");
      return;
    }
    setSending(true);
    setStatus("");
    try {
      const idToken = await auth.currentUser?.getIdToken();
      const res = await fetch("/api/admin-broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ subject, bodyHtml }),
      });
      const data = await res.json();
      setStatus(res.ok ? `Sent to ${data.sentTo} users.` : data.error);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="glass-card p-5">
      <h3 className="neon-text font-semibold text-sm mb-3">SMTP Broadcast Center</h3>
      <input
        className="input-field mb-3"
        placeholder="Subject"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
      />
      <textarea
        className="input-field mb-3 h-32 resize-none"
        placeholder="HTML message body"
        value={bodyHtml}
        onChange={(e) => setBodyHtml(e.target.value)}
      />
      <button onClick={send} disabled={sending} className="glow-btn text-sm">
        {sending ? "Sending..." : "Send Broadcast"}
      </button>
      {status && <p className="text-xs text-white/60 mt-2">{status}</p>}
    </div>
  );
}
