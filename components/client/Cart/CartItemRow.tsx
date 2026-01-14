import { getImageUrl } from "@/lib/utils";
import { CartItem, useCartStore } from "@/stores/cartStore";
import { Minus, Plus, Trash2 } from "lucide-react";
import Image from "next/image";

// Format price to VND
const formatPriceVND = (priceUSD: number): string => {
    const vndPrice = priceUSD * 25000; // Convert USD to VND
    return vndPrice.toLocaleString("vi-VN", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    });
};

interface CartItemRowProps {
    item: CartItem;
    isSelected: boolean;
    onToggleSelect: () => void;
}

export const CartItemRow = ({ item, isSelected, onToggleSelect }: CartItemRowProps) => {
    const { updateQuantity, removeItem } = useCartStore();

    const imageUrl = getImageUrl(item.image);
    const finalImageUrl = imageUrl || "/placeholder.png";
    const hasImage = finalImageUrl && finalImageUrl !== "/placeholder.png";
    const itemTotal = item.price * item.quantity;

    return (
        <div className="flex items-start gap-4">
            {/* Checkbox */}
            <div className="flex-shrink-0 pt-1">
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={onToggleSelect}
                    className="w-5 h-5 text-[#EE4D2D] border-gray-300 rounded focus:ring-[#EE4D2D] focus:ring-2 cursor-pointer"
                />
            </div>

            {/* Product Image - Square */}
            {hasImage ? (
                <div className="relative h-20 w-20 md:h-24 md:w-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
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
                <div className="flex h-20 w-20 md:h-24 md:w-24 items-center justify-center rounded-lg bg-gradient-to-br from-orange-100 to-orange-200 text-[#EE4D2D] flex-shrink-0">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                        />
                    </svg>
                </div>
            )}

            {/* Product Info */}
            <div className="flex-grow min-w-0">
                {/* Product Name - Bold */}
                <p className="font-bold text-base md:text-lg leading-tight text-gray-900 mb-1">{item.name}</p>

                {/* Size and Customizations - Small gray text */}
                <div className="space-y-0.5 mb-2">
                    {item.sizeName && (
                        <p className="text-xs text-gray-500">Size: {item.sizeName}</p>
                    )}
                    {item.customizations && (
                        <p className="text-xs text-gray-500 truncate max-w-[200px]" title={item.customizations}>
                            {item.customizations}
                        </p>
                    )}
                </div>

                {/* Price per item */}
                <p className="text-sm text-gray-500 mb-2">{formatPriceVND(item.price)} ₫</p>

                {/* Quantity Control */}
                <div className="flex items-center gap-3">
                    <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                        <button
                            title="Decrease item"
                            onClick={() => updateQuantity(item.id, item.restaurantId, item.quantity - 1)}
                            className="p-2 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={item.quantity <= 1}
                        >
                            <Minus className="w-4 h-4 text-gray-600" />
                        </button>
                        <span className="px-4 py-1.5 font-semibold text-gray-900 min-w-[2.5rem] text-center bg-white">
                            {item.quantity}
                        </span>
                        <button
                            title="Increase item"
                            onClick={() => updateQuantity(item.id, item.restaurantId, item.quantity + 1)}
                            className="p-2 hover:bg-[#EE4D2D]/10 hover:text-[#EE4D2D] transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Delete Button */}
                    <button
                        title="Remove item"
                        onClick={() => removeItem(item.id, item.restaurantId)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Total Item Price - Orange, Bold */}
            <div className="flex-shrink-0 text-right">
                <p className="font-bold text-lg text-[#EE4D2D]">{formatPriceVND(itemTotal)} ₫</p>
            </div>
        </div>
    );
};
