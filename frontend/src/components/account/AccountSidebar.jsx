"use client";

import Link from "next/link";
import {
  Heart,
  LayoutDashboard,
  LogOut,
  MapPin,
  Package,
  Truck,
  UserRound,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

const links = [
  {
    label: "Overview",
    href: "/account",
    icon: UserRound,
  },
  {
    label: "My orders",
    href: "/account/orders",
    icon: Package,
  },
  {
    label: "Track order",
    href: "/track-order",
    icon: Truck,
  },
  {
    label: "Wishlist",
    href: "/wishlist",
    icon: Heart,
  },
  {
    label: "Addresses",
    href: "/account/addresses",
    icon: MapPin,
  },
];

export default function AccountSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const {
    data: session,
    isPending,
  } = authClient.useSession();

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/");
          router.refresh();
        },
      },
    });
  };

  if (isPending) {
    return (
      <aside className="rounded-[24px] bg-white p-4">
        <div className="flex items-center gap-3 border-b border-[var(--border)] px-3 pb-5">
          <div className="h-12 w-12 animate-pulse rounded-full bg-[#eeeeea]" />

          <div className="min-w-0 flex-1">
            <div className="h-4 w-28 animate-pulse rounded bg-[#eeeeea]" />

            <div className="mt-2 h-3 w-36 animate-pulse rounded bg-[#eeeeea]" />
          </div>
        </div>
      </aside>
    );
  }

  if (!session) {
    return null;
  }

  const user = session.user;
  const isAdmin = user.role === "admin";

  const initials = getInitials(
    user.name || "User"
  );

  return (
    <aside className="rounded-[24px] bg-white p-4">
      <div className="flex items-center gap-3 border-b border-[var(--border)] px-3 pb-5">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#111111] text-sm font-semibold !text-white">
          {initials}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-semibold">
              {user.name || "User"}
            </p>

            <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-[8px] font-semibold uppercase tracking-[0.1em] ${
                isAdmin
                  ? "bg-[#111111] text-white"
                  : "bg-[#f0f0ec] text-[#666666]"
              }`}
            >
              {isAdmin ? "Admin" : "Customer"}
            </span>
          </div>

          <p className="mt-1 truncate text-xs text-[var(--muted)]">
            {user.email}
          </p>
        </div>
      </div>

      <nav className="mt-4 space-y-1">
        {links.map((link) => {
          const Icon = link.icon;

          const active =
            pathname === link.href ||
            (link.href !== "/account" &&
              pathname.startsWith(link.href));

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition ${
                active
                  ? "bg-[#111111] !text-white"
                  : "text-[var(--muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--foreground)]"
              }`}
            >
              <Icon
                size={17}
                strokeWidth={1.7}
              />

              <span>{link.label}</span>
            </Link>
          );
        })}

        {isAdmin && (
          <Link
            href="/admin"
            className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition ${
              pathname.startsWith("/admin")
                ? "bg-[#111111] !text-white"
                : "text-[var(--muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--foreground)]"
            }`}
          >
            <LayoutDashboard
              size={17}
              strokeWidth={1.7}
            />

            <span>Admin dashboard</span>
          </Link>
        )}
      </nav>

      <div className="mt-4 border-t border-[var(--border)] pt-4">
        <button
          type="button"
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-[var(--muted)] transition hover:bg-[var(--surface-soft)] hover:text-[var(--foreground)]"
        >
          <LogOut
            size={17}
            strokeWidth={1.7}
          />

          Sign out
        </button>
      </div>
    </aside>
  );
}

function getInitials(name) {
  const parts = name.trim().split(/\s+/);

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${
    parts[parts.length - 1][0]
  }`.toUpperCase();
}