"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
ArrowLeft,
ArrowUpRight,
CalendarDays,
Package,
} from "lucide-react";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const formatDate = (date) => {
if (!date) return "Date unavailable";

const parsedDate = new Date(date);

if (Number.isNaN(parsedDate.getTime())) {
return "Date unavailable";
}

return parsedDate.toLocaleDateString("en-US", {
month: "long",
day: "numeric",
year: "numeric",
});
};

const statusLabel = {
pending: "Pending",
processing: "Processing",
shipped: "Shipped",
delivered: "Delivered",
cancelled: "Cancelled",
};

const paymentLabel = {
pending: "Payment pending",
pending_verification: "Verification pending",
paid: "Paid",
failed: "Payment failed",
refunded: "Refunded",
};

export default function OrdersPage() {
const [orders, setOrders] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");

useEffect(() => {
const loadOrders = async () => {
try {
setLoading(true);
setError("");


    const response = await fetch(`${API_URL}/api/orders`, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data?.message || "Failed to load your orders."
      );
    }

    const orderList =
      data?.orders ||
      data?.data?.orders ||
      data?.data ||
      [];

    const normalizedOrders = Array.isArray(orderList)
      ? orderList.map((order) => ({
          id: order.orderNumber || order._id || order.id,
          orderId: order._id || order.id,
          date: order.createdAt,
          items: Array.isArray(order.items)
            ? order.items.map((item) => ({
                name: item.name || "Product",
                quantity: Number(item.quantity) || 0,
                price: Number(item.price) || 0,
                image: item.image || "",
              }))
            : [],
          total: Number(order.total) || 0,
          status:
            statusLabel[order.orderStatus] ||
            order.orderStatus ||
            "Pending",
          payment:
            paymentLabel[order.paymentStatus] ||
            order.paymentStatus ||
            "Payment pending",
        }))
      : [];

    setOrders(normalizedOrders);
  } catch (err) {
    setError(err.message || "Failed to load your orders.");
    setOrders([]);
  } finally {
    setLoading(false);
  }
};

loadOrders();

}, []);

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
          Shopping history
        </p>

        <h1 className="mt-4 text-5xl font-semibold tracking-[-0.055em] sm:text-6xl">
          My orders
        </h1>

        <p className="mt-5 max-w-xl text-sm leading-6 text-[var(--muted)] sm:text-base">
          View your previous purchases, order status and payment details.
        </p>
      </div>

      {error && (
        <div className="mt-10 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {loading ? (
        <div className="mt-10 space-y-4">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-[220px] animate-pulse rounded-[24px] bg-white"
            />
          ))}
        </div>
      ) : orders.length > 0 ? (
        <div className="mt-10 space-y-4">
          {orders.map((order) => (
            <OrderCard key={order.orderId || order.id} order={order} />
          ))}
        </div>
      ) : (
        <div className="mt-10 rounded-[24px] bg-white px-6 py-16 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#ecece7]">
            <Package size={24} strokeWidth={1.7} />
          </div>

          <h2 className="mt-5 text-xl font-semibold">
            No orders yet
          </h2>

          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[var(--muted)]">
            Your completed and active orders will appear here once you
            place your first order.
          </p>

          <Link
            href="/products"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#111111] px-5 py-3 text-sm font-medium !text-white transition hover:bg-[#252525]"
          >
            Start shopping
          </Link>
        </div>
      )}
    </section>
  </main>

  <Footer />
</>


);
}

function OrderCard({ order }) {
const statusStyles = {
Pending: "bg-[#f4efe1] text-[#80682c]",
Processing: "bg-[#eef1e8] text-[#63734c]",
Delivered: "bg-[#e6f3dd] text-[#48752f]",
Shipped: "bg-[#e9eef8] text-[#48628c]",
Cancelled: "bg-[#f4e4e4] text-[#8b3d3d]",
};

const paymentStyles = {
Paid: "bg-[#e9f4eb] text-[#397047]",
Refunded: "bg-[#f3e8e8] text-[#814545]",
"Payment pending": "bg-[#f4efe1] text-[#80682c]",
"Verification pending": "bg-[#eeeaf7] text-[#68508a]",
"Payment failed": "bg-[#f4e4e4] text-[#8b3d3d]",
};

return ( <article className="rounded-[24px] bg-white p-5 sm:p-6"> <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between"> <div className="flex items-start gap-4"> <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#ecece7]"> <Package size={18} strokeWidth={1.7} /> </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
          Order
        </p>

        <h2 className="mt-1 text-base font-semibold">
          {order.id}
        </h2>

        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-[var(--muted)]">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays size={13} strokeWidth={1.7} />
            {formatDate(order.date)}
          </span>

          <span>·</span>

          <span>
            {order.items.reduce(
              (total, item) => total + item.quantity,
              0
            )}{" "}
            items
          </span>
        </div>
      </div>
    </div>

    <div className="flex flex-wrap gap-2 lg:justify-end">
      <span
        className={`rounded-full px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.12em] ${
          statusStyles[order.status] ||
          "bg-[#eeeeea] text-[#555555]"
        }`}
      >
        {order.status}
      </span>

      <span
        className={`rounded-full px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.12em] ${
          paymentStyles[order.payment] ||
          "bg-[#eeeeea] text-[#555555]"
        }`}
      >
        {order.payment}
      </span>
    </div>
  </div>

  <div className="mt-6 border-t border-[var(--border)] pt-5">
    {order.items.length > 0 ? (
      <div className="flex flex-wrap items-center gap-3">
        {order.items.map((item, index) => (
          <div
            key={`${order.orderId || order.id}-${index}`}
            className="flex items-center gap-3"
          >
            <div className="h-14 w-12 overflow-hidden rounded-xl bg-[#ecece7]">
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <Package
                    size={17}
                    strokeWidth={1.5}
                    className="text-[#999]"
                  />
                </div>
              )}
            </div>

            <div className="hidden sm:block">
              <p className="max-w-[180px] truncate text-xs font-medium">
                {item.name}
              </p>

              <p className="mt-1 text-[11px] text-[var(--muted)]">
                Qty {item.quantity}
              </p>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <p className="text-sm text-[var(--muted)]">
        No item information available.
      </p>
    )}

    <div className="mt-6 flex flex-col gap-4 border-t border-[var(--border)] pt-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-xs text-[var(--muted)]">Order total</p>

        <p className="mt-1 text-lg font-semibold">
          ${Number(order.total || 0).toFixed(2)}
        </p>
      </div>

      <Link
        href={`/account/orders/${order.orderId || order.id}`}
        className="group inline-flex w-fit items-center gap-2 rounded-full border border-[var(--border)] px-5 py-3 text-xs font-medium transition hover:border-[#111111]"
      >
        View order

        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#111111] !text-white transition-transform duration-300 group-hover:rotate-45">
          <ArrowUpRight size={13} strokeWidth={2} />
        </span>
      </Link>
    </div>
  </div>
</article>


);
}
