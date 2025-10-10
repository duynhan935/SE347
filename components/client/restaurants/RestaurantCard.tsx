import { Star } from "lucide-react";
import Image, { StaticImageData } from "next/image";
import Link from "next/link";

type Restaurant = {
        id: number;
        name: string;
        image: StaticImageData;
        deliveryFee: string;
        deliveryTime: number;
        foodType: string;
        rating: number;
        reviewCount: number;
};

export const RestaurantCard = ({ restaurant }: { restaurant: Restaurant }) => (
        <Link href={"/restaurants/212"} className="group cursor-pointer">
                <div className="relative w-full h-48 overflow-hidden rounded-lg">
                        <Image
                                src={restaurant.image}
                                alt={restaurant.name}
                                fill
                                className="object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                </div>
                <div className="mt-3">
                        <h3 className="font-semibold text-lg">{restaurant.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">{restaurant.deliveryFee} delivery fee</p>
                        <div className="flex items-center justify-between text-sm text-gray-500 mt-1">
                                <span>{restaurant.deliveryTime} min</span>
                                <span>•</span>
                                <span>{restaurant.foodType}</span>
                                <span>•</span>
                                <div className="flex items-center gap-1">
                                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                        <span>
                                                {restaurant.rating} ({restaurant.reviewCount.toLocaleString()})
                                        </span>
                                </div>
                        </div>
                </div>
        </Link>
);
