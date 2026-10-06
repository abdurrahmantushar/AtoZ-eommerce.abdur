"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, Eye, EyeOff, LockKeyhole } from "lucide-react";
import { useMemo, useState } from "react";

export default function ResetPasswordPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [form, setForm] = useState({
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const passwordChecks = useMemo(
    () => ({
      length: form.password.length >= 8,
      number: /\d/.test(form.password),
      letter: /[A-Za-z]/.test(form.password),
    }),
    [form.password]
  );

  const updateField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!form.password || !form.confirmPassword) {
      setError("Please enter your new password.");
      return;
    }

    if (
      !passwordChecks.length ||
      !passwordChecks.number ||
      !passwordChecks.letter
    ) {
      setError(
        "Password must contain at least 8 characters, one letter, and one number."
      );
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 900));

    setLoading(false);
    setSuccess(true);
  };

  if (success) {
    return (
      <div>
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#111111] text-white">
          <Check size={27} strokeWidth={2} />
        </div>

        <span className="mt-7 block text-xs font-semibold uppercase tracking-[0.18em] text-[#999991]">
          Password updated
        </span>

        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-[#111111]">
          You're all set.
        </h1>

        <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
          Your AtoZ password has been updated successfully. You can now sign
          in with your new password.
        </p>

        <Link
          href="/login"
          className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#111111] px-5 py-3.5 text-sm font-medium text-white transition hover:bg-[#252525]"
        >
          Continue to sign in
          <ArrowRight size={17} strokeWidth={1.8} />
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/login"
        className="inline-flex items-center gap-2 text-sm font-medium text-[#666666] transition hover:text-[#111111]"
      >
        <ArrowLeft size={16} strokeWidth={1.8} />
        Back to sign in
      </Link>

      <div className="mt-10">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#999991]">
          Password reset
        </span>

        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-[#111111]">
          Create a new password
        </h1>

        <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
          Choose a strong password you haven't used before.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div>
          <label className="mb-2 block text-xs font-medium text-[#555]">
            New password
          </label>

          <div className="relative">
            <LockKeyhole
              size={17}
              strokeWidth={1.8}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#999]"
            />

            <input
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={(event) =>
                updateField("password", event.target.value)
              }
              placeholder="Enter your new password"
              className="w-full rounded-2xl border border-[var(--border)] bg-white py-3.5 pl-11 pr-12 text-sm text-[#111111] outline-none transition placeholder:text-[#aaa] focus:border-[#111111]"
            />

            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-[#777] transition hover:bg-[#f3f3ef] hover:text-[#111111]"
            >
              {showPassword ? (
                <EyeOff size={17} strokeWidth={1.8} />
              ) : (
                <Eye size={17} strokeWidth={1.8} />
              )}
            </button>
          </div>

          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            <PasswordCheck
              active={passwordChecks.length}
              text="8+ characters"
            />

            <PasswordCheck
              active={passwordChecks.letter}
              text="One letter"
            />

            <PasswordCheck
              active={passwordChecks.number}
              text="One number"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-xs font-medium text-[#555]">
            Confirm password
          </label>

          <div className="relative">
            <LockKeyhole
              size={17}
              strokeWidth={1.8}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#999]"
            />

            <input
              type={showConfirmPassword ? "text" : "password"}
              value={form.confirmPassword}
              onChange={(event) =>
                updateField("confirmPassword", event.target.value)
              }
              placeholder="Repeat your new password"
              className="w-full rounded-2xl border border-[var(--border)] bg-white py-3.5 pl-11 pr-12 text-sm text-[#111111] outline-none transition placeholder:text-[#aaa] focus:border-[#111111]"
            />

            <button
              type="button"
              onClick={() =>
                setShowConfirmPassword((current) => !current)
              }
              className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-[#777] transition hover:bg-[#f3f3ef] hover:text-[#111111]"
            >
              {showConfirmPassword ? (
                <EyeOff size={17} strokeWidth={1.8} />
              ) : (
                <Eye size={17} strokeWidth={1.8} />
              )}
            </button>
          </div>
        </div>

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
          {loading ? "Updating password..." : "Update password"}

          {!loading && <ArrowRight size={17} strokeWidth={1.8} />}
        </button>
      </form>
    </div>
  );
}

function PasswordCheck({ active, text }) {
  return (
    <div
      className={`flex items-center gap-1.5 text-[11px] ${
        active ? "text-[#111111]" : "text-[#aaa]"
      }`}
    >
      <span
        className={`flex h-4 w-4 items-center justify-center rounded-full ${
          active ? "bg-[#111111] text-white" : "bg-[#eeeeea]"
        }`}
      >
        <Check size={10} strokeWidth={2.2} />
      </span>

      {text}
    </div>
  );
}