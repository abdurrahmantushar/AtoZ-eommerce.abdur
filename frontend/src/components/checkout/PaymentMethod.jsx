"use client";

import {
  Check,
  CreditCard,
  WalletCards,
  Smartphone,
} from "lucide-react";

const paymentOptions = [
  {
    id: "card",
    title: "Credit / Debit Card",
    description: "Secure payment with Stripe",
    icon: CreditCard,
  },
  {
    id: "bkash",
    title: "bKash",
    description: "Pay securely with bKash",
    icon: Smartphone,
  },
  {
    id: "nagad",
    title: "Nagad",
    description: "Pay securely with Nagad",
    icon: Smartphone,
  },
  {
    id: "cod",
    title: "Cash on Delivery",
    description: "Pay when your order arrives",
    icon: WalletCards,
  },
];

export default function PaymentMethod({
  selected = "card",
  setSelected = () => {},
}) {
  return (
    <div className="rounded-[24px] bg-white p-6 sm:p-7">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
        Step 03
      </p>

      <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em]">
        Payment method
      </h2>

      <div className="mt-6 space-y-3">
        {paymentOptions.map((option) => {
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

              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition ${
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
            </button>
          );
        })}
      </div>

      {selected === "card" && (
        <div className="mt-5 rounded-2xl border border-[var(--border)] bg-[#fafaf8] p-4">
          <p className="text-xs leading-5 text-[var(--muted)]">
            Your card payment will be processed
            securely through Stripe.
          </p>
        </div>
      )}

      {selected === "bkash" && (
        <div className="mt-5 rounded-2xl border border-[var(--border)] bg-[#fafaf8] p-4">
          <p className="text-xs leading-5 text-[var(--muted)]">
            After placing the order, submit your
            bKash transaction details and payment
            screenshot for verification.
          </p>
        </div>
      )}

      {selected === "nagad" && (
        <div className="mt-5 rounded-2xl border border-[var(--border)] bg-[#fafaf8] p-4">
          <p className="text-xs leading-5 text-[var(--muted)]">
            After placing the order, submit your
            Nagad transaction details and payment
            screenshot for verification.
          </p>
        </div>
      )}

      {selected === "cod" && (
        <div className="mt-5 rounded-2xl border border-[var(--border)] bg-[#fafaf8] p-4">
          <p className="text-xs leading-5 text-[var(--muted)]">
            Pay in cash when your order is
            delivered to your address.
          </p>
        </div>
      )}
    </div>
  );
}

