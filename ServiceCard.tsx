"use client";

import type { Service } from "@/types";

export default function ServiceCard({ service, onBuy }: { service: Service; onBuy: (s: Service) => void }) {
  return (
    <div className="glass-card p-5 flex flex-col justify-between hover:shadow-glowLg transition-shadow duration-200">
      <div>
        <span className="badge border-amethyst-500/30 bg-amethyst-500/10 text-amethyst-400 mb-3 inline-block">
          {service.category}
        </span>
        <h3 className="font-semibold text-white mb-1">{service.name}</h3>
        {service.description && <p className="text-xs text-white/50 mb-3">{service.description}</p>}
        <p className="text-sm text-white/70">
          <span className="neon-text font-semibold">${service.ratePer1000.toFixed(2)}</span>{" "}
          <span className="text-white/40">/ 1000</span>
        </p>
        <p className="text-xs text-white/40 mt-1">
          Min {service.min} · Max {service.max}
        </p>
      </div>
      <button onClick={() => onBuy(service)} className="glow-btn mt-4 w-full text-sm">
        Buy Now
      </button>
    </div>
  );
}
