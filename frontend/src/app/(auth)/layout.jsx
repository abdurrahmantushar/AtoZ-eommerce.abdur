import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";

export default function AuthLayout({ children }) {
  return (
    <main className="min-h-screen bg-[var(--background)]">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden overflow-hidden bg-[#111111] lg:block">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(223,255,0,0.16),transparent_28%),radial-gradient(circle_at_80%_70%,rgba(255,255,255,0.08),transparent_30%)]" />

          <div className="relative flex min-h-screen flex-col justify-between p-10 xl:p-14">
            <Link
              href="/"
              className="inline-flex w-fit items-center gap-2 text-xl font-semibold tracking-[-0.04em] text-white"
            >
              AtoZ
              <ArrowUpRight size={18} strokeWidth={1.8} />
            </Link>

            <div className="max-w-xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] text-white/70">
                <Sparkles size={14} strokeWidth={1.8} />
                Your world, all in one place
              </div>

              <h1 className="max-w-lg text-5xl font-semibold leading-[0.98] tracking-[-0.055em] text-white xl:text-7xl">
                Everything you need.
                <span className="text-[#dfff00]"> One account.</span>
              </h1>

              <p className="mt-7 max-w-md text-sm leading-7 text-white/55">
                Save your wishlist, manage orders, keep your addresses ready,
                and enjoy a faster shopping experience across AtoZ.
              </p>
            </div>

            <p className="text-xs text-white/35">
              © {new Date().getFullYear()} AtoZ. All rights reserved.
            </p>
          </div>
        </section>

        <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8 lg:px-12">
          <div className="w-full max-w-md">
            <div className="mb-8 lg:hidden">
              <Link
                href="/"
                className="text-2xl font-semibold tracking-[-0.04em] text-[#111111]"
              >
                AtoZ
              </Link>
            </div>

            {children}
          </div>
        </section>
      </div>
    </main>
  );
}