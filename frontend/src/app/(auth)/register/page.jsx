
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  User,
} from "lucide-react";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";


export default function RegisterPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    terms: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    if (error) {
      setError("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const { error: signUpError } =
        await authClient.signUp.email({
          name: `${form.firstName.trim()} ${form.lastName.trim()}`,
          email: form.email.trim(),
          password: form.password,
        });

      if (signUpError) {
        setError(
          signUpError.message ||
            "Unable to create your account."
        );
        return;
      }

      router.push("/account");
    } catch (error) {
      console.error("Register error:", error);

      setError(
        error?.message ||
          "Something went wrong while creating your account."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div>
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#999991]">
          Create account
        </span>

        <h2 className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-[#111111]">
          Join AtoZ
        </h2>

        <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
          Create your account and make every shopping experience easier.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-8 space-y-5"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Field
            label="First name"
            value={form.firstName}
            onChange={(value) =>
              updateField("firstName", value)
            }
            placeholder="Alex"
            icon={User}
            required
          />

          <Field
            label="Last name"
            value={form.lastName}
            onChange={(value) =>
              updateField("lastName", value)
            }
            placeholder="Taylor"
            required
          />
        </div>

        <Field
          label="Email address"
          type="email"
          value={form.email}
          onChange={(value) =>
            updateField("email", value)
          }
          placeholder="you@example.com"
          icon={Mail}
          required
        />

        <div>
          <label className="mb-2 block text-xs font-medium text-[#555555]">
            Password
          </label>

          <div className="relative">
            <LockKeyhole
              size={17}
              strokeWidth={1.8}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#999999]"
            />

            <input
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={(event) =>
                updateField(
                  "password",
                  event.target.value
                )
              }
              placeholder="Create a password"
              autoComplete="new-password"
              required
              className="w-full rounded-2xl border border-[var(--border)] bg-white py-3.5 pl-11 pr-12 text-sm text-[#111111] outline-none transition placeholder:text-[#aaa] focus:border-[#111111]"
            />

            <button
              type="button"
              onClick={() =>
                setShowPassword((current) => !current)
              }
              className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-[#777777] transition hover:bg-[#f3f3ef]"
              aria-label={
                showPassword
                  ? "Hide password"
                  : "Show password"
              }
            >
              {showPassword ? (
                <EyeOff size={17} />
              ) : (
                <Eye size={17} />
              )}
            </button>
          </div>

          <p className="mt-3 text-xs text-[#999999]">
            Use at least 8 characters.
          </p>
        </div>

        <div>
          <label className="mb-2 block text-xs font-medium text-[#555555]">
            Confirm password
          </label>

          <div className="relative">
            <LockKeyhole
              size={17}
              strokeWidth={1.8}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#999999]"
            />

            <input
              type={
                showConfirmPassword
                  ? "text"
                  : "password"
              }
              value={form.confirmPassword}
              onChange={(event) =>
                updateField(
                  "confirmPassword",
                  event.target.value
                )
              }
              placeholder="Repeat your password"
              autoComplete="new-password"
              required
              className="w-full rounded-2xl border border-[var(--border)] bg-white py-3.5 pl-11 pr-12 text-sm text-[#111111] outline-none transition placeholder:text-[#aaa] focus:border-[#111111]"
            />

            <button
              type="button"
              onClick={() =>
                setShowConfirmPassword(
                  (current) => !current
                )
              }
              className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-[#777777] transition hover:bg-[#f3f3ef]"
              aria-label={
                showConfirmPassword
                  ? "Hide confirm password"
                  : "Show confirm password"
              }
            >
              {showConfirmPassword ? (
                <EyeOff size={17} />
              ) : (
                <Eye size={17} />
              )}
            </button>
          </div>
        </div>

        <label className="flex cursor-pointer items-start gap-3 text-sm leading-6 text-[#666666]">
          <input
            type="checkbox"
            checked={form.terms}
            onChange={(event) =>
              updateField(
                "terms",
                event.target.checked
              )
            }
            required
            className="mt-1 h-4 w-4 shrink-0 accent-[#111111]"
          />

          <span>
            I agree to the{" "}
            <Link
              href="/terms"
              className="font-medium text-[#111111] underline underline-offset-4"
            >
              Terms
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="font-medium text-[#111111] underline underline-offset-4"
            >
              Privacy Policy
            </Link>
            .
          </span>
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
          {loading
            ? "Creating account..."
            : "Create account"}

          {!loading && (
            <ArrowRight
              size={17}
              strokeWidth={1.8}
            />
          )}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-[var(--muted)]">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-[#111111] underline underline-offset-4"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  icon: Icon,
  required = false,
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-medium text-[#555555]">
        {label}
      </label>

      <div className="relative">
        {Icon && (
          <Icon
            size={17}
            strokeWidth={1.8}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#999999]"
          />
        )}

        <input
          type={type}
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          placeholder={placeholder}
          required={required}
          autoComplete={
            type === "email" ? "email" : "off"
          }
          className={`w-full rounded-2xl border border-[var(--border)] bg-white py-3.5 text-sm text-[#111111] outline-none transition placeholder:text-[#aaa] focus:border-[#111111] ${
            Icon ? "pl-11 pr-4" : "px-4"
          }`}
        />
      </div>
    </div>
  );
}
