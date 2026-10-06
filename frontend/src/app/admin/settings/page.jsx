"use client";

import { useEffect, useState } from "react";
import {
  Bell,
  Building2,
  Check,
  ChevronRight,
  CreditCard,
  Globe2,
  LockKeyhole,
  Mail,
  Save,
  ShieldCheck,
  Store,
  UserRound,
} from "lucide-react";

import { authClient } from "@/lib/auth-client";

const STORAGE_KEY =
  "atoz-admin-settings";

const defaultStoreSettings = {
  storeName: "AtoZ",
  email: "hello@atoz.com",
  phone: "+880 1700-000000",
  currency: "USD",
  timezone: "Asia/Dhaka",
  address: "Chattogram, Bangladesh",
};

const defaultOrderSettings = {
  freeShipping: "50",
  standardShipping: "0",
  expressShipping: "12",
  lowStockThreshold: "10",
  autoConfirmOrders: true,
  allowGuestCheckout: true,
};

const defaultNotifications = {
  newOrder: true,
  lowStock: true,
  customerSignup: true,
  paymentAlert: true,
  weeklyReport: false,
};

export default function AdminSettingsPage() {
  const [activeSection, setActiveSection] =
    useState("store");

  const [
    storeSettings,
    setStoreSettings,
  ] = useState(
    defaultStoreSettings
  );

  const [
    orderSettings,
    setOrderSettings,
  ] = useState(
    defaultOrderSettings
  );

  const [
    notifications,
    setNotifications,
  ] = useState(
    defaultNotifications
  );

  const [saved, setSaved] =
    useState(false);

  const [hydrated, setHydrated] =
    useState(false);

  useEffect(() => {
    try {
      const stored =
        localStorage.getItem(
          STORAGE_KEY
        );

      if (stored) {
        const parsed =
          JSON.parse(stored);

        setStoreSettings({
          ...defaultStoreSettings,
          ...(parsed.storeSettings ||
            {}),
        });

        setOrderSettings({
          ...defaultOrderSettings,
          ...(parsed.orderSettings ||
            {}),
        });

        setNotifications({
          ...defaultNotifications,
          ...(parsed.notifications ||
            {}),
        });
      }
    } catch (error) {
      console.error(
        "Admin settings load error:",
        error
      );
    } finally {
      setHydrated(true);
    }
  }, []);

  const updateStore = (
    field,
    value
  ) => {
    setStoreSettings(
      (current) => ({
        ...current,
        [field]: value,
      })
    );
  };

  const updateOrder = (
    field,
    value
  ) => {
    setOrderSettings(
      (current) => ({
        ...current,
        [field]: value,
      })
    );
  };

  const updateNotification = (
    field,
    value
  ) => {
    setNotifications(
      (current) => ({
        ...current,
        [field]: value,
      })
    );
  };

  const handleSave = () => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          storeSettings,
          orderSettings,
          notifications,
        })
      );

      setSaved(true);

      setTimeout(() => {
        setSaved(false);
      }, 1600);
    } catch (error) {
      console.error(
        "Admin settings save error:",
        error
      );
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-8">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#999991]">
            System
          </span>

          <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[#111111] sm:text-4xl">
            Settings
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
            Manage your store configuration,
            checkout preferences, notifications,
            and administrator profile.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[230px_1fr]">
          <aside className="h-fit rounded-[28px] border border-[var(--border)] bg-white p-3 lg:sticky lg:top-24">
            <SettingsNav
              activeSection={
                activeSection
              }
              setActiveSection={
                setActiveSection
              }
            />
          </aside>

          <div className="min-w-0">
            {activeSection ===
              "store" && (
              <StoreSettings
                settings={
                  storeSettings
                }
                updateField={
                  updateStore
                }
              />
            )}

            {activeSection ===
              "orders" && (
              <OrderSettings
                settings={
                  orderSettings
                }
                updateField={
                  updateOrder
                }
              />
            )}

            {activeSection ===
              "notifications" && (
              <NotificationSettings
                settings={
                  notifications
                }
                updateField={
                  updateNotification
                }
              />
            )}

            {activeSection ===
              "account" && (
              <AccountSettings />
            )}

            {activeSection !==
              "account" && (
              <div className="mt-6 rounded-[28px] bg-[#111111] p-5 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">
                      Save your changes
                    </p>

                    <p className="mt-1 text-xs leading-5 text-white/45">
                      These settings are
                      stored in this browser.
                      Server-side settings
                      require a dedicated
                      settings API.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={
                      handleSave
                    }
                    disabled={
                      !hydrated
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-medium !text-[#111111] transition hover:bg-[#f0f0ec] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {saved ? (
                      <>
                        <Check
                          size={16}
                          strokeWidth={
                            2
                          }
                        />
                        Saved
                      </>
                    ) : (
                      <>
                        <Save
                          size={16}
                          strokeWidth={
                            1.8
                          }
                        />
                        Save changes
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingsNav({
  activeSection,
  setActiveSection,
}) {
  const items = [
    {
      id: "store",
      label: "Store",
      description:
        "Business information",
      icon: Store,
    },
    {
      id: "orders",
      label: "Orders",
      description:
        "Shipping & checkout",
      icon: CreditCard,
    },
    {
      id: "notifications",
      label: "Notifications",
      description:
        "Alerts & reports",
      icon: Bell,
    },
    {
      id: "account",
      label: "Admin account",
      description:
        "Profile & security",
      icon: ShieldCheck,
    },
  ];

  return (
    <nav className="space-y-1">
      {items.map((item) => {
        const Icon = item.icon;

        const active =
          activeSection ===
          item.id;

        return (
          <button
            key={item.id}
            type="button"
            onClick={() =>
              setActiveSection(
                item.id
              )
            }
            className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition ${
              active
                ? "bg-[#111111] text-white"
                : "text-[#666666] hover:bg-[#f4f4f1] hover:text-[#111111]"
            }`}
          >
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                active
                  ? "bg-white/10"
                  : "bg-[#f0f0ec]"
              }`}
            >
              <Icon
                size={17}
                strokeWidth={1.8}
              />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">
                {item.label}
              </p>

              <p
                className={`mt-0.5 text-[10px] ${
                  active
                    ? "text-white/45"
                    : "text-[#999991]"
                }`}
              >
                {item.description}
              </p>
            </div>

            <ChevronRight
              size={15}
              strokeWidth={1.8}
              className={
                active
                  ? "text-white/45"
                  : "text-[#aaa]"
              }
            />
          </button>
        );
      })}
    </nav>
  );
}

function StoreSettings({
  settings,
  updateField,
}) {
  return (
    <SettingsCard
      icon={Building2}
      eyebrow="Store"
      title="Store information"
      description="Basic information used by the storefront configuration."
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Store name"
          value={
            settings.storeName
          }
          onChange={(value) =>
            updateField(
              "storeName",
              value
            )
          }
          icon={Store}
        />

        <Field
          label="Support email"
          type="email"
          value={settings.email}
          onChange={(value) =>
            updateField(
              "email",
              value
            )
          }
          icon={Mail}
        />

        <Field
          label="Phone number"
          value={settings.phone}
          onChange={(value) =>
            updateField(
              "phone",
              value
            )
          }
        />

        <SelectField
          label="Currency"
          value={settings.currency}
          onChange={(value) =>
            updateField(
              "currency",
              value
            )
          }
          options={[
            "USD",
            "BDT",
            "EUR",
            "GBP",
          ]}
        />

        <SelectField
          label="Timezone"
          value={
            settings.timezone
          }
          onChange={(value) =>
            updateField(
              "timezone",
              value
            )
          }
          options={[
            "Asia/Dhaka",
            "Asia/Dubai",
            "Asia/Kolkata",
            "Europe/London",
          ]}
        />

        <Field
          label="Store address"
          value={
            settings.address
          }
          onChange={(value) =>
            updateField(
              "address",
              value
            )
          }
          icon={Globe2}
        />
      </div>
    </SettingsCard>
  );
}

function OrderSettings({
  settings,
  updateField,
}) {
  return (
    <div className="space-y-6">
      <SettingsCard
        icon={CreditCard}
        eyebrow="Checkout"
        title="Order & shipping settings"
        description="Current checkout configuration used by the application."
      >
        <div className="grid gap-5 sm:grid-cols-3">
          <Field
            label="Free shipping above"
            type="number"
            value={
              settings.freeShipping
            }
            onChange={(value) =>
              updateField(
                "freeShipping",
                value
              )
            }
          />

          <Field
            label="Standard shipping"
            type="number"
            value={
              settings.standardShipping
            }
            onChange={(value) =>
              updateField(
                "standardShipping",
                value
              )
            }
          />

          <Field
            label="Express shipping"
            type="number"
            value={
              settings.expressShipping
            }
            onChange={(value) =>
              updateField(
                "expressShipping",
                value
              )
            }
          />
        </div>

        <div className="mt-5">
          <Field
            label="Low stock threshold"
            type="number"
            value={
              settings.lowStockThreshold
            }
            onChange={(value) =>
              updateField(
                "lowStockThreshold",
                value
              )
            }
          />
        </div>

        <div className="mt-5 rounded-2xl bg-[#f7f7f5] p-4">
          <p className="text-xs font-medium text-[#111111]">
            Backend shipping
          </p>

          <p className="mt-1 text-xs leading-5 text-[#888880]">
            Standard delivery is currently
            $0 and express delivery is $12 in
            the order service.
          </p>
        </div>
      </SettingsCard>

      <SettingsCard
        icon={Store}
        eyebrow="Checkout behavior"
        title="Customer checkout"
        description="Frontend preferences for the checkout experience."
      >
        <div className="space-y-3">
          <ToggleRow
            title="Auto-confirm orders"
            description="Automatically confirm successfully placed orders."
            checked={
              settings.autoConfirmOrders
            }
            onChange={(value) =>
              updateField(
                "autoConfirmOrders",
                value
              )
            }
          />

          <ToggleRow
            title="Allow guest checkout"
            description="Let customers complete purchases without creating an account."
            checked={
              settings.allowGuestCheckout
            }
            onChange={(value) =>
              updateField(
                "allowGuestCheckout",
                value
              )
            }
          />
        </div>
      </SettingsCard>
    </div>
  );
}

function NotificationSettings({
  settings,
  updateField,
}) {
  return (
    <SettingsCard
      icon={Bell}
      eyebrow="Notifications"
      title="Admin notifications"
      description="Local notification preferences for the admin interface."
    >
      <div className="space-y-3">
        <ToggleRow
          title="New order"
          description="Receive an alert whenever a new order is placed."
          checked={
            settings.newOrder
          }
          onChange={(value) =>
            updateField(
              "newOrder",
              value
            )
          }
        />

        <ToggleRow
          title="Low stock"
          description="Get notified when products reach the stock threshold."
          checked={
            settings.lowStock
          }
          onChange={(value) =>
            updateField(
              "lowStock",
              value
            )
          }
        />

        <ToggleRow
          title="New customer"
          description="Receive a notification when someone creates an account."
          checked={
            settings.customerSignup
          }
          onChange={(value) =>
            updateField(
              "customerSignup",
              value
            )
          }
        />

        <ToggleRow
          title="Payment alerts"
          description="Get notified about payment failures or unusual payment events."
          checked={
            settings.paymentAlert
          }
          onChange={(value) =>
            updateField(
              "paymentAlert",
              value
            )
          }
        />

        <ToggleRow
          title="Weekly report"
          description="Receive a weekly summary of store activity."
          checked={
            settings.weeklyReport
          }
          onChange={(value) =>
            updateField(
              "weeklyReport",
              value
            )
          }
        />
      </div>
    </SettingsCard>
  );
}

function AccountSettings() {
  const {
    data: session,
    isPending,
  } =
    authClient.useSession();

  if (isPending) {
    return (
      <div className="space-y-6">
        <div className="rounded-[28px] border border-[var(--border)] bg-white p-6">
          <div className="h-16 w-16 animate-pulse rounded-full bg-[#eeeeea]" />
          <div className="mt-5 h-5 w-40 animate-pulse rounded bg-[#eeeeea]" />
          <div className="mt-2 h-3 w-56 animate-pulse rounded bg-[#eeeeea]" />
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="rounded-[28px] border border-red-200 bg-red-50 p-6 text-sm text-red-600">
        Admin session not found.
      </div>
    );
  }

  const user = session.user;

  const initials =
    getInitials(
      user.name ||
        user.email ||
        "Admin"
    );

  return (
    <div className="space-y-6">
      <SettingsCard
        icon={UserRound}
        eyebrow="Admin account"
        title="Profile"
        description="Your current administrator profile information."
      >
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#111111] text-sm font-semibold text-white">
            {initials}
          </div>

          <div>
            <h3 className="font-semibold text-[#111111]">
              {user.name ||
                "Admin"}
            </h3>

            <p className="mt-1 text-sm text-[#666666]">
              {user.role ===
              "admin"
                ? "Administrator"
                : "User"}
            </p>

            <p className="mt-1 text-xs text-[#999991]">
              {user.email}
            </p>
          </div>
        </div>
      </SettingsCard>

      <SettingsCard
        icon={LockKeyhole}
        eyebrow="Security"
        title="Account security"
        description="Authentication is handled by Better Auth."
      >
        <div className="rounded-2xl bg-[#f7f7f5] p-4">
          <p className="text-sm font-medium text-[#111111]">
            Password
          </p>

          <p className="mt-1 text-xs leading-5 text-[#888880]">
            Your password is managed through
            the authentication system.
          </p>

          <button
            type="button"
            className="mt-4 rounded-full border border-[var(--border)] bg-white px-4 py-2.5 text-xs font-medium text-[#111111]"
          >
            Change password
          </button>
        </div>
      </SettingsCard>
    </div>
  );
}

function SettingsCard({
  icon: Icon,
  eyebrow,
  title,
  description,
  children,
}) {
  return (
    <section className="rounded-[28px] border border-[var(--border)] bg-white p-5 sm:p-6">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#f0f0ec]">
          <Icon
            size={19}
            strokeWidth={1.8}
          />
        </div>

        <div>
          <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#999991]">
            {eyebrow}
          </span>

          <h3 className="mt-1 text-xl font-semibold tracking-[-0.03em] text-[#111111]">
            {title}
          </h3>

          <p className="mt-1 max-w-2xl text-sm leading-6 text-[var(--muted)]">
            {description}
          </p>
        </div>
      </div>

      <div className="mt-7">
        {children}
      </div>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  icon: Icon,
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-medium text-[#555555]">
        {label}
      </label>

      <div className="relative">
        {Icon && (
          <Icon
            size={16}
            strokeWidth={1.8}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#999]"
          />
        )}

        <input
          type={type}
          value={value}
          onChange={(event) =>
            onChange(
              event.target.value
            )
          }
          className={`w-full rounded-2xl border border-[var(--border)] bg-[#fafaf8] py-3.5 text-sm text-[#111111] outline-none transition focus:border-[#111111] focus:bg-white ${
            Icon
              ? "pl-11 pr-4"
              : "px-4"
          }`}
        />
      </div>
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-medium text-[#555555]">
        {label}
      </label>

      <select
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        className="w-full rounded-2xl border border-[var(--border)] bg-[#fafaf8] px-4 py-3.5 text-sm text-[#111111] outline-none transition focus:border-[#111111] focus:bg-white"
      >
        {options.map(
          (option) => (
            <option
              key={option}
              value={option}
            >
              {option}
            </option>
          )
        )}
      </select>
    </div>
  );
}

function ToggleRow({
  title,
  description,
  checked,
  onChange,
}) {
  return (
    <div className="flex items-center justify-between gap-5 rounded-2xl bg-[#f7f7f5] p-4">
      <div>
        <p className="text-sm font-medium text-[#111111]">
          {title}
        </p>

        <p className="mt-1 max-w-xl text-xs leading-5 text-[#888880]">
          {description}
        </p>
      </div>

      <button
        type="button"
        onClick={() =>
          onChange(!checked)
        }
        className={`relative h-7 w-12 shrink-0 rounded-full transition ${
          checked
            ? "bg-[#111111]"
            : "bg-[#d9d9d3]"
        }`}
        aria-label={`${
          checked
            ? "Disable"
            : "Enable"
        } ${title}`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${
            checked
              ? "left-6"
              : "left-1"
          }`}
        />
      </button>
    </div>
  );
}

function getInitials(name) {
  const parts = name
    .trim()
    .split(/\s+/);

  if (parts.length === 1) {
    return parts[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return `${parts[0][0]}${
    parts[parts.length - 1][0]
  }`.toUpperCase();
}

