import { getOrderById } from "../../../../lib/orders";

export async function GET(request, { params }) {
  const { id } = await params;
  const order = getOrderById(id);

  if (!order) {
    return Response.json(
      { error: { code: "ORDER_NOT_FOUND", message: "Order not found." } },
      { status: 404 }
    );
  }

  return Response.json(order);
}
