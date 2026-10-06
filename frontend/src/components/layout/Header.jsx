
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Heart,
  LogOut,
  ShoppingBag,
  UserRound,
} from "lucide-react";
import Link from "next/link";

import useCart from "@/hooks/useCart";
import useWishlist from "@/hooks/useWishlist";


import Logo from "../common/Logo";
import SearchBar from "../common/SearchBar";
import CartDrawer from "../cart/CartDrawer";
import AnnouncementBar from "./AnnouncementBar";
import MobileNav from "./MobileNav";
import { authClient } from "@/lib/auth-client";

const navItems = [
  { label: "Shop", href: "/products" },
  { label: "Categories", href: "/categories" },
  { label: "New Arrivals", href: "/products?sort=newest" },
  { label: "Best Sellers", href: "/products?sort=best-selling" },
];

export default function Header() {
  const router = useRouter();

  const [cartOpen, setCartOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const { totalItems: wishlistCount } = useWishlist();
  const { totalItems } = useCart();

  const { data: session, isPending } =
    authClient.useSession();

  const handleLogout = async () => {
    try {
      setLoggingOut(true);

      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            setUserMenuOpen(false);
            router.push("/");
          },
        },
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setLoggingOut(false);
    }
  };

  return (
<header className="sticky top-0 z-[100] bg-[var(--background)]">      <AnnouncementBar />

      <div className="container-main">
        <div className="hidden h-20 items-center justify-between gap-8 lg:flex">
          <Logo />

          <nav className="flex items-center gap-7">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-sm font-medium text-[var(--muted)] transition hover:text-[var(--foreground)]"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="w-full max-w-[280px]">
            <SearchBar />
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/wishlist"
              className="relative flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border)] bg-white transition hover:border-[var(--dark)]"
              aria-label="Wishlist"
            >
              <Heart
                size={18}
                strokeWidth={1.8}
              />

              {wishlistCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--dark)] px-1 text-[10px] font-bold text-white">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <div className="relative">
              {isPending ? (
                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border)] bg-white">
                  <UserRound
                    size={18}
                    strokeWidth={1.8}
                    className="text-[#aaa]"
                  />
                </div>
              ) : session ? (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setUserMenuOpen(
                        (current) => !current
                      )
                    }
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border)] bg-white transition hover:border-[var(--dark)]"
                    aria-label="Account menu"
                  >
                    <UserRound
                      size={18}
                      strokeWidth={1.8}
                    />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 top-14 w-64 rounded-2xl border border-[var(--border)] bg-white p-2 shadow-xl">
                      <div className="border-b border-[var(--border)] px-3 py-3">
                        <p className="truncate text-sm font-semibold text-[#111111]">
                          {session.user.name || "Account"}
                        </p>

                        <p className="mt-1 truncate text-xs text-[var(--muted)]">
                          {session.user.email}
                        </p>
                      </div>

                      <div className="mt-2 space-y-1">
                        <Link
                          href="/account"
                          onClick={() =>
                            setUserMenuOpen(false)
                          }
                          className="block rounded-xl px-3 py-2.5 text-sm text-[#333] transition hover:bg-[#f3f3ef]"
                        >
                          My account
                        </Link>

                        <Link
                          href="/account/profile"
                          onClick={() =>
                            setUserMenuOpen(false)
                          }
                          className="block rounded-xl px-3 py-2.5 text-sm text-[#333] transition hover:bg-[#f3f3ef]"
                        >
                          Profile
                        </Link>

                        <button
                          type="button"
                          onClick={handleLogout}
                          disabled={loggingOut}
                          className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <LogOut
                            size={16}
                            strokeWidth={1.8}
                          />

                          {loggingOut
                            ? "Signing out..."
                            : "Sign out"}
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <Link
                  href="/login"
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border)] bg-white transition hover:border-[var(--dark)]"
                  aria-label="Sign in"
                >
                  <UserRound
                    size={18}
                    strokeWidth={1.8}
                  />
                </Link>
              )}
            </div>

            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className="relative flex h-11 w-11 items-center justify-center rounded-full bg-[var(--dark)] text-white transition hover:opacity-80"
              aria-label="Open cart"
            >
              <ShoppingBag
                size={18}
                strokeWidth={1.8}
              />

              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--accent)] px-1 text-[10px] font-bold text-black">
                {totalItems}
              </span>
            </button>
          </div>
        </div>

        <MobileNav />
      </div>

      <div className="hidden border-b border-[var(--border)] lg:block" />

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
      />
    </header>
  );
}
