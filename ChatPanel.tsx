"use client";

import { useEffect, useRef, useState } from "react";
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/firebase";
import type { ChatMessage, UserRole } from "@/types";

export default function ChatPanel({
  chatId,
  senderId,
  senderRole,
}: {
  chatId: string; // thread id -- equals the end-user's uid
  senderId: string;
  senderRole: UserRole;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = query(collection(db, "chats", chatId, "messages"), orderBy("createdAt", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() } as ChatMessage)));
    });
    return () => unsub();
  }, [chatId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send() {
    if (!text.trim()) return;
    await addDoc(collection(db, "chats", chatId, "messages"), {
      chatId,
      senderId,
      senderRole,
      text: text.trim(),
      createdAt: Date.now(),
      read: senderRole !== "user",
    });
    await updateDoc(doc(db, "chats", chatId), {
      lastMessage: text.trim(),
      lastMessageAt: Date.now(),
      unreadForAdmin: senderRole === "user" ? 1 : 0,
    }).catch(() => {});
    setText("");
  }

  return (
    <div className="glass-card p-5 flex flex-col h-[420px]">
      <h3 className="neon-text font-semibold text-sm mb-3">Support Chat</h3>
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`max-w-[75%] px-3 py-2 rounded-xl text-sm ${
              m.senderId === senderId
                ? "ml-auto bg-amethyst-gradient text-white"
                : "bg-obsidian2 border border-white/10 text-white/80"
            }`}
          >
            {m.text}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="flex gap-2 mt-3">
        <input
          className="input-field"
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
        />
        <button onClick={send} className="glow-btn text-sm">
          Send
        </button>
      </div>
    </div>
  );
}
