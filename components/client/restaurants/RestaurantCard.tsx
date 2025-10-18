import { Restaurant } from "@/types";
import { Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// Props của component, nhận vào một object restaurant
type RestaurantCardProps = {
        restaurant: Restaurant;
};

export const RestaurantCard = ({ restaurant }: RestaurantCardProps) => (
        <Link
                href={`/restaurants/${restaurant.id}`}
                className="group block rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 bg-white h-full flex flex-col"
        >
                <div className="relative w-full h-48">
                        <Image
                                src={restaurant.imageURL || "/placeholder.png"}
                                alt={restaurant.resName}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />

                        <div className="absolute bottom-2 right-2 bg-white/80 text-gray-800 text-xs px-2 py-1 rounded-full backdrop-blur-sm font-semibold">
                                {restaurant.duration} min
                        </div>
                </div>

                <div className="p-4 flex-grow flex flex-col">
                        <h3 className="font-bold text-lg truncate" title={restaurant.resName}>
                                {restaurant.resName}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">{restaurant.distance.toFixed(1)} km</p>

                        <div className="flex items-center justify-between mt-auto pt-3 text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                        <span className="font-medium text-gray-800">{restaurant.rating}</span>
                                        <span className="text-gray-500">
                                                ({restaurant.totalReview.toLocaleString()})
                                        </span>
                                </div>
                                {/* Hiệu ứng mũi tên xuất hiện khi hover */}
                                <span className="text-xs text-brand-purple opacity-0 group-hover:opacity-100 transition-opacity font-semibold">
                                        View details →
                                </span>
                        </div>
                </div>
        </Link>
);
