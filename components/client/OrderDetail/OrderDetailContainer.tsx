import { orderApi } from "@/lib/api/orderApi";
import { Order } from "@/types/order.type";
import { notFound } from "next/navigation";
import OrderDetailClientWrapper from "./OrderDetailClientWrapper";

export default async function OrderDetailPageContainer({ params }: { params: { slug: string } }) {
    let order: Order | null = null;
    try {
        order = await orderApi.getOrderBySlug(params.slug);
    } catch {
        order = null;
    }

    if (!order) {
        notFound();
    }

    return <OrderDetailClientWrapper initialOrder={order} />;
}
