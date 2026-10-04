import { notFound } from "next/navigation";
import { getOrderById } from "../../../lib/orders";
import OrderStatus from "./OrderStatus";

export default async function OrderStatusPage({ params }) {
  const { id } = await params;
  const order = getOrderById(id);

  if (!order) {
    notFound();
  }

  return (
    <main>
      <h2>Order status</h2>
      <OrderStatus order={order} />
    </main>
  );
}
