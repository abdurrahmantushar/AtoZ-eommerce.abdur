"use client";

import { useEffect, useMemo, useState } from "react";
import {
Check,
Eye,
MessageSquare,
Search,
Star,
Trash2,
X,
} from "lucide-react";

const statusOptions = [
"All",
"Published",
"Pending",
"Rejected",
];

const backendStatus = {
Published: "approved",
Rejected: "rejected",
};

const statusLabels = {
approved: "Published",
pending: "Pending",
rejected: "Rejected",
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function parseResponse(response) {
const contentType =
response.headers.get("content-type") || "";

const text = await response.text();

if (!text) {
return {};
}

if (contentType.includes("application/json")) {
try {
return JSON.parse(text);
} catch {
throw new Error(
`Server returned invalid JSON (${response.status}).`
);
}
}

throw new Error(
`Reviews API returned ${response.status} ${response.statusText}. Response was not JSON.`
);
}

export default function AdminReviewsPage() {
const [reviews, setReviews] = useState([]);
const [search, setSearch] = useState("");
const [status, setStatus] = useState("All");
const [selectedReview, setSelectedReview] =
useState(null);

const [loading, setLoading] = useState(true);
const [updatingId, setUpdatingId] =
useState(null);
const [deletingId, setDeletingId] =
useState(null);
const [error, setError] = useState("");

const getReviews = (result) => {
if (Array.isArray(result?.data)) {
return result.data;
}

if (
  Array.isArray(result?.data?.reviews)
) {
  return result.data.reviews;
}

if (
  Array.isArray(result?.reviews)
) {
  return result.reviews;
}

return [];

};

const normalizeReview = (review) => {
return {
...review,

  id:
    review._id ||
    review.id,

  customer:
    review.userName ||
    review.user?.name ||
    review.name ||
    "Customer",

  email:
    review.user?.email ||
    review.email ||
    "—",

  product:
    review.product?.name ||
    review.productName ||
    "Product",

  rating: Number(
    review.rating || 0
  ),

  title:
    review.title ||
    "Customer review",

  comment:
    review.comment ||
    "",

  date:
    review.createdAt ||
    review.date,

  status:
    review.status ||
    "pending",

  verified:
    Boolean(
      review.isVerifiedPurchase
    ),
};

};

const fetchReviews = async () => {
try {
setLoading(true);
setError("");

  const response = await fetch(
    `${API_URL}/api/reviews`,
    {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    }
  );

  const result =
    await parseResponse(response);

  if (!response.ok) {
    throw new Error(
      result?.message ||
        `Failed to fetch reviews (${response.status})`
    );
  }

  const data =
    getReviews(result);

  setReviews(
    data.map(
      normalizeReview
    )
  );
} catch (error) {
  console.error(
    "Reviews fetch error:",
    error
  );

  setError(
    error?.message ||
      "Unable to load reviews."
  );
} finally {
  setLoading(false);
}

};

useEffect(() => {
fetchReviews();
}, []);

const filteredReviews = useMemo(() => {
const term =
search.trim().toLowerCase();

return reviews.filter(
  (review) => {
    const matchesSearch =
      !term ||
      review.customer
        ?.toLowerCase()
        .includes(term) ||
      review.product
        ?.toLowerCase()
        .includes(term) ||
      review.title
        ?.toLowerCase()
        .includes(term) ||
      review.comment
        ?.toLowerCase()
        .includes(term);

    const reviewStatus =
      statusLabels[
        review.status
      ] || review.status;

    const matchesStatus =
      status === "All" ||
      reviewStatus === status;

    return (
      matchesSearch &&
      matchesStatus
    );
  }
);

}, [
reviews,
search,
status,
]);

const publishedCount =
reviews.filter(
(review) =>
review.status ===
"approved"
).length;

const pendingCount =
reviews.filter(
(review) =>
review.status ===
"pending"
).length;

const rejectedCount =
reviews.filter(
(review) =>
review.status ===
"rejected"
).length;

const updateStatus = async (
id,
newStatus
) => {
const nextStatus =
backendStatus[newStatus];

if (!nextStatus) {
  return;
}

try {
  setUpdatingId(id);
  setError("");

  const response = await fetch(
    `${API_URL}/api/reviews/${id}/status`,
    {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify({
        status: nextStatus,
      }),
    }
  );

  const result =
    await parseResponse(response);

  if (!response.ok) {
    throw new Error(
      result?.message ||
        "Failed to update review status."
    );
  }

  setReviews((current) =>
    current.map((review) =>
      review.id === id
        ? {
            ...review,
            status:
              nextStatus,
          }
        : review
    )
  );

  setSelectedReview(
    (current) =>
      current?.id === id
        ? {
            ...current,
            status:
              nextStatus,
          }
        : current
  );
} catch (error) {
  console.error(
    "Review status update error:",
    error
  );

  setError(
    error?.message ||
      "Unable to update review status."
  );
} finally {
  setUpdatingId(null);
}

};

const handleDelete = async (
id
) => {
const review = reviews.find(
(item) => item.id === id
);

const confirmed =
  window.confirm(
    `Delete review from ${
      review?.customer ||
      "this customer"
    }?`
  );

if (!confirmed) {
  return;
}

try {
  setDeletingId(id);
  setError("");

  const response = await fetch(
    `${API_URL}/api/reviews/${id}`,
    {
      method: "DELETE",
      credentials: "include",
    }
  );

  const result =
    await parseResponse(response);

  if (!response.ok) {
    throw new Error(
      result?.message ||
        "Failed to delete review."
    );
  }

  setReviews((current) =>
    current.filter(
      (review) =>
        review.id !== id
    )
  );

  setSelectedReview(null);
} catch (error) {
  console.error(
    "Review delete error:",
    error
  );

  setError(
    error?.message ||
      "Unable to delete review."
  );
} finally {
  setDeletingId(null);
}

};

return ( <div className="p-4 sm:p-6 lg:p-8"> <div className="mx-auto max-w-[1500px]"> <div className="mb-8"> <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#999991]">
Customer feedback </span>

      <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[#111111] sm:text-4xl">
        Reviews
      </h2>

      <p className="mt-2 text-sm text-[var(--muted)]">
        Review, publish, and manage
        customer feedback.
      </p>
    </div>

    {error && (
      <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
        {error}
      </div>
    )}

    <div className="grid gap-4 sm:grid-cols-4">
      <StatCard
        label="Total reviews"
        value={reviews.length}
      />

      <StatCard
        label="Published"
        value={publishedCount}
      />

      <StatCard
        label="Pending"
        value={pendingCount}
      />

      <StatCard
        label="Rejected"
        value={rejectedCount}
      />
    </div>

    <div className="mt-6 rounded-[28px] border border-[var(--border)] bg-white">
      <div className="border-b border-[var(--border)] p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row">
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
              placeholder="Search customer, product or review..."
              className="w-full rounded-2xl border border-transparent bg-[#f5f5f2] py-3.5 pl-11 pr-4 text-sm outline-none transition placeholder:text-[#aaa] focus:border-[#111111] focus:bg-white"
            />
          </div>

          <select
            value={status}
            onChange={(event) =>
              setStatus(
                event.target.value
              )
            }
            className="rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none"
          >
            {statusOptions.map(
              (item) => (
                <option
                  key={item}
                  value={item}
                >
                  {item === "All"
                    ? "All status"
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
            length: 5,
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
                  <th className="px-6 py-4 text-[10px] uppercase tracking-[0.14em] text-[#999991]">
                    Customer
                  </th>

                  <th className="px-6 py-4 text-[10px] uppercase tracking-[0.14em] text-[#999991]">
                    Product
                  </th>

                  <th className="px-6 py-4 text-[10px] uppercase tracking-[0.14em] text-[#999991]">
                    Rating
                  </th>

                  <th className="px-6 py-4 text-[10px] uppercase tracking-[0.14em] text-[#999991]">
                    Status
                  </th>

                  <th className="px-6 py-4 text-right text-[10px] uppercase tracking-[0.14em] text-[#999991]">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredReviews.map(
                  (review) => (
                    <tr
                      key={review.id}
                      className="border-b border-[var(--border)] last:border-0"
                    >
                      <td className="px-6 py-5">
                        <p className="text-sm font-semibold text-[#111111]">
                          {
                            review.customer
                          }
                        </p>

                        <p className="mt-1 text-xs text-[#999991]">
                          {formatDate(
                            review.date
                          )}
                        </p>
                      </td>

                      <td className="px-6 py-5">
                        <p className="text-sm text-[#555555]">
                          {
                            review.product
                          }
                        </p>

                        <p className="mt-1 max-w-[220px] truncate text-xs text-[#999991]">
                          {
                            review.title
                          }
                        </p>
                      </td>

                      <td className="px-6 py-5">
                        <RatingStars
                          rating={
                            review.rating
                          }
                        />
                      </td>

                      <td className="px-6 py-5">
                        <ReviewStatus
                          status={
                            review.status
                          }
                        />
                      </td>

                      <td className="px-6 py-5">
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedReview(
                              review
                            )
                          }
                          className="ml-auto flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] text-[#666] transition hover:border-[#111111] hover:text-[#111111]"
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
            {filteredReviews.map(
              (review) => (
                <div
                  key={review.id}
                  className="rounded-2xl bg-[#f7f7f5] p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-sm font-semibold text-[#111111]">
                        {
                          review.customer
                        }
                      </h3>

                      <p className="mt-1 text-xs text-[#888880]">
                        {
                          review.product
                        }
                      </p>
                    </div>

                    <ReviewStatus
                      status={
                        review.status
                      }
                    />
                  </div>

                  <div className="mt-4">
                    <RatingStars
                      rating={
                        review.rating
                      }
                    />
                  </div>

                  <p className="mt-3 text-sm font-medium text-[#111111]">
                    {
                      review.title
                    }
                  </p>

                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#666666]">
                    {
                      review.comment
                    }
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      setSelectedReview(
                        review
                      )
                    }
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-white py-2.5 text-xs font-medium"
                  >
                    <Eye
                      size={14}
                    />
                    View review
                  </button>
                </div>
              )
            )}
          </div>

          {filteredReviews.length ===
            0 && (
            <div className="px-6 py-20 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#f0f0ec]">
                <MessageSquare
                  size={23}
                  strokeWidth={
                    1.7
                  }
                />
              </div>

              <h3 className="mt-5 text-xl font-semibold text-[#111111]">
                No reviews found
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

  {selectedReview && (
    <ReviewModal
      review={
        selectedReview
      }
      onClose={() =>
        setSelectedReview(null)
      }
      onStatusChange={
        updateStatus
      }
      onDelete={
        handleDelete
      }
      updating={
        updatingId ===
        selectedReview.id
      }
      deleting={
        deletingId ===
        selectedReview.id
      }
    />
  )}
</div>

);
}

function StatCard({
label,
value,
}) {
return ( <div className="rounded-[24px] border border-[var(--border)] bg-white p-5"> <p className="text-xs text-[#888880]">
{label} </p>

  <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[#111111]">
    {value}
  </p>
</div>

);
}

function RatingStars({
rating,
}) {
return ( <div className="flex gap-0.5">
{[1, 2, 3, 4, 5].map(
(star) => (
<Star
key={star}
size={14}
fill={
star <=
Number(rating)
? "currentColor"
: "none"
}
strokeWidth={1.7}
/>
)
)} </div>
);
}

function ReviewStatus({
status,
}) {
const styles = {
approved:
"bg-[#eef4e5] text-[#60703f]",
pending:
"bg-[#f2eee4] text-[#8a7445]",
rejected:
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
status} </span>
);
}

function ReviewModal({
review,
onClose,
onStatusChange,
onDelete,
updating,
deleting,
}) {
const isPending =
review.status === "pending";

return ( <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center"> <button
     type="button"
     onClick={onClose}
     className="absolute inset-0 bg-black/40"
     aria-label="Close review"
   />

  <div className="relative max-h-[90vh] w-full overflow-y-auto rounded-t-[28px] bg-white p-6 sm:max-w-lg sm:rounded-[28px]">
    <div className="flex items-start justify-between gap-4">
      <div>
        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#999991]">
          Review
        </span>

        <h2 className="mt-2 text-2xl font-semibold text-[#111111]">
          {review.product}
        </h2>

        <p className="mt-1 text-xs text-[#888880]">
          {review.customer} ·{" "}
          {formatDate(
            review.date
          )}
        </p>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f0f0ec]"
      >
        <X
          size={17}
          strokeWidth={1.8}
        />
      </button>
    </div>

    <div className="mt-7 rounded-2xl bg-[#f7f7f5] p-5">
      <div className="flex flex-wrap items-center gap-2">
        <MessageSquare
          size={17}
          strokeWidth={1.8}
        />

        <span className="text-sm font-semibold">
          {review.customer}
        </span>

        {review.verified && (
          <span className="rounded-full bg-white px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.1em] text-[#60703f]">
            Verified
          </span>
        )}
      </div>

      <div className="mt-3">
        <RatingStars
          rating={review.rating}
        />
      </div>

      <h3 className="mt-5 text-base font-semibold">
        {review.title}
      </h3>

      <p className="mt-2 text-sm leading-7 text-[#666666]">
        {review.comment}
      </p>
    </div>

    <div className="mt-5">
      <label className="mb-2 block text-xs font-medium text-[#555555]">
        Review status
      </label>

      {isPending ? (
        <select
          value=""
          onChange={(event) =>
            onStatusChange(
              review.id,
              event.target.value
            )
          }
          disabled={
            updating ||
            deleting
          }
          className="w-full rounded-2xl border border-[var(--border)] px-4 py-3.5 text-sm outline-none disabled:opacity-60"
        >
          <option value="">
            Choose action
          </option>

          <option value="Published">
            Publish review
          </option>

          <option value="Rejected">
            Reject review
          </option>
        </select>
      ) : (
        <select
          value={
            statusLabels[
              review.status
            ] ||
            review.status
          }
          onChange={(event) =>
            onStatusChange(
              review.id,
              event.target.value
            )
          }
          disabled={
            updating ||
            deleting
          }
          className="w-full rounded-2xl border border-[var(--border)] px-4 py-3.5 text-sm outline-none disabled:opacity-60"
        >
          <option value="Published">
            Published
          </option>

          <option value="Rejected">
            Rejected
          </option>
        </select>
      )}

      {updating && (
        <p className="mt-2 text-xs text-[#888880]">
          Updating review status...
        </p>
      )}
    </div>

    <div className="mt-5 grid grid-cols-2 gap-3">
      <button
        type="button"
        onClick={() =>
          onDelete(
            review.id
          )
        }
        disabled={
          deleting ||
          updating
        }
        className="flex items-center justify-center gap-2 rounded-2xl border border-red-200 px-4 py-3.5 text-sm font-medium text-red-500 disabled:opacity-50"
      >
        {deleting ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-red-400 border-t-transparent" />
        ) : (
          <Trash2
            size={16}
          />
        )}

        {deleting
          ? "Deleting..."
          : "Delete"}
      </button>

      <button
        type="button"
        onClick={onClose}
        disabled={
          deleting ||
          updating
        }
        className="flex items-center justify-center gap-2 rounded-2xl bg-[#111111] px-4 py-3.5 text-sm font-medium text-white disabled:opacity-50"
      >
        <Check size={16} />
        Done
      </button>
    </div>
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
