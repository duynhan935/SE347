import { orderApi } from "@/lib/api/orderApi";
import { Order } from "@/types/order.type";
import { notFound } from "next/navigation";
import DeliveryStatusPageClientWrapper from "./DeliveryStatusPageClientWrapper";

type StatusType = "Pending" | "Success" | "Cancel";

type OrderStatus = {
    orderValidate: StatusType;
    orderReceived: StatusType;
    restaurantStatus: StatusType;
    deliveryStatus: StatusType;
    estimatedTime: number;
};

type DisplayOrderItem = {
    id: string;
    name: string;
    shopName: string;
    price: number;
    quantity: number;
    note?: string;
};

export default async function OrderStatusPage({ params }: { params: { slug: string } }) {
    let order: Order | null = null;
    try {
        // Prefer fetching by orderId to avoid stale slug-based cache on backend.
        // Slug format: "<restaurant-slug>-<orderId lowercased>"
        const lastSegment = params.slug.split("-").pop() || "";
        const maybeOrderId = lastSegment.toUpperCase();

        if (maybeOrderId.startsWith("ORD")) {
            order = await orderApi.getOrderById(maybeOrderId, { cacheBust: true });
        } else {
            // Fallback to slug endpoint if we can't safely parse orderId
            order = await orderApi.getOrderBySlug(params.slug, { cacheBust: true });
        }
    } catch {
        order = null;
    }

    if (!order) {
        notFound();
    }

    return <DeliveryStatusPageClientWrapper initialOrder={order} />;
}
