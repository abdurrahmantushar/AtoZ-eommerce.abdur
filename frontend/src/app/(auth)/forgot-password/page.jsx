"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2, Mail } from "lucide-react";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 900));

    setLoading(false);
    setSubmitted(true);
  };

  return (
    <div>
      <Link
        href="/login"
        className="inline-flex items-center gap-2 text-sm font-medium text-[#666666] transition hover:text-[#111111]"
      >
        <ArrowLeft size={16} strokeWidth={1.8} />
        Back to sign in
      </Link>

      {!submitted ? (
        <>
          <div className="mt-10">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#999991]">
              Account recovery
            </span>

            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-[#111111]">
              Forgot your password?
            </h1>

            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
              Enter the email connected to your AtoZ account and we'll send
              you instructions to reset your password.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
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
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-2xl border border-[var(--border)] bg-white py-3.5 pl-11 pr-4 text-sm text-[#111111] outline-none transition placeholder:text-[#aaa] focus:border-[#111111]"
                />
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
              {loading ? "Sending instructions..." : "Send reset link"}

              {!loading && <ArrowRight size={17} strokeWidth={1.8} />}
            </button>
          </form>
        </>
      ) : (
        <div className="mt-10">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#111111] text-white">
            <CheckCircle2 size={27} strokeWidth={1.7} />
          </div>

          <h1 className="mt-6 text-4xl font-semibold tracking-[-0.05em] text-[#111111]">
            Check your inbox
          </h1>

          <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
            We've sent password reset instructions to{" "}
            <span className="font-medium text-[#111111]">{email}</span>.
            Check your inbox and follow the link to continue.
          </p>

          <div className="mt-7 rounded-2xl bg-[#f0f0ec] p-4 text-sm leading-6 text-[#666]">
            Didn't receive anything? Check your spam folder or try again with
            the correct email address.
          </div>

          <Link
            href="/login"
            className="mt-7 flex w-full items-center justify-center rounded-2xl bg-[#111111] px-5 py-3.5 text-sm font-medium text-white transition hover:bg-[#252525]"
          >
            Back to sign in
          </Link>
        </div>
      )}
    </div>
  );
}