import OrderList from "@/components/admin/orders/OrderList";
import { Suspense } from "react";
// import { adminApi } from "@/lib/api/adminApi"; // Giả định
import { Order } from "@/app/(admin)/admin/types/types";
import { Loader2 } from "lucide-react";

async function getOrders(): Promise<Order[]> {
        // const response = await adminApi.getAllOrders();
        // return response.data;

        // ---- Dữ liệu giả lập ----
        return [
                {
                        id: "ord1",
                        customerName: "Bob",
                        restaurantName: "Nhà hàng A",
                        totalPrice: 25.5,
                        status: "DELIVERED",
                        createdAt: new Date().toISOString(),
                },
                {
                        id: "ord2",
                        customerName: "Alice",
                        restaurantName: "Nhà hàng B",
                        totalPrice: 19.0,
                        status: "PENDING",
                        createdAt: new Date().toISOString(),
                },
                {
                        id: "ord3",
                        customerName: "Charlie",
                        restaurantName: "Nhà hàng A",
                        totalPrice: 45.0,
                        status: "CANCELLED",
                        createdAt: new Date().toISOString(),
                },
        ];
        // ---- Hết dữ liệu giả lập ----
}

export default async function AdminOrdersPage() {
        const orders = await getOrders();

        return (
                <div className="p-6">
                        <h1 className="text-3xl font-bold mb-6">Order Management</h1>
                        <Suspense fallback={<Loader2 className="animate-spin" />}>
                                <OrderList initialOrders={orders} />
                        </Suspense>
                </div>
        );
}
