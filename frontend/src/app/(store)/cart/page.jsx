"use client";

import Link from "next/link";
import {
  Minus,
  Plus,
  Trash2,
  ArrowRight,
  ShoppingBag,
  ShieldCheck,
  Truck,
} from "lucide-react";

import useCart from "@/hooks/useCart";

export default function CartPage() {
  const {
    items,
    subtotal,
    removeFromCart,
    updateQuantity,
    clearCart,
  } = useCart();

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-[#f5f7f0]">
        <section className="container-main flex min-h-[78vh] items-center justify-center px-5 py-20">
          <div className="w-full max-w-xl text-center">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[30px] bg-white shadow-[0_15px_50px_rgba(0,0,0,0.07)]">
              <ShoppingBag
                size={34}
                strokeWidth={1.4}
                className="text-[#60703f]"
              />
            </div>

            <p className="mt-8 text-[10px] font-bold uppercase tracking-[0.25em] text-[#7d876d]">
              Shopping bag
            </p>

            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.06em] text-[#111111] sm:text-5xl">
              Your bag is waiting.
            </h1>

            <p className="mx-auto mt-5 max-w-md text-sm leading-7 text-[#7a7d75]">
              Looks like you haven't added anything yet.
              Explore our collection and find something
              you'll love.
            </p>

            <Link
              href="/products"
              className="mx-auto mt-8 inline-flex h-13 items-center gap-2 rounded-full bg-[#111111] px-7 text-sm font-medium !text-white transition hover:bg-[#303030]"
            >
              Start shopping
              <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f7f0]">
      <section className="container-main px-5 py-10 sm:py-14 lg:py-20">
        <div className="relative overflow-hidden rounded-[32px] bg-[#e9efdf] px-6 py-10 sm:px-10 sm:py-12 lg:px-14">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/75 px-3.5 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#60703f]">
              <ShoppingBag size={13} />
              {items.length}{" "}
              {items.length === 1
                ? "item"
                : "items"}{" "}
              in your bag
            </div>

            <h1 className="mt-5 text-5xl font-semibold tracking-[-0.065em] text-[#111111] sm:text-6xl lg:text-7xl">
              Your Cart
            </h1>

            <p className="mt-4 max-w-lg text-sm leading-7 text-[#69715f] sm:text-base">
              Review your selected products, update
              quantities, and continue when you're ready.
            </p>
          </div>

          <div className="absolute -right-16 -top-24 h-64 w-64 rounded-full bg-white/30" />
          <div className="absolute -bottom-32 right-20 h-72 w-72 rounded-full bg-[#dce7cd]/60" />
        </div>

        <div className="mt-10 grid items-start gap-8 xl:grid-cols-[minmax(0,1fr)_390px]">
          <div>
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8a8e84]">
                  Selected products
                </p>

                <h2 className="mt-1 text-xl font-semibold tracking-[-0.03em] text-[#111111]">
                  Your items
                </h2>
              </div>

              <button
                type="button"
                onClick={clearCart}
                className="rounded-full border border-[#d9ddd2] bg-white px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#777b73] transition hover:border-[#111111] hover:text-[#111111]"
              >
                Clear cart
              </button>
            </div>

            <div className="space-y-4">
              {items.map((item) => (
                <CartItem
                  key={`${item.id}-${item.selectedColor}-${item.selectedSize}`}
                  item={item}
                  updateQuantity={updateQuantity}
                  removeFromCart={removeFromCart}
                />
              ))}
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-[20px] bg-white px-4 py-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eef4e5] text-[#60703f]">
                  <Truck size={17} strokeWidth={1.7} />
                </div>

                <div>
                  <p className="text-xs font-semibold text-[#111111]">
                    Fast delivery
                  </p>

                  <p className="mt-0.5 text-[10px] text-[#888b83]">
                    Reliable shipping at checkout
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-[20px] bg-white px-4 py-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eef4e5] text-[#60703f]">
                  <ShieldCheck
                    size={17}
                    strokeWidth={1.7}
                  />
                </div>

                <div>
                  <p className="text-xs font-semibold text-[#111111]">
                    Secure checkout
                  </p>

                  <p className="mt-0.5 text-[10px] text-[#888b83]">
                    Your information stays protected
                  </p>
                </div>
              </div>
            </div>
          </div>

          <aside className="sticky top-6 overflow-hidden rounded-[30px] bg-[#111111] text-white shadow-[0_20px_60px_rgba(0,0,0,0.12)]">
            <div className="p-6 sm:p-7">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/45">
                    Checkout
                  </p>

                  <h2 className="mt-1 text-xl font-semibold tracking-[-0.03em]">
                    Order summary
                  </h2>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
                  <ShoppingBag
                    size={16}
                    strokeWidth={1.7}
                  />
                </div>
              </div>

              <div className="mt-7 space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/50">
                    Subtotal
                  </span>

                  <span className="font-medium">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/50">
                    Shipping
                  </span>

                  <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-semibold">
                    FREE
                  </span>
                </div>
              </div>

              <div className="my-6 h-px bg-white/10" />

              <div className="flex items-end justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.15em] text-white/40">
                    Total
                  </p>

                  <p className="mt-1 text-3xl font-semibold tracking-[-0.05em]">
                    ${subtotal.toFixed(2)}
                  </p>
                </div>

                <span className="mb-1 text-[10px] text-white/40">
                  USD
                </span>
              </div>

              <Link
                href="/checkout"
                className="mt-7 flex h-14 items-center justify-between rounded-full bg-[#dce9c9] px-5 text-sm font-semibold text-[#27301d] transition hover:bg-white"
              >
                <span>Proceed to checkout</span>

                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#111111] text-white">
                  <ArrowRight size={15} />
                </span>
              </Link>

              <p className="mt-4 text-center text-[10px] leading-5 text-white/35">
                Shipping and taxes are calculated at
                checkout.
              </p>
            </div>

            <div className="border-t border-white/10 bg-white/[0.03] px-6 py-4 sm:px-7">
              <div className="flex items-center justify-center gap-2 text-[10px] text-white/40">
                <ShieldCheck size={13} />
                Secure and protected checkout
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

function CartItem({
  item,
  updateQuantity,
  removeFromCart,
}) {
  return (
    <div className="group relative overflow-hidden rounded-[26px] border border-[#e5e7df] bg-white p-3.5 transition duration-300 hover:border-[#d5dcc8] hover:shadow-[0_15px_45px_rgba(0,0,0,0.06)] sm:p-4">
      <div className="flex gap-4 sm:gap-5">
        <Link
          href={`/products/${item.id}`}
          className="relative h-[118px] w-[100px] shrink-0 overflow-hidden rounded-[20px] bg-[#edf0e8] sm:h-[145px] sm:w-[125px]"
        >
          <img
            src={item.image}
            alt={item.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />

          <div className="absolute bottom-2 left-2 rounded-full bg-white/90 px-2.5 py-1 text-[9px] font-bold text-[#60703f] backdrop-blur-sm">
            {item.quantity}x
          </div>
        </Link>

        <div className="flex min-w-0 flex-1 flex-col justify-between py-1">
          <div>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#8a9083]">
                  {item.category}
                </p>

                <Link
                  href={`/products/${item.id}`}
                  className="mt-1.5 block text-sm font-semibold tracking-[-0.02em] text-[#111111] transition hover:text-[#60703f] sm:text-base"
                >
                  {item.name}
                </Link>
              </div>

              <span className="shrink-0 text-sm font-bold text-[#111111] sm:text-base">
                ${(item.price * item.quantity).toFixed(2)}
              </span>
            </div>

            {(item.selectedColor ||
              item.selectedSize) && (
              <div className="mt-3 flex flex-wrap gap-2">
                {item.selectedColor && (
                  <span className="rounded-lg bg-[#f4f5f0] px-2.5 py-1.5 text-[10px] font-medium text-[#6f7569]">
                    Color: {item.selectedColor}
                  </span>
                )}

                {item.selectedSize && (
                  <span className="rounded-lg bg-[#f4f5f0] px-2.5 py-1.5 text-[10px] font-medium text-[#6f7569]">
                    Size: {item.selectedSize}
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="mt-4 flex items-end justify-between gap-3">
            <div>
              <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#999d94]">
                Quantity
              </p>

              <div className="flex h-9 items-center rounded-full bg-[#f3f5ee] px-1">
                <button
                  type="button"
                  onClick={() =>
                    updateQuantity(
                      item.id,
                      item.quantity - 1,
                      item.selectedColor,
                      item.selectedSize
                    )
                  }
                  disabled={item.quantity <= 1}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-[#111111] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <Minus size={12} />
                </button>

                <span className="w-7 text-center text-xs font-semibold text-[#111111]">
                  {item.quantity}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    updateQuantity(
                      item.id,
                      item.quantity + 1,
                      item.selectedColor,
                      item.selectedSize
                    )
                  }
                  className="flex h-7 w-7 items-center justify-center rounded-full text-[#111111] transition hover:bg-white"
                >
                  <Plus size={12} />
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                removeFromCart(
                  item.id,
                  item.selectedColor,
                  item.selectedSize
                )
              }
              className="group/remove flex items-center gap-1.5 rounded-full px-2 py-2 text-[10px] font-medium text-[#999d94] transition hover:bg-red-50 hover:text-red-500"
              aria-label="Remove item"
            >
              <Trash2
                size={13}
                strokeWidth={1.7}
                className="transition-transform group-hover/remove:scale-110"
              />

              <span className="hidden sm:inline">
                Remove
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}