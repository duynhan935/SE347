import { type RestaurantDetail } from "@/app/(client)/restaurants/[id]/page";
import { Heart, Info } from "lucide-react";
import Image from "next/image";

type RestaurantHeroProps = {
        restaurant: RestaurantDetail;
};

export default function RestaurantHero({ restaurant }: RestaurantHeroProps) {
        return (
                <section className="relative">
                        {/* Banner Image */}
                        <div className="h-56 w-full">
                                <Image
                                        src={restaurant.bannerImage}
                                        alt={`${restaurant.name} banner`}
                                        layout="fill"
                                        objectFit="cover"
                                />
                        </div>

                        {/* Content Container */}
                        <div className="custom-container">
                                <div className="bg-white p-6 rounded-lg shadow-lg relative -mt-16 z-10">
                                        {/* Logo */}
                                        <Image
                                                src={restaurant.image}
                                                alt={`${restaurant.name} logo`}
                                                width={96}
                                                height={96}
                                                className="rounded-full border-4 border-white absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2"
                                        />

                                        {/* Buttons */}
                                        <div className="flex justify-end gap-2 pt-2 mt-5 lg:mt-">
                                                <button className="flex items-center gap-2 text-sm font-semibold border rounded-full px-4 py-2 hover:bg-gray-100 cursor-pointer">
                                                        <Info className="w-4 h-4" /> Store info
                                                </button>
                                                <button className="flex items-center gap-2 text-sm font-semibold bg-green-600 text-white rounded-full px-4 py-2 hover:bg-green-700 cursor-pointer">
                                                        <Heart className="w-4 h-4" /> Add to favorites
                                                </button>
                                        </div>

                                        {/* Info */}
                                        <div className="text-center mt-10">
                                                <h1 className="text-3xl font-bold">{restaurant.name}</h1>
                                                <p className="text-gray-500 mt-1 text-sm">
                                                        <span>{restaurant.deliveryFee} delivery fee</span>
                                                        <span className="mx-2">•</span>
                                                        <span>{restaurant.deliveryTime} min</span>
                                                        <span className="mx-2">•</span>
                                                        <span>{restaurant.foodType}</span>
                                                </p>
                                        </div>

                                        {/* Stats */}
                                        <div className="mt-4 pt-4 border-t flex flex-wrap justify-around text-center text-sm gap-y-2">
                                                <div>
                                                        <p className="font-bold">
                                                                {restaurant.rating.toFixed(1)} (
                                                                {restaurant.reviewCount.toLocaleString()})
                                                        </p>
                                                        <p className="text-gray-500">Rating</p>
                                                </div>
                                                <div>
                                                        <p className="font-bold">{restaurant.foodGood}%</p>
                                                        <p className="text-gray-500">Food was good</p>
                                                </div>
                                                <div>
                                                        <p className="font-bold">{restaurant.deliveryOnTime}%</p>
                                                        <p className="text-gray-500">Delivery on time</p>
                                                </div>
                                                <div>
                                                        <p className="font-bold">{restaurant.orderCorrect}%</p>
                                                        <p className="text-gray-500">Order was correct</p>
                                                </div>
                                        </div>
                                </div>
                        </div>
                </section>
        );
}
