// File: app/_components/client/Restaurant/RestaurantHero.tsx
"use client";

import { Restaurant } from "@/types";
import { Star } from "lucide-react";
import Image from "next/image";

export default function RestaurantHero({ restaurant }: { restaurant: Restaurant }) {
        const mainCategory = restaurant.cate[0]?.cateName || "Restaurant";

        return (
                <section className="relative h-[300px] md:h-[400px] w-full">
                        <Image
                                src={restaurant.imageURL || "/placeholder-banner.png"}
                                alt={`${restaurant.resName} banner`}
                                fill
                                className="object-cover"
                                priority
                                unoptimized={!restaurant.imageURL || restaurant.imageURL === "/placeholder-banner.png"}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                        <div className="absolute bottom-0 left-0 w-full">
                                <div className="custom-container py-8 text-white">
                                        <h1 className="text-4xl lg:text-5xl font-bold font-roboto-serif">
                                                {restaurant.resName}
                                        </h1>
                                        <p className="mt-2 text-lg">{mainCategory}</p>
                                        <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                                                <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full">
                                                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                                        <span className="font-semibold text-white">{restaurant.rating}</span>
                                                        <span className="text-gray-300">
                                                                ({restaurant.totalReview.toLocaleString()} reviews)
                                                        </span>
                                                </div>
                                                {restaurant.duration != null && restaurant.distance != null && (
                                                        <div className="flex items-center gap-2">
                                                                <span className="font-semibold">{restaurant.duration} min</span>
                                                                <span className="text-gray-300">•</span>
                                                                <span className="font-semibold">
                                                                        {restaurant.distance.toFixed(1)} km
                                                                </span>
                                                        </div>
                                                )}
                                        </div>
                                </div>
                        </div>
                </section>
        );
}
