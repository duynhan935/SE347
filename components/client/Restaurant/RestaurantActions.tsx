"use client";

import { Restaurant } from "@/types";
import ChatWithRestaurantButton from "./ChatWithRestaurantButton";

interface RestaurantActionsProps {
        restaurant: Restaurant;
}

export default function RestaurantActions({ restaurant }: RestaurantActionsProps) {
        return (
                <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
                        <h2 className="text-2xl font-bold font-roboto-serif mb-4 text-gray-900">Liên hệ</h2>
                        <p className="text-sm text-gray-600 mb-6">
                                Có câu hỏi về nhà hàng? Chat trực tiếp với chủ nhà hàng để được hỗ trợ nhanh chóng.
                        </p>
                        <div className="flex flex-col gap-3">
                                <ChatWithRestaurantButton
                                        merchantId={restaurant.merchantId}
                                        restaurantName={restaurant.resName}
                                        variant="default"
                                        className="w-full px-6 py-3 rounded-lg"
                                />
                        </div>
                </div>
        );
}
