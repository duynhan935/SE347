import { FoodEat, Hero } from "@/constants";
import Image, { StaticImageData } from "next/image";
import { OrderItemRow } from "./OrderItemRow";
import { PeopleAlsoBought } from "./PeopleAlsoBought";
type OrderItem = {
        id: string;
        productId: number;
        name: string;
        shopName: string;
        price: number;
        image: StaticImageData;
};

type Order = {
        id: number;
        date: string;
        items: OrderItem[];
};

export default async function OrdersPageContainer({ orders }: { orders: Order[] }) {
        return (
                <div className="custom-container p-3 sm:p-1 md:p-12">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-16 items-start">
                                {/* Cột bên trái: Danh sách đơn hàng */}
                                <div className="lg:col-span-2">
                                        {/* Filter options */}
                                        <div className="flex justify-between items-center mb-8">
                                                <h1 className="text-xl md:text-3xl font-bold">
                                                        Your Orders ({orders.length} orders)
                                                </h1>
                                                <div className="flex items-center gap-2">
                                                        <span className="text-sm font-medium text-gray-600">
                                                                Sort by:
                                                        </span>
                                                        <select
                                                                className="font-semibold border-gray-700 border p-1 rounded-md shadow-sm"
                                                                title="Sort by"
                                                        >
                                                                <option>Recent</option>
                                                                <option>Past 3 months</option>
                                                                <option>2025</option>
                                                        </select>
                                                </div>
                                        </div>
                                        {/* Order list */}
                                        <div className="space-y-8">
                                                {orders.map((order) => (
                                                        <div key={order.id}>
                                                                <h2 className="text-xl font-bold mb-2">
                                                                        Order {order.id}
                                                                </h2>
                                                                <div className="border rounded-lg p-4">
                                                                        {order.items.map((item) => (
                                                                                <OrderItemRow
                                                                                        key={item.id}
                                                                                        orderId={order.id}
                                                                                        item={item}
                                                                                />
                                                                        ))}
                                                                </div>
                                                        </div>
                                                ))}
                                        </div>
                                </div>

                                {/* Cột bên phải: Quảng cáo */}
                                <div className="lg:col-span-1 hidden lg:block">
                                        <div className="bg-green-100 p-3 rounded-lg sticky top-24">
                                                <Image
                                                        src={Hero}
                                                        alt="Food Delivery"
                                                        className="w-full h-auto rounded-md"
                                                />

                                                <Image
                                                        src={FoodEat}
                                                        alt="Food Delivery"
                                                        className="w-full h-auto rounded-md mt-5"
                                                />
                                        </div>
                                </div>
                        </div>

                        <PeopleAlsoBought />
                </div>
        );
}
