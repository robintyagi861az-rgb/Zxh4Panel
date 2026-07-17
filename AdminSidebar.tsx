"use client";

const tabs = [
  { id: "chats", label: "Chat Desk" },
  { id: "wallets", label: "Coupons & Wallets" },
  { id: "settings", label: "Global Settings" },
  { id: "subadmins", label: "Sub-Admins" },
  { id: "broadcast", label: "Broadcast" },
] as const;

export type AdminTab = (typeof tabs)[number]["id"];

export default function AdminSidebar({
  active,
  onChange,
  isSuperAdmin,
}: {
  active: AdminTab;
  onChange: (t: AdminTab) => void;
  isSuperAdmin: boolean;
}) {
  return (
    <nav className="glass-card p-3 flex md:flex-col gap-2 overflow-x-auto md:overflow-visible">
      {tabs
        .filter((t) => t.id !== "subadmins" || isSuperAdmin)
        .map((t) => (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className={`text-left px-4 py-2.5 rounded-xl text-sm whitespace-nowrap transition-colors ${
              active === t.id ? "bg-amethyst-gradient text-white shadow-glow" : "text-white/60 hover:bg-white/5"
            }`}
          >
            {t.label}
          </button>
        ))}
    </nav>
  );
}
