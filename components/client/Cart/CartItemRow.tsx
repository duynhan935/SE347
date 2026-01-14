import { getImageUrl } from "@/lib/utils";
import { CartItem, useCartStore } from "@/stores/cartStore";
import { Minus, Plus, Trash2 } from "lucide-react";
import Image from "next/image";

export const CartItemRow = ({ item }: { item: CartItem }) => {
        const { updateQuantity, removeItem } = useCartStore();

        const imageUrl = getImageUrl(item.image);
        const finalImageUrl = imageUrl || "/placeholder.png";
        const hasImage = finalImageUrl && finalImageUrl !== "/placeholder.png";

        return (
                <div className="flex items-start gap-4 py-5 border-b border-gray-100 last:border-b-0">
                        {/* Product Image - Real food image with rounded corners */}
                        {hasImage ? (
                                <div className="relative h-20 w-20 md:h-24 md:w-24 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100 shadow-sm">
                                        <Image
                                                src={finalImageUrl}
                                                alt={item.name}
                                                fill
                                                className="object-cover"
                                                sizes="(max-width: 768px) 80px, 96px"
                                                unoptimized={finalImageUrl.startsWith("http")}
                                        />
                                </div>
                        ) : (
                                <div className="flex h-20 w-20 md:h-24 md:w-24 items-center justify-center rounded-xl bg-gradient-to-br from-orange-100 to-orange-200 text-brand-purple flex-shrink-0 shadow-sm">
                                        <svg
                                                className="w-8 h-8"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                        >
                                                <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                                                />
                                        </svg>
                                </div>
                        )}

                        {/* Product Details - Better typography hierarchy */}
                        <div className="flex-grow min-w-0 space-y-1.5">
                                {/* Product Name - Bold */}
                                <p className="font-bold text-base md:text-lg leading-tight text-gray-900">{item.name}</p>

                                {/* Category */}
                                {item.categoryName && (
                                        <p className="text-xs md:text-sm text-gray-500 font-medium">
                                                Category: {item.categoryName}
                                        </p>
                                )}

                                {/* Price per item - Small, light gray */}
                                <p className="text-xs md:text-sm text-gray-400 font-medium">
                                        ${item.price.toFixed(2)} each
                                </p>

                                {/* Size and Customizations - Small, light gray */}
                                {item.sizeName && (
                                        <p className="text-xs text-gray-400">Size: {item.sizeName}</p>
                                )}
                                {item.customizations && (
                                        <p className="text-xs text-gray-400 truncate max-w-[200px]" title={item.customizations}>
                                                {item.customizations}
                                        </p>
                                )}

                                {/* Total Price - Smaller than Orders page */}
                                <p className="font-semibold text-sm text-gray-600 mt-2">
                                        ${(item.price * item.quantity).toFixed(2)}
                                </p>
                        </div>

                        {/* Quantity Controls and Actions */}
                        <div className="flex flex-col items-end gap-3 flex-shrink-0">
                                {/* Quantity Controls - Improved design */}
                                <div className="flex items-center border-2 border-gray-200 rounded-lg overflow-hidden">
                                        <button
                                                title="Decrease item"
                                                onClick={() => updateQuantity(item.id, item.restaurantId, item.quantity - 1)}
                                                className="p-2.5 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                disabled={item.quantity <= 1}
                                        >
                                                <Minus className="w-4 h-4" />
                                        </button>
                                        <span className="px-4 py-2 font-bold text-gray-900 min-w-[3rem] text-center">
                                                {item.quantity}
                                        </span>
                                        <button
                                                title="Increase item"
                                                onClick={() => updateQuantity(item.id, item.restaurantId, item.quantity + 1)}
                                                className="p-2.5 hover:bg-gray-100 transition-colors"
                                        >
                                                <Plus className="w-4 h-4" />
                                        </button>
                                </div>

                                {/* Remove Button - Desktop */}
                                <button
                                        title="Remove item"
                                        onClick={() => removeItem(item.id, item.restaurantId)}
                                        className="text-gray-400 hover:text-red-500 transition-colors hidden sm:flex items-center gap-1.5 text-sm font-medium"
                                >
                                        <Trash2 className="w-4 h-4" />
                                        <span>Remove</span>
                                </button>
                        </div>
                </div>
        );
};
