import burgerImage from "@/assets/Restaurant/Burger.png";
import Image, { StaticImageData } from "next/image";
import { notFound } from "next/navigation";
import { OrderSummary } from "./OrderSummary";

type OrderItem = {
        id: string;
        productId: number;
        name: string;
        shopName: string;
        price: number;
        image: StaticImageData;
        quantity: number;
        note?: string;
};

type Order = {
        id: number;
        date: string;
        items: OrderItem[];
};

const fakeOrders: Order[] = [
        {
                id: 1,
                date: "2025-09-25",
                items: [
                        {
                                id: "12345678910",
                                productId: 101,
                                name: "Burger",
                                shopName: "Burger Shop",
                                price: 30,
                                image: burgerImage,
                                quantity: 2,
                                note: "No cheese, No meat",
                        },
                        {
                                id: "12345678911",
                                productId: 301,
                                name: "Burger",
                                shopName: "Burger Shop",
                                price: 30,
                                image: burgerImage,
                                quantity: 2,
                                note: "No Duy Nhan",
                        },
                ],
        },
];

async function fetchOrderById(id: string): Promise<Order | undefined> {
        const orderId = Number(id);
        return fakeOrders.find((order) => order.id === orderId);
}

export default async function OrderDetailPageContainer({ params }: { params: { id: string } }) {
        const order = await fetchOrderById(params.id);

        if (!order) {
                notFound();
        }

        const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);

        const groupedItems = order.items.reduce((acc, item) => {
                const { shopName } = item;
                if (!acc[shopName]) {
                        acc[shopName] = [];
                }
                acc[shopName].push(item);
                return acc;
        }, {} as Record<string, OrderItem[]>);

        return (
                <div className="custom-container p-3 sm:p-1 md:p-12">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 items-start">
                                {/* Cột trái: Chi tiết đơn hàng */}
                                <div className="lg:col-span-2 space-y-6">
                                        <h1 className="text-3xl font-bold">
                                                Order Details ({totalItems} {totalItems > 1 ? "items" : "item"})
                                        </h1>

                                        <div className="space-y-8">
                                                {Object.entries(groupedItems).map(([shopName, items]) => (
                                                        <div key={shopName}>
                                                                <h2 className="text-lg font-semibold mb-2">
                                                                        {shopName}
                                                                </h2>
                                                                <div className="space-y-4 border-t">
                                                                        {items.map((item) => (
                                                                                <div
                                                                                        key={item.id}
                                                                                        className="flex items-start gap-4 pt-4 border-b pb-2 last:border-b-0"
                                                                                >
                                                                                        <Image
                                                                                                src={item.image}
                                                                                                alt={item.name}
                                                                                                width={64}
                                                                                                height={64}
                                                                                                className="rounded-md object-cover"
                                                                                        />
                                                                                        <div className="flex-grow">
                                                                                                <p className="font-semibold">
                                                                                                        {item.name}
                                                                                                </p>
                                                                                                <p className="text-sm text-gray-500">
                                                                                                        {item.note}
                                                                                                </p>
                                                                                        </div>
                                                                                        <div className="text-right">
                                                                                                <p className="text-sm text-gray-600">
                                                                                                        Quantity:{" "}
                                                                                                        {item.quantity}
                                                                                                </p>
                                                                                                <p className="font-bold">
                                                                                                        $
                                                                                                        {(
                                                                                                                item.price *
                                                                                                                item.quantity
                                                                                                        ).toFixed(2)}
                                                                                                </p>
                                                                                        </div>
                                                                                </div>
                                                                        ))}
                                                                </div>
                                                        </div>
                                                ))}
                                        </div>
                                </div>

                                {/* Cột phải: Tóm tắt đơn hàng */}
                                <div className="lg:col-span-1">
                                        <OrderSummary order={order} />
                                </div>
                        </div>
                </div>
        );
}
