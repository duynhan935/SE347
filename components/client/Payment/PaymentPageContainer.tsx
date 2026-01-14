"use client";

import { orderApi, type CreateOrderRequest } from "@/lib/api/orderApi";
import { paymentApi } from "@/lib/api/paymentApi";
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
    const { user } = useAuthStore();
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
        if (!extendedUser) {
            toast.error("Please login to checkout");
            router.push("/login");
            return;
        }

        // Ensure userId is set in cart store
        if (extendedUser.id && cartUserId !== extendedUser.id) {
            setUserId(extendedUser.id);
        }

        // Fetch cart when userId is set and matches current user
        if (extendedUser.id && cartUserId === extendedUser.id && !cartFetched && !cartLoading) {
            fetchCart().catch((error) => {
                // Silently handle errors - cart might not exist yet or service unavailable
                const status = (error as { response?: { status?: number } })?.response?.status;
                if (status !== 404 && status !== 503) {
                    console.warn("Failed to fetch cart:", error);
                }
            });
            setCartFetched(true);
        }

        // Mark as fetched when cart loading is complete
        if (cartUserId && !cartLoading && !cartFetched) {
            setCartFetched(true);
        }
    }, [extendedUser, cartUserId, cartLoading, setUserId, router, cartFetched, fetchCart]);

    // Check if cart is empty after fetching (only after cart has been fetched and loaded)
    // Skip this check if payment has been completed to avoid showing error toast after successful payment
    useEffect(() => {
        if (!extendedUser || cartLoading || !cartFetched || isPaymentCompleted) return;

        // Only check if cart is empty after fetching is complete
        if (orderItems.length === 0 && cartUserId) {
            toast.error("Your cart is empty");
            router.push("/cart");
        }
    }, [extendedUser, orderItems.length, cartUserId, cartFetched, cartLoading, isPaymentCompleted, router]);

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

        if (!extendedUser?.id) {
            toast.error("Please login to place order");
            router.push("/login");
            return;
        }

        if (orderItems.length === 0) {
            toast.error("Your cart is empty");
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
            // Group items by restaurant
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

            // Create order for each restaurant
            // Use Promise.allSettled to handle partial failures
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
                throw new Error(`Không thể tạo đơn hàng cho bất kỳ nhà hàng nào. ${errorMessages}`);
            }

            // If some orders failed, show warning but continue
            if (failedRestaurants.length > 0) {
                const failedNames = failedRestaurants.map((f) => f.name).join(", ");
                toast.error(
                    `Một số đơn hàng không thể tạo: ${failedNames}. Các đơn hàng khác đã được tạo thành công.`,
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
                throw new Error("Không thể lấy ID đơn hàng từ response. Vui lòng thử lại.");
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
            toast.success(`Đã tạo ${orders.length} đơn hàng thành công! Vui lòng chọn phương thức thanh toán.`);
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
                const currentTime = now.toLocaleTimeString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                    timeZone: "Asia/Ho_Chi_Minh",
                });

                toast.error(
                    `Nhà hàng "${restaurantName}" hiện đang đóng cửa (Thời gian hiện tại: ${currentTime}). Vui lòng kiểm tra lại thời gian hoạt động trong phần quản lý nhà hàng hoặc thử lại sau.`,
                    {
                        duration: 8000,
                    }
                );
            } else if (errorMessage.includes("Restaurant validation failed")) {
                // Check if it's a closed restaurant error
                if (errorMessage.includes("closed")) {
                    toast.error("Nhà hàng hiện đang đóng cửa. Vui lòng kiểm tra lại thời gian hoạt động.", {
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
        console.log("đang thanh toán");
        if (!extendedUser?.id || createdOrderIds.length === 0) {
            toast.error("Lỗi: Không tìm thấy thông tin đơn hàng.");
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
        toast.loading("Đang chuẩn bị thanh toán...");

        try {
            const firstOrder = createdOrders[0];
            const orderId =
                (firstOrder as { id?: string; orderId?: string }).id ||
                (firstOrder as { id?: string; orderId?: string }).orderId;

            const firstOrderRestaurantId =
                (firstOrder as { restaurantId?: string }).restaurantId ||
                (firstOrder as { restaurant?: { id?: string } }).restaurant?.id;

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
                throw new Error("Không thể lấy thông tin đơn hàng để tạo thanh toán.");
            }

            const paymentResponse = await paymentApi.createPayment({
                orderId: orderId,
                userId: extendedUser.id,
                // Backend payment service is single-order centric. Use the first order's amount.
                amount: firstOrderTotal || totalAmount,
                paymentMethod: "card",
                currency: "USD",
                metadata: {
                    // Provide both naming variants to be compatible with backend implementations.
                    merchantId: firstOrderRestaurantId,
                    restaurantId: firstOrderRestaurantId,
                    amountForMerchant,
                    amountForRestaurant: amountForMerchant,
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
                    toast.success("Đã sẵn sàng thanh toán!");
                } else {
                    console.error("❌ Invalid clientSecret in payment response:", paymentData);
                    throw new Error(
                        "Không nhận được clientSecret từ payment service. Response: " + JSON.stringify(paymentData)
                    );
                }
            } else {
                console.error("❌ Invalid payment response structure:", paymentResponseData);
                throw new Error(
                    "Không nhận được clientSecret từ payment service. Response structure invalid: " +
                        JSON.stringify(paymentResponseData)
                );
            }
        } catch (paymentError) {
            console.error("Failed to create payment:", paymentError);
            const errorMessage =
                (paymentError as { response?: { data?: { message?: string } } })?.response?.data?.message ||
                (paymentError as { message?: string })?.message ||
                "Không thể tạo thanh toán. Vui lòng thử lại.";
            toast.error(errorMessage);
            setIsProcessingCardPayment(false);
        }
    };

    const handleStripePaymentSuccess = async () => {
        try {
            // Mark payment as completed to prevent cart empty check
            setIsPaymentCompleted(true);

            // Complete payment - update payment status to "completed"
            // This ensures payment status is updated immediately (webhook will also handle it as backup)
            if (paymentId) {
                try {
                    await paymentApi.completePayment(paymentId);
                    console.log("✅ Payment marked as completed:", paymentId);
                } catch (paymentError) {
                    console.error("Failed to complete payment:", paymentError);
                    // Continue even if complete payment fails - webhook will handle it
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

            toast.success(`Thanh toán thành công! Đã tạo ${createdOrderIds.length} đơn hàng.`);

            // Add a small delay to ensure orders are persisted before redirecting
            await new Promise((resolve) => setTimeout(resolve, 500));

            // Redirect to orders page - it will fetch orders automatically with retry logic
            router.push("/orders");
        } catch (error) {
            console.error("Failed to handle payment success:", error);
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
                    {/* Cột bên trái: Billing Details */}
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
                                {isSubmitting ? "Đang tạo đơn hàng..." : `Tạo đơn hàng (${orderItems.length} items)`}
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
                    {/* Cột bên trái: Order Summary */}
                    <div className="space-y-6">
                        <h1 className="text-3xl font-bold">Thông tin đơn hàng</h1>
                        <div className="bg-gray-50 p-6 rounded-lg border">
                            <h2 className="text-xl font-bold mb-4">Đơn hàng đã tạo</h2>
                            <div className="space-y-2 text-sm">
                                <p>
                                    <span className="font-medium">Số đơn hàng:</span> {createdOrderIds.length}
                                </p>
                                <p>
                                    <span className="font-medium">Mã đơn hàng:</span> {createdOrderIds.join(", ")}
                                </p>
                            </div>
                            <button
                                onClick={() => setCurrentStep("order")}
                                className="mt-4 text-brand-purple hover:underline text-sm"
                            >
                                ← Quay lại chỉnh sửa đơn hàng
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
                                        ? "Đang chuẩn bị thanh toán..."
                                        : "Tạo thanh toán bằng thẻ"}
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
