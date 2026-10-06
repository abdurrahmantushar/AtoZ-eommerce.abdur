"use client";

import Link from "next/link";
import {
  Minus,
  Plus,
  ShoppingBag,
  X,
  ArrowRight,
  Trash2,
  Truck,
} from "lucide-react";

import useCart from "@/hooks/useCart";

export default function CartDrawer({
  open,
  onClose,
}) {
  const {
    items,
    subtotal,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-50 bg-[#111111]/45 backdrop-blur-[3px]"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed right-0 top-0 z-[60] flex rounded-l-2xl h-dvh w-full max-w-[460px] flex-col bg-[#f8f8f5] transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] ${open
            ? "translate-x-0"
            : "translate-x-full"
          }`}
      >
        <header className="relative shrink-0 overflow-hidden bg-[#111111] px-6 pb-7 pt-6 text-white">
          <div className="absolute -right-16 -top-20 h-48 w-48 rounded-full bg-[#68794a]/30" />

          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-white/45">
                Your selection
              </p>

<div className="mt-2 flex items-center justify-between gap-4">
  <div className="flex items-center gap-3">
    <h2 className="text-3xl font-semibold tracking-[-0.06em]">
      Bag
    </h2>

    <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-[#dce8c9] px-2 text-[10px] font-bold text-[#344025]">
      {items.length}
    </span>
  </div>

  {items.length > 0 && (
    <button
      type="button"
      onClick={clearCart}
      className="group flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.16em] text-red-500 transition hover:text-white"
    >
      <span className="h-px w-4 bg-white/20 transition-all  duration-300 group-hover:w-6 group-hover:bg-white/50" />
      Remove all
    </button>
  )}
</div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition hover:bg-white hover:text-[#111111]"
              aria-label="Close cart"
            >
              <X size={17} strokeWidth={1.8} />
            </button>
          </div>

          {items.length > 0 && (
            <div className="relative mt-7">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-white/50">
                  You're shopping with us
                </span>

                <span className="font-semibold text-[#dce8c9]">
                  Free shipping
                </span>
              </div>

              <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/10">
                <div className="h-full w-full rounded-full bg-[#dce8c9]" />
              </div>
            </div>
          )}
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex min-h-full flex-col items-center justify-center px-7 text-center">
              <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-[#e9efdf]">
                <div className="absolute inset-2 rounded-full border border-[#d5dfc8]" />

                <ShoppingBag
                  size={30}
                  strokeWidth={1.4}
                  className="text-[#60703f]"
                />
              </div>

              <p className="mt-7 text-[9px] font-bold uppercase tracking-[0.25em] text-[#92978d]">
                Your bag is empty
              </p>

              <h3 className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-[#111111]">
                Nothing added yet
              </h3>

              <p className="mt-3 max-w-[280px] text-sm leading-6 text-[#858980]">
                Browse our collection and add your
                favorite products to your bag.
              </p>

              <Link
                href="/products"
                onClick={onClose}
                className="mt-7 flex h-12 items-center gap-2 rounded-full bg-[#111111] px-6 text-sm font-medium !text-white transition hover:bg-[#2c2c2c]"
              >
                Explore products
                <ArrowRight size={15} />
              </Link>
            </div>
          ) : (
            <div className="px-6 py-2">
              {items.map((item, index) => (
                <DrawerItem
                  key={`${item.id || item._id || index}-${item.selectedColor || ""}-${item.selectedSize || ""}`}
                  item={item}
                  updateQuantity={updateQuantity}
                  removeFromCart={removeFromCart}
                />
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <footer className="shrink-0 bg-[#f8f8f5] px-5 pb-5 pt-3">
            <div className="rounded-[28px] bg-[#111111] p-5 text-white shadow-[0_15px_45px_rgba(0,0,0,0.16)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/40">
                    Subtotal
                  </p>

                  <p className="mt-1 text-2xl font-semibold tracking-[-0.04em]">
                    ${Number(subtotal || 0).toFixed(2)}
                  </p>
                </div>

                <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-2">
                  <Truck
                    size={13}
                    className="text-[#dce8c9]"
                  />

                  <span className="text-[9px] font-medium text-white/60">
                    Shipping at checkout
                  </span>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-[0.75fr_1.25fr] gap-2">
                <Link
                  href="/cart"
                  onClick={onClose}
                  className="flex h-12 items-center justify-center rounded-full bg-white/10 text-xs font-medium text-white transition hover:bg-white/15"
                >
                  View bag
                </Link>

                <Link
                  href="/checkout"
                  onClick={onClose}
                  className="flex h-12 items-center justify-center gap-2 rounded-full bg-[#60740a] text-xs font-semibold text-[#000000] transition hover:bg-white"
                >
                  Checkout
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </footer>
        )}
      </aside>
    </>
  );
}

function DrawerItem({
  item,
  updateQuantity,
  removeFromCart,
}) {
  const productId =
    item.id ||
    item._id ||
    item.product?._id;

  const image =
    item.image ||
    item.images?.[0] ||
    item.product?.images?.[0] ||
    "";

  const name =
    item.name ||
    item.product?.name ||
    "Product";

  const price = Number(
    item.price ||
    item.product?.price ||
    0
  );

  const quantity =
    Number(item.quantity) || 1;

  const category =
    item.category?.name ||
    item.category ||
    item.product?.category?.name ||
    "";

  return (
    <div className="relative flex gap-4 border-b border-[#e3e5de] py-5">
      <Link
        href={`/products/${productId}`}
        className="relative h-[112px] w-[92px] shrink-0 overflow-hidden rounded-[18px] bg-[#e9ece5]"
      >
        {image ? (
          <img
            src={image}
            alt={name}
            className="h-full w-full object-cover transition duration-500 hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[9px] text-[#999999]">
            No image
          </div>
        )}

        <span className="absolute bottom-2 left-2 rounded-full bg-white/90 px-2 py-1 text-[9px] font-bold text-[#111111]">
          {quantity}
        </span>
      </Link>

      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 pr-5">
              {category && (
                <p className="text-[8px] font-bold uppercase tracking-[0.18em] text-[#969b91]">
                  {category}
                </p>
              )}

              <Link
                href={`/products/${productId}`}
                className="mt-1.5 block text-[13px] font-semibold leading-5 tracking-[-0.015em] text-[#111111] hover:text-[#60703f]"
              >
                {name}
              </Link>
            </div>

            <button
              type="button"
              onClick={() =>
                removeFromCart(
                  productId,
                  item.selectedColor,
                  item.selectedSize
                )
              }
              className="absolute right-0 top-5 flex h-7 w-7 items-center justify-center rounded-full text-[#a0a39c] transition hover:bg-red-50 hover:text-red-500"
              aria-label="Remove item"
            >
              <Trash2
                size={13}
                strokeWidth={1.7}
              />
            </button>
          </div>

          {(item.selectedColor ||
            item.selectedSize) && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {item.selectedColor && (
                  <span className="rounded-md bg-[#f0f2ed] px-2 py-1 text-[9px] text-[#777d72]">
                    {item.selectedColor}
                  </span>
                )}

                {item.selectedSize && (
                  <span className="rounded-md bg-[#f0f2ed] px-2 py-1 text-[9px] text-[#777d72]">
                    {item.selectedSize}
                  </span>
                )}
              </div>
            )}
        </div>

        <div className="flex items-end justify-between gap-3">
          <div className="flex h-8 items-center rounded-full border border-[#dfe2d9] bg-[#fafaf8]">
            <button
              type="button"
              onClick={() =>
                updateQuantity(
                  productId,
                  quantity - 1,
                  item.selectedColor,
                  item.selectedSize
                )
              }
              disabled={quantity <= 1}
              className="flex h-8 w-8 items-center justify-center rounded-full text-[#111111] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-30"
              aria-label="Decrease quantity"
            >
              <Minus size={11} />
            </button>

            <span className="w-6 text-center text-[10px] font-bold">
              {quantity}
            </span>

            <button
              type="button"
              onClick={() =>
                updateQuantity(
                  productId,
                  quantity + 1,
                  item.selectedColor,
                  item.selectedSize
                )
              }
              className="flex h-8 w-8 items-center justify-center rounded-full text-[#111111] transition hover:bg-white"
              aria-label="Increase quantity"
            >
              <Plus size={11} />
            </button>
          </div>

          <div className="text-right">
            <p className="text-[8px] uppercase tracking-[0.12em] text-[#9a9e96]">
              Total
            </p>

            <p className="mt-0.5 text-sm font-bold tracking-[-0.02em] text-[#111111]">
              ${(price * quantity).toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}