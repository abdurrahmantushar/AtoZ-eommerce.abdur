"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  Boxes,
  FolderTree,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  PanelsTopLeft,
  Settings,
  ShoppingCart,
  TicketPercent,
  Users,
} from "lucide-react";

import { authClient } from "@/lib/auth-client";

const navItems = [
  {
    label: "Overview",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    label: "Products",
    href: "/admin/products",
    icon: Boxes,
  },
  {
    label: "Categories",
    href: "/admin/categories",
    icon: FolderTree,
  },
  {
    label: "Orders",
    href: "/admin/orders",
    icon: ShoppingCart,
  },
  {
    label: "Customers",
    href: "/admin/customers",
    icon: Users,
  },
  {
    label: "Coupons",
    href: "/admin/coupons",
    icon: TicketPercent,
  },
  {
    label: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
  },
  {
    label: "Reviews",
    href: "/admin/reviews",
    icon: MessageSquare,
  },
  {
    label: "Hero Settings",
    href: "/admin/dashboard/hero",
    icon: PanelsTopLeft,
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await authClient.signOut();
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Admin logout error:", error);
    }
  };

  return (
    <aside className="hidden w-[250px] shrink-0 border-r border-[var(--border)] bg-white lg:flex lg:flex-col">
      <div className="flex h-20 items-center border-b border-[var(--border)] px-6">
        <Link
          href="/admin"
          className="text-2xl font-semibold tracking-[-0.05em] text-[#111111]"
        >
          AtoZ

          <span className="ml-2 text-xs font-medium uppercase tracking-[0.14em] text-[#999991]">
            Admin
          </span>
        </Link>
      </div>

      <div className="flex-1 p-4">
        <p className="px-3 pb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#999991]">
          Management
        </p>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;

            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition ${
                  active
                    ? "bg-[#111111] font-medium text-white"
                    : "text-[#666666] hover:bg-[#f4f4f1] hover:text-[#111111]"
                }`}
              >
                <Icon size={18} strokeWidth={1.8} />

                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="my-6 h-px bg-[var(--border)]" />

        <p className="px-3 pb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#999991]">
          System
        </p>

        <Link
          href="/admin/settings"
          className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition ${
            pathname.startsWith("/admin/settings")
              ? "bg-[#111111] font-medium text-white"
              : "text-[#666666] hover:bg-[#f4f4f1] hover:text-[#111111]"
          }`}
        >
          <Settings size={18} strokeWidth={1.8} />

          Settings
        </Link>
      </div>

      <div className="border-t border-[var(--border)] p-4">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-[#666666] transition hover:bg-red-50 hover:text-red-500"
        >
          <LogOut size={18} strokeWidth={1.8} />

          Sign out
        </button>
      </div>
    </aside>
  );
}