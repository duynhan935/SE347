import OrderList from "@/components/admin/orders/OrderList";
import { Suspense } from "react";
import { orderApi } from "@/lib/api/orderApi";
import { Order } from "@/types/order.type";
import { Loader2 } from "lucide-react";

export const dynamic = "force-dynamic";

async function getOrders(): Promise<Order[]> {
    const result = await orderApi.getAllOrders();
    return result.orders;
}

export default async function AdminOrdersPage() {
    const orders = await getOrders();

    return (
        <div className="space-y-4">
            <h1 className="text-2xl md:text-3xl font-bold">Order Management</h1>
            <Suspense fallback={<Loader2 className="animate-spin" />}>
                <OrderList initialOrders={orders} />
            </Suspense>
        </div>
    );
}
