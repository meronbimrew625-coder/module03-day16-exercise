import { listOrders } from "../../lib/orders";
import OrderList from "./OrderList";

export const revalidate = 60;

export default async function OrdersPage({ searchParams }) {
  const params = await searchParams;
  const initialQuery = typeof params?.search === "string" ? params.search : "";
  const initialPage = Math.max(1, Number(params?.page || "1"));
  const initialData = {
    orders: listOrders().slice((initialPage - 1) * 3, initialPage * 3),
    page: initialPage,
    pageSize: 3,
    total: listOrders().length,
    totalPages: Math.max(1, Math.ceil(listOrders().length / 3)),
    search: initialQuery,
  };

  return (
    <main>
      <h2>Orders</h2>
      <p>Search and paging.</p>
      <OrderList
        fallbackData={initialData}
        initialQuery={initialQuery}
        initialPage={initialPage}
      />
    </main>
  );
}
