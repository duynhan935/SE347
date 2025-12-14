"use client";

import OrderList from "@/components/admin/orders/OrderList";
import { orderApi } from "@/lib/api/orderApi";
import type { Order } from "@/types/order.type";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let alive = true;
        (async () => {
            try {
                const data = await orderApi.getAllOrders();
                if (!alive) return;
                setOrders(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Failed to fetch orders:", error);
                toast.error("Không thể tải danh sách đơn hàng");
                setOrders([]);
            } finally {
                if (alive) setLoading(false);
            }
        })();
        return () => {
            alive = false;
        };
    }, []);

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">Order Management</h1>
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="animate-spin" />
                </div>
            ) : (
                <OrderList initialOrders={orders} />
            )}
        </div>
    );
}
