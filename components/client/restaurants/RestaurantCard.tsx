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
        <Link
                href={`/restaurants/${restaurant.id}`}
                className="group block rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 bg-white"
        >
                {/* Ảnh nhà hàng */}
                <div className="relative w-full h-48">
                        <Image
                                src={restaurant.image}
                                alt={restaurant.name}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {/* Tag thời gian giao hàng */}
                        <div className="absolute bottom-2 right-2 bg-white/80 text-gray-700 text-xs px-2 py-1 rounded-md backdrop-blur-sm">
                                {restaurant.deliveryTime} min
                        </div>
                </div>

                {/* Nội dung thông tin */}
                <div className="p-4">
                        <h3 className="font-semibold text-lg text-gray-800 group-hover:text-primary transition-colors">
                                {restaurant.name}
                        </h3>

                        <p className="text-sm text-gray-500 mt-1">
                                {restaurant.foodType} • {restaurant.deliveryFee} delivery fee
                        </p>

                        <div className="flex items-center justify-between mt-3 text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                        <span className="font-medium text-gray-800">{restaurant.rating}</span>
                                        <span className="text-gray-500">
                                                ({restaurant.reviewCount.toLocaleString()})
                                        </span>
                                </div>
                                <span className="text-xs text-gray-400">View details →</span>
                        </div>
                </div>
        </Link>
);
