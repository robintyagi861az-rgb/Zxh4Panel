"use client";

export default function MaintenanceModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="glass-card max-w-sm w-full p-7 text-center">
        <div className="mx-auto w-14 h-14 rounded-full bg-amethyst-gradient shadow-glowLg flex items-center justify-center mb-4">
          <span className="text-2xl">⚙️</span>
        </div>
        <h3 className="neon-text text-lg font-semibold mb-2">Website Under Maintenance</h3>
        <p className="text-sm text-white/60 mb-6">Can&apos;t accept order right now. Please try again shortly.</p>
        <button onClick={onClose} className="glow-btn w-full">
          Got it
        </button>
      </div>
    </div>
  );
}
