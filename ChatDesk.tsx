"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "@/firebase";
import ChatPanel from "@/ChatPanel";
import WalletQuickAction from "@/WalletQuickAction";
import type { AppUser, ChatThread } from "@/types";

export default function ChatDesk({ actor }: { actor: AppUser }) {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, "chats"), orderBy("lastMessageAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setThreads(snap.docs.map((d) => d.data() as ChatThread));
    });
    return () => unsub();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="glass-card p-4">
        <h3 className="neon-text font-semibold text-sm mb-3">Active Conversations</h3>
        <div className="space-y-1 max-h-[500px] overflow-y-auto">
          {threads.map((t) => (
            <button
              key={t.userId}
              onClick={() => setSelected(t.userId)}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-colors flex items-center justify-between ${
                selected === t.userId ? "bg-amethyst-gradient text-white" : "hover:bg-white/5 text-white/70"
              }`}
            >
              <span className="truncate">{t.userDisplayName}</span>
              {t.unreadForAdmin > 0 && (
                <span className="badge bg-fuchsia-500 border-transparent text-white text-[10px] ml-2">
                  {t.unreadForAdmin}
                </span>
              )}
            </button>
          ))}
          {threads.length === 0 && <p className="text-xs text-white/40 px-1">No conversations yet.</p>}
        </div>
      </div>

      <div className="md:col-span-1">
        {selected ? (
          <ChatPanel chatId={selected} senderId={actor.uid} senderRole={actor.role} />
        ) : (
          <div className="glass-card p-5 h-[420px] flex items-center justify-center text-white/40 text-sm">
            Select a conversation
          </div>
        )}
      </div>

      <div className="md:col-span-1">
        <WalletQuickAction />
      </div>
    </div>
  );
}
