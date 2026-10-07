"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
} from "lucide-react";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export default function LoginPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
    remember: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const updateField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (error) {
      setError("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!form.email.trim() || !form.password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

const { error: signInError } =
  await authClient.signIn.email({
    email: form.email.trim(),
    password: form.password,
    rememberMe: form.remember,
  });

if (signInError) {
  setError(
    signInError.message ||
      "Invalid email or password."
  );
  return;
}

router.replace("/account");
router.refresh();

    } catch (error) {
      console.error("Login error:", error);

      setError(
        error?.message ||
          "Something went wrong while signing in."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div>
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#999991]">
          Welcome back
        </span>

        <h2 className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-[#111111]">
          Sign in to AtoZ
        </h2>

        <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
          Access your orders, wishlist, addresses, and account settings.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-8 space-y-5"
      >
        <div>
          <label className="mb-2 block text-xs font-medium text-[#555]">
            Email address
          </label>

          <div className="relative">
            <Mail
              size={17}
              strokeWidth={1.8}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#999]"
            />

            <input
              type="email"
              value={form.email}
              onChange={(event) =>
                updateField(
                  "email",
                  event.target.value
                )
              }
              placeholder="you@example.com"
              autoComplete="email"
              required
              className="w-full rounded-2xl border border-[var(--border)] bg-white py-3.5 pl-11 pr-4 text-sm text-[#111111] outline-none transition placeholder:text-[#aaa] focus:border-[#111111]"
            />
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="block text-xs font-medium text-[#555]">
              Password
            </label>

            <Link
              href="/forgot-password"
              className="text-xs font-medium text-[#666] transition hover:text-[#111111]"
            >
              Forgot password?
            </Link>
          </div>

          <div className="relative">
            <LockKeyhole
              size={17}
              strokeWidth={1.8}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#999]"
            />

            <input
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              value={form.password}
              onChange={(event) =>
                updateField(
                  "password",
                  event.target.value
                )
              }
              placeholder="Enter your password"
              autoComplete="current-password"
              required
              className="w-full rounded-2xl border border-[var(--border)] bg-white py-3.5 pl-11 pr-12 text-sm text-[#111111] outline-none transition placeholder:text-[#aaa] focus:border-[#111111]"
            />

            <button
              type="button"
              onClick={() =>
                setShowPassword(
                  (current) => !current
                )
              }
              className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-[#777] transition hover:bg-[#f3f3ef] hover:text-[#111111]"
              aria-label={
                showPassword
                  ? "Hide password"
                  : "Show password"
              }
            >
              {showPassword ? (
                <EyeOff
                  size={17}
                  strokeWidth={1.8}
                />
              ) : (
                <Eye
                  size={17}
                  strokeWidth={1.8}
                />
              )}
            </button>
          </div>
        </div>

        <label className="flex cursor-pointer items-center gap-3 text-sm text-[#666]">
          <input
            type="checkbox"
            checked={form.remember}
            onChange={(event) =>
              updateField(
                "remember",
                event.target.checked
              )
            }
            className="h-4 w-4 rounded border-gray-300 accent-[#111111]"
          />

          Keep me signed in
        </label>

        {error && (
          <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#111111] px-5 py-3.5 text-sm font-medium text-white transition hover:bg-[#252525] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Sign in"}

          {!loading && (
            <ArrowRight
              size={17}
              strokeWidth={1.8}
            />
          )}
        </button>
      </form>

      <div className="my-7 flex items-center gap-4">
        <div className="h-px flex-1 bg-[var(--border)]" />

        <span className="text-xs uppercase tracking-[0.14em] text-[#aaa]">
          Or
        </span>

        <div className="h-px flex-1 bg-[var(--border)]" />
      </div>

      <button
        type="button"
        className="flex w-full items-center justify-center gap-3 rounded-2xl border border-[var(--border)] bg-white px-5 py-3.5 text-sm font-medium text-[#111111] transition hover:bg-[#f6f6f3]"
      >
        <span className="text-base font-semibold">
          G
        </span>

        Continue with Google
      </button>

      <p className="mt-8 text-center text-sm text-[var(--muted)]">
        Don't have an account?{" "}
        <Link
          href="/register"
          className="font-semibold text-[#111111] underline underline-offset-4"
        >
          Create one
        </Link>
      </p>
    </div>
  );
}