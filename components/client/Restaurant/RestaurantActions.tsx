"use client";

import { useAuthStore } from "@/stores/useAuthStore";
import { Restaurant } from "@/types";
import { Users } from "lucide-react";
import { useState } from "react";
import ChatWithRestaurantButton from "./ChatWithRestaurantButton";
import CreateGroupOrderModal from "./CreateGroupOrderModal";

interface RestaurantActionsProps {
        restaurant: Restaurant;
}

export default function RestaurantActions({ restaurant }: RestaurantActionsProps) {
        const { isAuthenticated, user } = useAuthStore();
        const [isGroupOrderModalOpen, setIsGroupOrderModalOpen] = useState(false);

        const handleCreateGroupOrder = () => {
                if (!isAuthenticated || !user) {
                        // Redirect to login or show toast
                        return;
                }
                setIsGroupOrderModalOpen(true);
        };

        return (
                <>
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

                                {/* Action Buttons */}
                                <div className="flex flex-col gap-3">
                                        {/* Create Group Order Button */}
                                        {isAuthenticated && user && (
                                                <button
                                                        onClick={handleCreateGroupOrder}
                                                        className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-[#EE4D2D] text-white rounded-lg hover:bg-[#EE4D2D]/90 transition-colors font-medium"
                                                >
                                                        <Users className="w-5 h-5" />
                                                        Tạo Group Order
                                                </button>
                                        )}
                                        
                                        {/* Chat Button */}
                                        <ChatWithRestaurantButton
                                                merchantId={restaurant.merchantId}
                                                restaurantName={restaurant.resName}
                                                variant="outline"
                                                className="w-full px-6 py-3 rounded-lg"
                                        />
                                </div>
                        </div>

                        {/* Create Group Order Modal */}
                        <CreateGroupOrderModal
                                restaurant={restaurant}
                                isOpen={isGroupOrderModalOpen}
                                onClose={() => setIsGroupOrderModalOpen(false)}
                        />
                </>
        );
}
