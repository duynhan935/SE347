import { RestaurantDetail } from "@/app/(client)/restaurants/[id]/page";
import { PlusCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export const MenuItemCard = ({ item }: { item: RestaurantDetail["menu"][0]["items"][0] }) => {
        const handleAddToCart = () => {
                console.log(`Added ${item.name} to cart!`);
        };

        return (
                <Link href={`/food/${item.id}`} className="border rounded-lg overflow-hidden">
                        <Image
                                src={item.image}
                                alt={item.name}
                                width={300}
                                height={180}
                                className="w-full h-32 object-cover"
                        />
                        <div className="p-4">
                                <h3 className="font-semibold truncate">{item.name}</h3>
                                <p className="text-sm text-gray-500 mt-1 line-clamp-2 h-10">{item.description}</p>
                                <div className="flex justify-between items-center mt-3">
                                        <p className="font-bold">${item.price.toFixed(2)}</p>
                                        <button
                                                onClick={handleAddToCart}
                                                className="text-brand-purple hover:text-brand-purple/80 cursor-pointer"
                                                title="Add to Cart"
                                        >
                                                <PlusCircle className="w-7 h-7" />
                                        </button>
                                </div>
                        </div>
                </Link>
        );
};
