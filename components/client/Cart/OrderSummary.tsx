"use client";

import { authApi } from "@/lib/api/authApi";
import { CartItem } from "@/stores/cartStore";
import { useAuthStore } from "@/stores/useAuthStore";
import type { Address } from "@/types";
import { Edit2, MapPin } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

// Format price to USD
const formatPriceUSD = (priceUSD: number): string => {
    return priceUSD.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
};

interface OrderSummaryProps {
    subtotal: number;
    selectedItems: CartItem[]; // Kept for future use (e.g., displaying selected items list)
    restaurantId?: string;
    totalItems: number;
}

export const OrderSummary = ({ subtotal, restaurantId, totalItems }: OrderSummaryProps) => {
    const { user, isAuthenticated } = useAuthStore();
    const [voucherCode, setVoucherCode] = useState("");
    const [appliedVoucher, setAppliedVoucher] = useState<string | null>(null);
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loadingAddresses, setLoadingAddresses] = useState(false);
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

    // Fetch user addresses
    useEffect(() => {
        if (user?.id && isAuthenticated) {
            setLoadingAddresses(true);
            authApi
                .getUserAddresses(user.id)
                .then((data) => {
                    if (Array.isArray(data) && data.length > 0) {
                        setAddresses(data);
                        setSelectedAddressId(data[0].id);
                    }
                })
                .catch((error) => {
                    console.warn("Failed to fetch addresses:", error);
                })
                .finally(() => {
                    setLoadingAddresses(false);
                });
        }
    }, [user?.id, isAuthenticated]);

    const selectedAddress = addresses.find((addr) => addr.id === selectedAddressId);
    const deliveryAddress = selectedAddress?.location || (addresses.length > 0 ? addresses[0].location : "No address saved");

    const shippingFee = 0; // Free shipping for now
    const tax = subtotal * 0.05; // 5% tax
    const voucherDiscount = appliedVoucher ? subtotal * 0.1 : 0; // 10% discount if voucher applied
    const total = subtotal + shippingFee + tax - voucherDiscount;

    const handleApplyVoucher = () => {
        if (voucherCode.trim()) {
            // Mock voucher validation (TODO: Integrate with backend voucher API when available)
            if (voucherCode.toUpperCase() === "SAVE10" || voucherCode.toUpperCase() === "DISCOUNT10") {
                setAppliedVoucher(voucherCode.toUpperCase());
                toast.success("Voucher applied successfully!");
            } else {
                toast.error("Invalid voucher code");
            }
        }
    };

    const handleRemoveVoucher = () => {
        setAppliedVoucher(null);
        setVoucherCode("");
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            {/* Location */}
            <div className="mb-6 pb-6 border-b border-gray-200">
                <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-[#EE4D2D] flex-shrink-0 mt-0.5" />
                    <div className="flex-grow min-w-0">
                        <p className="text-xs text-gray-500 mb-1">Deliver to</p>
                        {loadingAddresses ? (
                            <p className="text-sm text-gray-400">Loading address...</p>
                        ) : addresses.length > 0 ? (
                            <>
                                {addresses.length > 1 ? (
                                    <select
                                        value={selectedAddressId || ""}
                                        onChange={(e) => setSelectedAddressId(e.target.value)}
                                        aria-label="Select delivery address"
                                        title="Select delivery address"
                                        className="w-full text-sm font-medium text-gray-900 border border-gray-300 rounded-lg px-2 py-1 mb-1 focus:outline-none focus:ring-2 focus:ring-[#EE4D2D] focus:border-[#EE4D2D]"
                                    >
                                        {addresses.map((addr) => (
                                            <option key={addr.id} value={addr.id}>
                                                {addr.location}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <p className="text-sm font-medium text-gray-900 line-clamp-2">{deliveryAddress}</p>
                                )}
                                <Link
                                    href="/account/addresses"
                                    className="text-xs text-[#EE4D2D] hover:text-[#EE4D2D]/80 mt-1 flex items-center gap-1"
                                >
                                    <Edit2 className="w-3 h-3" />
                                    <span>Edit</span>
                                </Link>
                            </>
                        ) : (
                            <>
                                <p className="text-sm text-gray-400 italic">No address saved</p>
                                <Link
                                    href="/account/addresses"
                                    className="text-xs text-[#EE4D2D] hover:text-[#EE4D2D]/80 mt-1 flex items-center gap-1"
                                >
                                    <Edit2 className="w-3 h-3" />
                                    <span>Add Address</span>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Bill Details */}
            <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-900 font-medium">{formatPriceUSD(subtotal)} $</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping Fee</span>
                    <span className="text-gray-900 font-medium">
                        {shippingFee === 0 ? "FREE" : `${formatPriceUSD(shippingFee)} $`}
                    </span>
                </div>
                {appliedVoucher && (
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Voucher Discount</span>
                        <span className="text-green-600 font-medium">-{formatPriceUSD(voucherDiscount)} $</span>
                    </div>
                )}
                <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax</span>
                    <span className="text-gray-900 font-medium">{formatPriceUSD(tax)} $</span>
                </div>
            </div>

            {/* Voucher Input */}
            <div className="mb-6 pb-6 border-b border-gray-200">
                {appliedVoucher ? (
                    <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-green-700">{appliedVoucher}</span>
                            <span className="text-xs text-green-600">Applied</span>
                        </div>
                        <button
                            onClick={handleRemoveVoucher}
                            className="text-xs text-green-700 hover:text-green-800 font-medium"
                        >
                            Remove
                        </button>
                    </div>
                ) : (
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Enter voucher code"
                            value={voucherCode}
                            onChange={(e) => setVoucherCode(e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#EE4D2D] focus:border-[#EE4D2D]"
                        />
                        <button
                            onClick={handleApplyVoucher}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                        >
                            Apply
                        </button>
                    </div>
                )}
            </div>

            {/* Total */}
            <div className="mb-6">
                <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">Total</span>
                    <span className="text-2xl font-bold text-[#EE4D2D]">{formatPriceUSD(total)} $</span>
                </div>
            </div>

            {/* Checkout Button */}
            <Link
                href={restaurantId ? `/payment?restaurantId=${restaurantId}` : "/payment"}
                className="block w-full bg-[#EE4D2D] text-white font-semibold py-4 rounded-lg hover:bg-[#EE4D2D]/90 transition-colors text-center shadow-md hover:shadow-lg"
            >
                Checkout ({totalItems})
            </Link>
        </div>
    );
};
