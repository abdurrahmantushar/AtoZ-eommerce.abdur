"use client";

import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export default function CheckoutSummary({
  items = [],
  subtotal = 0,
  shippingCost = 0,
  discount = 0,
  total,
  onPlaceOrder,
  placingOrder = false,
}) {
  const finalTotal =
    typeof total === "number"
      ? total
      : subtotal +
        shippingCost -
        discount;

  return (
    <aside className="rounded-[28px] border border-[var(--border)] bg-white p-5 sm:p-6 lg:sticky lg:top-28">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#999991]">
            Your order
          </span>

          <h2 className="mt-1 text-xl font-semibold tracking-[-0.03em] text-[#111111]">
            Summary
          </h2>
        </div>

        <span className="rounded-full bg-[#f0f0ec] px-3 py-1.5 text-xs font-medium text-[#555555]">
          {items.length}{" "}
          {items.length === 1
            ? "item"
            : "items"}
        </span>
      </div>

      <div className="mt-6 max-h-[280px] space-y-4 overflow-y-auto pr-1">
        {items.map((item, index) => {
          const itemId =
            item.id ||
            item._id ||
            item.product?._id ||
            index;

          const itemImage =
            item.image ||
            item.images?.[0] ||
            item.product?.images?.[0] ||
            "";

          const itemPrice = Number(
            item.price ||
              item.product?.price ||
              0
          );

          const itemQuantity =
            Number(item.quantity) || 1;

          return (
            <div
              key={`${itemId}-${item.selectedColor || ""}-${item.selectedSize || ""}`}
              className="flex gap-3"
            >
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-[#f0f0ec]">
                {itemImage ? (
                  <img
                    src={itemImage}
                    alt={item.name || "Product"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[10px] text-[#999999]">
                    No image
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[#111111]">
                  {item.name ||
                    item.product?.name ||
                    "Product"}
                </p>

                <p className="mt-1 text-xs text-[#888880]">
                  Qty: {itemQuantity}
                </p>

                {(item.selectedColor ||
                  item.selectedSize) && (
                  <p className="mt-1 text-[10px] text-[#999999]">
                    {item.selectedColor &&
                      `Color: ${item.selectedColor}`}

                    {item.selectedColor &&
                      item.selectedSize &&
                      " • "}

                    {item.selectedSize &&
                      `Size: ${item.selectedSize}`}
                  </p>
                )}

                <p className="mt-2 text-sm font-semibold text-[#111111]">
                  $
                  {(
                    itemPrice *
                    itemQuantity
                  ).toFixed(2)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="my-6 h-px bg-[var(--border)]" />

      <div className="space-y-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-[#777777]">
            Subtotal
          </span>

          <span className="font-medium text-[#111111]">
            ${Number(subtotal).toFixed(2)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[#777777]">
            Shipping
          </span>

          <span className="font-medium text-[#111111]">
            {Number(shippingCost) === 0
              ? "Free"
              : `$${Number(
                  shippingCost
                ).toFixed(2)}`}
          </span>
        </div>

        {Number(discount) > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-[#60703f]">
              Discount
            </span>

            <span className="font-medium text-[#60703f]">
              -$
              {Number(discount).toFixed(2)}
            </span>
          </div>
        )}
      </div>

      <div className="my-6 h-px bg-[var(--border)]" />

      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs text-[#888880]">
            Total
          </p>

          <p className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-[#111111]">
            $
            {Number(finalTotal).toFixed(2)}
          </p>
        </div>

        <span className="text-[10px] uppercase tracking-[0.14em] text-[#999991]">
          USD
        </span>
      </div>

      <button
        type="button"
        onClick={onPlaceOrder}
        disabled={
          placingOrder ||
          items.length === 0
        }
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#111111] px-5 py-4 text-sm font-medium text-white transition hover:bg-[#252525] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {placingOrder
          ? "Placing order..."
          : "Place order"}

        {!placingOrder && (
          <ArrowRight
            size={17}
            strokeWidth={1.8}
          />
        )}
      </button>

      <div className="mt-5 flex items-start gap-3 rounded-2xl bg-[#f7f7f5] p-4">
        <ShieldCheck
          size={18}
          strokeWidth={1.8}
          className="mt-0.5 shrink-0 text-[#666666]"
        />

        <p className="text-xs leading-5 text-[#777777]">
          Your order details are protected.
          Secure authentication and payment
          processing are connected to the
          backend.
        </p>
      </div>

      <Link
        href="/cart"
        className="mt-5 block text-center text-xs font-medium text-[#666666] underline underline-offset-4 transition hover:text-[#111111]"
      >
        Return to cart
      </Link>
    </aside>
  );
}

