"use client";

import GlobalLoader from "@/components/ui/GlobalLoader";
import { authApi } from "@/lib/api/authApi";
import { orderApi, type CreateOrderRequest } from "@/lib/api/orderApi";
import { paymentApi } from "@/lib/api/paymentApi";
import { useGeolocation } from "@/lib/userLocation";
import { getImageUrl } from "@/lib/utils";
import { useCartStore, type CartItem } from "@/stores/cartStore";
import { useAuthStore } from "@/stores/useAuthStore";
import type { Address } from "@/types";
import { ArrowLeft, Edit2, Truck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import PaymentMethodSelector from "./PaymentMethodSelector";

const SHIPPING_FEE = 0; // Free shipping

// Format price to USD
const formatPriceUSD = (priceUSD: number): string => {
    return priceUSD.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
};

export default function PaymentPageClient() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const restaurantId = searchParams.get("restaurantId");

    const { items, clearRestaurant, setUserId, userId: cartUserId, isLoading: cartLoading, fetchCart } = useCartStore();
    const { user, loading: authLoading, isAuthenticated } = useAuthStore();
    const { coords, error: locationError } = useGeolocation();
    const [cartFetched, setCartFetched] = useState(false);
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loadingAddresses, setLoadingAddresses] = useState(false);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deliverStyle, setDeliverStyle] = useState<"delivery" | "pickup">("delivery");
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
    const [useNewAddress, setUseNewAddress] = useState(false);
    
    // Stripe payment states
    const [createdOrderIds, setCreatedOrderIds] = useState<string[]>([]);
    const [stripeClientSecret, setStripeClientSecret] = useState<string | null>(null);
    const [isProcessingCardPayment, setIsProcessingCardPayment] = useState(false);
    // paymentId is stored but not used for API calls - Stripe webhook handles payment completion
    const [paymentId, setPaymentId] = useState<string | null>(null);
    const [isPaymentSuccess, setIsPaymentSuccess] = useState(false);

    const [formData, setFormData] = useState({
        name: user?.username || "",
        phone: (user as { phone?: string })?.phone || "",
        street: "",
        note: "",
    });

    // Filter items by restaurant if restaurantId provided
    const orderItems = useMemo(
        () => (restaurantId ? items.filter((item) => item.restaurantId === restaurantId) : items),
        [restaurantId, items]
    );
    const subtotal = useMemo(
        () => orderItems.reduce((total, item) => total + item.price * item.quantity, 0),
        [orderItems]
    );
    const shipping = deliverStyle === "pickup" ? 0 : SHIPPING_FEE;
    const tax = subtotal * 0.05;
    const total = subtotal + shipping + tax;

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
                        // Auto-fill form with first address
                        const firstAddress = data[0];
                        setFormData((prev) => ({
                            ...prev,
                            street: firstAddress.location || "",
                        }));
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
    }, [user?.id, isAuthenticated]);

    // Auto-fill form from user profile
    useEffect(() => {
        if (user) {
            setFormData((prev) => ({
                ...prev,
                name: user.username || prev.name,
                phone: (user as { phone?: string })?.phone || prev.phone,
            }));
        }
    }, [user]);

    // Ensure cart is initialized and fetched
    useEffect(() => {
        if (authLoading) {
            return;
        }

        const hasToken =
            typeof window !== "undefined" &&
            (localStorage.getItem("accessToken") || localStorage.getItem("refreshToken"));

        if (!user && !isAuthenticated && !hasToken) {
            toast.error("Please login to checkout");
            router.push("/login");
            return;
        }

        if (!user && hasToken && isAuthenticated) {
            return;
        }

        if (!restaurantId && items.length > 0) {
            const uniqueRestaurantIds = new Set(items.map((item) => item.restaurantId));
            if (uniqueRestaurantIds.size === 1) {
                const firstRestaurantId = Array.from(uniqueRestaurantIds)[0];
                router.replace(`/payment?restaurantId=${firstRestaurantId}`);
                return;
            }
        }

        if (user?.id && cartUserId !== user.id) {
            setUserId(user.id);
            setCartFetched(false);
            return;
        }

        if (user?.id && cartUserId === user.id && !cartFetched && !cartLoading) {
            fetchCart()
                .then(() => {
                    setCartFetched(true);
                })
                .catch((error) => {
                    const status = (error as { response?: { status?: number } })?.response?.status;
                    if (status !== 404 && status !== 503) {
                        console.warn("Failed to fetch cart:", error);
                    }
                    setCartFetched(true);
                });
        }

        if (user?.id && cartUserId === user.id && !cartLoading && !cartFetched) {
            setCartFetched(true);
        }
    }, [
        authLoading,
        user,
        isAuthenticated,
        restaurantId,
        items,
        cartUserId,
        cartFetched,
        cartLoading,
        fetchCart,
        setUserId,
        router,
    ]);

    // Check if cart is empty (but skip if payment just succeeded to avoid redirect conflict)
    useEffect(() => {
        if (!user || cartLoading || !cartFetched || isPaymentSuccess) return;

        const delay = 300;
        const checkTimer = setTimeout(() => {
            const itemsToCheck = restaurantId ? orderItems : items;
            if (itemsToCheck.length === 0 && cartUserId) {
                toast.error("Your cart is empty");
                router.push("/cart");
            }
        }, delay);

        return () => clearTimeout(checkTimer);
    }, [user, orderItems, items, cartUserId, cartFetched, cartLoading, router, restaurantId, isPaymentSuccess]);

    useEffect(() => {
        if (locationError) {
            toast.error(locationError);
        }
    }, [locationError]);


    // Handle address selection
    const handleAddressSelect = (addressId: string) => {
        setSelectedAddressId(addressId);
        setUseNewAddress(false);
        const selectedAddress = addresses.find((addr) => addr.id === addressId);
        if (selectedAddress) {
            setFormData((prev) => ({
                ...prev,
                street: selectedAddress.location || "",
            }));
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (isSubmitting) {
            return;
        }

        if (!user?.id) {
            toast.error("Please login to place order");
            router.push("/login");
            return;
        }

        if (!restaurantId) {
            toast.error("Please select a restaurant to checkout");
            router.push("/cart");
            return;
        }

        if (orderItems.length === 0) {
            toast.error("Your cart is empty");
            return;
        }

        // Validate form
        if (!formData.name || !formData.phone) {
            toast.error("Please fill in your name and phone number");
            return;
        }

        if (deliverStyle === "delivery") {
            if (!formData.street) {
                toast.error("Please enter delivery address");
                return;
            }
        }

        const latitude = coords?.latitude ?? undefined;
        const longitude = coords?.longitude ?? undefined;

        if (deliverStyle === "delivery" && (typeof latitude !== "number" || typeof longitude !== "number")) {
            toast.error("Unable to determine your location. Please enable location services and try again.");
            return;
        }

        setIsSubmitting(true);

        try {
            // Group items by restaurant (should only be one)
            const restaurantGroups = orderItems.reduce((acc, item) => {
                if (!acc[item.restaurantId]) {
                    acc[item.restaurantId] = {
                        restaurantName: item.restaurantName,
                        items: [] as CartItem[],
                    };
                }
                acc[item.restaurantId].items.push(item);
                return acc;
            }, {} as Record<string, { restaurantName?: string; items: CartItem[] }>);

            const restaurantEntries = Object.entries(restaurantGroups);

            if (restaurantEntries.length !== 1) {
                throw new Error("Each order can only be for one restaurant");
            }

            const [restId, group] = restaurantEntries[0];

            // Get selected address coordinates
            let finalLatitude = latitude;
            let finalLongitude = longitude;

            if (selectedAddressId && !useNewAddress) {
                const selectedAddress = addresses.find((addr) => addr.id === selectedAddressId);
                if (selectedAddress) {
                    finalLatitude = selectedAddress.latitude;
                    finalLongitude = selectedAddress.longitude;
                }
            }

            const payload: CreateOrderRequest = {
                userId: user.id,
                restaurantId: restId,
                restaurantName: group.restaurantName || "Unknown Restaurant",
                deliveryAddress: {
                    street: formData.street,
                    city: "Ho Chi Minh City", // Default city
                    state: "Ho Chi Minh", // Default state
                    zipCode: "700000", // Default zip code
                },
                items: group.items.map((item) => {
                    const customizationParts: string[] = [];
                    if (item.sizeName) {
                        customizationParts.push(`Size: ${item.sizeName}`);
                    }
                    if (item.customizations) {
                        customizationParts.push(item.customizations);
                    }
                    const customizations = customizationParts.join(" | ");

                    return {
                        productId: item.id,
                        productName: item.name,
                        quantity: item.quantity,
                        price: item.price,
                        customizations: customizations || undefined,
                    };
                }),
                paymentMethod: "card", // Always use "card" for backend (Stripe)
                orderNote: formData.note.trim() ? formData.note.trim() : undefined,
                userLat: deliverStyle === "delivery" && typeof finalLatitude === "number" ? finalLatitude : 0,
                userLon: deliverStyle === "delivery" && typeof finalLongitude === "number" ? finalLongitude : 0,
            };

            const order = await orderApi.createOrder(payload);

            // For Stripe payment, DON'T clear cart yet - wait for payment success
            // Save order ID and slug for payment step
            setCreatedOrderIds([order.orderId]);
            // Store slug for redirect (use slug if available, fallback to orderId)
            const orderSlug = order.slug || order.orderId;
            
            // Set isProcessingCardPayment to show loading state
            setIsProcessingCardPayment(true);
            
            // Create payment and show Stripe form
            await handleCardPayment(order);
        } catch (error: unknown) {
            console.error("Failed to create order:", error);
            const errorMessage =
                (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
                (error as { message?: string })?.message ||
                "Failed to create order. Please try again.";

            if (errorMessage.includes("Restaurant is currently closed")) {
                toast.error("This restaurant is currently closed. Please check the operating hours.", {
                    duration: 6000,
                });
            } else {
                toast.error(errorMessage);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle card payment with Stripe
    const handleCardPayment = async (order: { orderId: string }) => {
        if (!user?.id) {
            toast.error("Please login to complete payment");
            setIsProcessingCardPayment(false);
            return;
        }

        // isProcessingCardPayment is already set to true in handleSubmit
        const loadingToast = toast.loading("Preparing payment...");

        try {
            // Calculate total amount
            const tax = subtotal * 0.05;
            const calculatedTotal = subtotal + shipping + tax;

            // Create payment
            const paymentResponse = await paymentApi.createPayment({
                orderId: order.orderId,
                userId: user.id,
                amount: calculatedTotal,
                currency: "USD",
                paymentMethod: "card",
            });

            // Check response structure
            if (!paymentResponse) {
                throw new Error("Payment response is null or undefined");
            }

            // Backend returns: { success: true, message: "...", data: { clientSecret, paymentId, status } }
            // But paymentApi.createPayment returns response.data, so it might be the data directly
            const responseData = (paymentResponse as { data?: unknown }).data || paymentResponse;
            
            if (!responseData || typeof responseData !== "object") {
                throw new Error("Payment response data is missing or invalid");
            }

            const responseDataObj = responseData as Record<string, unknown>;
            const clientSecret = responseDataObj.clientSecret as string | undefined;
            const paymentIdFromResponse = responseDataObj.paymentId as string | undefined;

            if (!clientSecret) {
                throw new Error("Failed to get payment client secret from backend");
            }

            if (!paymentIdFromResponse) {
                throw new Error("Failed to get payment ID from backend");
            }

            // Set states to show Stripe form
            setStripeClientSecret(clientSecret);
            setPaymentId(paymentIdFromResponse);
            
            // Dismiss loading toast
            toast.dismiss(loadingToast);
            
            // Scroll to payment form after a short delay to ensure it's rendered
            setTimeout(() => {
                const paymentForm = document.querySelector('[data-payment-form]');
                if (paymentForm) {
                    // For desktop (payment form is in sticky column), scroll window to show the form
                    // For mobile, scroll the form into view
                    if (window.innerWidth >= 1024) {
                        // Desktop: Scroll window to position payment form in view
                        const formRect = paymentForm.getBoundingClientRect();
                        const formTop = formRect.top + window.pageYOffset;
                        window.scrollTo({ 
                            top: formTop - 100, // Offset from top
                            behavior: 'smooth' 
                        });
                    } else {
                        // Mobile: Use scrollIntoView
                        paymentForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }
            }, 300);
        } catch (error: unknown) {
            // Extract error message
            let errorMessage = "Unable to create payment. Please try again.";
            
            if (error && typeof error === "object") {
                const errorObj = error as { response?: { data?: { message?: string } }; message?: string };
                if (errorObj.response?.data?.message) {
                    errorMessage = errorObj.response.data.message;
                } else if (errorObj.message) {
                    errorMessage = errorObj.message;
                }
            }
            
            toast.dismiss(loadingToast);
            toast.error(errorMessage, { duration: 5000 });
            setIsProcessingCardPayment(false);
            setStripeClientSecret(null);
            setPaymentId(null);
        }
    };

    // Handle payment success
    const handlePaymentSuccess = async () => {
        // Stripe webhook will automatically update payment status
        // No need to call completePayment API - webhook handles it
        
        // Set payment success flag FIRST to prevent cart empty check from redirecting
        setIsPaymentSuccess(true);
        
        // Reset payment states
        setIsProcessingCardPayment(false);
        setStripeClientSecret(null);
        setPaymentId(null);

        // Show success message
        toast.success("Payment successful! Your order has been placed.", {
            duration: 3000,
        });

        // Redirect immediately to prevent cart empty check from triggering
        // Use router.replace to prevent back navigation to payment page
        // Redirect to delivery status page (not order details page)
        if (createdOrderIds.length > 0) {
            // Fetch order to get slug for redirect
            try {
                const order = await orderApi.getOrderById(createdOrderIds[0]);
                const redirectSlug = order.slug || createdOrderIds[0];
                // Add timestamp to force Next.js to revalidate and fetch fresh data
                router.replace(`/delivery/${redirectSlug}?t=${Date.now()}`);
            } catch (error) {
                // Fallback to orderId if fetch fails
                console.error("Failed to fetch order slug, using orderId:", error);
                router.replace(`/delivery/${createdOrderIds[0]}?t=${Date.now()}`);
            }
        }

        // Clear cart silently (no toast) after redirect has started
        // This happens after redirect so it won't trigger the cart empty check
        setTimeout(() => {
            if (restaurantId) {
                clearRestaurant(restaurantId, { silent: true });
            }
        }, 100);
    };

    // Handle payment error
    const handlePaymentError = (error: string) => {
        // If PaymentIntent is in terminal state, reset states to allow creating new payment
        if (error.includes("terminal state") || error.includes("terminal") || error.includes("cannot be used")) {
            toast.error("Payment Intent has been used or expired. Please place the order again.", { duration: 5000 });
            setIsProcessingCardPayment(false);
            setStripeClientSecret(null);
            setPaymentId(null);
        } else {
            toast.error(error, { duration: 5000 });
            // Keep the form visible so user can retry for other errors
        }
    };

    if (authLoading || cartLoading || !cartFetched || loadingAddresses) {
        return <GlobalLoader label="Loading" sublabel="Setting up checkout" />;
    }

    // Don't show cart empty message if payment was successful (redirect should happen)
    if (orderItems.length === 0 && !isPaymentSuccess) {
        return (
            <div className="custom-container p-4 sm:p-6 md:p-12">
                <div className="text-center py-12">
                    <p className="text-gray-600 mb-4">Your cart is empty</p>
                    <button
                        onClick={() => router.push("/cart")}
                        className="text-[#EE4D2D] hover:text-[#EE4D2D]/80 font-medium"
                    >
                        Go to Cart
                    </button>
                </div>
            </div>
        );
    }

    // Show loader if payment success but redirect hasn't happened yet
    if (isPaymentSuccess) {
        return <GlobalLoader label="Redirecting" sublabel="Taking you to order tracking..." />;
    }

    return (
        <div className="custom-container p-4 sm:p-6 md:p-12">
            {/* Header with Back Button */}
            <div className="mb-6">
                <Link
                    href="/cart"
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-[#EE4D2D] transition-colors mb-4 group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-medium">Back to Cart</span>
                </Link>
                <h1 className="text-2xl md:text-3xl font-bold">Checkout</h1>
            </div>

            {/* Desktop: 2 Column Layout */}
            <div className="hidden lg:grid lg:grid-cols-[65%_35%] gap-6">
                {/* Left Column: Delivery Details Only */}
                <div className="space-y-6">
                    {/* Block A: Delivery Details */}
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                        <h2 className="text-xl font-bold mb-4">Delivery Details</h2>

                        {/* Delivery/Pickup Toggle */}
                        <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-lg">
                            <button
                                type="button"
                                onClick={() => setDeliverStyle("delivery")}
                                className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                                    deliverStyle === "delivery"
                                        ? "bg-[#EE4D2D] text-white"
                                        : "text-gray-600 hover:bg-gray-200"
                                }`}
                            >
                                <Truck className="w-4 h-4 inline mr-2" />
                                Delivery
                            </button>
                            <button
                                type="button"
                                onClick={() => setDeliverStyle("pickup")}
                                className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                                    deliverStyle === "pickup"
                                        ? "bg-[#EE4D2D] text-white"
                                        : "text-gray-600 hover:bg-gray-200"
                                }`}
                            >
                                Pickup
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Name */}
                            <div>
                                <label htmlFor="desktop-name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                <input
                                    id="desktop-name"
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EE4D2D] focus:border-[#EE4D2D]"
                                />
                            </div>

                            {/* Phone */}
                            <div>
                                <label htmlFor="desktop-phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                <input
                                    id="desktop-phone"
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EE4D2D] focus:border-[#EE4D2D]"
                                />
                            </div>

                            {/* Address Selection */}
                            {deliverStyle === "delivery" && (
                                <>
                                    {addresses.length > 0 && !useNewAddress ? (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Select Address
                                            </label>
                                            <select
                                                value={selectedAddressId || ""}
                                                onChange={(e) => handleAddressSelect(e.target.value)}
                                                aria-label="Select Address"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EE4D2D] focus:border-[#EE4D2D]"
                                            >
                                                {addresses.map((addr) => (
                                                    <option key={addr.id} value={addr.id}>
                                                        {addr.location}
                                                    </option>
                                                ))}
                                            </select>
                                            <button
                                                type="button"
                                                onClick={() => setUseNewAddress(true)}
                                                className="mt-2 text-sm text-[#EE4D2D] hover:text-[#EE4D2D]/80 flex items-center gap-1"
                                            >
                                                <Edit2 className="w-3 h-3" />
                                                Use new address
                                            </button>
                                        </div>
                                    ) : (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Street Address
                                            </label>
                                            <input
                                                type="text"
                                                name="street"
                                                value={formData.street}
                                                onChange={handleChange}
                                                required
                                                placeholder="Enter your address"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EE4D2D] focus:border-[#EE4D2D]"
                                            />
                                            {addresses.length > 0 && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setUseNewAddress(false);
                                                        if (addresses.length > 0) {
                                                            handleAddressSelect(addresses[0].id);
                                                        }
                                                    }}
                                                    className="mt-2 text-sm text-[#EE4D2D] hover:text-[#EE4D2D]/80"
                                                >
                                                    Use saved address
                                                </button>
                                            )}
                                        </div>
                                    )}

                                    {/* Note for Driver */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Note for Driver (Optional)
                                        </label>
                                        <textarea
                                            name="note"
                                            value={formData.note}
                                            onChange={handleChange}
                                            rows={3}
                                            placeholder="Any special instructions..."
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EE4D2D] focus:border-[#EE4D2D]"
                                        />
                                    </div>
                                </>
                            )}
                        </form>
                    </div>
                </div>

                {/* Right Column: Order Summary + Payment Method */}
                <div className="space-y-6 lg:sticky lg:top-24 h-fit">
                    {/* Block A: Order Summary */}
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                        <h2 className="text-xl font-bold mb-4">Order Summary</h2>

                        {/* Items List */}
                        <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                            {orderItems.map((item, idx) => {
                                const imageUrl = getImageUrl(item.image);
                                return (
                                    <div key={idx} className="flex items-center gap-3">
                                        {imageUrl && imageUrl !== "/placeholder.png" ? (
                                            <div className="relative w-12 h-12 rounded-md overflow-hidden flex-shrink-0">
                                                <Image
                                                    src={imageUrl}
                                                    alt={item.name}
                                                    fill
                                                    className="object-cover"
                                                    sizes="48px"
                                                    unoptimized={imageUrl.startsWith("http")}
                                                />
                                            </div>
                                        ) : (
                                            <div className="w-12 h-12 bg-gray-100 rounded-md flex-shrink-0"></div>
                                        )}
                                        <div className="flex-grow min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                                            <p className="text-xs text-gray-500">
                                                {item.quantity} x {formatPriceUSD(item.price)} $
                                            </p>
                                        </div>
                                        <p className="text-sm font-semibold text-gray-900">
                                            {formatPriceUSD(item.price * item.quantity)} $
                                        </p>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Bill Calculation */}
                        <div className="space-y-2 mb-6 pt-4 border-t border-gray-200">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Subtotal</span>
                                <span className="text-gray-900 font-medium">{formatPriceUSD(subtotal)} $</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Shipping Fee</span>
                                <span className="text-gray-900 font-medium">
                                    {shipping === 0 ? "FREE" : `${formatPriceUSD(shipping)} $`}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Tax</span>
                                <span className="text-gray-900 font-medium">{formatPriceUSD(tax)} $</span>
                            </div>
                        </div>

                        {/* Total */}
                        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                            <span className="text-lg font-semibold text-gray-900">Total</span>
                            <span className="text-2xl font-bold text-[#EE4D2D]">{formatPriceUSD(total)} $</span>
                        </div>
                    </div>

                    {/* Block B: Payment Method */}
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6" data-payment-form>
                        <h2 className="text-xl font-bold mb-4">Payment Method</h2>
                        {isProcessingCardPayment && stripeClientSecret ? (
                            <div className="space-y-4">
                                <PaymentMethodSelector
                                    key={stripeClientSecret} // Force re-render when clientSecret changes
                                    stripeClientSecret={stripeClientSecret}
                                    isProcessingCardPayment={isProcessingCardPayment}
                                    onPaymentSuccess={handlePaymentSuccess}
                                    onPaymentError={handlePaymentError}
                                />
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="text-gray-500 text-sm py-4 text-center">
                                    {isProcessingCardPayment ? (
                                        <div className="flex items-center justify-center space-x-2">
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#EE4D2D]"></div>
                                            <span>Preparing payment form...</span>
                                        </div>
                                    ) : (
                                        "Please click 'Place Order' to continue with payment"
                                    )}
                                </div>
                                
                                {/* Place Order Button - Only show if not processing card payment */}
                                {!isProcessingCardPayment && (
                                    <button
                                        type="submit"
                                        onClick={handleSubmit}
                                        disabled={isSubmitting}
                                        className="w-full bg-[#EE4D2D] text-white font-semibold py-4 rounded-lg hover:bg-[#EE4D2D]/90 transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                                    >
                                        {isSubmitting ? "Placing order..." : "Place Order"}
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile: Single Column */}
            <div className="lg:hidden space-y-6 pb-24">
                {/* Delivery Details */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
                    <h2 className="text-lg font-bold mb-4">Delivery Details</h2>

                    {/* Delivery/Pickup Toggle */}
                    <div className="flex gap-2 mb-4 p-1 bg-gray-100 rounded-lg">
                        <button
                            type="button"
                            onClick={() => setDeliverStyle("delivery")}
                            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                                deliverStyle === "delivery"
                                    ? "bg-[#EE4D2D] text-white"
                                    : "text-gray-600 hover:bg-gray-200"
                            }`}
                        >
                            <Truck className="w-3 h-3 inline mr-1" />
                            Delivery
                        </button>
                        <button
                            type="button"
                            onClick={() => setDeliverStyle("pickup")}
                            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                                deliverStyle === "pickup"
                                    ? "bg-[#EE4D2D] text-white"
                                    : "text-gray-600 hover:bg-gray-200"
                            }`}
                        >
                            Pickup
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-3">
                        {/* Name */}
                        <div>
                            <label htmlFor="mobile-name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                            <input
                                id="mobile-name"
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EE4D2D] focus:border-[#EE4D2D] text-sm"
                            />
                        </div>

                        {/* Phone */}
                        <div>
                            <label htmlFor="mobile-phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                            <input
                                id="mobile-phone"
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EE4D2D] focus:border-[#EE4D2D] text-sm"
                            />
                        </div>

                        {/* Address Selection */}
                        {deliverStyle === "delivery" && (
                            <>
                                {addresses.length > 0 && !useNewAddress ? (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Select Address
                                        </label>
                                        <select
                                            value={selectedAddressId || ""}
                                            onChange={(e) => handleAddressSelect(e.target.value)}
                                            aria-label="Select Address"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EE4D2D] focus:border-[#EE4D2D] text-sm"
                                        >
                                            {addresses.map((addr) => (
                                                <option key={addr.id} value={addr.id}>
                                                    {addr.location}
                                                </option>
                                            ))}
                                        </select>
                                        <button
                                            type="button"
                                            onClick={() => setUseNewAddress(true)}
                                            className="mt-2 text-xs text-[#EE4D2D] hover:text-[#EE4D2D]/80 flex items-center gap-1"
                                        >
                                            <Edit2 className="w-3 h-3" />
                                            Use new address
                                        </button>
                                    </div>
                                ) : (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Street Address
                                        </label>
                                        <input
                                            type="text"
                                            name="street"
                                            value={formData.street}
                                            onChange={handleChange}
                                            required
                                            placeholder="Enter your address"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EE4D2D] focus:border-[#EE4D2D] text-sm"
                                        />
                                        {addresses.length > 0 && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setUseNewAddress(false);
                                                    if (addresses.length > 0) {
                                                        handleAddressSelect(addresses[0].id);
                                                    }
                                                }}
                                                className="mt-2 text-xs text-[#EE4D2D] hover:text-[#EE4D2D]/80"
                                            >
                                                Use saved address
                                            </button>
                                        )}
                                    </div>
                                )}

                                {/* Note for Driver */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Note for Driver (Optional)
                                    </label>
                                    <textarea
                                        name="note"
                                        value={formData.note}
                                        onChange={handleChange}
                                        rows={2}
                                        placeholder="Any special instructions..."
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EE4D2D] focus:border-[#EE4D2D] text-sm"
                                    />
                                </div>
                            </>
                        )}
                    </form>
                </div>

                {/* Order Summary */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
                    <h2 className="text-lg font-bold mb-4">Order Summary</h2>

                    {/* Items List */}
                    <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                        {orderItems.map((item, idx) => {
                            const imageUrl = getImageUrl(item.image);
                            return (
                                <div key={idx} className="flex items-center gap-2">
                                    {imageUrl && imageUrl !== "/placeholder.png" ? (
                                        <div className="relative w-10 h-10 rounded-md overflow-hidden flex-shrink-0">
                                            <Image
                                                src={imageUrl}
                                                alt={item.name}
                                                fill
                                                className="object-cover"
                                                sizes="40px"
                                                unoptimized={imageUrl.startsWith("http")}
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-10 h-10 bg-gray-100 rounded-md flex-shrink-0"></div>
                                    )}
                                    <div className="flex-grow min-w-0">
                                        <p className="text-xs font-medium text-gray-900 truncate">{item.name}</p>
                                        <p className="text-xs text-gray-500">
                                            {item.quantity} x {formatPriceUSD(item.price)} $
                                        </p>
                                    </div>
                                    <p className="text-xs font-semibold text-gray-900">
                                        {formatPriceUSD(item.price * item.quantity)} $
                                    </p>
                                </div>
                            );
                        })}
                    </div>

                    {/* Bill Calculation */}
                    <div className="space-y-1.5 mb-4 pt-3 border-t border-gray-200">
                        <div className="flex justify-between text-xs">
                            <span className="text-gray-600">Subtotal</span>
                            <span className="text-gray-900 font-medium">{formatPriceUSD(subtotal)} $</span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-gray-600">Shipping</span>
                            <span className="text-gray-900 font-medium">
                                {shipping === 0 ? "FREE" : `${formatPriceUSD(shipping)} $`}
                            </span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-gray-600">Tax</span>
                            <span className="text-gray-900 font-medium">{formatPriceUSD(tax)} $</span>
                        </div>
                    </div>

                    {/* Total */}
                    <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                        <span className="text-base font-semibold text-gray-900">Total</span>
                        <span className="text-xl font-bold text-[#EE4D2D]">{formatPriceUSD(total)} $</span>
                    </div>
                </div>

                {/* Payment Method */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4" data-payment-form>
                    <h2 className="text-lg font-bold mb-4">Payment Method</h2>
                    {isProcessingCardPayment && stripeClientSecret ? (
                        <div className="space-y-4">
                            <PaymentMethodSelector
                                key={stripeClientSecret} // Force re-render when clientSecret changes
                                stripeClientSecret={stripeClientSecret}
                                isProcessingCardPayment={isProcessingCardPayment}
                                onPaymentSuccess={handlePaymentSuccess}
                                onPaymentError={handlePaymentError}
                            />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="text-gray-500 text-sm py-4 text-center">
                                {isProcessingCardPayment ? (
                                    <div className="flex items-center justify-center space-x-2">
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#EE4D2D]"></div>
                                        <span>Preparing payment form...</span>
                                    </div>
                                ) : (
                                    "Please click 'Place Order' to continue with payment"
                                )}
                            </div>
                            
                            {/* Place Order Button - Only show if not processing card payment */}
                            {!isProcessingCardPayment && (
                                <button
                                    type="submit"
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                    className="w-full bg-[#EE4D2D] text-white font-semibold py-4 rounded-lg hover:bg-[#EE4D2D]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? "Placing order..." : "Place Order"}
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
