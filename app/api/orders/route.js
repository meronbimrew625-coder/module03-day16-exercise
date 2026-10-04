import { cookies } from "next/headers";
import { createOrder, listOrders } from "../../../lib/orders";
import { validateOrder } from "../../../lib/orderSchema";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page") || "1"));
  const search = (searchParams.get("search") || "").trim().toLowerCase();
  const pageSize = 3;

  let orders = listOrders();

  if (search) {
    orders = orders.filter((order) =>
      [order.id, order.name, order.phone, order.status]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(search))
    );
  }

  const total = orders.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;

  return Response.json({
    orders: orders.slice(start, start + pageSize),
    page: safePage,
    pageSize,
    total,
    totalPages,
    search,
  });
}

export async function POST(request) {
  let body;

  try {
    body = await request.json();
  } catch {
    return Response.json(
      {
        error: {
          code: "INVALID_JSON",
          message: "Request body must be valid JSON.",
        },
      },
      { status: 400 }
    );
  }

  const validation = validateOrder(body);

  if (!validation.valid) {
    return Response.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "Validation failed.",
        },
        fieldErrors: validation.fieldErrors,
      },
      { status: 422 }
    );
  }

  const cookieStore = await cookies();
  const session = cookieStore.get("session");
  const ownerId = session?.value || "anonymous";

  const order = createOrder({
    ownerId,
    values: validation.values,
  });

  return Response.json(order, { status: 201 });
}
