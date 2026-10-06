"use client";

import { Check, Truck, Zap } from "lucide-react";

const shippingOptions = [
  {
    id: "standard",
    title: "Standard delivery",
    description: "Delivery within 3–5 business days",
    price: 0,
    icon: Truck,
  },
  {
    id: "express",
    title: "Express delivery",
    description: "Delivery within 1–2 business days",
    price: 12,
    icon: Zap,
  },
];

export default function ShippingMethod({
  selected = "standard",
  setSelected = () => {},
}) {
  return (
    <div className="rounded-[24px] bg-white p-6 sm:p-7">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
        Step 02
      </p>

      <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em]">
        Shipping method
      </h2>

      <div className="mt-6 space-y-3">
        {shippingOptions.map((option) => {
          const Icon = option.icon;
          const active =
            selected === option.id;

          return (
            <button
              key={option.id}
              type="button"
              onClick={() =>
                setSelected(option.id)
              }
              className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition ${
                active
                  ? "border-[#111111] bg-[#f7f7f5]"
                  : "border-[var(--border)] hover:border-[#111111]"
              }`}
            >
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition ${
                  active
                    ? "bg-[#111111] text-white"
                    : "bg-[#ecece7] text-[#111111]"
                }`}
              >
                <Icon
                  size={18}
                  strokeWidth={1.7}
                />
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold">
                  {option.title}
                </h3>

                <p className="mt-1 text-xs text-[var(--muted)]">
                  {option.description}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold">
                  {option.price === 0
                    ? "Free"
                    : `$${option.price}`}
                </span>

                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full border transition ${
                    active
                      ? "border-[#111111] bg-[#111111] text-white"
                      : "border-[var(--border)]"
                  }`}
                >
                  {active && (
                    <Check
                      size={12}
                      strokeWidth={2}
                    />
                  )}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
