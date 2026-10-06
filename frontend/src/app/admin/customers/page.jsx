"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Eye,
  Mail,
  Search,
  ShoppingBag,
  UserRound,
  X,
} from "lucide-react";

const statusOptions = [
  "All",
  "Admin",
  "Customer",
];

export default function AdminCustomersPage() {
  const [customers, setCustomers] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [status, setStatus] =
    useState("All");

  const [
    selectedCustomer,
    setSelectedCustomer,
  ] = useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const getArray = (result) => {
    const data =
      result?.data;

    if (Array.isArray(data)) {
      return data;
    }

    if (Array.isArray(data?.users)) {
      return data.users;
    }

    if (Array.isArray(data?.orders)) {
      return data.orders;
    }

    if (Array.isArray(result?.users)) {
      return result.users;
    }

    if (Array.isArray(result?.orders)) {
      return result.orders;
    }

    return [];
  };

  const getPagination = (result) => {
    const data =
      result?.data;

    return (
      data?.pagination ||
      result?.pagination ||
      result?.meta ||
      {}
    );
  };

  const fetchAll = async (endpoint) => {
    const all = [];
    let page = 1;
    const limit = 100;

    while (page <= 100) {
      const separator =
        endpoint.includes("?")
          ? "&"
          : "?";

      const response =
        await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}${endpoint}${separator}page=${page}&limit=${limit}`,
          {
            credentials: "include",
            cache: "no-store",
          }
        );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Failed to fetch data"
        );
      }

      const batch =
        getArray(result);

      all.push(...batch);

      const pagination =
        getPagination(result);

      const totalPages = Number(
        pagination.totalPages ||
          pagination.pages ||
          0
      );

      const total = Number(
        pagination.total || 0
      );

      if (
        batch.length === 0 ||
        (totalPages &&
          page >= totalPages) ||
        (!totalPages &&
          total &&
          all.length >= total) ||
        batch.length < limit
      ) {
        break;
      }

      page += 1;
    }

    return all;
  };

  const loadCustomers = async () => {
    try {
      setLoading(true);
      setError("");

      const [users, orders] =
        await Promise.all([
          fetchAll(
            "/api/admin/users?sort=createdAt:desc"
          ),
          fetchAll(
            "/api/admin/orders"
          ),
        ]);

      const orderMap = new Map();

      orders.forEach((order) => {
        const userId =
          order.userId ||
          order.user?._id ||
          order.user?.id;

        if (!userId) return;

        const key = String(userId);

        const current =
          orderMap.get(key) || {
            orders: 0,
            spent: 0,
          };

        current.orders += 1;

        if (
          order.paymentStatus ===
          "paid"
        ) {
          current.spent += Number(
            order.total || 0
          );
        }

        orderMap.set(key, current);
      });

      const customerData = users.map(
        (user) => {
          const userId =
            user._id || user.id;

          const stats =
            orderMap.get(
              String(userId)
            ) || {
              orders: 0,
              spent: 0,
            };

          return {
            ...user,
            id: userId,
            name:
              user.name || "User",
            email:
              user.email || "—",
            phone:
              user.phone ||
              user.phoneNumber ||
              "Not added yet",
            joined:
              user.createdAt,
            orders:
              stats.orders,
            spent:
              stats.spent,
            role:
              user.role || "user",
          };
        }
      );

      setCustomers(
        customerData
      );
    } catch (error) {
      console.error(
        "Customers fetch error:",
        error
      );

      setError(
        error.message ||
          "Unable to load customers."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const filteredCustomers =
    useMemo(() => {
      const term =
        search.trim().toLowerCase();

      return customers.filter(
        (customer) => {
          const matchesSearch =
            !term ||
            customer.name
              ?.toLowerCase()
              .includes(term) ||
            customer.email
              ?.toLowerCase()
              .includes(term) ||
            customer.phone
              ?.toLowerCase()
              .includes(term);

          const customerType =
            customer.role === "admin"
              ? "Admin"
              : "Customer";

          const matchesStatus =
            status === "All" ||
            customerType === status;

          return (
            matchesSearch &&
            matchesStatus
          );
        }
      );
    }, [
      customers,
      search,
      status,
    ]);

  const customersOnly =
    customers.filter(
      (customer) =>
        customer.role !== "admin"
    );

  const totalSpent =
    customers.reduce(
      (total, customer) =>
        total +
        Number(customer.spent || 0),
      0
    );

  const totalOrders =
    customers.reduce(
      (total, customer) =>
        total +
        Number(customer.orders || 0),
      0
    );

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-8">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#999991]">
            Customers
          </span>

          <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[#111111] sm:text-4xl">
            Customer management
          </h2>

          <p className="mt-2 text-sm text-[var(--muted)]">
            View customers, account roles,
            order activity, and spending.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <CustomerStat
            label="Total customers"
            value={
              customersOnly.length
            }
          />

          <CustomerStat
            label="Admin accounts"
            value={
              customers.filter(
                (customer) =>
                  customer.role ===
                  "admin"
              ).length
            }
          />

          <CustomerStat
            label="Total orders"
            value={totalOrders}
          />

          <CustomerStat
            label="Total spent"
            value={`$${totalSpent.toLocaleString(
              "en-US",
              {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }
            )}`}
          />
        </div>

        <div className="mt-6 rounded-[28px] border border-[var(--border)] bg-white">
          <div className="border-b border-[var(--border)] p-4 sm:p-5">
            <div className="flex flex-col gap-3 lg:flex-row">
              <div className="relative flex-1">
                <Search
                  size={17}
                  strokeWidth={1.8}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#999]"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                  placeholder="Search by name, email or phone..."
                  className="w-full rounded-2xl border border-transparent bg-[#f5f5f2] py-3.5 pl-11 pr-4 text-sm text-[#111111] outline-none transition placeholder:text-[#aaa] focus:border-[#111111] focus:bg-white"
                />
              </div>

              <select
                value={status}
                onChange={(event) =>
                  setStatus(
                    event.target.value
                  )
                }
                className="rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm text-[#111111] outline-none"
              >
                {statusOptions.map(
                  (item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {item === "All"
                        ? "All accounts"
                        : item}
                    </option>
                  )
                )}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="space-y-3 p-5">
              {Array.from({
                length: 6,
              }).map((_, index) => (
                <div
                  key={index}
                  className="h-20 animate-pulse rounded-2xl bg-[#f5f5f2]"
                />
              ))}
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full min-w-[1000px]">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-left">
                      <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#999991]">
                        Customer
                      </th>

                      <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#999991]">
                        Joined
                      </th>

                      <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#999991]">
                        Orders
                      </th>

                      <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#999991]">
                        Total spent
                      </th>

                      <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#999991]">
                        Role
                      </th>

                      <th className="px-6 py-4 text-right text-[10px] font-semibold uppercase tracking-[0.14em] text-[#999991]">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredCustomers.map(
                      (customer) => (
                        <tr
                          key={customer.id}
                          className="border-b border-[var(--border)] last:border-0"
                        >
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <Avatar
                                name={
                                  customer.name
                                }
                              />

                              <div>
                                <p className="text-sm font-semibold text-[#111111]">
                                  {
                                    customer.name
                                  }
                                </p>

                                <p className="mt-1 text-xs text-[#999991]">
                                  {
                                    customer.email
                                  }
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-5 text-sm text-[#666666]">
                            {formatDate(
                              customer.joined
                            )}
                          </td>

                          <td className="px-6 py-5 text-sm font-medium text-[#111111]">
                            {
                              customer.orders
                            }
                          </td>

                          <td className="px-6 py-5 text-sm font-semibold text-[#111111]">
                            $
                            {Number(
                              customer.spent ||
                                0
                            ).toLocaleString(
                              "en-US",
                              {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }
                            )}
                          </td>

                          <td className="px-6 py-5">
                            <CustomerStatus
                              status={
                                customer.role ===
                                "admin"
                                  ? "Admin"
                                  : "Customer"
                              }
                            />
                          </td>

                          <td className="px-6 py-5">
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedCustomer(
                                  customer
                                )
                              }
                              className="ml-auto flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] text-[#666666] transition hover:border-[#111111] hover:text-[#111111]"
                              aria-label={`View ${customer.name}`}
                            >
                              <Eye
                                size={15}
                                strokeWidth={
                                  1.8
                                }
                              />
                            </button>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>

              <div className="grid gap-3 p-4 lg:hidden">
                {filteredCustomers.map(
                  (customer) => (
                    <CustomerMobileCard
                      key={
                        customer.id
                      }
                      customer={
                        customer
                      }
                      onView={
                        setSelectedCustomer
                      }
                    />
                  )
                )}
              </div>

              {filteredCustomers.length ===
                0 && (
                <div className="px-6 py-20 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#f0f0ec]">
                    <UserRound
                      size={23}
                      strokeWidth={1.7}
                    />
                  </div>

                  <h3 className="mt-5 text-xl font-semibold text-[#111111]">
                    No customers found
                  </h3>

                  <p className="mt-2 text-sm text-[var(--muted)]">
                    Try changing your search or account filter.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {selectedCustomer && (
        <CustomerDetailsModal
          customer={
            selectedCustomer
          }
          onClose={() =>
            setSelectedCustomer(null)
          }
        />
      )}
    </div>
  );
}

function CustomerStat({
  label,
  value,
}) {
  return (
    <div className="rounded-[24px] border border-[var(--border)] bg-white p-5">
      <p className="text-xs text-[#888880]">
        {label}
      </p>

      <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[#111111]">
        {value}
      </p>
    </div>
  );
}

function Avatar({ name }) {
  const initials =
    (name || "User")
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#111111] text-xs font-semibold text-white">
      {initials}
    </div>
  );
}

function CustomerStatus({
  status,
}) {
  const admin =
    status === "Admin";

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
        admin
          ? "bg-[#111111] text-white"
          : "bg-[#eef4e5] text-[#60703f]"
      }`}
    >
      {status}
    </span>
  );
}

