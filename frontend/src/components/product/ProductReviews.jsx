"use client";

import {
  CheckCircle2,
  Star,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

export default function ProductReviews({
  product,
}) {
  const productId =
    product?.id || product?._id;

  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] =
    useState(0);
  const [comment, setComment] =
    useState("");
  const [showForm, setShowForm] =
    useState(false);
  const [submitted, setSubmitted] =
    useState(false);
  const [loading, setLoading] =
    useState(true);
  const [submitting, setSubmitting] =
    useState(false);
  const [error, setError] =
    useState("");

  useEffect(() => {
    if (!productId) return;

    const controller =
      new AbortController();

    const fetchReviews = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/reviews/product/${productId}`,
          {
            signal: controller.signal,
            credentials: "include",
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error(
            "Failed to fetch reviews"
          );
        }

        const result =
          await response.json();

        const reviewData =
          result.data ||
          result.reviews ||
          [];

        setReviews(
          Array.isArray(reviewData)
            ? reviewData
            : []
        );
      } catch (error) {
        if (
          error.name !== "AbortError"
        ) {
          console.error(
            "Reviews fetch error:",
            error
          );

          setError(
            "Unable to load reviews right now."
          );
        }
      } finally {
        if (
          !controller.signal.aborted
        ) {
          setLoading(false);
        }
      }
    };

    fetchReviews();

    return () => {
      controller.abort();
    };
  }, [productId]);

  const averageRating = useMemo(() => {
    if (!reviews.length) {
      return Number(
        product?.rating || 0
      ).toFixed(1);
    }

    return (
      reviews.reduce(
        (total, review) =>
          total +
          Number(review.rating || 0),
        0
      ) / reviews.length
    ).toFixed(1);
  }, [reviews, product?.rating]);

  const ratingCounts = useMemo(() => {
    return [5, 4, 3, 2, 1].map(
      (value) => ({
        rating: value,
        count: reviews.filter(
          (review) =>
            Number(review.rating) ===
            value
        ).length,
      })
    );
  }, [reviews]);

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    if (
      !productId ||
      !comment.trim()
    ) {
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setSubmitted(false);

const response = await fetch(
  `${process.env.NEXT_PUBLIC_API_URL}/api/reviews/product/${productId}`,
  {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      rating,
      comment: comment.trim(),
    }),
  }
);

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Failed to submit review"
        );
      }

      setComment("");
      setRating(5);
      setSubmitted(true);

      setTimeout(() => {
        setSubmitted(false);
        setShowForm(false);
      }, 1800);
    } catch (error) {
      console.error(
        "Review submit error:",
        error
      );

      setError(
        error.message ||
          "Unable to submit review."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mt-20 border-t border-[var(--border)] pt-16">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#999991]">
            Customer feedback
          </span>

          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[#111111] sm:text-4xl">
            Reviews
          </h2>

          <p className="mt-2 text-sm text-[var(--muted)]">
            See what customers think about{" "}
            {product?.name ||
              "this product"}
            .
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            setShowForm(
              (current) => !current
            )
          }
          className="w-fit rounded-full bg-[#111111] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#252525]"
        >
          {showForm
            ? "Close review"
            : "Write a review"}
        </button>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className="rounded-[28px] border border-[var(--border)] bg-white p-6">
          <div className="flex items-end gap-3">
            <span className="text-5xl font-semibold tracking-[-0.05em] text-[#111111]">
              {averageRating}
            </span>

            <div className="pb-1">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(
                  (star) => (
                    <Star
                      key={star}
                      size={16}
                      fill={
                        star <=
                        Math.round(
                          Number(
                            averageRating
                          )
                        )
                          ? "currentColor"
                          : "none"
                      }
                      strokeWidth={1.7}
                    />
                  )
                )}
              </div>

              <p className="mt-1 text-xs text-[var(--muted)]">
                {reviews.length ||
                  product?.reviews ||
                  0}{" "}
                {(reviews.length ||
                  product?.reviews ||
                  0) === 1
                  ? "review"
                  : "reviews"}
              </p>
            </div>
          </div>

          <div className="mt-7 space-y-3">
            {ratingCounts.map(
              (item) => {
                const percentage =
                  reviews.length > 0
                    ? (item.count /
                        reviews.length) *
                      100
                    : 0;

                return (
                  <div
                    key={item.rating}
                    className="flex items-center gap-3"
                  >
                    <div className="flex w-7 items-center gap-1">
                      <span className="text-xs font-medium text-[#555555]">
                        {item.rating}
                      </span>

                      <Star
                        size={12}
                        fill="currentColor"
                        strokeWidth={1.7}
                      />
                    </div>

                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#eeeeea]">
                      <div
                        className="h-full rounded-full bg-[#111111] transition-all duration-500"
                        style={{
                          width: `${percentage}%`,
                        }}
                      />
                    </div>

                    <span className="w-5 text-right text-xs text-[#999]">
                      {item.count}
                    </span>
                  </div>
                );
              }
            )}
          </div>
        </div>

        <div className="space-y-4">
          {showForm && (
            <form
              onSubmit={handleSubmit}
              className="rounded-[28px] border border-[var(--border)] bg-white p-6"
            >
              <div>
                <h3 className="text-lg font-semibold text-[#111111]">
                  Write your review
                </h3>

                <p className="mt-1 text-xs text-[var(--muted)]">
                  Share your experience
                  with other shoppers.
                </p>
              </div>

              <div className="mt-6">
                <label className="mb-2 block text-xs font-medium text-[#555]">
                  Your rating
                </label>

                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map(
                    (value) => (
                      <button
                        key={value}
                        type="button"
                        onMouseEnter={() =>
                          setHoverRating(
                            value
                          )
                        }
                        onMouseLeave={() =>
                          setHoverRating(0)
                        }
                        onClick={() =>
                          setRating(value)
                        }
                        className="flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-[#f0f0ec]"
                        aria-label={`${value} star rating`}
                      >
                        <Star
                          size={19}
                          fill={
                            value <=
                            (hoverRating ||
                              rating)
                              ? "currentColor"
                              : "none"
                          }
                          strokeWidth={
                            1.7
                          }
                        />
                      </button>
                    )
                  )}
                </div>
              </div>

              <div className="mt-5">
                <label className="mb-2 block text-xs font-medium text-[#555]">
                  Your review
                </label>

                <textarea
                  rows={5}
                  value={comment}
                  onChange={(event) =>
                    setComment(
                      event.target.value
                    )
                  }
                  placeholder="Tell us about your experience..."
                  className="w-full resize-none rounded-2xl border border-[var(--border)] bg-[#fafaf8] px-4 py-3 text-sm text-[#111111] outline-none transition placeholder:text-[#aaa] focus:border-[#111111] focus:bg-white"
                />
              </div>

              {error && (
                <p className="mt-4 text-sm text-red-600">
                  {error}
                </p>
              )}

              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                {submitted ? (
                  <span className="text-sm font-medium text-[#111111]">
                    Review submitted. Waiting
                    for approval ✓
                  </span>
                ) : (
                  <span className="text-xs text-[var(--muted)]">
                    Your review will be
                    checked before appearing
                    publicly.
                  </span>
                )}

                <button
                  type="submit"
                  disabled={
                    !comment.trim() ||
                    submitting ||
                    submitted
                  }
                  className="rounded-full bg-[#111111] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#252525] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting
                    ? "Submitting..."
                    : "Submit review"}
                </button>
              </div>
            </form>
          )}

          {loading ? (
            Array.from({
              length: 3,
            }).map((_, index) => (
              <div
                key={index}
                className="rounded-[28px] border border-[var(--border)] bg-white p-6"
              >
                <div className="h-5 w-32 animate-pulse rounded bg-[#eeeeea]" />
                <div className="mt-4 h-4 w-24 animate-pulse rounded bg-[#eeeeea]" />
                <div className="mt-5 h-4 w-full animate-pulse rounded bg-[#eeeeea]" />
                <div className="mt-2 h-4 w-4/5 animate-pulse rounded bg-[#eeeeea]" />
              </div>
            ))
          ) : error && !showForm ? (
            <div className="rounded-[28px] border border-[var(--border)] bg-white p-6 text-sm text-[var(--muted)]">
              {error}
            </div>
          ) : reviews.length === 0 ? (
            <div className="rounded-[28px] border border-[var(--border)] bg-white p-8 text-center">
              <p className="text-sm font-medium text-[#111111]">
                No reviews yet
              </p>

              <p className="mt-2 text-sm text-[var(--muted)]">
                Be the first customer to
                review this product.
              </p>
            </div>
          ) : (
            reviews.map((review) => {
              const reviewerName =
                review.user?.name ||
                review.name ||
                "Customer";

              const reviewDate =
                review.createdAt
                  ? new Date(
                      review.createdAt
                    ).toLocaleDateString(
                      "en-US",
                      {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      }
                    )
                  : "";

              return (
                <article
                  key={
                    review._id ||
                    review.id
                  }
                  className="rounded-[28px] border border-[var(--border)] bg-white p-6"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-[#111111]">
                          {reviewerName}
                        </h3>

                        {review.isVerifiedPurchase && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#f0f0ec] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#666666]">
                            <CheckCircle2
                              size={12}
                              strokeWidth={
                                1.8
                              }
                            />
                            Verified
                          </span>
                        )}
                      </div>

                      <div className="mt-2 flex items-center gap-3">
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map(
                            (star) => (
                              <Star
                                key={star}
                                size={14}
                                fill={
                                  star <=
                                  Number(
                                    review.rating ||
                                      0
                                  )
                                    ? "currentColor"
                                    : "none"
                                }
                                strokeWidth={
                                  1.7
                                }
                              />
                            )
                          )}
                        </div>

                        <span className="text-xs text-[#999999]">
                          {reviewDate}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="mt-5 text-sm leading-7 text-[#666666]">
                    {review.comment}
                  </p>
                </article>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}

