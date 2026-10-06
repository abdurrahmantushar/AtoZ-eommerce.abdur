"use client";

import {
  ArrowLeft,
  Camera,
  Check,
  LockKeyhole,
  Save,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { authClient } from "@/lib/auth-client";


export default function ProfilePage() {
  const {
    data: session,
    isPending,
  } = authClient.useSession();

  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const [imageUploading, setImageUploading] = useState(false);
  const fileInputRef = useRef(null);

  const [showPasswordForm, setShowPasswordForm] =
    useState(false);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    if (!session?.user) return;

    const nameParts =
      session.user.name?.trim().split(/\s+/) || [];

    const firstName = nameParts.shift() || "";
    const lastName = nameParts.join(" ");

    setProfile({
      firstName,
      lastName,
      email: session.user.email || "",
      phone: session.user.phoneNumber || "",
      dateOfBirth: session.user.dateOfBirth || "",
    });
  }, [session]);;

  const updateField = (field, value) => {
    setProfile((prev) => ({
      ...prev,
      [field]: value,
    }));


    setSaved(false);
    setError("");


  };

  const handleImageChange = async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB.");
      return;
    }

    try {
      setImageUploading(true);
      setError("");

      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/upload/profile-image`,
        {
          method: "PUT",
          body: formData,
          credentials: "include",
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to upload profile image."
        );
      }

      await authClient.getSession();
    } catch (error) {
      console.error("Profile image upload error:", error);

      setError(
        error?.message ||
        "Something went wrong while uploading your profile image."
      );
    } finally {
      setImageUploading(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSaved(false);

    if (!profile.firstName.trim()) {
      setError("First name is required.");
      return;
    }

    if (!profile.lastName.trim()) {
      setError("Last name is required.");
      return;
    }

    try {
      setSaving(true);

      const fullName =
        `${profile.firstName.trim()} ${profile.lastName.trim()}`.trim();

      const { error: updateError } =
        await authClient.updateUser({
          name: fullName,
          phoneNumber: profile.phone.trim(),
          dateOfBirth: profile.dateOfBirth,
        });

      if (updateError) {
        setError(
          updateError.message ||
          "Unable to update your profile."
        );
        return;
      }
      setSaved(true);

      setTimeout(() => {
        setSaved(false);
      }, 2200);
    } catch (error) {
      console.error(
        "Profile update error:",
        error
      );

      setError(
        error?.message ||
        "Something went wrong while updating your profile."
      );
    } finally {
      setSaving(false);
    }

  };

  const updatePasswordField = (field, value) => {
    setPasswordForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    setPasswordSaved(false);
    setPasswordError("");

  };

  const closePasswordForm = () => {
    if (passwordSaving) return;

    setShowPasswordForm(false);

    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

    setPasswordError("");
    setPasswordSaved(false);

  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();

    setPasswordError("");
    setPasswordSaved(false);

    if (!passwordForm.currentPassword) {
      setPasswordError(
        "Please enter your current password."
      );
      return;
    }

    if (!passwordForm.newPassword) {
      setPasswordError(
        "Please enter your new password."
      );
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setPasswordError(
        "New password must be at least 8 characters."
      );
      return;
    }

    if (
      passwordForm.newPassword !==
      passwordForm.confirmPassword
    ) {
      setPasswordError(
        "New password and confirmation do not match."
      );
      return;
    }

    try {
      setPasswordSaving(true);

      const { error: changePasswordError } =
        await authClient.changePassword({
          currentPassword:
            passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
          revokeOtherSessions: true,
        });

      if (changePasswordError) {
        setPasswordError(
          changePasswordError.message ||
          "Unable to change your password."
        );
        return;
      }

      setPasswordSaved(true);

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setTimeout(() => {
        setShowPasswordForm(false);
        setPasswordSaved(false);
      }, 1800);
    } catch (error) {
      console.error(
        "Password change error:",
        error
      );

      setPasswordError(
        error?.message ||
        "Something went wrong while changing your password."
      );
    } finally {
      setPasswordSaving(false);
    }

  };

  if (isPending) {
    return (
      <> <Header />

        <main className="flex min-h-screen items-center justify-center bg-[var(--background)]">
          <p className="text-sm text-[var(--muted)]">
            Loading profile...
          </p>
        </main>

        <Footer />
      </>
    );

  }

  if (!session) {
    return (
      <> <Header />

        <main className="flex min-h-[70vh] items-center justify-center bg-[var(--background)] px-6">
          <div className="text-center">
            <h1 className="text-3xl font-semibold tracking-[-0.04em]">
              Please sign in
            </h1>

            <p className="mt-3 text-sm text-[var(--muted)]">
              You need to sign in to manage your profile.
            </p>

            <Link
              href="/login"
              className="mt-6 inline-flex rounded-full bg-[#111111] px-6 py-3 text-sm font-medium !text-white"
            >
              Sign in
            </Link>
          </div>
        </main>

        <Footer />
      </>
    );

  }

  const memberSince = session.user.createdAt
    ? new Date(
      session.user.createdAt
    ).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    })
    : "—";

  const initials = getInitials(
    session.user.name || "User"
  );

  return (
    <> <Header />

      <main className="min-h-screen bg-[var(--background)]">
        <section className="container-main py-10 sm:py-14 lg:py-16">
          <Link
            href="/account"
            className="group inline-flex items-center gap-2 text-sm font-medium text-[var(--muted)] transition hover:text-[var(--foreground)]"
          >
            <ArrowLeft
              size={16}
              strokeWidth={1.8}
              className="transition-transform duration-300 group-hover:-translate-x-1"
            />

            Back to account
          </Link>

          <div className="mt-8 max-w-3xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
              Account settings
            </p>

            <h1 className="mt-4 text-5xl font-semibold tracking-[-0.055em] sm:text-6xl">
              Profile
            </h1>

            <p className="mt-5 max-w-xl text-sm leading-6 text-[var(--muted)] sm:text-base">
              Manage your personal information and account details.
            </p>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-[280px_1fr]">
            <ProfileSide
              name={session.user.name}
              email={session.user.email}
              image={session.user.image}
              initials={initials}
              memberSince={memberSince}
              imageUploading={imageUploading}
              fileInputRef={fileInputRef}
              onImageChange={handleImageChange}
            />

            <div className="space-y-5">
              <form
                onSubmit={handleSubmit}
                className="rounded-[24px] bg-white p-6 sm:p-7"
              >
                <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                      Personal information
                    </p>

                    <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em]">
                      Your profile
                    </h2>
                  </div>

                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#111111] px-5 text-sm font-medium !text-white transition hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Save
                      size={16}
                      strokeWidth={1.8}
                    />

                    {saving
                      ? "Saving..."
                      : saved
                        ? "Saved"
                        : "Save changes"}
                  </button>
                </div>

                <div className="mt-7 grid gap-5 sm:grid-cols-2">
                  <Field
                    label="First name"
                    value={profile.firstName}
                    onChange={(e) =>
                      updateField(
                        "firstName",
                        e.target.value
                      )
                    }
                    required
                  />

                  <Field
                    label="Last name"
                    value={profile.lastName}
                    onChange={(e) =>
                      updateField(
                        "lastName",
                        e.target.value
                      )
                    }
                    required
                  />

                  <Field
                    label="Email address"
                    type="email"
                    value={profile.email}
                    readOnly
                  />

                  <Field
                    label="Phone number"
                    type="tel"
                    value={profile.phone}
                    onChange={(e) =>
                      updateField(
                        "phone",
                        e.target.value
                      )
                    }
                    placeholder="Add phone number"
                  />

                  <Field
                    label="Date of birth"
                    type="date"
                    value={profile.dateOfBirth}
                    onChange={(e) =>
                      updateField(
                        "dateOfBirth",
                        e.target.value
                      )
                    }
                  />
                </div>

                {error && (
                  <div className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-xs font-medium text-red-600">
                    {error}
                  </div>
                )}

                {saved && !error && (
                  <div className="mt-5 rounded-2xl bg-[#e6f3dd] px-4 py-3 text-xs font-medium text-[#48752f]">
                    Your name has been updated successfully.
                    Phone and date of birth are saved on this
                    device.
                  </div>
                )}
              </form>

              <div className="rounded-[24px] bg-white p-6 sm:p-7">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#ecece7]">
                    <LockKeyhole
                      size={18}
                      strokeWidth={1.7}
                    />
                  </div>

                  <div className="flex-1">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                      Security
                    </p>

                    <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em]">
                      Password & security
                    </h2>

                    <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--muted)]">
                      Manage your password and account security
                      from here.
                    </p>

                    <button
                      type="button"
                      onClick={() => {
                        setShowPasswordForm(true);
                        setPasswordError("");
                        setPasswordSaved(false);
                      }}
                      className="mt-5 rounded-full border border-[var(--border)] px-5 py-3 text-xs font-medium transition hover:border-[#111111]"
                    >
                      Change password
                    </button>
                  </div>
                </div>
              </div>

              {showPasswordForm && (
                <div className="rounded-[24px] bg-white p-6 sm:p-7">
                  <div className="flex items-start justify-between gap-5">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                        Security
                      </p>

                      <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em]">
                        Change password
                      </h2>
                    </div>

                    <button
                      type="button"
                      onClick={closePasswordForm}
                      disabled={passwordSaving}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f3f3ef] text-[#666] transition hover:bg-[#e9e9e4] hover:text-[#111] disabled:opacity-60"
                      aria-label="Close password form"
                    >
                      <X
                        size={17}
                        strokeWidth={1.8}
                      />
                    </button>
                  </div>

                  <form
                    onSubmit={handlePasswordSubmit}
                    className="mt-7 space-y-5"
                  >
                    <Field
                      label="Current password"
                      type="password"
                      value={
                        passwordForm.currentPassword
                      }
                      onChange={(e) =>
                        updatePasswordField(
                          "currentPassword",
                          e.target.value
                        )
                      }
                      required
                    />

                    <Field
                      label="New password"
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) =>
                        updatePasswordField(
                          "newPassword",
                          e.target.value
                        )
                      }
                      placeholder="Minimum 8 characters"
                      required
                    />

                    <Field
                      label="Confirm new password"
                      type="password"
                      value={
                        passwordForm.confirmPassword
                      }
                      onChange={(e) =>
                        updatePasswordField(
                          "confirmPassword",
                          e.target.value
                        )
                      }
                      required
                    />

                    {passwordError && (
                      <div className="rounded-2xl bg-red-50 px-4 py-3 text-xs font-medium text-red-600">
                        {passwordError}
                      </div>
                    )}

                    {passwordSaved && (
                      <div className="flex items-center gap-2 rounded-2xl bg-[#e6f3dd] px-4 py-3 text-xs font-medium text-[#48752f]">
                        <Check
                          size={15}
                          strokeWidth={2}
                        />
                        Password changed successfully.
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={
                        passwordSaving ||
                        passwordSaved
                      }
                      className="inline-flex h-11 items-center justify-center rounded-full bg-[#111111] px-6 text-sm font-medium !text-white transition hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {passwordSaving
                        ? "Changing password..."
                        : passwordSaved
                          ? "Password changed"
                          : "Update password"}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>

  );
}

function ProfileSide({
  name,
  email,
  image,
  initials,
  memberSince,
  imageUploading,
  fileInputRef,
  onImageChange,
}) {
  return (
    <aside className="h-fit rounded-[24px] bg-white p-5">

      {
        image ? (
          <img 
          src={image}
          alt={name || 'profile'}
          className="h-24 w-24 rounded-full object-cover"
          />
        ):(

      <div className="flex flex-col items-center border-b border-[var(--border)] pb-6 text-center"> <div className="relative"> <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#111111] text-2xl font-semibold !text-white">
        {initials} </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={onImageChange}
          className="hidden"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={imageUploading}
          className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full border-4 border-white bg-[#dfff00] text-black transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60"
          aria-label="Change profile picture"
        >
          {imageUploading ? (
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-black border-t-transparent" />
          ) : (
            <Camera
              size={15}
              strokeWidth={1.8}
            />
          )}
        </button>
      </div>

        <h2 className="mt-4 text-base font-semibold">
          {name || "User"}
        </h2>

        <p className="mt-1 text-xs text-[var(--muted)]">
          {email}
        </p>
      </div>
        )
      }

      <div className="pt-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
          Account status
        </p>

        <div className="mt-3 flex items-center gap-2 rounded-2xl bg-[#e6f3dd] px-4 py-3 text-xs font-medium text-[#48752f]">
          <span className="h-2 w-2 rounded-full bg-current" />
          Active account
        </div>

        <p className="mt-4 text-xs leading-5 text-[var(--muted)]">
          Member since {memberSince}
        </p>
      </div>
    </aside>

  );
}

function Field({
  label,
  type = "text",
  value,
  onChange,
  placeholder = "",
  readOnly = false,
  required = false,
}) {
  return (<label className="block"> <span className="text-xs font-medium">
    {label} </span>

    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      readOnly={readOnly}
      required={required}
      className={`mt-2 h-12 w-full rounded-2xl border border-[var(--border)] px-4 text-sm outline-none transition focus:border-[#111111] ${readOnly
          ? "cursor-not-allowed bg-[#f7f7f5] text-[#777]"
          : "bg-white"
        }`}
    />
  </label>


  );
}

function getInitials(name) {
  const parts = name.trim().split(/\s+/);

  if (parts.length === 1) {
    return parts[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]
    }`.toUpperCase();
}
