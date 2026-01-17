// File: app/_components/client/Restaurant/RestaurantHero.tsx
"use client";

import { getImageUrl } from "@/lib/utils";
import { Restaurant } from "@/types";
import { Clock, MapPin, Star } from "lucide-react";
import Image from "next/image";

export default function RestaurantHero({ restaurant }: { restaurant: Restaurant }) {
        const mainCategory = restaurant.cate[0]?.cateName || "Restaurant";
        const bannerUrl = restaurant.imageURL || "/placeholder-banner.png";

        return (
                <>
                        {/* 1. Hero Banner Wrapper - Atmospheric Blur Style */}
                        <div className="relative h-[300px] md:h-[400px] w-full overflow-hidden bg-gray-900">
                                {/* Blurred Background Image */}
                                <Image
                                        src={getImageUrl(bannerUrl)}
                                        alt={`${restaurant.resName} background`}
                                        fill
                                        className="object-cover filter blur-2xl scale-110 opacity-70"
                                        sizes="100vw"
                                        priority
                                        unoptimized={!restaurant.imageURL || restaurant.imageURL === "/placeholder-banner.png"}
                                />

                                {/* Strong Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/95 via-gray-900/60 to-gray-900/20 z-0"></div>

                                {/* Content - Restaurant Info */}
                                <div className="absolute bottom-0 left-0 w-full p-6 md:p-8 z-20">
                                        <div className="flex items-end gap-4 md:gap-6 max-w-6xl mx-auto">
                                                {/* Restaurant Logo/Avatar (Optional) */}
                                                <div className="hidden md:block flex-shrink-0">
                                                        <div className="relative w-20 h-20 rounded-full overflow-hidden bg-white p-1 shadow-2xl ring-2 ring-white/20">
                                                                <div className="relative w-full h-full rounded-full overflow-hidden bg-gray-100">
                                                                        <Image
                                                                                src={getImageUrl(restaurant.imageURL || "/placeholder.png")}
                                                                                alt={restaurant.resName}
                                                                                fill
                                                                                className="object-cover"
                                                                                unoptimized={!restaurant.imageURL || restaurant.imageURL === "/placeholder.png"}
                                                                        />
                                                                </div>
                                                        </div>
                                                </div>

                                                {/* Restaurant Info */}
                                                <div className="flex-1 min-w-0">
                                                        {/* Restaurant Name */}
                                                        <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-2 drop-shadow-lg">
                                                                {restaurant.resName}
                                                        </h1>

                                                        {/* Category */}
                                                        <p className="text-base md:text-lg text-gray-200 mb-4 drop-shadow-md">
                                                                {mainCategory}
                                                        </p>

                                                        {/* Rating & Meta Info */}
                                                        <div className="flex flex-wrap items-center gap-x-4 md:gap-x-6 gap-y-2">
                                                                {/* Rating */}
                                                                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/20">
                                                                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 flex-shrink-0" />
                                                                        <span className="font-semibold text-white">{restaurant.rating}</span>
                                                                        <span className="text-xs text-gray-200">
                                                                                ({restaurant.totalReview.toLocaleString()} reviews)
                                                                        </span>
                                                                </div>

                                                                {/* Duration & Distance */}
                                                                {restaurant.duration != null && restaurant.distance != null && (
                                                                        <>
                                                                                <div className="flex items-center gap-2 text-sm text-gray-200">
                                                                                        <Clock className="w-4 h-4 text-gray-300 flex-shrink-0" />
                                                                                        <span className="font-medium">{restaurant.duration} min</span>
                                                                                </div>
                                                                                <div className="flex items-center gap-2 text-sm text-gray-200">
                                                                                        <MapPin className="w-4 h-4 text-gray-300 flex-shrink-0" />
                                                                                        <span className="font-medium">{restaurant.distance.toFixed(1)} km</span>
                                                                                </div>
                                                                        </>
                                                                )}
                                                        </div>
                                                </div>
                                        </div>
                                </div>
                        </div>

                        {/* 2. Spacer for content below (to account for removed overlapping card) */}
                        <div className="h-8"></div>
                </>
        );
}
