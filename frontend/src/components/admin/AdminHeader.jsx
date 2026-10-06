
"use client";

import Link from "next/link";
import {
  Bell,
  ExternalLink,
  Menu,
} from "lucide-react";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";

export default function AdminHeader({
  onMenuClick,
}) {
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    const loadAdmin = async () => {
      try {
        const result =
          await authClient.getSession();

        if (result?.data?.user) {
          setAdmin(result.data.user);
        }
      } catch (error) {
        console.error(
          "Admin session error:",
          error
        );
      }
    };

    loadAdmin();
  }, []);

  const adminName =
    admin?.name ||
    admin?.email ||
    "Admin";

  const initials = adminName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <header className="sticky top-0 z-30 h-20 border-b border-[var(--border)] bg-white/95 backdrop-blur-md">
      <div className="flex h-full items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] text-[#555] lg:hidden"
            aria-label="Open admin navigation"
          >
            <Menu
              size={18}
              strokeWidth={1.8}
            />
          </button>

          <div>
            <p className="text-xs text-[#999991]">
              Admin workspace
            </p>

            <h1 className="text-sm font-semibold text-[#111111] sm:text-base">
              Store overview
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/"
            target="_blank"
            className="hidden items-center gap-2 rounded-full border border-[var(--border)] px-4 py-2.5 text-xs font-medium text-[#555] transition hover:border-[#111111] hover:text-[#111111] sm:flex"
          >
            View store

            <ExternalLink
              size={14}
              strokeWidth={1.8}
            />
          </Link>

          <button
            type="button"
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] text-[#555]"
            aria-label="Notifications"
          >
            <Bell
              size={17}
              strokeWidth={1.8}
            />

            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#111111]" />
          </button>

          <div
            title={adminName}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#111111] text-xs font-semibold text-white"
          >
            {initials || "AD"}
          </div>
        </div>
      </div>
    </header>
  );
}
