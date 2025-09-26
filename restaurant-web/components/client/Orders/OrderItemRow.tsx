import Image, { StaticImageData } from "next/image";
import Link from "next/link";
type OrderItem = {
        id: string;
        productId: number;
        name: string;
        shopName: string;
        price: number;
        image: StaticImageData;
};

export const OrderItemRow = ({ item }: { item: OrderItem }) => (
        <div className="flex items-center gap-4 py-4 border-b last:border-b-0">
                <Image src={item.image} alt={item.name} width={64} height={64} className="rounded-md object-cover" />
                <div className="flex-grow space-y-1">
                        <p className="font-semibold">{item.shopName}</p>
                        <p className="text-sm text-gray-500">ID: {item.id}</p>
                        <p className="font-bold">${item.price.toFixed(2)}</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                        <button className="text-sm font-semibold bg-brand-purple text-white px-4 py-2 rounded-md hover:bg-brand-purple/80 cursor-pointer">
                                Buy Again
                        </button>
                        <Link
                                href={`/orders/${item.id}`}
                                className="text-sm font-semibold px-4 py-2 rounded-md text-center hover:bg-gray-50 border border-gray-400"
                        >
                                See Details
                        </Link>
                </div>
        </div>
);
