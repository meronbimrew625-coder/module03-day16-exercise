"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import useSWR from "swr";
import { fetcher } from "../../lib/fetcher";
import CancelOrderButton from "./CancelOrderButton";

export default function OrderList({ fallbackData, initialQuery, initialPage }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [term, setTerm] = useState(initialQuery);
  const [debouncedTerm, setDebouncedTerm] = useState(initialQuery);
  const [page, setPage] = useState(initialPage);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedTerm(term.trim()), 350);
    return () => clearTimeout(timer);
  }, [term]);

  useEffect(() => {
    const nextPage = Math.max(1, Number(searchParams.get("page") || "1"));
    setPage(nextPage);
  }, [searchParams]);

  const key = useMemo(() => {
    if (!debouncedTerm) return null;
    return `/api/orders?search=${encodeURIComponent(debouncedTerm)}&page=${page}`;
  }, [debouncedTerm, page]);

  const { data, error, isLoading, isValidating } = useSWR(key, fetcher, {
    fallbackData,
    keepPreviousData: true,
  });

  function updateQuery(nextTerm, nextPage) {
    const params = new URLSearchParams(searchParams.toString());
    if (nextTerm) params.set("search", nextTerm);
    else params.delete("search");
    params.set("page", String(nextPage));
    router.push(`/orders?${params.toString()}`);
  }

  function handleSearchChange(event) {
    const nextTerm = event.target.value;
    setTerm(nextTerm);
    setPage(1);
    updateQuery(nextTerm.trim(), 1);
  }

  function goToPage(nextPage) {
    setPage(nextPage);
    updateQuery(debouncedTerm, nextPage);
  }

  const result = data || fallbackData;

  return (
    <section>
      <label htmlFor="order-search">Search orders</label>
      <input
        id="order-search"
        value={term}
        onChange={handleSearchChange}
        placeholder="Search by name, phone, status, or ID"
      />

      {error && <p>Could not refresh orders.</p>}
      {isLoading && <p>Loading orders...</p>}
      {isValidating && !isLoading && <p>Refreshing...</p>}

      {!result?.orders?.length ? (
        <p>No orders found.</p>
      ) : (
        <div>
          {result.orders.map((order) => (
            <article className="dish-card" key={order.id}>
              <h3>Order {order.id}</h3>
              <p>Status: {order.status}</p>
              <p>Name: {order.name}</p>
              <p>Phone: {order.phone}</p>
              <div className="dish-actions">
                <Link href={`/orders/${order.id}`}>Track status</Link>
                {order.status !== "cancelled" && (
                  <CancelOrderButton orderId={order.id} />
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      <div className="dish-actions">
        <button
          type="button"
          disabled={result?.page <= 1}
          onClick={() => goToPage(result.page - 1)}
        >
          Previous
        </button>
        <span>Page {result?.page || 1} of {result?.totalPages || 1}</span>
        <button
          type="button"
          disabled={result?.page >= result?.totalPages}
          onClick={() => goToPage(result.page + 1)}
        >
          Next
        </button>
      </div>
    </section>
  );
}
