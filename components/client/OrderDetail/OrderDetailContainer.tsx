import { orderApi } from "@/lib/api/orderApi";
import { Order } from "@/types/order.type";
import { notFound } from "next/navigation";
import OrderDetailClientWrapper from "./OrderDetailClientWrapper";

export default async function OrderDetailPageContainer({ params }: { params: { id: string } }) {
    let order: Order | null = null;
    try {
        order = await orderApi.getOrderById(params.id);
    } catch {
        order = null;
    }

    if (!order) {
        notFound();
    }

    return <OrderDetailClientWrapper initialOrder={order} />;
}
