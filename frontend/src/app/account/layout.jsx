"use client";

import { authClient } from "@/lib/auth-client";

export default function AccountLayout({ children }) {
  const {
    data: session,
    isPending,
  } = authClient.useSession();

  if (isPending) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--background)]">
        <p className="text-sm text-[var(--muted)]">
          Loading account...
        </p>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--background)]">
        <p className="text-sm text-[var(--muted)]">
          Please sign in to view your account.
        </p>
      </main>
    );
  }

  return children;
}