function CustomerMobileCard({
  customer,
  onView,
}) {
  return (
    <div className="rounded-2xl bg-[#f7f7f5] p-4">
      <div className="flex items-start gap-3">
        <Avatar
          name={customer.name}
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-[#111111]">
                {customer.name}
              </h3>

              <p className="mt-1 truncate text-xs text-[#888880]">
                {customer.email}
              </p>
            </div>

            <CustomerStatus
              status={
                customer.role ===
                "admin"
                  ? "Admin"
                  : "Customer"
              }
            />
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.12em] text-[#999991]">
                Orders
              </p>

              <p className="mt-1 text-xs font-semibold text-[#111111]">
                {customer.orders}
              </p>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-[0.12em] text-[#999991]">
                Spent
              </p>

              <p className="mt-1 text-xs font-semibold text-[#111111]">
                $
                {Number(
                  customer.spent ||
                    0
                ).toLocaleString()}
              </p>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-[0.12em] text-[#999991]">
                Joined
              </p>

              <p className="mt-1 text-xs font-medium text-[#111111]">
                {formatDate(
                  customer.joined
                )}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              onView(customer)
            }
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-3 py-2.5 text-xs font-medium text-[#111111]"
          >
            <Eye
              size={14}
              strokeWidth={1.8}
            />
            View customer
          </button>
        </div>
      </div>
    </div>
  );
}

function CustomerDetailsModal({
  customer,
  onClose,
}) {
  const isAdmin =
    customer.role ===
    "admin";

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
        aria-label="Close customer details"
      />

      <div className="relative max-h-[90vh] w-full overflow-y-auto rounded-t-[28px] bg-white p-6 sm:max-w-lg sm:rounded-[28px]">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <Avatar
              name={customer.name}
            />

            <div>
              <h2 className="text-xl font-semibold tracking-[-0.03em] text-[#111111]">
                {customer.name}
              </h2>

              <p className="mt-1 text-xs text-[#888880]">
                Account details
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f0f0ec]"
            aria-label="Close"
          >
            <X
              size={17}
              strokeWidth={1.8}
            />
          </button>
        </div>

        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          <InfoCard
            icon={Mail}
            label="Email"
            value={customer.email}
          />

          <InfoCard
            icon={ShoppingBag}
            label="Orders"
            value={`${customer.orders} orders`}
          />

          <InfoCard
            icon={UserRound}
            label="Phone"
            value={customer.phone}
          />

          <InfoCard
            icon={UserRound}
            label="Total spent"
            value={`$${Number(
              customer.spent ||
                0
            ).toLocaleString(
              "en-US",
              {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }
            )}`}
          />
        </div>

        <div className="mt-3 rounded-2xl bg-[#f7f7f5] p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#999991]">
            Joined
          </p>

          <p className="mt-2 text-sm text-[#555555]">
            {formatDate(
              customer.joined
            )}
          </p>
        </div>

        <div className="mt-3 rounded-2xl border border-[var(--border)] p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-[#111111]">
                Account role
              </p>

              <p className="mt-1 text-xs text-[#888880]">
                Role controls access to the admin area.
              </p>
            </div>

            <CustomerStatus
              status={
                isAdmin
                  ? "Admin"
                  : "Customer"
              }
            />
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <a
            href={`mailto:${customer.email}`}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[var(--border)] px-4 py-3.5 text-sm font-medium text-[#111111] transition hover:bg-[#f5f5f2]"
          >
            <Mail
              size={16}
              strokeWidth={1.8}
            />
            Email customer
          </a>

          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl bg-[#111111] px-4 py-3.5 text-sm font-medium text-white transition hover:bg-[#252525]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoCard({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="rounded-2xl bg-[#f7f7f5] p-4">
      <Icon
        size={17}
        strokeWidth={1.8}
        className="text-[#777777]"
      />

      <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#999991]">
        {label}
      </p>

      <p className="mt-1 text-sm font-medium text-[#111111]">
        {value}
      </p>
    </div>
  );
}

function formatDate(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "—";
  }

  return date.toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  );
}
