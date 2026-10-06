"use client";

import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  CircleDollarSign,
  Package,
  ShoppingCart,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const CATEGORY_COLORS = [
  "#5B5BD6",
  "#D84F87",
  "#00A67E",
  "#E58A00",
  "#4C8BF5",
  "#8B8B84",
];

const STATUS_COLORS = {
  delivered: "#00A67E",
  processing: "#E58A00",
  shipped: "#4C8BF5",
  pending: "#8B8B84",
  cancelled: "#D84F87",
};

const emptyMetrics = {
  revenue: 0,
  orders: 0,
  customers: 0,
  averageOrderValue: 0,
};

export default function AdminAnalyticsPage() {
  const [metrics, setMetrics] =
    useState(emptyMetrics);

  const [orders, setOrders] = useState([]);
  const [products, setProducts] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    let cancelled = false;

    const fetchJson = async (url) => {
      const response = await fetch(url, {
        credentials: "include",
        cache: "no-store",
      });

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Failed to load analytics data"
        );
      }

      return result;
    };

    const getPayload = (result) =>
      result?.data ?? result;

    const getArray = (result) => {
      const payload = getPayload(result);

      if (Array.isArray(payload)) {
        return payload;
      }

      if (Array.isArray(payload?.orders)) {
        return payload.orders;
      }

      if (Array.isArray(payload?.products)) {
        return payload.products;
      }

      if (Array.isArray(payload?.items)) {
        return payload.items;
      }

      return [];
    };

    const getPagination = (result) => {
      const payload = getPayload(result);

      return (
        payload?.pagination ||
        result?.pagination ||
        result?.meta?.pagination ||
        result?.meta ||
        {}
      );
    };

    const fetchAll = async (
      endpoint,
      key
    ) => {
      const all = [];
      let page = 1;
      const limit = 100;

      while (page <= 100) {
        const separator =
          endpoint.includes("?")
            ? "&"
            : "?";

        const result = await fetchJson(
          `${process.env.NEXT_PUBLIC_API_URL}${endpoint}${separator}page=${page}&limit=${limit}`
        );

        const batch = getArray(result);

        if (batch.length) {
          all.push(...batch);
        }

        const pagination =
          getPagination(result);

        const totalPages =
          Number(
            pagination.totalPages ||
              pagination.pages ||
              0
          );

        const total =
          Number(
            pagination.total ||
              result?.total ||
              0
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

      return {
        key,
        data: all,
      };
    };

    const loadAnalytics = async () => {
      try {
        setLoading(true);
        setError("");

        const [
          orderStatsResult,
          userStatsResult,
          ordersResult,
          productsResult,
        ] = await Promise.all([
          fetchJson(
            `${process.env.NEXT_PUBLIC_API_URL}/api/admin/orders/stats`
          ),
          fetchJson(
            `${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/stats`
          ),
          fetchAll(
            "/api/admin/orders",
            "orders"
          ),
          fetchAll(
            "/api/admin/products",
            "products"
          ),
        ]);

        if (cancelled) return;

        const orderStats =
          getPayload(orderStatsResult);

        const userStats =
          getPayload(userStatsResult);

        const allOrders =
          ordersResult.data || [];

        const allProducts =
          productsResult.data || [];

        const revenue = Number(
          orderStats?.revenue || 0
        );

        const totalOrders = Number(
          orderStats?.total || 0
        );

        const customerCount = Number(
          userStats?.total ||
            userStats?.totalUsers ||
            userStats?.customers ||
            userStats?.users ||
            0
        );

        const paidOrders =
          allOrders.filter(
            (order) =>
              order.paymentStatus ===
              "paid"
          );

        const paidOrderCount =
          paidOrders.length;

        const averageOrderValue =
          paidOrderCount > 0
            ? revenue / paidOrderCount
            : 0;

        setMetrics({
          revenue,
          orders: totalOrders,
          customers: customerCount,
          averageOrderValue,
        });

        setOrders(allOrders);
        setProducts(allProducts);
      } catch (error) {
        if (cancelled) return;

        console.error(
          "Analytics error:",
          error
        );

        setError(
          error.message ||
            "Unable to load analytics data."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadAnalytics();

    return () => {
      cancelled = true;
    };
  }, []);

  const productCategoryMap = useMemo(() => {
    const map = new Map();

    products.forEach((product) => {
      const id =
        product?._id ||
        product?.id;

      if (!id) return;

      const category =
        product?.category?.name ||
        product?.category ||
        "Other";

      map.set(String(id), category);
    });

    return map;
  }, [products]);

  const revenueData = useMemo(() => {
    const now = new Date();

    const months = Array.from(
      { length: 6 },
      (_, index) => {
        const date = new Date(
          now.getFullYear(),
          now.getMonth() -
            (5 - index),
          1
        );

        return {
          year: date.getFullYear(),
          monthIndex:
            date.getMonth(),
          month: date.toLocaleDateString(
            "en-US",
            {
              month: "short",
            }
          ),
          revenue: 0,
        };
      }
    );

    orders.forEach((order) => {
      if (
        order.paymentStatus !==
        "paid"
      ) {
        return;
      }

      if (!order.createdAt) {
        return;
      }

      const date = new Date(
        order.createdAt
      );

      const target = months.find(
        (item) =>
          item.year ===
            date.getFullYear() &&
          item.monthIndex ===
            date.getMonth()
      );

      if (target) {
        target.revenue += Number(
          order.total || 0
        );
      }
    });

    return months.map(
      (item, index) => ({
        ...item,
        color:
          index ===
          months.length - 1
            ? "#111111"
            : "#5B5BD6",
      })
    );
  }, [orders]);

  const highestRevenue = Math.max(
    ...revenueData.map(
      (item) => item.revenue
    ),
    1
  );

  const categoryData = useMemo(() => {
    const revenueMap = new Map();

    orders.forEach((order) => {
      if (
        order.paymentStatus !==
        "paid"
      ) {
        return;
      }

      order.items?.forEach((item) => {
        const productId =
          item?.product?._id ||
          item?.product?.id ||
          item?.product;

        const category =
          productCategoryMap.get(
            String(productId)
          ) || "Other";

        const itemRevenue =
          Number(item.price || 0) *
          Number(item.quantity || 0);

        revenueMap.set(
          category,
          (revenueMap.get(category) ||
            0) + itemRevenue
        );
      });
    });

    const totalRevenue = Array.from(
      revenueMap.values()
    ).reduce(
      (sum, value) => sum + value,
      0
    );

    return Array.from(
      revenueMap.entries()
    )
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(
        ([name, revenue], index) => ({
          name,
          value:
            totalRevenue > 0
              ? Math.round(
                  (revenue /
                    totalRevenue) *
                    100
                )
              : 0,
          revenue,
          color:
            CATEGORY_COLORS[
              index %
                CATEGORY_COLORS.length
            ],
        })
      );
  }, [
    orders,
    productCategoryMap,
  ]);

  const orderStatus = useMemo(() => {
    const counts = {
      delivered: 0,
      processing: 0,
      shipped: 0,
      pending: 0,
      cancelled: 0,
    };

    orders.forEach((order) => {
      const status =
        order.orderStatus ||
        "pending";

      if (
        Object.prototype.hasOwnProperty.call(
          counts,
          status
        )
      ) {
        counts[status] += 1;
      }
    });

    const total =
      orders.length ||
      metrics.orders ||
      0;

    return [
      "delivered",
      "processing",
      "shipped",
      "pending",
      "cancelled",
    ]
      .filter(
        (status) =>
          counts[status] > 0
      )
      .map((status) => ({
        name:
          status
            .charAt(0)
            .toUpperCase() +
          status.slice(1),
        count: counts[status],
        percentage:
          total > 0
            ? Math.round(
                (counts[status] /
                  total) *
                  100
              )
            : 0,
        color:
          STATUS_COLORS[status],
      }));
  }, [orders, metrics.orders]);

  const topProducts = useMemo(() => {
    const productMap = new Map();

    orders.forEach((order) => {
      if (
        order.paymentStatus !==
        "paid"
      ) {
        return;
      }

      order.items?.forEach((item) => {
        const id =
          item?.product?._id ||
          item?.product?.id ||
          item?.product ||
          item?.name;

        const key = String(id);

        const current =
          productMap.get(key) || {
            name:
              item.name ||
              "Product",
            category:
              productCategoryMap.get(
                String(
                  item?.product?._id ||
                    item?.product?.id ||
                    item?.product
                )
              ) || "Other",
            sold: 0,
            revenue: 0,
          };

        current.sold += Number(
          item.quantity || 0
        );

        current.revenue +=
          Number(item.price || 0) *
          Number(item.quantity || 0);

        productMap.set(
          key,
          current
        );
      });
    });

    return Array.from(
      productMap.values()
    )
      .sort(
        (a, b) =>
          b.revenue - a.revenue
      )
      .slice(0, 4);
  }, [
    orders,
    productCategoryMap,
  ]);

  const activity = useMemo(() => {
    return [...orders]
      .sort(
        (a, b) =>
          new Date(
            b.createdAt || 0
          ) -
          new Date(
            a.createdAt || 0
          )
      )
      .slice(0, 4)
      .map((order) => {
        const status =
          order.orderStatus ||
          "pending";

        const customer =
          [
            order.shippingAddress
              ?.firstName,
            order.shippingAddress
              ?.lastName,
          ]
            .filter(Boolean)
            .join(" ") ||
          "Customer";

        const orderNumber =
          order.orderNumber ||
          order._id;

        return {
          title: `Order ${orderNumber} ${status}`,
          detail: customer,
          time: getRelativeTime(
            order.createdAt
          ),
        };
      });
  }, [orders]);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#999991]">
              Insights
            </span>

            <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[#111111] sm:text-4xl">
              Analytics
            </h2>

            <p className="mt-2 text-sm text-[var(--muted)]">
              Understand sales, customers,
              products, and store performance.
            </p>
          </div>

          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[var(--border)] bg-white px-4 py-2.5 text-xs font-medium text-[#555555]">
            <CalendarDays
              size={15}
              strokeWidth={1.8}
            />
            Last 6 months
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Revenue"
            value={formatCurrency(
              metrics.revenue
            )}
            change="Live"
            positive
            icon={CircleDollarSign}
            loading={loading}
          />

          <MetricCard
            label="Orders"
            value={metrics.orders.toLocaleString()}
            change="Live"
            positive
            icon={ShoppingCart}
            loading={loading}
          />

          <MetricCard
            label="Customers"
            value={metrics.customers.toLocaleString()}
            change="Live"
            positive
            icon={Users}
            loading={loading}
          />

          <MetricCard
            label="Avg. order value"
            value={formatCurrency(
              metrics.averageOrderValue
            )}
            change="Live"
            positive
            icon={Package}
            loading={loading}
          />
        </div>

        <section className="mt-6 rounded-[28px] border border-[var(--border)] bg-white p-5 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h3 className="font-semibold text-[#111111]">
                Revenue overview
              </h3>

              <p className="mt-1 text-xs text-[var(--muted)]">
                Monthly paid revenue performance
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-[#777777]">
              <span className="h-2.5 w-2.5 rounded-full bg-[#111111]" />
              Revenue
            </div>
          </div>

          <div className="mt-8">
            <div className="flex h-[280px] items-end gap-3 sm:gap-5">
              {revenueData.map((item) => {
                const height =
                  (item.revenue /
                    highestRevenue) *
                  100;

                return (
                  <div
                    key={`${item.year}-${item.monthIndex}`}
                    className="flex h-full flex-1 flex-col items-center justify-end"
                  >
                    <div className="mb-3 text-[10px] font-medium text-[#888880]">
                      {formatCompactCurrency(
                        item.revenue
                      )}
                    </div>

                    <div className="flex h-[210px] w-full items-end rounded-t-2xl bg-[#f2f2ee]">
                      <div
                        className="w-full rounded-t-2xl transition-all duration-500"
                        style={{
                          height: `${height}%`,
                          backgroundColor:
                            item.color,
                        }}
                      />
                    </div>

                    <span className="mt-3 text-[11px] font-medium text-[#888880]">
                      {item.month}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          <section className="rounded-[28px] border border-[var(--border)] bg-white p-5 sm:p-6">
            <div>
              <h3 className="font-semibold text-[#111111]">
                Sales by category
              </h3>

              <p className="mt-1 text-xs text-[var(--muted)]">
                Revenue contribution across categories
              </p>
            </div>

            <div className="mt-7 space-y-5">
              {categoryData.length === 0 ? (
                <EmptyState text="No category sales data yet." />
              ) : (
                categoryData.map(
                  (item) => (
                    <div key={item.name}>
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span
                            className="h-2.5 w-2.5 rounded-full"
                            style={{
                              backgroundColor:
                                item.color,
                            }}
                          />

                          <span className="text-sm font-medium text-[#111111]">
                            {item.name}
                          </span>

                          <span className="text-xs text-[#999991]">
                            {item.value}%
                          </span>
                        </div>

                        <span className="text-xs font-medium text-[#555555]">
                          {formatCurrency(
                            item.revenue
                          )}
                        </span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-[#eeeeea]">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${item.value}%`,
                            backgroundColor:
                              item.color,
                          }}
                        />
                      </div>
                    </div>
                  )
                )
              )}
            </div>
          </section>

          <section className="rounded-[28px] border border-[var(--border)] bg-white p-5 sm:p-6">
            <div>
              <h3 className="font-semibold text-[#111111]">
                Order status
              </h3>

              <p className="mt-1 text-xs text-[var(--muted)]">
                Current order distribution
              </p>
            </div>

            <div className="mt-7 space-y-4">
              {orderStatus.length === 0 ? (
                <EmptyState text="No order data yet." />
              ) : (
                orderStatus.map(
                  (item) => (
                    <div
                      key={item.name}
                      className="flex items-center gap-4"
                    >
                      <div className="flex w-24 shrink-0 items-center gap-2 text-sm text-[#555555]">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{
                            backgroundColor:
                              item.color,
                          }}
                        />

                        {item.name}
                      </div>

                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#eeeeea]">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${item.percentage}%`,
                            backgroundColor:
                              item.color,
                          }}
                        />
                      </div>

                      <div className="w-16 text-right">
                        <p className="text-sm font-semibold text-[#111111]">
                          {item.count}
                        </p>

                        <p className="text-[10px] text-[#999991]">
                          {item.percentage}%
                        </p>
                      </div>
                    </div>
                  )
                )
              )}
            </div>

            <div className="mt-8 rounded-2xl bg-[#f7f7f5] p-4">
              <p className="text-xs text-[#888880]">
                Total processed orders
              </p>

              <p className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-[#111111]">
                {metrics.orders.toLocaleString()}
              </p>
            </div>
          </section>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-[28px] border border-[var(--border)] bg-white">
            <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-5 sm:px-6">
              <div>
                <h3 className="font-semibold text-[#111111]">
                  Top products
                </h3>

                <p className="mt-1 text-xs text-[var(--muted)]">
                  Best-performing products by paid sales
                </p>
              </div>

              <BarChart3
                size={18}
                strokeWidth={1.8}
                className="text-[#888880]"
              />
            </div>

            <div className="divide-y divide-[var(--border)]">
              {topProducts.length === 0 ? (
                <div className="p-6">
                  <EmptyState text="No paid product sales yet." />
                </div>
              ) : (
                topProducts.map(
                  (product, index) => (
                    <div
                      key={product.name}
                      className="flex items-center gap-4 px-5 py-5 sm:px-6"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f0f0ec] text-xs font-semibold text-[#777777]">
                        0{index + 1}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h4 className="truncate text-sm font-semibold text-[#111111]">
                          {product.name}
                        </h4>

                        <p className="mt-1 text-xs text-[#999991]">
                          {product.category}{" "}
                          · {product.sold} sold
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-sm font-semibold text-[#111111]">
                          {formatCurrency(
                            product.revenue
                          )}
                        </p>

                        <p className="mt-1 text-[10px] text-[#999991]">
                          Revenue
                        </p>
                      </div>
                    </div>
                  )
                )
              )}
            </div>
          </section>

          <section className="rounded-[28px] border border-[var(--border)] bg-[#111111] p-6 text-white">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-white/40">
              Recent activity
            </span>

            <h3 className="mt-3 text-2xl font-semibold tracking-[-0.04em]">
              What's happening
            </h3>

            <div className="mt-7 space-y-5">
              {activity.length === 0 ? (
                <p className="text-sm text-white/50">
                  No recent activity yet.
                </p>
              ) : (
                activity.map(
                  (item, index) => (
                    <div
                      key={`${item.title}-${index}`}
                      className="flex gap-3"
                    >
                      <div className="relative flex w-4 justify-center">
                        <span className="mt-1.5 h-2 w-2 rounded-full bg-[#dfff00]" />

                        {index !==
                          activity.length -
                            1 && (
                          <span className="absolute top-4 h-full w-px bg-white/10" />
                        )}
                      </div>

                      <div className="flex-1 pb-1">
                        <p className="text-sm font-medium">
                          {item.title}
                        </p>

                        <div className="mt-1 flex flex-wrap gap-x-2 gap-y-1 text-xs text-white/45">
                          <span>
                            {item.detail}
                          </span>

                          <span>
                            ·
                          </span>

                          <span>
                            {item.time}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                )
              )}
            </div>

            <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/45">
                  Data source
                </span>

                <span className="rounded-full bg-[#dfff00]/10 px-2.5 py-1 text-[10px] font-medium text-[#dfff00]">
                  Live data
                </span>
              </div>

              <p className="mt-3 text-xs leading-5 text-white/35">
                Analytics are calculated from
                your current orders, products,
                and customer data.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  change,
  positive,
  icon: Icon,
  loading,
}) {
  return (
    <div className="rounded-[24px] border border-[var(--border)] bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f0f0ec]">
          <Icon
            size={19}
            strokeWidth={1.8}
          />
        </div>

        <span
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold ${
            positive
              ? "bg-[#eef4e5] text-[#60703f]"
              : "bg-[#f7eaea] text-[#9b5555]"
          }`}
        >
          {positive ? (
            <ArrowUpRight
              size={11}
              strokeWidth={2}
            />
          ) : (
            <ArrowDownRight
              size={11}
              strokeWidth={2}
            />
          )}

          {change}
        </span>
      </div>

      <p className="mt-6 text-xs text-[#888880]">
        {label}
      </p>

      <p className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-[#111111]">
        {loading ? "—" : value}
      </p>
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <p className="py-6 text-sm text-[#999991]">
      {text}
    </p>
  );
}

function formatCurrency(value) {
  return `$${Number(
    value || 0
  ).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatCompactCurrency(value) {
  const number = Number(value || 0);

  if (number >= 1000000) {
    return `$${(
      number / 1000000
    ).toFixed(1)}m`;
  }

  if (number >= 1000) {
    return `$${(
      number / 1000
    ).toFixed(1)}k`;
  }

  return `$${number.toFixed(0)}`;
}

function getRelativeTime(dateValue) {
  if (!dateValue) {
    return "Recently";
  }

  const date = new Date(dateValue);
  const now = new Date();

  const diffMs = Math.max(
    now.getTime() - date.getTime(),
    0
  );

  const minutes = Math.floor(
    diffMs / 60000
  );

  if (minutes < 1) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes} min ago`;
  }

  const hours = Math.floor(
    minutes / 60
  );

  if (hours < 24) {
    return `${hours} hr ago`;
  }

  const days = Math.floor(
    hours / 24
  );

  if (days < 30) {
    return `${days} day${
      days === 1 ? "" : "s"
    } ago`;
  }

  return date.toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
    }
  );
}

