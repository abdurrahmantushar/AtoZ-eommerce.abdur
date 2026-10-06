"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  Mail,
  Phone,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";

export default function ProfileOverview() {
  const {
    data: session,
    isPending,
  } = authClient.useSession();

  if (isPending) {
    return (
      <div className="rounded-[24px] bg-white p-6 sm:p-7">
        <p className="text-sm text-[var(--muted)]">
          Loading profile...
        </p>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const user = session.user;

  const isAdmin = user.role === "admin";

  const memberSince = user.createdAt
    ? new Date(user.createdAt).getFullYear()
    : "—";

  return (
    <div className="rounded-[24px] bg-white p-6 sm:p-7">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
              Profile
            </p>

            <span
              className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${
                isAdmin
                  ? "bg-[#111111] text-white"
                  : "bg-[#f0f0ec] text-[#666666]"
              }`}
            >
              {isAdmin
                ? "Admin"
                : "Customer"}
            </span>
          </div>

          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
            {user.name || "User"}
          </h2>

          <p className="mt-2 text-sm text-[var(--muted)]">
            {isAdmin
              ? "Administrator"
              : `Member since ${memberSince}`}
          </p>
        </div>

        <Link
          href={
            isAdmin
              ? "/admin"
              : "/account/profile"
          }
          className="group inline-flex w-fit items-center gap-2 rounded-full border border-[var(--border)] px-4 py-2.5 text-xs font-medium transition hover:border-[#111111]"
        >
          {isAdmin
            ? "Admin dashboard"
            : "Edit profile"}

          <ArrowUpRight
            size={14}
            className="transition-transform duration-300 group-hover:rotate-45"
          />
        </Link>
      </div>

      <div className="mt-7 grid gap-4 sm:grid-cols-2">
        <Info
          icon={
            <Mail
              size={17}
              strokeWidth={1.7}
            />
          }
          label="Email"
          value={user.email}
        />

        <Info
          icon={
            <Phone
              size={17}
              strokeWidth={1.7}
            />
          }
          label="Phone"
          value={
            user.phone ||
            user.phoneNumber ||
            "Not added yet"
          }
        />
      </div>
    </div>
  );
}

function Info({
  icon,
  label,
  value,
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-[#f7f7f5] p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
          {label}
        </p>

        <p className="mt-1 truncate text-sm font-medium">
          {value}
        </p>
      </div>
    </div>
  );
}

