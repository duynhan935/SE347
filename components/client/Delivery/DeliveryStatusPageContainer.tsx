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

export default async function OrderStatusPage({ params }: { params: { id: string } }) {
    let order: Order | null = null;
    try {
        order = await orderApi.getOrderById(params.id);
    } catch {
        order = null;
    }

    if (!order) {
        notFound();
    }

    return <DeliveryStatusPageClientWrapper initialOrder={order} />;
}
