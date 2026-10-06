
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Package,
  ShoppingBag,
} from "lucide-react";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL;

const getOrderStatusStyle = (status) => {
  const styles = {
    pending:
      "bg-amber-50 text-amber-700",
    processing:
      "bg-blue-50 text-blue-700",
    shipped:
      "bg-violet-50 text-violet-700",
    delivered:
      "bg-emerald-50 text-emerald-700",
    cancelled:
      "bg-red-50 text-red-700",
  };

  return (
    styles[status] ||
    "bg-gray-50 text-gray-700"
  );
};

const getPaymentStatusStyle = (status) => {
  const styles = {
    pending:
      "bg-amber-50 text-amber-700",
    pending_verification:
      "bg-orange-50 text-orange-700",
    paid:
      "bg-emerald-50 text-emerald-700",
    failed:
      "bg-red-50 text-red-700",
    refunded:
      "bg-gray-100 text-gray-700",
  };

  return (
    styles[status] ||
    "bg-gray-50 text-gray-700"
  );
};

const formatStatus = (status) => {
  return status
    ?.replaceAll("_", " ")
    .replace(/\b\w/g, (char) =>
      char.toUpperCase()
    );
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    }
  );
};

export default function OrdersPage() {
  const [orders, setOrders] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/api/orders`,
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          }
        );

        const result =
          await response.json();

        if (!response.ok) {
          throw new Error(
            result.message ||
              "Failed to fetch orders."
          );
        }

        setOrders(result.data || []);
      } catch (error) {
        console.error(
          "Orders fetch error:",
          error
        );

        setError(
          error.message ||
            "Unable to load your orders."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return (
    <>
      <Header />

      <main className="min-h-screen bg-[var(--background)]">
        <section className="container-main py-10 sm:py-14 lg:py-16">
          <div>
            <Link
              href="/"
              className="mb-7 inline-flex items-center gap-2 text-sm font-medium text-[#666666] transition hover:text-[#111111]"
            >
              <ArrowLeft
                size={16}
                strokeWidth={1.8}
              />
              Back to home
            </Link>

            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
              Your purchases
            </p>

            <div className="mt-3 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <h1 className="text-5xl font-semibold tracking-[-0.055em]">
                  My orders
                </h1>

                <p className="mt-4 max-w-xl text-sm leading-6 text-[var(--muted)]">
                  View your recent orders, payment
                  status, and delivery progress.
                </p>
              </div>

              {!loading &&
                orders.length > 0 && (
                  <span className="text-sm text-[var(--muted)]">
                    <span className="font-semibold text-[#111111]">
                      {orders.length}
                    </span>{" "}
                    {orders.length === 1
                      ? "order"
                      : "orders"}
                  </span>
                )}
            </div>
          </div>

          {loading ? (
            <div className="mt-10 space-y-5">
              {Array.from({
                length: 3,
              }).map((_, index) => (
                <div
                  key={index}
                  className="animate-pulse rounded-[28px] border border-[var(--border)] bg-white p-5 sm:p-6"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <div className="h-4 w-40 rounded bg-black/10" />
                      <div className="mt-3 h-3 w-28 rounded bg-black/10" />
                    </div>

                    <div className="h-9 w-24 rounded-full bg-black/10" />
                  </div>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="h-16 rounded-2xl bg-black/5" />
                    <div className="h-16 rounded-2xl bg-black/5" />
                    <div className="h-16 rounded-2xl bg-black/5" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="mt-10 rounded-[28px] border border-red-100 bg-red-50 px-6 py-16 text-center">
              <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[#111111]">
                Unable to load orders
              </h2>

              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-red-600/80">
                {error}
              </p>

              <Link
                href="/"
                className="mt-7 inline-flex rounded-full bg-[#111111] px-6 py-3.5 text-sm font-medium !text-white"
              >
                Back to home
              </Link>
            </div>
          ) : orders.length === 0 ? (
            <div className="flex min-h-[55vh] items-center justify-center">
              <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#ecece7]">
                  <ShoppingBag
                    size={23}
                    strokeWidth={1.6}
                  />
                </div>

                <h2 className="mt-5 text-2xl font-semibold tracking-[-0.03em]">
                  No orders yet
                </h2>

                <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[var(--muted)]">
                  Your completed and recent orders will
                  appear here.
                </p>

                <Link
                  href="/products"
                  className="mt-7 inline-flex rounded-full bg-[#111111] px-6 py-3.5 text-sm font-medium !text-white transition hover:opacity-80"
                >
                  Start shopping
                </Link>
              </div>
            </div>
          ) : (
            <div className="mt-10 space-y-5">
              {orders.map((order) => (
                <OrderCard
                  key={order._id}
                  order={order}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </>
  );
}

function OrderCard({ order }) {
  const previewItems =
    order.items?.slice(0, 3) || [];

  const extraItems =
    (order.items?.length || 0) - 3;

  return (
    <article className="overflow-hidden rounded-[28px] border border-[var(--border)] bg-white">
      <div className="flex flex-col gap-5 border-b border-[var(--border)] p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-base font-semibold tracking-[-0.02em] text-[#111111]">
              {order.orderNumber}
            </h2>

            <span
              className={`rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] ${getOrderStatusStyle(
                order.orderStatus
              )}`}
            >
              {formatStatus(
                order.orderStatus
              )}
            </span>
          </div>

          <p className="mt-2 text-xs text-[var(--muted)]">
            Placed on{" "}
            {formatDate(order.createdAt)}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span
            className={`rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] ${getPaymentStatusStyle(
              order.paymentStatus
            )}`}
          >
            Payment:{" "}
            {formatStatus(
              order.paymentStatus
            )}
          </span>

          <span className="text-base font-semibold text-[#111111]">
            ${Number(
              order.total || 0
            ).toFixed(2)}
          </span>
        </div>
      </div>

      <div className="p-5 sm:p-6">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="flex flex-wrap gap-3">
            {previewItems.map(
              (item, index) => (
                <div
                  key={`${item.product}-${index}`}
                  className="flex items-center gap-3 rounded-2xl bg-[#f6f6f3] px-3 py-3"
                >
                  <div className="flex h-14 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#ecece7]">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Package
                        size={17}
                        strokeWidth={1.6}
                      />
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="max-w-[180px] truncate text-xs font-semibold text-[#111111]">
                      {item.name}
                    </p>

                    <p className="mt-1 text-[10px] text-[var(--muted)]">
                      Qty {item.quantity}
                    </p>
                  </div>
                </div>
              )
            )}

            {extraItems > 0 && (
              <div className="flex min-h-[80px] items-center rounded-2xl bg-[#f6f6f3] px-4 text-xs font-medium text-[var(--muted)]">
                +{extraItems} more
              </div>
            )}
          </div>

          <Link
            href={`/orders/${order._id}`}
            className="group inline-flex w-fit items-center gap-2 text-sm font-medium text-[#111111]"
          >
            View order

            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] transition-transform duration-300 group-hover:translate-x-1">
              <ArrowRight
                size={15}
                strokeWidth={1.8}
              />
            </span>
          </Link>
        </div>

        <div className="mt-5 grid gap-3 border-t border-[var(--border)] pt-5 sm:grid-cols-3">
          <InfoItem
            label="Items"
            value={`${order.items?.length || 0} ${
              order.items?.length === 1
                ? "product"
                : "products"
            }`}
          />

          <InfoItem
            label="Payment method"
            value={formatStatus(
              order.paymentMethod
            )}
          />

          <InfoItem
            label="Shipping"
            value={
              Number(
                order.shippingCost || 0
              ) > 0
                ? `$${Number(
                    order.shippingCost
                  ).toFixed(2)}`
                : "Free"
            }
          />
        </div>
      </div>
    </article>
  );
}

function InfoItem({ label, value }) {
  return (
    <div className="rounded-2xl bg-[#fafaf8] px-4 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
        {label}
      </p>

      <p className="mt-1 text-sm font-medium text-[#111111]">
        {value}
      </p>
    </div>
  );
}

