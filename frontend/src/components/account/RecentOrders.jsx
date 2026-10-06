import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export default function RecentOrders({
  orders = [],
}) {
  return (
    <div className="rounded-[24px] bg-white p-6 sm:p-7">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
            Shopping history
          </p>

          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
            Recent orders
          </h2>
        </div>

        <Link
          href="/account/orders"
          className="text-xs font-medium underline underline-offset-4"
        >
          View all
        </Link>
      </div>

      <div className="mt-6 divide-y divide-[var(--border)]">
        {orders.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-sm font-medium">
              No orders yet
            </p>

            <p className="mt-2 text-xs text-[var(--muted)]">
              Your recent orders will appear here.
            </p>

            <Link
              href="/products"
              className="mt-5 inline-flex rounded-full bg-[#111111] px-4 py-2.5 text-xs font-medium !text-white transition hover:opacity-80"
            >
              Start shopping
            </Link>
          </div>
        ) : (
          orders.map((order) => {
            const orderId =
              order._id ||
              order.id;

            const displayOrderNumber =
              order.orderNumber ||
              `#${orderId}`;

            const itemCount =
              Array.isArray(order.items)
                ? order.items.reduce(
                    (
                      total,
                      item
                    ) =>
                      total +
                      Number(
                        item.quantity || 0
                      ),
                    0
                  )
                : 0;

            const date = order.createdAt
              ? new Date(
                  order.createdAt
                ).toLocaleDateString(
                  "en-US",
                  {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  }
                )
              : "—";

            const status =
              order.orderStatus ||
              order.status ||
              "pending";

            const statusLabel =
              status
                .charAt(0)
                .toUpperCase() +
              status.slice(1);

            return (
              <div
                key={orderId}
                className="flex flex-col gap-4 py-5 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-semibold">
                    {displayOrderNumber}
                  </p>

                  <p className="mt-1 text-xs text-[var(--muted)]">
                    {date} · {itemCount}{" "}
                    {itemCount === 1
                      ? "item"
                      : "items"}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-5 sm:justify-end">
                  <div className="text-right">
                    <p className="text-sm font-semibold">
                      $
                      {Number(
                        order.total || 0
                      ).toFixed(2)}
                    </p>

                    <span
                      className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.1em] ${
                        status ===
                        "delivered"
                          ? "bg-[#e6f3dd] text-[#48752f]"
                          : status ===
                              "cancelled"
                            ? "bg-[#fde8e8] text-[#a23d3d]"
                            : "bg-[#e9eef8] text-[#48628c]"
                      }`}
                    >
                      {statusLabel}
                    </span>
                  </div>

                  <Link
                    href={`/account/orders/${orderId}`}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)]"
                    aria-label={`View ${displayOrderNumber}`}
                  >
                    <ArrowUpRight
                      size={15}
                    />
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

