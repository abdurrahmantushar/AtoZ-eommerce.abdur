"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Eye,
  Package,
  Search,
  X,
} from "lucide-react";

const statusOptions = [
  "All",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
];

const statusValues = {
  Processing: "processing",
  Shipped: "shipped",
  Delivered: "delivered",
  Cancelled: "cancelled",
};

const statusLabels = {
  pending: "Pending",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const paymentLabels = {
  pending: "Pending",
  pending_verification:
    "Verification",
  paid: "Paid",
  failed: "Failed",
  refunded: "Refunded",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [selectedOrder, setSelectedOrder] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [updatingId, setUpdatingId] =
    useState(null);

  const [error, setError] =
    useState("");

  const getOrders = (result) => {
    if (Array.isArray(result?.data)) {
      return result.data;
    }

    if (
      Array.isArray(
        result?.data?.orders
      )
    ) {
      return result.data.orders;
    }

    if (Array.isArray(result?.orders)) {
      return result.orders;
    }

    return [];
  };

  const getPagination = (result) => {
    return (
      result?.data?.pagination ||
      result?.pagination ||
      result?.meta ||
      {}
    );
  };

  const fetchOrders = async () => {
    const allOrders = [];
    let page = 1;
    const limit = 100;

    while (page <= 100) {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/orders?page=${page}&limit=${limit}`,
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
            "Failed to fetch orders"
        );
      }

      const batch =
        getOrders(result);

      allOrders.push(...batch);

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
          allOrders.length >= total) ||
        batch.length < limit
      ) {
        break;
      }

      page += 1;
    }

    return allOrders;
  };

  const normalizeOrder = (order) => {
    const shippingAddress =
      order.shippingAddress || {};

    const products =
      Array.isArray(order.items)
        ? order.items
        : [];

    const itemsCount =
      products.reduce(
        (total, item) =>
          total +
          Number(item.quantity || 0),
        0
      );

    const customerName =
      [
        shippingAddress.firstName,
        shippingAddress.lastName,
      ]
        .filter(Boolean)
        .join(" ") ||
      order.user?.name ||
      "Customer";

    const customerEmail =
      shippingAddress.email ||
      order.user?.email ||
      "—";

    const addressParts = [
      shippingAddress.address,
      shippingAddress.city,
      shippingAddress.postalCode,
      shippingAddress.country,
    ].filter(Boolean);

    return {
      ...order,
      id:
        order._id ||
        order.id,
      orderNumber:
        order.orderNumber ||
        order._id,
      customer: customerName,
      email: customerEmail,
      phone:
        shippingAddress.phone ||
        "Not available",
      date: order.createdAt,
      status:
        order.orderStatus ||
        "pending",
      payment:
        order.paymentStatus ||
        "pending",
      total: Number(
        order.total || 0
      ),
      items: itemsCount,
      address:
        addressParts.join(", ") ||
        "Address not available",
      products,
    };
  };

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const data =
        await fetchOrders();

      setOrders(
        data.map(normalizeOrder)
      );
    } catch (error) {
      console.error(
        "Admin orders fetch error:",
        error
      );

      setError(
        error.message ||
          "Unable to load orders."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    const term =
      search.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesSearch =
        !term ||
        String(
          order.orderNumber || ""
        )
          .toLowerCase()
          .includes(term) ||
        order.customer
          ?.toLowerCase()
          .includes(term) ||
        order.email
          ?.toLowerCase()
          .includes(term);

      const matchesStatus =
        status === "All" ||
        statusLabels[
          order.status
        ] === status;

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [
    orders,
    search,
    status,
  ]);

  const processingCount =
    orders.filter(
      (order) =>
        order.status ===
        "processing"
    ).length;

  const shippedCount =
    orders.filter(
      (order) =>
        order.status ===
        "shipped"
    ).length;

  const deliveredCount =
    orders.filter(
      (order) =>
        order.status ===
        "delivered"
    ).length;

  const updateOrderStatus = async (
    orderId,
    newStatus
  ) => {
    const backendStatus =
      statusValues[newStatus] ||
      newStatus.toLowerCase();

    try {
      setUpdatingId(orderId);
      setError("");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/orders/${orderId}/status`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            status:
              backendStatus,
          }),
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Failed to update order status"
        );
      }

      const updatedOrder =
        result.data ||
        result.order ||
        result;

      setOrders((current) =>
        current.map((order) =>
          order.id === orderId
            ? {
                ...order,
                status:
                  updatedOrder?.orderStatus ||
                  backendStatus,
              }
            : order
        )
      );

      setSelectedOrder((current) =>
        current?.id === orderId
          ? {
              ...current,
              status:
                updatedOrder?.orderStatus ||
                backendStatus,
            }
          : current
      );
    } catch (error) {
      console.error(
        "Order status update error:",
        error
      );

      setError(
        error.message ||
          "Unable to update order status."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-8">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#999991]">
            Sales
          </span>

          <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[#111111] sm:text-4xl">
            Orders
          </h2>

          <p className="mt-2 text-sm text-[var(--muted)]">
            Review customer orders and manage
            their fulfillment status.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <OrderStat
            label="Total orders"
            value={orders.length}
          />

          <OrderStat
            label="Processing"
            value={processingCount}
          />

          <OrderStat
            label="Shipped"
            value={shippedCount}
          />

          <OrderStat
            label="Delivered"
            value={deliveredCount}
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
                  placeholder="Search order ID, customer or email..."
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
                        ? "All statuses"
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
                <table className="w-full min-w-[950px]">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-left">
                      <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#999991]">
                        Order
                      </th>

                      <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#999991]">
                        Customer
                      </th>

                      <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#999991]">
                        Date
                      </th>

                      <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#999991]">
                        Payment
                      </th>

                      <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#999991]">
                        Status
                      </th>

                      <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#999991]">
                        Total
                      </th>

                      <th className="px-6 py-4 text-right text-[10px] font-semibold uppercase tracking-[0.14em] text-[#999991]">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredOrders.map(
                      (order) => (
                        <OrderRow
                          key={order.id}
                          order={order}
                          onView={
                            setSelectedOrder
                          }
                        />
                      )
                    )}
                  </tbody>
                </table>
              </div>

              <div className="grid gap-3 p-4 lg:hidden">
                {filteredOrders.map(
                  (order) => (
                    <OrderMobileCard
                      key={
                        order.id
                      }
                      order={order}
                      onView={
                        setSelectedOrder
                      }
                    />
                  )
                )}
              </div>

              {filteredOrders.length ===
                0 && (
                <div className="px-6 py-20 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#f0f0ec]">
                    <Package
                      size={23}
                      strokeWidth={1.7}
                    />
                  </div>

                  <h3 className="mt-5 text-xl font-semibold text-[#111111]">
                    No orders found
                  </h3>

                  <p className="mt-2 text-sm text-[var(--muted)]">
                    Try changing your search or status filter.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {selectedOrder && (
        <OrderDetailsModal
          order={
            selectedOrder
          }
          onClose={() =>
            setSelectedOrder(null)
          }
          onStatusChange={
            updateOrderStatus
          }
          updating={
            updatingId ===
            selectedOrder.id
          }
        />
      )}
    </div>
  );
}

function OrderStat({
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

function OrderRow({
  order,
  onView,
}) {
  return (
    <tr className="border-b border-[var(--border)] last:border-0">
      <td className="px-6 py-5">
        <p className="text-sm font-semibold text-[#111111]">
          {order.orderNumber}
        </p>

        <p className="mt-1 text-xs text-[#999991]">
          {order.items}{" "}
          {order.items === 1
            ? "item"
            : "items"}
        </p>
      </td>

      <td className="px-6 py-5">
        <p className="text-sm font-medium text-[#111111]">
          {order.customer}
        </p>

        <p className="mt-1 text-xs text-[#999991]">
          {order.email}
        </p>
      </td>

      <td className="px-6 py-5 text-sm text-[#666666]">
        {formatDate(
          order.date
        )}
      </td>

      <td className="px-6 py-5">
        <PaymentBadge
          status={order.payment}
        />
      </td>

      <td className="px-6 py-5">
        <StatusBadge
          status={order.status}
        />
      </td>

      <td className="px-6 py-5 text-sm font-semibold text-[#111111]">
        $
        {Number(
          order.total || 0
        ).toFixed(2)}
      </td>

      <td className="px-6 py-5">
        <button
          type="button"
          onClick={() =>
            onView(order)
          }
          className="ml-auto flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] text-[#666] transition hover:border-[#111111] hover:text-[#111111]"
          aria-label={`View ${order.orderNumber}`}
        >
          <Eye
            size={15}
            strokeWidth={1.8}
          />
        </button>
      </td>
    </tr>
  );
}

function OrderMobileCard({
  order,
  onView,
}) {
  return (
    <div className="rounded-2xl bg-[#f7f7f5] p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-[#111111]">
            {order.orderNumber}
          </p>

          <p className="mt-1 text-xs text-[#888880]">
            {order.customer}
          </p>
        </div>

        <StatusBadge
          status={order.status}
        />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.12em] text-[#999991]">
            Date
          </p>

          <p className="mt-1 text-xs font-medium text-[#111111]">
            {formatDate(
              order.date
            )}
          </p>
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-[0.12em] text-[#999991]">
            Payment
          </p>

          <p className="mt-1 text-xs font-medium text-[#111111]">
            {
              paymentLabels[
                order.payment
              ] ||
                order.payment
            }
          </p>
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-[0.12em] text-[#999991]">
            Total
          </p>

          <p className="mt-1 text-xs font-semibold text-[#111111]">
            $
            {Number(
              order.total || 0
            ).toFixed(2)}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={() =>
          onView(order)
        }
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-3 py-2.5 text-xs font-medium text-[#111111]"
      >
        <Eye
          size={14}
          strokeWidth={1.8}
        />

        View order
      </button>
    </div>
  );
}

function StatusBadge({
  status,
}) {
  const styles = {
    pending:
      "bg-[#f0f0ec] text-[#666666]",
    processing:
      "bg-[#f2eee4] text-[#8a7445]",
    shipped:
      "bg-[#edf1f6] text-[#5d6d82]",
    delivered:
      "bg-[#eef4e5] text-[#60703f]",
    cancelled:
      "bg-[#f7eaea] text-[#9b5555]",
  };

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
        styles[status] ||
        "bg-[#f0f0ec] text-[#666666]"
      }`}
    >
      {statusLabels[status] ||
        status}
    </span>
  );
}

function PaymentBadge({
  status,
}) {
  const styles = {
    paid:
      "bg-[#eef4e5] text-[#60703f]",
    pending:
      "bg-[#f2eee4] text-[#8a7445]",
    pending_verification:
      "bg-[#f2eee4] text-[#8a7445]",
    refunded:
      "bg-[#f0f0ec] text-[#666666]",
    failed:
      "bg-[#f7eaea] text-[#9b5555]",
  };

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
        styles[status] ||
        "bg-[#f0f0ec] text-[#666666]"
      }`}
    >
      {paymentLabels[status] ||
        status}
    </span>
  );
}

function OrderDetailsModal({
  order,
  onClose,
  onStatusChange,
  updating,
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
        aria-label="Close order details"
      />

      <div className="relative max-h-[90vh] w-full overflow-y-auto rounded-t-[28px] bg-white p-6 sm:max-w-2xl sm:rounded-[28px]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#999991]">
              Order details
            </span>

            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[#111111]">
              {order.orderNumber}
            </h2>

            <p className="mt-1 text-xs text-[#888880]">
              Placed on{" "}
              {formatDate(
                order.date
              )}
            </p>
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
          <div className="rounded-2xl bg-[#f7f7f5] p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#999991]">
              Customer
            </p>

            <p className="mt-2 text-sm font-semibold text-[#111111]">
              {order.customer}
            </p>

            <p className="mt-1 text-xs text-[#666666]">
              {order.email}
            </p>

            {order.phone && (
              <p className="mt-1 text-xs text-[#666666]">
                {order.phone}
              </p>
            )}
          </div>

          <div className="rounded-2xl bg-[#f7f7f5] p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#999991]">
              Shipping address
            </p>

            <p className="mt-2 text-xs leading-5 text-[#666666]">
              {order.address}
            </p>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-[var(--border)] p-5">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-sm font-semibold text-[#111111]">
              Order status
            </h3>

            <StatusBadge
              status={order.status}
            />
          </div>

          <select
            value={order.status}
            onChange={(event) =>
              onStatusChange(
                order.id,
                event.target
                  .value
              )
            }
            disabled={updating}
            className="mt-4 w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm text-[#111111] outline-none focus:border-[#111111] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <option value="processing">
              Processing
            </option>

            <option value="shipped">
              Shipped
            </option>

            <option value="delivered">
              Delivered
            </option>

            <option value="cancelled">
              Cancelled
            </option>
          </select>

          {updating && (
            <p className="mt-3 text-xs text-[#888880]">
              Updating order status...
            </p>
          )}
        </div>

        <div className="mt-5 rounded-2xl border border-[var(--border)] p-5">
          <h3 className="text-sm font-semibold text-[#111111]">
            Items
          </h3>

          <div className="mt-4 space-y-3">
            {order.products.map(
              (product, index) => {
                const productImage =
                  product.image;

                return (
                  <div
                    key={`${product.name}-${index}`}
                    className="flex items-center justify-between gap-4 rounded-2xl bg-[#f7f7f5] p-4"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-white">
                        {productImage ? (
                          <img
                            src={
                              productImage
                            }
                            alt={
                              product.name
                            }
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <Package
                              size={16}
                              strokeWidth={
                                1.7
                              }
                            />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-[#111111]">
                          {
                            product.name
                          }
                        </p>

                        <p className="mt-1 text-xs text-[#888880]">
                          Quantity:{" "}
                          {
                            product.quantity
                          }
                        </p>

                        {(product.selectedColor ||
                          product.selectedSize) && (
                          <p className="mt-1 text-[10px] text-[#999999]">
                            {product.selectedColor &&
                              `Color: ${product.selectedColor}`}

                            {product.selectedColor &&
                              product.selectedSize &&
                              " • "}

                            {product.selectedSize &&
                              `Size: ${product.selectedSize}`}
                          </p>
                        )}
                      </div>
                    </div>

                    <p className="shrink-0 text-sm font-semibold text-[#111111]">
                      $
                      {(
                        Number(
                          product.price ||
                            0
                        ) *
                        Number(
                          product.quantity ||
                            0
                        )
                      ).toFixed(2)}
                    </p>
                  </div>
                );
              }
            )}
          </div>
        </div>

        <div className="mt-5 rounded-2xl bg-[#111111] p-5 text-white">
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/55">
              Payment
            </span>

            <span>
              {paymentLabels[
                order.payment
              ] ||
                order.payment}
            </span>
          </div>

          {order.paymentMethod && (
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-white/55">
                Method
              </span>

              <span>
                {order.paymentMethod}
              </span>
            </div>
          )}

          <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3">
            <span className="font-medium text-white/55">
              Order total
            </span>

            <span className="text-xl font-semibold">
              $
              {Number(
                order.total || 0
              ).toFixed(2)}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border border-[var(--border)] px-5 py-3.5 text-sm font-medium text-[#111111] transition hover:bg-[#f5f5f2]"
        >
          Done

          <ArrowRight
            size={16}
            strokeWidth={1.8}
          />
        </button>
      </div>
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

