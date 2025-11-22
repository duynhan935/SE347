// File: app/_components/client/Restaurant/MenuItemCard.tsx
import { type Product } from "@/types";
import { PlusCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export const MenuItemCard = ({ item }: { item: Product }) => {
        const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
                e.preventDefault();
                console.log(`Added ${item.productName} to cart!`);
        };
        const displayPrice = item.productSizes?.[0]?.price;

        return (
                <Link
                        href={`/food/${item.slug}`}
                        className="block border rounded-lg overflow-hidden h-full group bg-white hover:shadow-xl transition-shadow"
                >
                        <div className="relative w-full h-32">
                                <Image
                                        src={item.imageURL || "/placeholder.png"}
                                        alt={item.productName}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform"
                                />
                        </div>
                        <div className="p-4 flex flex-col flex-grow">
                                <h3 className="font-semibold truncate">{item.productName}</h3>
                                <p className="text-sm text-gray-500 mt-1 line-clamp-2 flex-grow h-10">
                                        {item.description}
                                </p>
                                <div className="flex justify-between items-center mt-3">
                                        <p className="font-bold">
                                                {item.productSizes.length > 1 ? "From " : ""}
                                                {displayPrice ? `$${displayPrice.toFixed(2)}` : "N/A"}
                                        </p>
                                        <button
                                                onClick={handleAddToCart}
                                                className="text-brand-purple hover:text-brand-purple/80"
                                                title="Add to Cart"
                                        >
                                                <PlusCircle className="w-7 h-7" />
                                        </button>
                                </div>
                        </div>
                </Link>
        );
};
