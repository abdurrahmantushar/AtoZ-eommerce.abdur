"use client";

import { ShoppingBag } from "lucide-react";
import { useState } from "react";
import useCart from "@/hooks/useCart";
import CartDrawer from "@/components/cart/CartDrawer";

export default function ProductDetailsCart() {
  const [cartOpen, setCartOpen] = useState(false);

  const { items } = useCart();

  if (!items?.length) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setCartOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#111111] text-white shadow-[0_12px_35px_rgba(0,0,0,0.2)] transition hover:scale-105 hover:bg-[#252525]"
        aria-label="Open cart"
      >
        <ShoppingBag size={21} strokeWidth={1.8} />

        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#dce8c9] px-1 text-[9px] font-bold text-[#303b24]">
          {items.length}
        </span>
      </button>

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
      />
    </>
  );
}