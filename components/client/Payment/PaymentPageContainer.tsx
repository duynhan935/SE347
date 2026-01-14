"use client";

import { orderApi, type CreateOrderRequest } from "@/lib/api/orderApi";
import { paymentApi } from "@/lib/api/paymentApi";
import { restaurantApi } from "@/lib/api/restaurantApi";
import { useGeolocation } from "@/lib/userLocation";
import { useCartStore, type CartItem } from "@/stores/cartStore";
import { useAuthStore } from "@/stores/useAuthStore";
import type { User as UserType } from "@/types";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { InputField } from "./InputField";
import PaymentMethodSelector from "./PaymentMethodSelector";
import { PaymentProgress } from "./PaymentProgress";
import { RadioField } from "./RadioField";
import { SelectField } from "./SelectField";

const SHIPPING_FEE = 21.0;

type ExtendedUser = UserType & {
    phoneNumber?: string | null;
    phone?: string | null;
    defaultAddress?: {
        street?: string | null;
        city?: string | null;
        state?: string | null;
        zipCode?: string | null;
        latitude?: number | null;
        longitude?: number | null;
    } | null;
    latitude?: number | null;
    longitude?: number | null;
};

const OrderSummary = ({ subtotal, shipping, items }: { subtotal: number; shipping: number; items: CartItem[] }) => {
    const savings = 0;
    const tax = subtotal * 0.05;
    const total = subtotal - savings + shipping + tax;

    return (
        <div className="bg-gray-50 p-6 rounded-lg border w-full">
            <h2 className="text-xl font-bold mb-4">Your order</h2>
            <div className="space-y-3 text-gray-600">
                {items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                        <span>
                            {item.name} x{item.quantity}
                        </span>
                        <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                ))}
                <div className="flex justify-between">
                    <span>Original Price</span>
                    <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                    <span>Savings</span>
                    <span>-${savings.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between">
                    <span>Estimated Sales Tax</span>
                    <span>${tax.toFixed(2)}</span>
                </div>
            </div>
            <div className="flex justify-between font-bold text-2xl mt-4 pt-4 border-t">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
            </div>
        </div>
    );
};

