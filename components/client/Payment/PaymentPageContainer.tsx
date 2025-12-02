"use client";

import { orderApi, type CreateOrderRequest } from "@/lib/api/orderApi";
import { paymentApi } from "@/lib/api/paymentApi";
import { useGeolocation } from "@/lib/userLocation";
import { useCartStore, type CartItem } from "@/stores/cartStore";
import { useAuthStore } from "@/stores/useAuthStore";
import type { User as UserType } from "@/types";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { InputField } from "./InputField";
import { RadioField } from "./RadioField";
import { SelectField } from "./SelectField";
import StripeCardElement from "./StripeCardElement";

const SHIPPING_FEE = 21.0;

// Initialize Stripe
const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
if (!stripePublishableKey) {
        console.warn("⚠️ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set. Stripe payment will not work.");
}
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

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

        const { items, clearRestaurant } = useCartStore();
        const { user } = useAuthStore();
        const { coords, error: locationError } = useGeolocation();

        const extendedUser = (user as ExtendedUser | null) ?? null;
        const defaultAddress = extendedUser?.defaultAddress ?? null;

        const [isSubmitting, setIsSubmitting] = useState(false);
        const [paymentMethod, setPaymentMethod] = useState<CreateOrderRequest["paymentMethod"]>("cash");
        const [deliverStyle, setDeliverStyle] = useState("delivery");
        const [createdOrderIds, setCreatedOrderIds] = useState<string[]>([]);
        const [stripeClientSecret, setStripeClientSecret] = useState<string | null>(null);
        const [isProcessingCardPayment, setIsProcessingCardPayment] = useState(false);
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

        // Filter items by restaurant if restaurantId provided
        const orderItems = restaurantId ? items.filter((item) => item.restaurantId === restaurantId) : items;
        const subtotal = orderItems.reduce((total, item) => total + item.price * item.quantity, 0);
        const shipping = deliverStyle === "pickup" ? 0 : SHIPPING_FEE;

        useEffect(() => {
                if (!extendedUser) {
                        toast.error("Please login to checkout");
                        router.push("/login");
                        return;
                }

                if (orderItems.length === 0) {
                        toast.error("Your cart is empty");
                        router.push("/cart");
                }
        }, [extendedUser, orderItems.length, router]);

        useEffect(() => {
                if (locationError) {
                        toast.error(locationError);
                }
        }, [locationError]);

        // Fetch payment info when orders are created and payment method is card
        useEffect(() => {
                const fetchPaymentInfo = async () => {
                        if (
                                createdOrderIds.length > 0 &&
                                paymentMethod === "card" &&
                                !stripeClientSecret &&
                                !isSubmitting
                        ) {
                                let retries = 0;
                                const maxRetries = 5;
                                const retryDelay = 1000; // 1 second

                                const tryFetchPayment = async (): Promise<void> => {
                                        try {
                                                // Get payment info from the first order (assuming all orders have same payment method)
                                                const payment = await paymentApi.getPaymentByOrderId(
                                                        createdOrderIds[0]
                                                );

                                                // Check if payment has clientSecret in metadata
                                                if (
                                                        payment &&
                                                        payment.metadata &&
                                                        typeof payment.metadata === "object" &&
                                                        "clientSecret" in payment.metadata
                                                ) {
                                                        const clientSecret = payment.metadata.clientSecret as string;
                                                        if (clientSecret && typeof clientSecret === "string") {
                                                                setStripeClientSecret(clientSecret);
                                                                toast.dismiss(); // Dismiss loading toast
                                                                return;
                                                        }
                                                }

                                                // If no clientSecret yet and retries left, retry
                                                if (retries < maxRetries) {
                                                        retries++;
                                                        setTimeout(tryFetchPayment, retryDelay);
                                                } else {
                                                        toast.error(
                                                                "Không thể tải thông tin thanh toán. Vui lòng thử lại."
                                                        );
                                                        setIsProcessingCardPayment(false);
                                                }
                                        } catch (error) {
                                                // If 404, payment might not be created yet - retry
                                                if (
                                                        retries < maxRetries &&
                                                        (error as { response?: { status?: number } })?.response
                                                                ?.status === 404
                                                ) {
                                                        retries++;
                                                        setTimeout(tryFetchPayment, retryDelay);
                                                } else {
                                                        console.error("Failed to fetch payment info:", error);
                                                        toast.error(
                                                                "Không thể tải thông tin thanh toán. Vui lòng thử lại."
                                                        );
                                                        setIsProcessingCardPayment(false);
                                                }
                                        }
                                };

                                // Start fetching after initial delay
                                setTimeout(tryFetchPayment, 500);
                        }
                };

                fetchPaymentInfo();
        }, [createdOrderIds, paymentMethod, stripeClientSecret, isSubmitting]);

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
                        toast.error(
                                "Unable to determine your location. Please enable location services and try again."
                        );
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
                        const orders = await Promise.all(
                                restaurantEntries.map(([restId, group]) => {
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
                                                paymentMethod: paymentMethod,
                                                orderNote: formData.orderNote.trim()
                                                        ? formData.orderNote.trim()
                                                        : undefined,
                                                userLat:
                                                        deliverStyle === "delivery"
                                                                ? (latitude as number)
                                                                : latitude ?? 0,
                                                userLon:
                                                        deliverStyle === "delivery"
                                                                ? (longitude as number)
                                                                : longitude ?? 0,
                                        };
                                        return orderApi.createOrder(payload);
                                })
                        );

                        const orderIds = orders.map((order) => order.id);
                        setCreatedOrderIds(orderIds);

                        // If payment method is cash or wallet, complete the order
                        if (paymentMethod === "cash" || paymentMethod === "wallet") {
                                for (const [restId] of restaurantEntries) {
                                        await clearRestaurant(restId, { silent: true });
                                }

                                toast.success(`Successfully created ${orders.length} order(s)!`);
                                router.push("/orders");
                        } else if (paymentMethod === "card") {
                                // For card payment, wait for Stripe Elements to handle payment
                                setIsProcessingCardPayment(true);
                                toast.loading("Đang tạo đơn hàng và chuẩn bị thanh toán...");
                        }
                } catch (error: unknown) {
                        console.error("Failed to create order:", error);

                        // Handle specific error messages
                        const errorMessage =
                                (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
                                (error as { message?: string })?.message ||
                                "Failed to create order. Please try again.";

                        // Check for timeout errors
                        if (errorMessage.includes("timeout") || errorMessage.includes("exceeded")) {
                                toast.error(
                                        "Backend service timeout. Please check if all services are running and try again."
                                );
                        } else if (errorMessage.includes("Restaurant validation failed")) {
                                toast.error(
                                        "Restaurant validation failed. Please check if restaurant service is available."
                                );
                        } else {
                                toast.error(errorMessage);
                        }
                } finally {
                        setIsSubmitting(false);
                }
        };

        const handleStripePaymentSuccess = async () => {
                try {
                        // Clear cart
                        const restaurantGroups = orderItems.reduce((acc, item) => {
                                if (!acc[item.restaurantId]) {
                                        acc[item.restaurantId] = [];
                                }
                                acc[item.restaurantId].push(item);
                                return acc;
                        }, {} as Record<string, CartItem[]>);

                        for (const restId of Object.keys(restaurantGroups)) {
                                await clearRestaurant(restId, { silent: true });
                        }

                        toast.success(`Thanh toán thành công! Đã tạo ${createdOrderIds.length} đơn hàng.`);
                        router.push("/orders");
                } catch (error) {
                        console.error("Failed to clear cart:", error);
                }
        };

        const handleStripePaymentError = (error: string) => {
                toast.error(error);
                setIsProcessingCardPayment(false);
        };

        return (
                <div className="custom-container py-12">
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
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                Deliver to
                                                        </label>
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
                                                        <label
                                                                htmlFor="orderNote"
                                                                className="block text-sm font-medium text-gray-700 mb-1"
                                                        >
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
                                                        disabled={
                                                                isSubmitting ||
                                                                orderItems.length === 0 ||
                                                                isProcessingCardPayment
                                                        }
                                                        className="cursor-pointer w-full bg-brand-purple text-white font-bold text-lg py-3 rounded-lg hover:bg-brand-purple/90 transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                                >
                                                        {isSubmitting
                                                                ? "Processing..."
                                                                : isProcessingCardPayment
                                                                ? "Đang xử lý thanh toán..."
                                                                : `Place Order (${orderItems.length} items)`}
                                                </button>
                                        </form>
                                </div>

                                {/* Cột bên phải: Your Order & Payment Method */}
                                <div className="space-y-8">
                                        <OrderSummary subtotal={subtotal} shipping={shipping} items={orderItems} />

                                        {/* Payment Method */}
                                        <div className="bg-gray-50 p-6 rounded-lg border">
                                                <h2 className="text-xl font-bold mb-4">Payment Method</h2>
                                                <div className="space-y-4">
                                                        <div className="border rounded-lg p-4 bg-white">
                                                                <div className="flex items-center">
                                                                        <input
                                                                                type="radio"
                                                                                id="cash"
                                                                                name="paymentMethod"
                                                                                value="cash"
                                                                                checked={paymentMethod === "cash"}
                                                                                onChange={(e) =>
                                                                                        setPaymentMethod(
                                                                                                e.target
                                                                                                        .value as CreateOrderRequest["paymentMethod"]
                                                                                        )
                                                                                }
                                                                                disabled={isProcessingCardPayment}
                                                                                className="h-4 w-4 text-brand-purple focus:ring-brand-purple border-gray-700"
                                                                        />
                                                                        <label
                                                                                htmlFor="cash"
                                                                                className="ml-3 block text-sm font-medium text-gray-700"
                                                                        >
                                                                                Cash on Delivery
                                                                        </label>
                                                                </div>
                                                        </div>
                                                        <div className="border rounded-lg p-4 bg-white">
                                                                <div className="flex items-center">
                                                                        <input
                                                                                type="radio"
                                                                                id="card"
                                                                                name="paymentMethod"
                                                                                value="card"
                                                                                checked={paymentMethod === "card"}
                                                                                onChange={(e) =>
                                                                                        setPaymentMethod(
                                                                                                e.target
                                                                                                        .value as CreateOrderRequest["paymentMethod"]
                                                                                        )
                                                                                }
                                                                                disabled={isProcessingCardPayment}
                                                                                className="h-4 w-4 text-brand-purple focus:ring-brand-purple border-gray-700"
                                                                        />
                                                                        <label
                                                                                htmlFor="card"
                                                                                className="ml-3 block text-sm font-medium text-gray-700"
                                                                        >
                                                                                Credit/Debit Card
                                                                        </label>
                                                                </div>
                                                                {paymentMethod === "card" &&
                                                                        !isProcessingCardPayment && (
                                                                                <div className="mt-4 text-sm text-gray-600">
                                                                                        <p>
                                                                                                Bạn sẽ được yêu cầu nhập
                                                                                                thông tin thẻ sau khi
                                                                                                đặt hàng.
                                                                                        </p>
                                                                                </div>
                                                                        )}
                                                                {isProcessingCardPayment &&
                                                                        stripeClientSecret &&
                                                                        stripePromise && (
                                                                                <div className="mt-4">
                                                                                        <Elements
                                                                                                stripe={stripePromise}
                                                                                                options={{
                                                                                                        clientSecret:
                                                                                                                stripeClientSecret,
                                                                                                }}
                                                                                        >
                                                                                                <StripeCardElement
                                                                                                        clientSecret={
                                                                                                                stripeClientSecret
                                                                                                        }
                                                                                                        onPaymentSuccess={
                                                                                                                handleStripePaymentSuccess
                                                                                                        }
                                                                                                        onPaymentError={
                                                                                                                handleStripePaymentError
                                                                                                        }
                                                                                                />
                                                                                        </Elements>
                                                                                </div>
                                                                        )}
                                                                {isProcessingCardPayment && !stripePromise && (
                                                                        <div className="mt-4 text-sm text-red-600">
                                                                                <p>
                                                                                        ⚠️ Stripe chưa được cấu hình.
                                                                                        Vui lòng kiểm tra
                                                                                        NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
                                                                                        trong .env.local
                                                                                </p>
                                                                        </div>
                                                                )}
                                                                {isProcessingCardPayment && !stripeClientSecret && (
                                                                        <div className="mt-4 text-sm text-gray-600">
                                                                                <p>Đang tải thông tin thanh toán...</p>
                                                                        </div>
                                                                )}
                                                        </div>
                                                        <div className="border rounded-lg p-4 bg-white">
                                                                <div className="flex items-center">
                                                                        <input
                                                                                type="radio"
                                                                                id="wallet"
                                                                                name="paymentMethod"
                                                                                value="wallet"
                                                                                checked={paymentMethod === "wallet"}
                                                                                onChange={(e) =>
                                                                                        setPaymentMethod(
                                                                                                e.target
                                                                                                        .value as CreateOrderRequest["paymentMethod"]
                                                                                        )
                                                                                }
                                                                                disabled={isProcessingCardPayment}
                                                                                className="h-4 w-4 text-brand-purple focus:ring-brand-purple border-gray-700"
                                                                        />
                                                                        <label
                                                                                htmlFor="wallet"
                                                                                className="ml-3 block text-sm font-medium text-gray-700"
                                                                        >
                                                                                E-Wallet
                                                                        </label>
                                                                </div>
                                                        </div>
                                                </div>
                                        </div>
                                </div>
                        </div>
                </div>
        );
}
