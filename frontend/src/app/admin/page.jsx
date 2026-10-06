"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  ChevronRight,
  CircleDollarSign,
  Package,
  ShoppingCart,
  Users,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const initialStats = [
  {
    label: "Total revenue",
    value: "$0.00",
    change: "+0%",
    icon: CircleDollarSign,
  },
  {
    label: "Orders",
    value: "0",
    change: "+0%",
    icon: ShoppingCart,
  },
  {
    label: "Customers",
    value: "0",
    change: "+0%",
    icon: Users,
  },
  {
    label: "Products",
    value: "0",
    change: "+0%",
    icon: Package,
  },
];

async function parseResponse(response) {
  const text = await response.text();

  let data = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    throw new Error(
      `Server returned invalid response. Status: ${response.status}`
    );
  }

  if (!response.ok) {
    throw new Error(
      data?.message ||
        `Request failed with status ${response.status}`
    );
  }

  return data;
}

function formatMoney(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

function formatNumber(value) {
  return new Intl.NumberFormat("en-US").format(
    Number(value || 0)
  );
}

function formatStatus(status) {
  if (!status) return "Unknown";

  return (
    status.charAt(0).toUpperCase() +
    status.slice(1)
  );
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(initialStats);
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [storeHealth, setStoreHealth] = useState({
    ordersProcessing: 0,
    lowStockItems: 0,
    supportRequests: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const getDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/api/admin/dashboard`,
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          }
        );

        const result = await parseResponse(response);

        if (!result?.success) {
          throw new Error(
            result?.message ||
              "Failed to load dashboard."
          );
        }

        const data = result.data;

        setStats([
          {
            label: "Total revenue",
            value: formatMoney(
              data?.stats?.totalRevenue
            ),
            change: "+0%",
            icon: CircleDollarSign,
          },
          {
            label: "Orders",
            value: formatNumber(
              data?.stats?.totalOrders
            ),
            change: "+0%",
            icon: ShoppingCart,
          },
          {
            label: "Customers",
            value: formatNumber(
              data?.stats?.totalCustomers
            ),
            change: "+0%",
            icon: Users,
          },
          {
            label: "Products",
            value: formatNumber(
              data?.stats?.totalProducts
            ),
            change: "+0%",
            icon: Package,
          },
        ]);

        setRecentOrders(
          data?.recentOrders || []
        );

        setTopProducts(
          data?.topProducts || []
        );

        setStoreHealth({
          ordersProcessing:
            data?.storeHealth
              ?.ordersProcessing || 0,
          lowStockItems:
            data?.storeHealth
              ?.lowStockItems || 0,
          supportRequests:
            data?.storeHealth
              ?.supportRequests || 0,
        });
      } catch (error) {
        console.error(
          "Get dashboard error:",
          error
        );

        setError(
          error?.message ||
            "Failed to load dashboard."
        );
      } finally {
        setLoading(false);
      }
    };

    getDashboard();
  }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-6 sm:mb-8">
          <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#999991] sm:text-xs">
            Dashboard
          </span>

          <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-[-0.04em] text-[#111111] sm:text-3xl md:text-4xl">
                Good morning, Admin.
              </h2>

              <p className="mt-2 max-w-md text-sm leading-6 text-[var(--muted)]">
                Here's what's happening across
                your store.
              </p>
            </div>

            <Link
              href="/admin/products"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#111111] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#252525] sm:w-fit"
            >
              Manage products
              <ArrowRight
                size={16}
                strokeWidth={1.8}
              />
            </Link>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.label}
                className="rounded-[20px] border border-[var(--border)] bg-white p-4 sm:rounded-[24px] sm:p-5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f0f0ec] sm:h-11 sm:w-11 sm:rounded-2xl">
                    <Icon
                      size={17}
                      strokeWidth={1.8}
                    />
                  </div>

                  <span className="rounded-full bg-[#eef4e5] px-2 py-1 text-[9px] font-semibold text-[#60703f] sm:px-2.5 sm:text-[10px]">
                    {loading ? "..." : stat.change}
                  </span>
                </div>

                <p className="mt-5 text-[10px] text-[#888880] sm:mt-6 sm:text-xs">
                  {stat.label}
                </p>

                <p className="mt-1 truncate text-lg font-semibold tracking-[-0.04em] text-[#111111] sm:text-2xl">
                  {loading ? "..." : stat.value}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-5 grid gap-5 xl:mt-6 xl:grid-cols-[1.35fr_0.65fr] xl:gap-6">
          <section className="overflow-hidden rounded-[24px] border border-[var(--border)] bg-white sm:rounded-[28px]">
            <div className="flex flex-col gap-3 border-b border-[var(--border)] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5">
              <div>
                <h3 className="font-semibold text-[#111111]">
                  Recent orders
                </h3>

                <p className="mt-1 text-xs text-[var(--muted)]">
                  Latest customer purchases
                </p>
              </div>

              <Link
                href="/admin/orders"
                className="inline-flex w-fit items-center gap-1 text-xs font-medium text-[#555] hover:text-[#111111]"
              >
                View all
                <ChevronRight
                  size={14}
                  strokeWidth={1.8}
                />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px]">
                <thead>
                  <tr className="border-b border-[var(--border)] text-left">
                    <th className="px-4 py-3.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#999991] sm:px-6 sm:py-4 sm:text-[10px]">
                      Order
                    </th>

                    <th className="px-4 py-3.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#999991] sm:py-4 sm:text-[10px]">
                      Customer
                    </th>

                    <th className="px-4 py-3.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#999991] sm:py-4 sm:text-[10px]">
                      Status
                    </th>

                    <th className="px-4 py-3.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#999991] sm:py-4 sm:text-[10px]">
                      Total
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-5 py-10 text-center text-sm text-[#888880]"
                      >
                        Loading orders...
                      </td>
                    </tr>
                  ) : recentOrders.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-5 py-10 text-center text-sm text-[#888880]"
                      >
                        No recent orders found.
                      </td>
                    </tr>
                  ) : (
                    recentOrders.map((order) => {
                      const status =
                        formatStatus(
                          order.status
                        );

                      return (
                        <tr
                          key={order.id}
                          className="border-b border-[var(--border)] last:border-0"
                        >
                          <td className="px-4 py-4 text-sm font-medium text-[#111111] sm:px-6 sm:py-5">
                            {order.id}
                          </td>

                          <td className="max-w-[180px] truncate px-4 py-4 text-sm text-[#666666] sm:py-5">
                            {order.customer}
                          </td>

                          <td className="px-4 py-4 sm:py-5">
                            <span
                              className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[9px] font-semibold sm:text-[10px] ${
                                status ===
                                "Delivered"
                                  ? "bg-[#eef4e5] text-[#60703f]"
                                  : status ===
                                      "Shipped"
                                    ? "bg-[#edf1f6] text-[#5d6d82]"
                                    : "bg-[#f2eee4] text-[#8a7445]"
                              }`}
                            >
                              {status}
                            </span>
                          </td>

                          <td className="px-4 py-4 text-sm font-medium text-[#111111] sm:py-5">
                            {formatMoney(
                              order.total
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-[24px] border border-[var(--border)] bg-[#111111] p-5 text-white sm:rounded-[28px] sm:p-6">
            <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/40 sm:text-xs">
              Store health
            </span>

            <h3 className="mt-3 text-xl font-semibold tracking-[-0.04em] sm:text-2xl">
              Everything looks good.
            </h3>

            <p className="mt-3 text-sm leading-6 text-white/55">
              Your current store activity is
              being monitored here. Alerts,
              inventory warnings, and operational
              metrics can be connected once the
              backend is live.
            </p>

            <div className="mt-6 space-y-3 sm:mt-8">
              <HealthRow
                label="Orders processing"
                value={
                  loading
                    ? "..."
                    : formatNumber(
                        storeHealth.ordersProcessing
                      )
                }
              />

              <HealthRow
                label="Low stock items"
                value={
                  loading
                    ? "..."
                    : formatNumber(
                        storeHealth.lowStockItems
                      )
                }
              />

              <HealthRow
                label="Support requests"
                value={
                  loading
                    ? "..."
                    : formatNumber(
                        storeHealth.supportRequests
                      )
                }
              />
            </div>
          </section>
        </div>

        <section className="mt-5 overflow-hidden rounded-[24px] border border-[var(--border)] bg-white sm:mt-6 sm:rounded-[28px]">
          <div className="flex flex-col gap-3 border-b border-[var(--border)] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5">
            <div>
              <h3 className="font-semibold text-[#111111]">
                Top products
              </h3>

              <p className="mt-1 text-xs text-[var(--muted)]">
                Best-performing products
              </p>
            </div>

            <Link
              href="/admin/products"
              className="inline-flex w-fit items-center gap-1 text-xs font-medium text-[#555] hover:text-[#111111]"
            >
              Manage
              <ChevronRight
                size={14}
                strokeWidth={1.8}
              />
            </Link>
          </div>

          <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
            {loading ? (
              <div className="col-span-full px-4 py-10 text-center text-sm text-[#888880]">
                Loading products...
              </div>
            ) : topProducts.length === 0 ? (
              <div className="col-span-full px-4 py-10 text-center text-sm text-[#888880]">
                No top products found.
              </div>
            ) : (
              topProducts.map((product, index) => (
                <div
                  key={`${product.name}-${index}`}
                  className="rounded-2xl bg-[#f7f7f5] p-4"
                >
                  <div className="flex items-start justify-between">
                    <span className="text-xs font-semibold text-[#999991]">
                      {String(index + 1).padStart(
                        2,
                        "0"
                      )}
                    </span>

                    <Package
                      size={17}
                      strokeWidth={1.7}
                      className="text-[#888880]"
                    />
                  </div>

                  <h4 className="mt-5 line-clamp-2 text-sm font-semibold text-[#111111] sm:mt-6">
                    {product.name}
                  </h4>

                  <p className="mt-1 truncate text-xs text-[#888880]">
                    {product.category}
                  </p>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-[#999991]">
                        Sold
                      </p>

                      <p className="mt-1 text-sm font-semibold text-[#111111]">
                        {formatNumber(
                          product.sold
                        )}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-[#999991]">
                        Revenue
                      </p>

                      <p className="mt-1 text-sm font-semibold text-[#111111]">
                        {formatMoney(
                          product.revenue
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function HealthRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
      <span className="text-xs text-white/60 sm:text-sm">
        {label}
      </span>

      <span className="shrink-0 text-sm font-semibold text-white">
        {value}
      </span>
    </div>
  );
}