export default function PaymentPageClient() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const restaurantId = searchParams.get("restaurantId");

        const { items, clearRestaurant, setUserId, userId: cartUserId, isLoading: cartLoading, fetchCart } = useCartStore();
        const { user, loading: authLoading, isAuthenticated } = useAuthStore();
        const { coords, error: locationError } = useGeolocation();
        const [cartFetched, setCartFetched] = useState(false);

    const extendedUser = (user as ExtendedUser | null) ?? null;
    const defaultAddress = extendedUser?.defaultAddress ?? null;

    const [currentStep, setCurrentStep] = useState<"order" | "payment">("order"); // Step 1: order, Step 2: payment
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deliverStyle, setDeliverStyle] = useState("delivery");
    const [createdOrderIds, setCreatedOrderIds] = useState<string[]>([]);
    const [createdOrders, setCreatedOrders] = useState<unknown[]>([]); // Store created orders data
    const [successfulRestaurantIds, setSuccessfulRestaurantIds] = useState<string[]>([]); // Store successful restaurant IDs for cart clearing
    const [stripeClientSecret, setStripeClientSecret] = useState<string | null>(null);
    const [paymentId, setPaymentId] = useState<string | null>(null); // Store paymentId to complete payment later
    const [isProcessingCardPayment, setIsProcessingCardPayment] = useState(false);
    const [isPaymentCompleted, setIsPaymentCompleted] = useState(false); // Flag to prevent cart empty check after payment
    const [formData, setFormData] = useState({
        name: extendedUser?.username || "",
        phone: extendedUser?.phoneNumber || extendedUser?.phone || "",
        email: extendedUser?.email || "",
        street: defaultAddress?.street ?? "",
        city: defaultAddress?.city ?? "",
        state: defaultAddress?.state ?? "",
        zipCode: defaultAddress?.zipCode ?? "",
        deliverTo: "residence",
        country: "vietnam",
        orderNote: "",
    });

    // Filter items by restaurant if restaurantId provided - memoized for performance
    const orderItems = useMemo(
        () => (restaurantId ? items.filter((item) => item.restaurantId === restaurantId) : items),
        [restaurantId, items]
    );
    const subtotal = useMemo(
        () => orderItems.reduce((total, item) => total + item.price * item.quantity, 0),
        [orderItems]
    );
    const shipping = deliverStyle === "pickup" ? 0 : SHIPPING_FEE;

    // Ensure cart is initialized and fetched
    useEffect(() => {
        // Wait for auth to finish loading before checking user
        // This prevents redirect on page refresh (F5) when auth is still initializing
        if (authLoading) {
            return;
        }

        // Check if user is authenticated (either has user object or has token)
        const hasToken = typeof window !== "undefined" && 
            (localStorage.getItem("accessToken") || localStorage.getItem("refreshToken"));
        
        if (!extendedUser && !isAuthenticated && !hasToken) {
            toast.error("Please login to checkout");
            router.push("/login");
            return;
        }

        // If we have token but user is not loaded yet, wait a bit for profile to load
        if (!extendedUser && hasToken && isAuthenticated) {
            // User might still be loading, give it a moment
            return;
        }

        // REQUIRE restaurantId when accessing payment page
        // Each order must be for ONE restaurant only
        if (!restaurantId) {
            toast.error("Please select a restaurant to checkout. Each order can only be for one restaurant.");
            router.push("/cart");
            return;
        }

                // Ensure userId is set in cart store (only if user is loaded)
                if (extendedUser?.id && cartUserId !== extendedUser.id) {
                        setUserId(extendedUser.id);
                }

                // Fetch cart when userId is set and matches current user
                if (extendedUser?.id && cartUserId === extendedUser.id && !cartFetched && !cartLoading) {
                        fetchCart()
                                .then(() => {
                                        // Mark as fetched after successful fetch
                                        setCartFetched(true);
                                })
                                .catch((error) => {
                                        // Silently handle errors - cart might not exist yet or service unavailable
                                        const status = (error as { response?: { status?: number } })?.response?.status;
                                        if (status !== 404 && status !== 503) {
                                                console.warn("Failed to fetch cart:", error);
                                        }
                                        // Still mark as fetched even on error (404/503 are expected for new users)
                                        setCartFetched(true);
                                });
                }

                // Mark as fetched when cart loading is complete (for cases where fetch was already in progress)
                if (cartUserId && !cartLoading && !cartFetched) {
                        setCartFetched(true);
                }
        }, [extendedUser, cartUserId, cartLoading, setUserId, router, cartFetched, fetchCart, restaurantId, authLoading, isAuthenticated]);

    // Check if cart is empty after fetching (only after cart has been fetched and loaded)
    // Skip this check if payment has been completed to avoid showing error toast after successful payment
    // Add a delay to handle race conditions when coming from "Buy Now"
    useEffect(() => {
        if (!extendedUser || cartLoading || !cartFetched || isPaymentCompleted) return;

        // Check if we're coming from "Buy Now" by checking referrer
        // This helps us give more time for cart to sync when user just added an item
        const isFromBuyNow = typeof window !== "undefined" && 
            (document.referrer.includes("/food") || document.referrer.includes("/restaurants"));

        // Add a delay to ensure cart state is fully updated after fetch completes
        // Longer delay if coming from Buy Now to handle backend sync time
        const delay = isFromBuyNow ? 800 : 300;
        
        const checkTimer = setTimeout(() => {
                // Check both filtered items (by restaurantId) and all items
                // If restaurantId is provided, check filtered items; otherwise check all items
                const itemsToCheck = restaurantId ? orderItems : items;
                
                // Only redirect if cart is truly empty AND we've given enough time for state to update
                if (itemsToCheck.length === 0 && cartUserId) {
                        toast.error("Your cart is empty");
                        router.push("/cart");
                }
        }, delay);

        return () => clearTimeout(checkTimer);
    }, [extendedUser, orderItems, items, cartUserId, cartFetched, cartLoading, isPaymentCompleted, router, restaurantId]);

    useEffect(() => {
        if (locationError) {
            toast.error(locationError);
        }
    }, [locationError]);

    // Auto-scroll to payment form when it appears
    useEffect(() => {
        if (isProcessingCardPayment && stripeClientSecret) {
            // Scroll to payment method section smoothly
            setTimeout(() => {
                const paymentSection = document.getElementById("payment-method-section");
                if (paymentSection) {
                    paymentSection.scrollIntoView({ behavior: "smooth", block: "center" });
                }
            }, 300);
        }
    }, [isProcessingCardPayment, stripeClientSecret]);

    // Note: Payment is now created directly after order creation, so we don't need to fetch it separately

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Prevent double submission
        if (isSubmitting) {
            return;
        }

        if (!extendedUser?.id) {
            toast.error("Please login to place order");
            router.push("/login");
            return;
        }

        // REQUIRE restaurantId - each order must be for ONE restaurant only
        if (!restaurantId) {
            toast.error("Please select a restaurant to checkout. Each order can only be for one restaurant.");
            router.push("/cart");
            return;
        }

        if (orderItems.length === 0) {
            toast.error("Your cart is empty");
            return;
        }

        // VALIDATE: Ensure all items belong to the same restaurant
        // This prevents accidentally creating orders with items from multiple restaurants
        const uniqueRestaurantIds = new Set(orderItems.map(item => item.restaurantId));
        if (uniqueRestaurantIds.size > 1) {
            toast.error("Error: your cart contains items from multiple restaurants. Each order can only be for one restaurant.");
            router.push("/cart");
            return;
        }

        // VALIDATE: Ensure all items belong to the specified restaurantId
        const invalidItems = orderItems.filter(item => item.restaurantId !== restaurantId);
        if (invalidItems.length > 0) {
            toast.error("Error: some items do not belong to the selected restaurant. Please review your cart.");
            router.push("/cart");
            return;
        }

        // Validate form
        if (
            !formData.name ||
            !formData.phone ||
            !formData.email ||
            !formData.street ||
            !formData.city ||
            !formData.state ||
            !formData.zipCode
        ) {
            toast.error("Please fill in all required fields");
            return;
        }

        const latitude = coords?.latitude ?? defaultAddress?.latitude ?? extendedUser.latitude ?? undefined;
        const longitude = coords?.longitude ?? defaultAddress?.longitude ?? extendedUser.longitude ?? undefined;

        if (deliverStyle === "delivery" && (typeof latitude !== "number" || typeof longitude !== "number")) {
            toast.error("Unable to determine your location. Please enable location services and try again.");
            return;
        }

        setIsSubmitting(true);

        try {
            // ENSURE: Only one restaurant in orderItems (already validated above)
            // Since we require restaurantId and validate items belong to it,
            // all items should belong to the same restaurant
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

            // VALIDATE: Should only have ONE restaurant (safety check)
            if (restaurantEntries.length !== 1) {
                throw new Error(
                    `Error: your cart contains items from ${restaurantEntries.length} restaurants. Each order can only be for one restaurant.`
                );
            }

            // Create order for ONE restaurant only
            // Use Promise.allSettled for consistency, but should only have one entry
            const orderResults = await Promise.allSettled(
                restaurantEntries.map(async ([restId, group]) => {
                    const payload: CreateOrderRequest = {
                        userId: extendedUser.id,
                        restaurantId: restId,
                        restaurantName: group.restaurantName || "Unknown Restaurant",
                        deliveryAddress: {
                            street: formData.street,
                            city: formData.city,
                            state: formData.state,
                            zipCode: formData.zipCode,
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
                        paymentMethod: "card",
                        orderNote: formData.orderNote.trim() ? formData.orderNote.trim() : undefined,
                        // Only send location if delivery, otherwise send 0 to potentially bypass location-based validation
                        userLat: deliverStyle === "delivery" && typeof latitude === "number" ? latitude : 0,
                        userLon: deliverStyle === "delivery" && typeof longitude === "number" ? longitude : 0,
                    };
                    return await orderApi.createOrder(payload);
                })
            );

            // Separate successful and failed orders
            const orders: unknown[] = [];
            const failedRestaurants: Array<{ name: string; error: string }> = [];

            orderResults.forEach((result, index) => {
                const [restId, group] = restaurantEntries[index];
                if (result.status === "fulfilled") {
                    orders.push(result.value);
                } else {
                    const error = result.reason;
                    const errorMessage =
                        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
                        (error as { message?: string })?.message ||
                        "Failed to create order";
                    failedRestaurants.push({
                        name: group.restaurantName || restId,
                        error: errorMessage,
                    });
                }
            });

            // If all orders failed, throw error
            if (orders.length === 0) {
                const errorMessages = failedRestaurants.map((f) => `${f.name}: ${f.error}`).join("; ");
                throw new Error(`Unable to create an order for any restaurant. ${errorMessages}`);
            }

            // If some orders failed, show warning but continue
            if (failedRestaurants.length > 0) {
                const failedNames = failedRestaurants.map((f) => f.name).join(", ");
                toast.error(
                    `Some orders could not be created: ${failedNames}. Other orders were created successfully.`,
                    { duration: 6000 }
                );
            }

            // Log orders for debugging
            if (process.env.NODE_ENV === "development") {
                console.log("Created orders:", orders);
            }

            // Extract order IDs and filter out any undefined values
            // Backend may return 'id' or 'orderId' field
            const orderIds = orders
                .map((order, index) => {
                    // Check if order exists
                    if (!order) {
                        console.error(`Order at index ${index} is null or undefined`);
                        return null;
                    }

                    // Check for both 'id' and 'orderId' fields (backend may use either)
                    const orderId =
                        (order as { id?: string; orderId?: string }).id ||
                        (order as { id?: string; orderId?: string }).orderId;

                    if (!orderId) {
                        console.error(`Order at index ${index} missing both id and orderId:`, order);
                        return null;
                    }

                    return orderId;
                })
                .filter((id): id is string => !!id && typeof id === "string");

            if (orderIds.length === 0) {
                console.error("No valid order IDs found. Orders:", orders);
                throw new Error("Could not extract order ID from the response. Please try again.");
            }

            if (process.env.NODE_ENV === "development") {
                console.log("Extracted order IDs:", orderIds);
            }

            // Save successful restaurant IDs for cart clearing
            const successfulRestIds = orders
                .map((order) => (order as { restaurantId?: string }).restaurantId)
                .filter((id): id is string => !!id && typeof id === "string");

            // Save order data for payment step
            setCreatedOrderIds(orderIds);
            setCreatedOrders(orders as unknown[]);
            setSuccessfulRestaurantIds(successfulRestIds);

            // Move to payment step
            setCurrentStep("payment");
            toast.success(`Created ${orders.length} order(s). Please choose a payment method.`);
        } catch (error: unknown) {
            console.error("Failed to create order:", error);

            // Handle specific error messages
            const errorMessage =
                (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
                (error as { message?: string })?.message ||
                "Failed to create order. Please try again.";

            // Check for timeout errors
            if (errorMessage.includes("timeout") || errorMessage.includes("exceeded")) {
                toast.error("Backend service timeout. Please check if all services are running and try again.");
            } else if (
                errorMessage.includes("Restaurant is currently closed") ||
                errorMessage.includes("currently closed")
            ) {
                // Extract restaurant name if available
                const restaurantMatch = errorMessage.match(/Restaurant is currently closed: (.+)/);
                const restaurantName = restaurantMatch ? restaurantMatch[1] : "restaurant";

                // Get current time for debugging
                const now = new Date();
                const currentTime = now.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                    timeZone: "Asia/Ho_Chi_Minh",
                });

                toast.error(
                    `Restaurant "${restaurantName}" is currently closed (current time: ${currentTime}). Please check the operating hours or try again later.`,
                    {
                        duration: 8000,
                    }
                );
            } else if (errorMessage.includes("Restaurant validation failed")) {
                // Check if it's a closed restaurant error
                if (errorMessage.includes("closed")) {
                    toast.error("This restaurant is currently closed. Please check the operating hours.", {
                        duration: 6000,
                    });
                } else {
                    toast.error("Restaurant validation failed. Please check if restaurant service is available.");
                }
            } else {
                toast.error(errorMessage);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle payment method selection and process payment
    const handlePaymentSubmit = async () => {
        console.log("Processing payment");
        if (!extendedUser?.id || createdOrderIds.length === 0) {
            toast.error("Error: order information not found.");
            return;
        }

        // Calculate total amount for payment
        const tax = subtotal * 0.05;
        const calculatedTotal = subtotal + shipping + tax;
        const totalAmount =
            createdOrders.reduce((sum: number, order) => {
                const orderTotal =
                    (order as { totalAmount?: number; finalAmount?: number }).totalAmount ||
                    (order as { totalAmount?: number; finalAmount?: number }).finalAmount ||
                    0;
                return sum + orderTotal;
            }, 0) || calculatedTotal;

        // Create payment and get clientSecret (card-only)
        setIsProcessingCardPayment(true);
        toast.loading("Preparing payment...");

        try {
            const firstOrder = createdOrders[0];
            const orderId =
                (firstOrder as { id?: string; orderId?: string }).id ||
                (firstOrder as { id?: string; orderId?: string }).orderId;

            const firstOrderRestaurantId =
                (firstOrder as { restaurantId?: string }).restaurantId ||
                (firstOrder as { restaurant?: { id?: string } }).restaurant?.id;

            // Get merchantId from order response (backend includes it)
            let merchantId = 
                (firstOrder as { merchantId?: string }).merchantId ||
                (firstOrder as { merchant_id?: string }).merchant_id;

            // If merchantId is not in order response, fetch from restaurant
            if (!merchantId && firstOrderRestaurantId) {
                try {
                    const restaurantResponse = await restaurantApi.getByRestaurantId(firstOrderRestaurantId);
                    const restaurant = restaurantResponse.data;
                    merchantId = restaurant?.merchantId;
                } catch (restaurantError) {
                    console.warn("Failed to fetch restaurant for merchantId:", restaurantError);
                    // Continue without merchantId - backend will try to get it from order
                }
            }

            // Fallback: use restaurantId as merchantId if still not available
            // This is a temporary fallback - ideally order should always have merchantId
            if (!merchantId && firstOrderRestaurantId) {
                console.warn("merchantId not found, using restaurantId as fallback");
                merchantId = firstOrderRestaurantId;
            }

            const firstOrderTotal = Number(
                (firstOrder as { finalAmount?: number; totalAmount?: number }).finalAmount ||
                    (firstOrder as { finalAmount?: number; totalAmount?: number }).totalAmount ||
                    totalAmount ||
                    0
            );

            // Payment-service wallet crediting depends on metadata. Provide it explicitly from FE.
            // NOTE: Payment-service currently only supports a single merchant per payment intent.
            const amountForMerchant = Math.round(firstOrderTotal * 0.9);

            if (!orderId) {
                throw new Error("Unable to get order information to create a payment.");
            }

            if (!merchantId) {
                throw new Error("Unable to get merchantId to create a payment. Please try again.");
            }

            if (!firstOrderRestaurantId) {
                throw new Error("Unable to get restaurantId to create a payment. Please try again.");
            }

            const paymentResponse = await paymentApi.createPayment({
                orderId: orderId,
                userId: extendedUser.id,
                // Backend payment service is single-order centric. Use the first order's amount.
                amount: firstOrderTotal || totalAmount,
                paymentMethod: "card",
                currency: "USD",
                metadata: {
                    // Backend requires both merchantId and restaurantId separately
                    merchantId: merchantId,
                    merchant_id: merchantId, // Also provide snake_case variant for compatibility
                    restaurantId: firstOrderRestaurantId,
                    restaurant_id: firstOrderRestaurantId, // Also provide snake_case variant for compatibility
                    amountForMerchant,
                    amount_for_merchant: amountForMerchant, // Also provide snake_case variant
                    amountForRestaurant: amountForMerchant,
                    amount_for_restaurant: amountForMerchant, // Also provide snake_case variant
                },
            });

            // paymentApi.createPayment returns response.data which is { success, message, data }
            const paymentResponseData = paymentResponse;
            console.log("🔔 Payment response:", paymentResponseData);

            // Check response structure: { success: true, message: '...', data: { clientSecret, paymentId, status } }
            if (
                paymentResponseData &&
                typeof paymentResponseData === "object" &&
                "data" in paymentResponseData &&
                paymentResponseData.data &&
                typeof paymentResponseData.data === "object"
            ) {
                const paymentData = paymentResponseData.data as {
                    clientSecret?: string;
                    paymentId?: string;
                    status?: string;
                };

                if (
                    paymentData.clientSecret &&
                    typeof paymentData.clientSecret === "string" &&
                    paymentData.clientSecret.length > 0
                ) {
                    setStripeClientSecret(paymentData.clientSecret);
                    if (paymentData.paymentId) {
                        setPaymentId(paymentData.paymentId);
                    }
                    toast.dismiss();
                    toast.success("Ready to pay!");
                } else {
                    console.error("❌ Invalid clientSecret in payment response:", paymentData);
                    throw new Error(
                        "Did not receive clientSecret from payment service. Response: " + JSON.stringify(paymentData)
                    );
                }
            } else {
                console.error("❌ Invalid payment response structure:", paymentResponseData);
                throw new Error(
                    "Did not receive clientSecret from payment service. Invalid response structure: " +
                        JSON.stringify(paymentResponseData)
                );
            }
        } catch (paymentError) {
            console.error("Failed to create payment:", paymentError);
            const errorMessage =
                (paymentError as { response?: { data?: { message?: string } } })?.response?.data?.message ||
                (paymentError as { message?: string })?.message ||
                "Unable to create payment. Please try again.";
            toast.error(errorMessage);
            setIsProcessingCardPayment(false);
        }
    };

    const handleStripePaymentSuccess = async () => {
        try {
            // Mark payment as completed to prevent cart empty check
            setIsPaymentCompleted(true);

            if (!paymentId) {
                console.warn("⚠️ Payment ID not available, cannot verify payment status");
            } else {
                console.log("✅ Stripe payment confirmed, webhook will update payment status:", paymentId);

                // Wait a bit for webhook to process (webhook is async)
                // Stripe webhook will automatically update payment status to 'completed'
                // We'll poll status a few times to check, but don't block user if webhook is slow
                await new Promise((resolve) => setTimeout(resolve, 2000));

                // Poll payment status to check if webhook has processed (non-blocking)
                let attempts = 0;
                const maxAttempts = 3; // Reduced attempts - just check, don't block
                let paymentStatus = "processing";

                while (attempts < maxAttempts && paymentStatus !== "completed") {
                    try {
                        const payment = await paymentApi.getPaymentById(paymentId);
                        paymentStatus = payment.status || "processing";
                        console.log(`📊 Payment status check ${attempts + 1}/${maxAttempts}:`, paymentStatus);

                        if (paymentStatus === "completed") {
                            console.log("✅ Payment status confirmed as completed by webhook");
                            break;
                        }

                        // Wait before next check
                        await new Promise((resolve) => setTimeout(resolve, 1500));
                        attempts++;
                    } catch (error) {
                        console.warn("Failed to check payment status:", error);
                        attempts++;
                        await new Promise((resolve) => setTimeout(resolve, 1500));
                    }
                }

                // Note: If payment is still processing, webhook will update it later
                // Stripe has already confirmed payment success, so it's safe to proceed
                if (paymentStatus !== "completed") {
                    console.log("ℹ️ Payment status still processing, webhook will update it shortly. Proceeding with order...");
                }
            }

            // Clear cart only for successfully created orders
            if (successfulRestaurantIds.length > 0) {
                for (const restId of successfulRestaurantIds) {
                    await clearRestaurant(restId, { silent: true });
                }
            } else {
                // Fallback: clear all restaurants in orderItems if successfulRestaurantIds not available
                const restaurantIds = Array.from(new Set(orderItems.map((item) => item.restaurantId)));
                for (const restId of restaurantIds) {
                    await clearRestaurant(restId, { silent: true });
                }
            }

            toast.success(`Payment successful. Created ${createdOrderIds.length} order(s).`);

            // Add a small delay to ensure orders are persisted before redirecting
            await new Promise((resolve) => setTimeout(resolve, 500));

            // Redirect to orders page - it will fetch orders automatically with retry logic
            router.push("/orders");
        } catch (error) {
            console.error("Failed to handle payment success:", error);
            // Still redirect even if status check fails - payment was confirmed by Stripe
            toast.success("Payment confirmed. Redirecting...");
            setTimeout(() => {
                router.push("/orders");
            }, 1000);
        }
    };

    const handleStripePaymentError = (error: string) => {
        toast.error(error);
        setIsProcessingCardPayment(false);
    };

    return (
        <div className="custom-container py-12">
            {/* Step Indicator */}
            <div className="mb-8">
                <div className="flex items-center justify-center space-x-4">
                    <PaymentProgress currentStep={currentStep} />
                </div>
            </div>

            {currentStep === "order" ? (
                /* Step 1: Create Order */
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                    {/* Left column: billing details */}
                    <div className="space-y-6">
                        <h1 className="text-3xl font-bold">Billing details</h1>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <InputField
                                label="Your email address"
                                id="email"
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />

                            {/* Deliver to - Pickup or Delivery */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Deliver to</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <RadioField
                                        label="Pickup"
                                        name="deliverStyle"
                                        value="pickup"
                                        checked={deliverStyle === "pickup"}
                                        onChange={() => setDeliverStyle("pickup")}
                                    />
                                    <RadioField
                                        label="Delivery"
                                        name="deliverStyle"
                                        value="delivery"
                                        checked={deliverStyle === "delivery"}
                                        onChange={() => setDeliverStyle("delivery")}
                                    />
                                </div>
                            </div>

                            {deliverStyle === "delivery" && (
                                <SelectField
                                    label="Delivery location"
                                    id="deliveryTo"
                                    name="deliverTo"
                                    value={formData.deliverTo}
                                    onChange={handleChange}
                                >
                                    <option value="residence">Residence</option>
                                    <option value="office">Office</option>
                                </SelectField>
                            )}

                            <SelectField
                                label="Country"
                                id="country"
                                name="country"
                                value={formData.country}
                                onChange={handleChange}
                            >
                                <option value="vietnam">Vietnam</option>
                                <option value="united-states">United States</option>
                            </SelectField>

                            <div className="grid grid-cols-2 gap-4">
                                <InputField
                                    label="Your first name"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                                <InputField
                                    label="Your phone number"
                                    id="phone"
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <InputField
                                label="Your address"
                                id="street"
                                name="street"
                                value={formData.street}
                                onChange={handleChange}
                                required
                            />

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <InputField
                                    label="City"
                                    id="city"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    required
                                />
                                <SelectField
                                    label="State"
                                    id="state"
                                    name="state"
                                    value={formData.state}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select state</option>
                                    <option value="ho-chi-minh">Ho Chi Minh</option>
                                    <option value="ha-noi">Ha Noi</option>
                                    <option value="da-nang">Da Nang</option>
                                </SelectField>
                                <InputField
                                    label="Zip code"
                                    id="zipCode"
                                    name="zipCode"
                                    value={formData.zipCode}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="orderNote" className="block text-sm font-medium text-gray-700 mb-1">
                                    Order note (optional)
                                </label>
                                <textarea
                                    id="orderNote"
                                    name="orderNote"
                                    rows={4}
                                    value={formData.orderNote}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border-gray-700 border-1 p-2 px-4 rounded-md focus:ring-brand-purple focus:border-brand-purple"
                                    placeholder="Tell us what you think"
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting || orderItems.length === 0}
                                className="cursor-pointer w-full bg-brand-purple text-white font-bold text-lg py-3 rounded-lg hover:bg-brand-purple/90 transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                            >
                                {isSubmitting ? "Creating order..." : `Create order (${orderItems.length} items)`}
                            </button>
                        </form>
                    </div>

                    {/* Cột bên phải: Your Order Summary */}
                    <div className="space-y-8">
                        <OrderSummary subtotal={subtotal} shipping={shipping} items={orderItems} />
                    </div>
                </div>
            ) : (
                /* Step 2: Payment */
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                    {/* Left column: order summary */}
                    <div className="space-y-6">
                        <h1 className="text-3xl font-bold">Order details</h1>
                        <div className="bg-gray-50 p-6 rounded-lg border">
                            <h2 className="text-xl font-bold mb-4">Created orders</h2>
                            <div className="space-y-2 text-sm">
                                <p>
                                    <span className="font-medium">Order count:</span> {createdOrderIds.length}
                                </p>
                                <p>
                                    <span className="font-medium">Order ID(s):</span> {createdOrderIds.join(", ")}
                                </p>
                            </div>
                            <button
                                onClick={() => setCurrentStep("order")}
                                className="mt-4 text-brand-purple hover:underline text-sm"
                            >
                                ← Back to edit order
                            </button>
                        </div>
                    </div>

                    {/* Cột bên phải: Payment Method */}
                    <div className="space-y-8">
                        <OrderSummary subtotal={subtotal} shipping={shipping} items={orderItems} />

                        {/* Payment Method */}
                        <div id="payment-method-section">
                            <PaymentMethodSelector
                                stripeClientSecret={stripeClientSecret}
                                isProcessingCardPayment={isProcessingCardPayment}
                                onPaymentSuccess={handleStripePaymentSuccess}
                                onPaymentError={handleStripePaymentError}
                            />
                        </div>

                        {/* Payment Submit Button */}
                        <div className="mt-4">
                            {!stripeClientSecret ? (
                                <button
                                    onClick={handlePaymentSubmit}
                                    disabled={isProcessingCardPayment}
                                    className="cursor-pointer w-full bg-brand-purple text-white font-bold text-lg py-3 rounded-lg hover:bg-brand-purple/90 transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                >
                                    {isProcessingCardPayment
                                        ? "Preparing payment..."
                                        : "Create card payment"}
                                </button>
                            ) : null}
                            {/* Note: When card is selected and clientSecret exists, Stripe form is shown in PaymentMethodSelector */}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
