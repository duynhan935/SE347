import { getImageUrl } from "@/lib/utils";
import { Restaurant } from "@/types";
import { Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type RestaurantCardProps = {
    restaurant: Restaurant;
};

export const RestaurantCard = ({ restaurant }: RestaurantCardProps) => {
    const imageUrl = getImageUrl(restaurant.imageURL);
    const isPlaceholder = imageUrl === "/placeholder.png" || !restaurant.imageURL;
    
    return (
    <Link
        href={`/restaurants/${restaurant.slug}`}
        className="group block rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 bg-white h-full flex flex-col"
    >
        <div className="relative w-full h-48">
            <Image
                src={imageUrl}
                alt={restaurant.resName}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                unoptimized={isPlaceholder}
            />

            <div className="absolute bottom-2 right-2 bg-white/80 text-gray-800 text-xs px-2 py-1 rounded-full backdrop-blur-sm font-semibold">
                {restaurant.duration} min
            </div>
        </div>

        <div className="p-4 flex-grow flex flex-col">
            <h3 className="font-bold text-lg truncate" title={restaurant.resName}>
                {restaurant.resName}
            </h3>
            {/* FIX: Check distance before calling toFixed */}
            <p className="text-sm text-gray-500 mt-1">
                {restaurant.distance != null ? `${restaurant.distance.toFixed(1)} km` : "Distance not available"}
            </p>

            <div className="flex items-center justify-between mt-auto pt-3 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="font-medium text-gray-800">{restaurant.rating}</span>
                    <span className="text-gray-500">({restaurant.totalReview.toLocaleString()})</span>
                </div>
                <span className="text-xs text-brand-purple opacity-0 group-hover:opacity-100 transition-opacity font-semibold">
                    View details →
                </span>
            </div>
        </div>
    </Link>
    );
};
