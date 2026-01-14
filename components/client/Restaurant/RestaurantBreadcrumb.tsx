"use client";

import { Restaurant } from "@/types";
import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";

export default function RestaurantBreadcrumb({ restaurant }: { restaurant: Restaurant }) {
        return (
                <nav className="flex items-center gap-2 py-4">
                        <Link
                                href="/"
                                className="flex items-center gap-1 text-gray-600 hover:text-[#EE4D2D] transition-colors"
                        >
                                <Home className="w-4 h-4" />
                                <span className="text-sm font-medium">Home</span>
                        </Link>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                        <Link
                                href="/restaurants"
                                className="text-gray-600 hover:text-[#EE4D2D] transition-colors text-sm font-medium"
                        >
                                Restaurants
                        </Link>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-800 text-sm font-semibold truncate max-w-[300px]">
                                {restaurant.resName}
                        </span>
                </nav>
        );
}
