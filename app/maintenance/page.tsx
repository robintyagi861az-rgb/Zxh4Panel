export default function MaintenancePage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 text-center">
      <div className="glass-card max-w-md w-full p-10">
        <div className="mx-auto w-16 h-16 rounded-full bg-amethyst-gradient shadow-glowLg flex items-center justify-center mb-5 text-3xl">
          ⚙️
        </div>
        <h1 className="neon-text text-2xl font-bold mb-2">Website Under Maintenance</h1>
        <p className="text-white/60 text-sm">
          We&apos;re making improvements behind the scenes. Please check back shortly — your account and wallet
          balance are completely safe.
        </p>
      </div>
    </main>
  );
}
