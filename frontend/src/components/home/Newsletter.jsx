"use client";

import { ArrowUpRight, Mail } from "lucide-react";
import { useState } from "react";

export default function Newsletter() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email.trim()) return;

    setEmail("");
  };

  return (
    <section className="container-main section-space-sm mb-5">
      <div className="relative overflow-hidden rounded-[28px] bg-[#111111] px-6 py-14 text-white sm:px-10 lg:px-16 lg:py-20">
        <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[#dfff00]/10 blur-3xl" />

        <div className="absolute -bottom-28 -left-20 h-64 w-64 rounded-full bg-white/5 blur-3xl" />

        <div className="relative z-10 grid gap-10 lg:grid-cols-[1fr_0.8fr] lg:items-end">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/45">
              Stay in the loop
            </p>

            <h2 className="mt-4 max-w-2xl text-4xl font-semibold leading-[0.95] tracking-[-0.05em] sm:text-5xl lg:text-6xl">
              New finds.
              <br />
              Better deals.
            </h2>

            <p className="mt-6 max-w-xl text-sm leading-6 text-white/55 sm:text-base">
              Get product drops, curated collections and special offers
              delivered straight to your inbox.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="w-full">
            <label className="mb-3 block text-xs font-medium uppercase tracking-[0.16em] text-white/40">
              Your email address
            </label>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Mail
                  size={17}
                  strokeWidth={1.7}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/35"
                />

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="h-13 w-full rounded-full border border-white/10 bg-white/5 pl-11 pr-5 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-white/30 focus:bg-white/10"
                />
              </div>

              <button
                type="submit"
                className="group inline-flex h-13 items-center justify-center gap-3 rounded-full bg-[#dfff00] px-6 text-sm font-semibold !text-black transition hover:bg-white"
              >
                Subscribe

                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-black text-white transition-transform duration-300 group-hover:rotate-45">
                  <ArrowUpRight size={15} strokeWidth={2} />
                </span>
              </button>
            </div>

            <p className="mt-3 text-[10px] leading-5 text-white/30">
              By subscribing, you agree to receive updates and promotional
              emails from AtoZ.
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}