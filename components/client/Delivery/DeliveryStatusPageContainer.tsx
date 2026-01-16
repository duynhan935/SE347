import { orderApi } from "@/lib/api/orderApi";
import { Order } from "@/types/order.type";
import { notFound } from "next/navigation";
import { OrderStatusSidebar } from "./OrderStatusSidebar";

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

    const displayItems: DisplayOrderItem[] = order.items.map((item, index) => ({
        id: `${order.orderId}-${item.productId}-${index}`,
        name: item.productName,
        shopName: order.restaurant?.name || "Restaurant",
        price: item.price,
        quantity: item.quantity,
        note: item.customizations,
    }));

    const totalItems = displayItems.reduce((sum, item) => sum + item.quantity, 0);

    const status: OrderStatus = (() => {
        const isCancelled = order.status === "cancelled";
        const isReceived = order.status !== "pending";
        const isRestaurantDone =
            order.status === "preparing" || order.status === "ready" || order.status === "completed";
        const isDelivering = order.status === "completed";

        const estimatedTime = (() => {
            if (!order.estimatedDeliveryTime) return 0;
            const eta = new Date(order.estimatedDeliveryTime).getTime();
            if (Number.isNaN(eta)) return 0;
            return Math.max(0, Math.round((eta - Date.now()) / 60000));
        })();

        return {
            orderValidate: "Success",
            orderReceived: isCancelled ? "Cancel" : isReceived ? "Success" : "Pending",
            restaurantStatus: isCancelled ? "Cancel" : isRestaurantDone ? "Success" : "Pending",
            deliveryStatus: isCancelled ? "Cancel" : isDelivering ? "Success" : "Pending",
            estimatedTime,
        };
    })();

    const canCancel = order.status === "pending";

    const groupedItems = displayItems.reduce((acc, item) => {
        const { shopName } = item;
        if (!acc[shopName]) {
            acc[shopName] = [];
        }
        acc[shopName].push(item);
        return acc;
    }, {} as Record<string, DisplayOrderItem[]>);

    return (
        <div className="custom-container py-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 items-start">
                {/* Left column: Order details */}
                <div className="lg:col-span-2 space-y-6 p-3 sm:p-1 md:p-12">
                    <h1 className="text-3xl font-bold">
                        Order Details ({totalItems} {totalItems > 1 ? "items" : "item"})
                    </h1>

                    <div className="space-y-8">
                        {Object.entries(groupedItems).map(([shopName, items]) => (
                            <div key={shopName}>
                                <h2 className="text-lg font-semibold mb-2">{shopName}</h2>
                                <div className="space-y-4 border-t">
                                    {items.map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex items-start gap-4 pt-4 border-b pb-2 last:border-b-0"
                                        >
                                            <div className="w-[64px] h-[64px] rounded-md bg-gray-200 flex items-center justify-center text-gray-400 text-xs">
                                                No Image
                                            </div>
                                            <div className="flex-grow">
                                                <p className="font-semibold">{item.name}</p>
                                                <p className="text-sm text-gray-500">{item.note}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                                                <p className="font-bold">${(item.price * item.quantity).toFixed(2)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right column: Order status information */}
                <div className="lg:col-span-1">
                    <OrderStatusSidebar status={status} orderId={order.orderId} canCancel={canCancel} />
                </div>
            </div>
        </div>
    );
}
