"use client";

import { Restaurant } from "@/types";
import ChatWithRestaurantButton from "./ChatWithRestaurantButton";

interface RestaurantActionsProps {
        restaurant: Restaurant;
}

export default function RestaurantActions({ restaurant }: RestaurantActionsProps) {
        return (
                <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
                        <h2 className="text-2xl font-bold mb-4 text-gray-900">Restaurant Info</h2>
                        
                        {/* Opening Hours */}
                        {restaurant.openingTime && restaurant.closingTime && (
                                <div className="mb-4 pb-4 border-b border-gray-200">
                                        <h3 className="text-sm font-semibold text-gray-700 mb-2">Opening Hours</h3>
                                        <p className="text-sm text-gray-600">
                                                {restaurant.openingTime} - {restaurant.closingTime}
                                        </p>
                                </div>
                        )}

                        {/* Distance */}
                        {restaurant.distance != null && (
                                <div className="mb-4 pb-4 border-b border-gray-200">
                                        <h3 className="text-sm font-semibold text-gray-700 mb-2">Distance</h3>
                                        <p className="text-sm text-gray-600">
                                                {restaurant.distance.toFixed(1)} km away
                                        </p>
                                </div>
                        )}

                        {/* Delivery Time */}
                        {restaurant.duration != null && (
                                <div className="mb-6 pb-4 border-b border-gray-200">
                                        <h3 className="text-sm font-semibold text-gray-700 mb-2">Delivery Time</h3>
                                        <p className="text-sm text-gray-600">
                                                {restaurant.duration} minutes
                                        </p>
                                </div>
                        )}

                        {/* Chat Button */}
                        <div className="flex flex-col gap-3">
                                <ChatWithRestaurantButton
                                        merchantId={restaurant.merchantId}
                                        restaurantName={restaurant.resName}
                                        variant="outline"
                                        className="w-full px-6 py-3 rounded-lg"
                                />
                        </div>
                </div>
        );
}
