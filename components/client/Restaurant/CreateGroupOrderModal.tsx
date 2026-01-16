"use client";

import { authApi } from "@/lib/api/authApi";
import { groupOrderApi } from "@/lib/api/groupOrderApi";
import { getImageUrl } from "@/lib/utils";
import { useAuthStore } from "@/stores/useAuthStore";
import { Address, Restaurant } from "@/types";
import { CreateGroupOrderRequest } from "@/types/groupOrder.type";
import { Check, Crown, MapPin, Users, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import toast from "react-hot-toast";

interface CreateGroupOrderModalProps {
    restaurant: Restaurant;
    isOpen: boolean;
    onClose: () => void;
}

type DeadlineOption = "15" | "30" | "60" | "custom";

export default function CreateGroupOrderModal({ restaurant, isOpen, onClose }: CreateGroupOrderModalProps) {
    const { user } = useAuthStore();
    const router = useRouter();
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loadingAddresses, setLoadingAddresses] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedAddressId, setSelectedAddressId] = useState<string>("");
    const [newAddress, setNewAddress] = useState("");
    const [useNewAddress, setUseNewAddress] = useState(false);
    const [deadlineOption, setDeadlineOption] = useState<DeadlineOption>("60");
    const [customHours, setCustomHours] = useState(2);
    
    const [formData, setFormData] = useState<CreateGroupOrderRequest>({
        restaurantId: restaurant.id,
        restaurantName: restaurant.resName,
        deliveryAddress: {
            street: "",
            city: "",
            state: "",
            zipCode: "",
        },
        groupNote: "",
        expiresInHours: 1,
        paymentMethod: "split",
        allowIndividualPayment: true,
    });

    // Fetch user addresses
    useEffect(() => {
        if (user?.id && isOpen) {
            setLoadingAddresses(true);
            authApi
                .getUserAddresses(user.id)
                .then((data) => {
                    if (Array.isArray(data) && data.length > 0) {
                        setAddresses(data);
                        setSelectedAddressId(data[0].id);
                        // Auto-fill with first address
                        const firstAddr = data[0];
                        if (firstAddr.location) {
                            parseAndSetAddress(firstAddr.location);
                        }
                    } else {
                        setUseNewAddress(true);
                    }
                })
                .catch((error) => {
                    console.warn("Failed to fetch addresses:", error);
                    setUseNewAddress(true);
                })
                .finally(() => {
                    setLoadingAddresses(false);
                });
        }
    }, [user?.id, isOpen]);

    // Update expiresInHours when deadline option changes
    useEffect(() => {
        if (deadlineOption === "custom") {
            setFormData(prev => ({ ...prev, expiresInHours: customHours }));
        } else {
            const hours = deadlineOption === "15" ? 0.25 : deadlineOption === "30" ? 0.5 : 1;
            setFormData(prev => ({ ...prev, expiresInHours: hours }));
        }
    }, [deadlineOption, customHours]);

    // Update address when selection changes
    useEffect(() => {
        if (!useNewAddress && selectedAddressId) {
            const selectedAddr = addresses.find(addr => addr.id === selectedAddressId);
            if (selectedAddr?.location) {
                parseAndSetAddress(selectedAddr.location);
            }
        } else if (useNewAddress && newAddress) {
            // Parse new address input
            parseAndSetAddress(newAddress);
        }
    }, [selectedAddressId, useNewAddress, newAddress, addresses]);

    const parseAndSetAddress = (addressString: string) => {
        const parts = addressString.split(",").map(p => p.trim());
        setFormData(prev => ({
            ...prev,
            deliveryAddress: {
                street: parts[0] || "",
                city: parts[1] || "Ho Chi Minh City",
                state: parts[2]?.split(" ")[0] || "Ho Chi Minh",
                zipCode: parts[2]?.split(" ")[1] || parts[3] || "700000",
            },
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!user) {
            toast.error("Please login to create group order");
            return;
        }

        // Validate delivery address
        if (useNewAddress && !newAddress.trim()) {
            toast.error("Please enter delivery address");
            return;
        }
        if (!useNewAddress && !selectedAddressId) {
            toast.error("Please select delivery address");
            return;
        }

        if (!formData.deliveryAddress.street) {
            toast.error("Please enter a valid delivery address");
            return;
        }

        setIsSubmitting(true);
        try {
            const groupOrder = await groupOrderApi.createGroupOrder(formData);
            toast.success("Group order created successfully!");
            
            onClose();
            router.push(`/group-orders/${groupOrder.shareToken}`);
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } }; message?: string };
            console.error("Failed to create group order:", error);
            const errorMessage = err.response?.data?.message || err.message || "Failed to create group order";
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const getDeadlineText = () => {
        const now = new Date();
        const hours = deadlineOption === "custom" ? customHours : deadlineOption === "15" ? 0.25 : deadlineOption === "30" ? 0.5 : 1;
        const endTime = new Date(now.getTime() + hours * 60 * 60 * 1000);
        return endTime.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
    };

    const restaurantImageUrl = restaurant.imageURL ? getImageUrl(restaurant.imageURL) : null;
    const [mounted, setMounted] = useState(false);

    // Handle mounting for portal
    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            // Save current scroll position
            const scrollY = window.scrollY;
            document.body.style.position = "fixed";
            document.body.style.top = `-${scrollY}px`;
            document.body.style.width = "100%";
            document.body.style.overflow = "hidden";
            
            return () => {
                // Restore scroll position
                const scrollY = document.body.style.top;
                document.body.style.position = "";
                document.body.style.top = "";
                document.body.style.width = "";
                document.body.style.overflow = "";
                if (scrollY) {
                    window.scrollTo(0, parseInt(scrollY || "0") * -1);
                }
            };
        }
    }, [isOpen]);

    if (!isOpen || !mounted) return null;

    const modalContent = (
        <>
            {/* Custom Scrollbar Styles */}
            <style jsx global>{`
                .group-order-modal-scroll {
                    scrollbar-width: thin;
                    scrollbar-color: #d1d5db #f3f4f6;
                }
                .group-order-modal-scroll::-webkit-scrollbar {
                    width: 6px;
                }
                .group-order-modal-scroll::-webkit-scrollbar-track {
                    background: #f3f4f6;
                    border-radius: 10px;
                }
                .group-order-modal-scroll::-webkit-scrollbar-thumb {
                    background: #d1d5db;
                    border-radius: 10px;
                }
                .group-order-modal-scroll::-webkit-scrollbar-thumb:hover {
                    background: #9ca3af;
                }
            `}</style>
            <div 
                className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                onClick={(e) => {
                    // Close modal when clicking backdrop
                    if (e.target === e.currentTarget) {
                        onClose();
                    }
                }}
            >
                <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header with Restaurant Mini Card */}
                <div className="bg-orange-50 px-6 py-4 border-b border-orange-100">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-900">Create Group Order</h2>
                        <button
                            onClick={onClose}
                            className="p-1.5 hover:bg-white/50 rounded-full transition-colors"
                            aria-label="Close"
                        >
                            <X className="w-5 h-5 text-gray-600" />
                        </button>
                    </div>
                    
                    {/* Restaurant Mini Card */}
                    <div className="flex items-center gap-3 bg-white rounded-xl p-3 shadow-sm">
                        <div className="relative w-14 h-14 flex-shrink-0 rounded-full overflow-hidden bg-gray-100 border-2 border-orange-200">
                            {restaurantImageUrl && restaurantImageUrl !== "/placeholder.png" ? (
                                <Image
                                    src={restaurantImageUrl}
                                    alt={restaurant.resName}
                                    fill
                                    className="object-cover"
                                    unoptimized
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-2xl">
                                    🍽️
                                </div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-lg text-gray-900 truncate">{restaurant.resName}</h3>
                            <p className="text-sm text-gray-500 truncate flex items-center gap-1">
                                <MapPin className="w-3 h-3 flex-shrink-0" />
                                <span className="truncate">{restaurant.address}</span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Form Content */}
                <form 
                    onSubmit={handleSubmit} 
                    className="flex-1 overflow-y-auto p-6 space-y-6 group-order-modal-scroll"
                >
                    {/* Delivery Address - Simplified */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
                            <MapPin className="w-4 h-4 text-[#EE4D2D]" />
                            Delivery Address <span className="text-red-500">*</span>
                        </label>
                        
                        {loadingAddresses ? (
                            <div className="text-sm text-gray-500 py-3">Loading addresses...</div>
                        ) : addresses.length > 0 ? (
                            <>
                                <div className="space-y-2 mb-3">
                                    {addresses.map((addr) => (
                                        <button
                                            key={addr.id}
                                            type="button"
                                            onClick={() => {
                                                setSelectedAddressId(addr.id);
                                                setUseNewAddress(false);
                                            }}
                                            className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                                                !useNewAddress && selectedAddressId === addr.id
                                                    ? "border-[#EE4D2D] bg-orange-50"
                                                    : "border-gray-200 hover:border-gray-300 bg-white"
                                            }`}
                                        >
                                            <div className="flex items-start gap-2">
                                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mt-0.5 flex-shrink-0 ${
                                                    !useNewAddress && selectedAddressId === addr.id
                                                        ? "border-[#EE4D2D] bg-[#EE4D2D]"
                                                        : "border-gray-300"
                                                }`}>
                                                    {!useNewAddress && selectedAddressId === addr.id && (
                                                        <div className="w-2 h-2 rounded-full bg-white" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 truncate">{addr.location}</p>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                                
                                <button
                                    type="button"
                                    onClick={() => {
                                        setUseNewAddress(true);
                                        setSelectedAddressId("");
                                    }}
                                    className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                                        useNewAddress
                                            ? "border-[#EE4D2D] bg-orange-50"
                                            : "border-gray-200 hover:border-gray-300 bg-white"
                                    }`}
                                >
                                    <div className="flex items-start gap-2">
                                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mt-0.5 flex-shrink-0 ${
                                            useNewAddress
                                                ? "border-[#EE4D2D] bg-[#EE4D2D]"
                                                : "border-gray-300"
                                        }`}>
                                            {useNewAddress && (
                                                <div className="w-2 h-2 rounded-full bg-white" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-900">+ Add New Address</p>
                                        </div>
                                    </div>
                                </button>
                            </>
                        ) : (
                            <div className="space-y-2">
                                <p className="text-xs text-gray-500 mb-2">No saved addresses. Add one below:</p>
                                <input
                                    type="text"
                                    placeholder="Enter delivery address"
                                    value={newAddress}
                                    onChange={(e) => {
                                        setNewAddress(e.target.value);
                                        setUseNewAddress(true);
                                    }}
                                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#EE4D2D] focus:border-[#EE4D2D]"
                                    required
                                />
                            </div>
                        )}

                        {useNewAddress && addresses.length > 0 && (
                            <div className="mt-3">
                                <input
                                    type="text"
                                    placeholder="Enter delivery address"
                                    value={newAddress}
                                    onChange={(e) => setNewAddress(e.target.value)}
                                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#EE4D2D] focus:border-[#EE4D2D]"
                                    required={useNewAddress}
                                />
                            </div>
                        )}

                        {addresses.length === 0 && (
                            <Link
                                href="/account/addresses"
                                className="text-xs text-[#EE4D2D] hover:underline mt-2 inline-block"
                            >
                                Manage addresses →
                            </Link>
                        )}
                    </div>

                    {/* Order Deadline - Quick Select */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-3">
                            Order Deadline
                        </label>
                        <div className="flex flex-wrap gap-2 mb-3">
                            {(["15", "30", "60", "custom"] as DeadlineOption[]).map((option) => (
                                <button
                                    key={option}
                                    type="button"
                                    onClick={() => setDeadlineOption(option)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                        deadlineOption === option
                                            ? "bg-[#EE4D2D] text-white shadow-md"
                                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    }`}
                                >
                                    {option === "15"
                                        ? "15 mins"
                                        : option === "30"
                                        ? "30 mins"
                                        : option === "60"
                                        ? "1 Hour"
                                        : "Custom"}
                                </button>
                            ))}
                        </div>
                        
                        {deadlineOption === "custom" && (
                            <div className="mb-3">
                                <input
                                    type="number"
                                    min={0.25}
                                    max={24}
                                    step={0.25}
                                    value={customHours}
                                    onChange={(e) => setCustomHours(parseFloat(e.target.value) || 1)}
                                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#EE4D2D] focus:border-[#EE4D2D]"
                                    placeholder="Hours"
                                />
                            </div>
                        )}
                        
                        <p className="text-xs text-gray-500">
                            Order will close at <span className="font-semibold text-gray-700">{getDeadlineText()}</span>
                        </p>
                    </div>

                    {/* Payment Mode - Radio Cards */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-3">
                            Payment Mode
                        </label>
                        <div className="space-y-3">
                            {/* Split Bill Option */}
                            <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, paymentMethod: "split" }))}
                                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                                    formData.paymentMethod === "split"
                                        ? "border-[#EE4D2D] bg-orange-50"
                                        : "border-gray-200 hover:border-gray-300 bg-white"
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                            formData.paymentMethod === "split"
                                                ? "border-[#EE4D2D] bg-[#EE4D2D]"
                                                : "border-gray-300"
                                        }`}>
                                            {formData.paymentMethod === "split" && (
                                                <Check className="w-3 h-3 text-white" />
                                            )}
                                        </div>
                                        <Users className="w-5 h-5 text-gray-600" />
                                        <div>
                                            <p className="font-semibold text-gray-900">Split Bill Equally</p>
                                            <p className="text-xs text-gray-500">Each person pays their share</p>
                                        </div>
                                    </div>
                                </div>
                            </button>

                            {/* Pay All Option */}
                            <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, paymentMethod: "card" }))}
                                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                                    formData.paymentMethod === "card"
                                        ? "border-[#EE4D2D] bg-orange-50"
                                        : "border-gray-200 hover:border-gray-300 bg-white"
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                            formData.paymentMethod === "card"
                                                ? "border-[#EE4D2D] bg-[#EE4D2D]"
                                                : "border-gray-300"
                                        }`}>
                                            {formData.paymentMethod === "card" && (
                                                <Check className="w-3 h-3 text-white" />
                                            )}
                                        </div>
                                        <Crown className="w-5 h-5 text-yellow-500" />
                                        <div>
                                            <p className="font-semibold text-gray-900">I will pay for everyone</p>
                                            <p className="text-xs text-gray-500">You cover the full bill</p>
                                        </div>
                                    </div>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Group Note - Optional */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Note (Optional)
                        </label>
                        <textarea
                            placeholder="Add a note for your group..."
                            value={formData.groupNote}
                            onChange={(e) => setFormData(prev => ({ ...prev, groupNote: e.target.value }))}
                            rows={3}
                            className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#EE4D2D] focus:border-[#EE4D2D] resize-none"
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-6 py-3 text-sm font-semibold text-white bg-[#EE4D2D] rounded-lg hover:bg-[#EE4D2D]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Creating..." : "Create Group Order"}
                        </button>
                    </div>
                </form>
                </div>
            </div>
        </>
    );

    return createPortal(modalContent, document.body);
}
