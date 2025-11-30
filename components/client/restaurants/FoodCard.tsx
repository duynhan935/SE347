"use client";

import { Product } from "@/types";
import { Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type FoodCardProps = {
        product: Product;
};

export const FoodCard = ({ product }: FoodCardProps) => {
        const displayPrice = product.productSizes?.[0]?.price;

        return (
                <Link
                        // 1. Link đến trang chi tiết food
                        href={`/food/${product.slug}`}
                        className="group block rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 bg-white h-full flex flex-col"
                >
                        <div className="relative w-full h-48">
                                <Image
                                        // 2. Dùng thông tin của product
                                        src={product.imageURL || "/placeholder.png"}
                                        alt={product.productName}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                                />

                                {/* Hiển thị thời gian giao hàng của nhà hàng (nếu muốn) */}
                                {product.restaurant && (
                                        <div className="absolute bottom-2 right-2 bg-white/80 text-gray-800 text-xs px-2 py-1 rounded-full backdrop-blur-sm font-semibold">
                                                {product.restaurant.duration} min
                                        </div>
                                )}
                        </div>

                        <div className="p-4 flex-grow flex flex-col">
                                <h3 className="font-bold text-lg truncate" title={product.productName}>
                                        {/* 3. Tên sản phẩm */}
                                        {product.productName}
                                </h3>
                                {/* 4. Tên nhà hàng */}
                                <p className="text-sm text-gray-500 mt-1 truncate">{product.restaurant?.resName}</p>

                                <div className="flex items-center justify-between mt-auto pt-3 text-sm text-gray-600">
                                        <div className="flex items-center gap-1">
                                                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                                {/* 5. Rating của sản phẩm */}
                                                <span className="font-medium text-gray-800">
                                                        {product.rating.toFixed(1)}
                                                </span>
                                                <span className="text-gray-500">
                                                        ({product.totalReview.toLocaleString()})
                                                </span>
                                        </div>

                                        {/* 6. Hiển thị giá */}
                                        {displayPrice !== undefined ? (
                                                <span className="text-md font-bold text-brand-purple">
                                                        ${displayPrice.toFixed(2)}
                                                </span>
                                        ) : (
                                                <span className="text-xs text-gray-500">No price</span>
                                        )}
                                </div>
                        </div>
                </Link>
        );
};
