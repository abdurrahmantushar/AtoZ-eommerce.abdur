"use client";

import {
  Menu,
  Search,
  ShoppingBag,
  UserRound,
  Heart,
  X,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import Logo from "../common/Logo";
import useCart from "@/hooks/useCart";
import useWishlist from "@/hooks/useWishlist";

const navItems = [
  { label: "Shop", href: "/products" },
  { label: "Categories", href: "/categories" },
  { label: "New Arrivals", href: "/products?sort=newest" },
  { label: "Best Sellers", href: "/products?sort=best-selling" },
];

export default function MobileNav() {
  const [open, setOpen] = useState(false);

  const { totalItems } = useCart();
  const { totalItems: wishlistCount } = useWishlist();

  return (
    <div className="relative z-[110] lg:hidden">
      <div className="flex h-16 items-center justify-between">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-white"
          aria-label="Open menu"
        >
          <Menu size={19} strokeWidth={1.8} />
        </button>

        <Logo />

        <div className="flex items-center gap-1">
          <Link
            href="/search"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-white"
            aria-label="Search"
          >
            <Search size={18} strokeWidth={1.8} />
          </Link>

          <Link
            href="/cart"
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-white"
            aria-label="Cart"
          >
            <ShoppingBag size={18} strokeWidth={1.8} />

            {totalItems > 0 && (
              <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--dark)] px-1 text-[9px] font-semibold text-white">
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-[999] bg-[#111111]">
          <div className="flex h-full w-full flex-col bg-white">
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-[#e8e8e3] px-5">
              <Logo />

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f2f2ee] text-[#111111] transition hover:bg-[#e7e7e2]"
                aria-label="Close menu"
              >
                <X size={19} strokeWidth={1.8} />
              </button>
            </div>

            <div className="flex flex-1 flex-col overflow-y-auto px-5 py-7">
              <div className="mb-3">
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#999991]">
                  Navigation
                </span>
              </div>

              <nav className="flex flex-col">
                {navItems.map((item, index) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="group flex items-center justify-between border-b border-[#e8e8e3] py-5 text-[22px] font-medium tracking-[-0.03em] text-[#111111]"
                  >
                    <span>
                      <span className="mr-3 text-[10px] font-medium tracking-[0.15em] text-[#aaa]">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      {item.label}
                    </span>

                    <ArrowUpRight
                      size={19}
                      strokeWidth={1.7}
                      className="text-[#999991] transition duration-300 group-hover:rotate-45 group-hover:text-[#111111]"
                    />
                  </Link>
                ))}
              </nav>

              <div className="mt-7">
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#999991]">
                  Your Space
                </span>

                <div className="mt-3 space-y-2">
                  <Link
                    href="/account"
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between rounded-[20px] bg-[#f5f5f2] px-5 py-4 text-[#111111]"
                  >
                    <span className="flex items-center gap-3 text-sm font-medium">
                      <UserRound size={18} strokeWidth={1.8} />
                      My Account
                    </span>

                    <ArrowUpRight size={18} strokeWidth={1.8} />
                  </Link>

                  <Link
                    href="/wishlist"
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between rounded-[20px] bg-[#f5f5f2] px-5 py-4 text-[#111111]"
                  >
                    <span className="flex items-center gap-3 text-sm font-medium">
                      <Heart size={18} strokeWidth={1.8} />
                      Wishlist
                    </span>

                    <span className="flex items-center gap-2">
                      {wishlistCount > 0 && (
                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#111111] px-1.5 text-[9px] font-semibold text-white">
                          {wishlistCount}
                        </span>
                      )}

                      <ArrowUpRight size={18} strokeWidth={1.8} />
                    </span>
                  </Link>

                  <Link
                    href="/cart"
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between rounded-[20px] bg-[#f5f5f2] px-5 py-4 text-[#111111]"
                  >
                    <span className="flex items-center gap-3 text-sm font-medium">
                      <ShoppingBag size={18} strokeWidth={1.8} />
                      Shopping Cart
                    </span>

                    <span className="flex items-center gap-2">
                      {totalItems > 0 && (
                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#111111] px-1.5 text-[9px] font-semibold text-white">
                          {totalItems}
                        </span>
                      )}

                      <ArrowUpRight size={18} strokeWidth={1.8} />
                    </span>
                  </Link>
                </div>
              </div>

              <div className="mt-auto pt-8">
                <div className="rounded-[24px] bg-[#111111] px-5 py-5 text-white">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/45">
                    AtoZ Shopping
                  </p>

                  <p className="mt-2 text-sm leading-6 text-white/70">
                    Discover fashion, tech, beauty, home and lifestyle
                    products.
                  </p>
                </div>

                <p className="mt-5 text-center text-[10px] uppercase tracking-[0.16em] text-[#aaa]">
                  Fashion · Tech · Beauty · Home · Lifestyle
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}