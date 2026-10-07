"use client";

import { useEffect, useState } from "react";
import {
  Check,
  Copy,
  Sparkles,
  TicketPercent,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function CouponShowcase() {
  const [activeCoupons, setActiveCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState("");

  useEffect(() => {
    const fetchActiveCoupons = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/coupons/active`,
          {
            cache: "no-store",
          }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result?.message ||
              "Failed to fetch coupons"
          );
        }

        const coupons = Array.isArray(result?.data)
          ? result.data
          : [];

        const now = new Date();

        const active = coupons.filter((coupon) => {
          if (!coupon?.isActive) {
            return false;
          }

          if (
            coupon?.expiresAt &&
            new Date(coupon.expiresAt) < now
          ) {
            return false;
          }

          if (
            coupon?.usageLimit &&
            Number(coupon.usedCount || 0) >=
              Number(coupon.usageLimit)
          ) {
            return false;
          }

          return true;
        });

        setActiveCoupons(active);
      } catch (error) {
        console.error(
          "Active coupons loading error:",
          error
        );

        setActiveCoupons([]);
      } finally {
        setLoading(false);
      }
    };

    fetchActiveCoupons();
  }, []);

  const handleCopy = async (code) => {
    try {
      await navigator.clipboard.writeText(code);

      setCopiedCode(code);

      setTimeout(() => {
        setCopiedCode("");
      }, 1800);
    } catch (error) {
      console.error(
        "Coupon copy error:",
        error
      );
    }
  };

  if (loading || !activeCoupons.length) {
    return null;
  }

  return (
    <section className="py-10 sm:py-14 lg:py-16">
      <div className="container-main">
        <div className="mb-7">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#eef4e5] text-[#60703f]">
              <Sparkles
                size={15}
                strokeWidth={1.8}
              />
            </span>

            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#71834b]">
              Special offers
            </span>
          </div>

          <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-[#111111] sm:text-3xl">
            Save more with our coupons
          </h2>

          <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--muted)]">
            Grab an active coupon and use it on your next order.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {activeCoupons.map((coupon) => {
            const isPercentage =
              coupon.type === "percentage";

            const isCopied =
              copiedCode === coupon.code;

            return (
              <div
                key={coupon._id || coupon.code}
                className="group relative overflow-hidden rounded-[26px] border border-[#dfe7d3] bg-gradient-to-br from-[#f7faef] via-white to-[#eef5e3] p-5 transition duration-300 hover:-translate-y-1 hover:border-[#cbd9b7] hover:shadow-[0_18px_45px_rgba(96,112,63,0.13)]"
              >
                <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-[#dfeacb]/60 blur-2xl transition duration-500 group-hover:scale-125" />

                <div className="relative">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#60703f] shadow-sm">
                      <TicketPercent
                        size={20}
                        strokeWidth={1.7}
                      />
                    </div>

                    <span className="rounded-full border border-[#d8e3c7] bg-white/80 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.14em] text-[#60703f]">
                      Active
                    </span>
                  </div>

                  <div className="mt-6">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7c8c5b]">
                      Special coupon
                    </p>

                    <div className="mt-1 flex items-end gap-2">
                      <h3 className="text-4xl font-bold tracking-[-0.06em] text-[#111111]">
                        {isPercentage
                          ? `${coupon.value}%`
                          : `৳${coupon.value}`}
                      </h3>

                      <span className="mb-1 text-xs font-semibold uppercase tracking-[0.08em] text-[#60703f]">
                        OFF
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 flex items-center gap-2 rounded-2xl border border-dashed border-[#cbd8b8] bg-white/80 p-2">
                    <div className="min-w-0 flex-1 px-2">
                      <p className="text-[9px] font-medium uppercase tracking-[0.14em] text-[#999]">
                        Coupon code
                      </p>

                      <p className="mt-0.5 truncate text-sm font-bold uppercase tracking-[0.08em] text-[#111111]">
                        {coupon.code}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        handleCopy(coupon.code)
                      }
                      className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-[10px] font-semibold transition ${
                        isCopied
                          ? "bg-[#60703f] text-white"
                          : "bg-[#111111] text-white hover:bg-[#252525]"
                      }`}
                    >
                      {isCopied ? (
                        <>
                          <Check size={13} />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy size={13} />
                          Copy
                        </>
                      )}
                    </button>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-[10px] text-[#7c806f]">
                    <span>
                      {isPercentage
                        ? `Save ${coupon.value}% on your order`
                        : `Save ৳${coupon.value} on your order`}
                    </span>

                    <Sparkles
                      size={13}
                      className="text-[#94a66b]"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}