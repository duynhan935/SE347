"use client";

import { orderApi, type CreateOrderRequest } from "@/lib/api/orderApi";
import { paymentApi } from "@/lib/api/paymentApi";
import { useGeolocation } from "@/lib/userLocation";
import { useCartStore, type CartItem } from "@/stores/cartStore";
import { useAuthStore } from "@/stores/useAuthStore";
import type { User as UserType } from "@/types";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { InputField } from "./InputField";
import PaymentMethodSelector from "./PaymentMethodSelector";
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

        const { items, clearRestaurant } = useCartStore();
        const { user } = useAuthStore();
        const { coords, error: locationError } = useGeolocation();

        const extendedUser = (user as ExtendedUser | null) ?? null;
        const defaultAddress = extendedUser?.defaultAddress ?? null;

        const [currentStep, setCurrentStep] = useState<"order" | "payment">("order"); // Step 1: order, Step 2: payment
        const [isSubmitting, setIsSubmitting] = useState(false);
        const [paymentMethod, setPaymentMethod] = useState<CreateOrderRequest["paymentMethod"]>("cash");
        const [deliverStyle, setDeliverStyle] = useState("delivery");
        const [createdOrderIds, setCreatedOrderIds] = useState<string[]>([]);
        const [createdOrders, setCreatedOrders] = useState<unknown[]>([]); // Store created orders data
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
                                                console.error(
                                                        `Order at index ${index} missing both id and orderId:`,
                                                        order
                                                );
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

                        // Save order data for payment step
                        setCreatedOrderIds(orderIds);
                        setCreatedOrders(orders as unknown[]);

                        // Move to payment step
                        setCurrentStep("payment");
                        toast.success(
                                `Đã tạo ${orders.length} đơn hàng thành công! Vui lòng chọn phương thức thanh toán.`
                        );
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

        // Handle payment method selection and process payment
        const handlePaymentSubmit = async () => {
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

                if (paymentMethod === "cash" || paymentMethod === "wallet") {
                        // Backend will create payment automatically via RabbitMQ
                        // Clear cart and redirect
                        for (const [restId] of Object.entries(
                                orderItems.reduce((acc, item) => {
                                        if (!acc[item.restaurantId]) {
                                                acc[item.restaurantId] = [];
                                        }
                                        acc[item.restaurantId].push(item);
                                        return acc;
                                }, {} as Record<string, CartItem[]>)
                        )) {
                                await clearRestaurant(restId, { silent: true });
                        }

                        toast.success(`Thanh toán thành công! Đã tạo ${createdOrderIds.length} đơn hàng.`);
                        router.push("/orders");
                } else if (paymentMethod === "card") {
                        // Create payment and get clientSecret
                        setIsProcessingCardPayment(true);
                        toast.loading("Đang chuẩn bị thanh toán...");

                        try {
                                const firstOrder = createdOrders[0];
                                const orderId =
                                        (firstOrder as { id?: string; orderId?: string }).id ||
                                        (firstOrder as { id?: string; orderId?: string }).orderId;

                                if (!orderId) {
                                        throw new Error("Không thể lấy thông tin đơn hàng để tạo thanh toán.");
                                }

                                // Create payment and get clientSecret
                                const paymentResponse = await paymentApi.createPayment({
                                        orderId: orderId,
                                        userId: extendedUser.id,
                                        amount: totalAmount,
                                        paymentMethod: "card",
                                        currency: "USD",
                                });

                                // Extract clientSecret from response
                                if (paymentResponse.data?.clientSecret) {
                                        setStripeClientSecret(paymentResponse.data.clientSecret);
                                        toast.dismiss();
                                        toast.success("Đã sẵn sàng thanh toán!");
                                } else {
                                        throw new Error("Không nhận được clientSecret từ payment service.");
                                }
                        } catch (paymentError) {
                                console.error("Failed to create payment:", paymentError);
                                const errorMessage =
                                        (paymentError as { response?: { data?: { message?: string } } })?.response?.data
                                                ?.message ||
                                        (paymentError as { message?: string })?.message ||
                                        "Không thể tạo thanh toán. Vui lòng thử lại.";
                                toast.error(errorMessage);
                                setIsProcessingCardPayment(false);
                        }
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
                        {/* Step Indicator */}
                        <div className="mb-8">
                                <div className="flex items-center justify-center space-x-4">
                                        <div
                                                className={`flex items-center ${
                                                        currentStep === "order" ? "text-brand-purple" : "text-gray-400"
                                                }`}
                                        >
                                                <div
                                                        className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                                                                currentStep === "order"
                                                                        ? "border-brand-purple bg-brand-purple text-white"
                                                                        : "border-gray-300"
                                                        }`}
                                                >
                                                        <span className="font-bold">1</span>
                                                </div>
                                                <span className="ml-2 font-medium">Tạo đơn hàng</span>
                                        </div>
                                        <div
                                                className={`w-16 h-0.5 ${
                                                        currentStep === "payment" ? "bg-brand-purple" : "bg-gray-300"
                                                }`}
                                        ></div>
                                        <div
                                                className={`flex items-center ${
                                                        currentStep === "payment"
                                                                ? "text-brand-purple"
                                                                : "text-gray-400"
                                                }`}
                                        >
                                                <div
                                                        className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                                                                currentStep === "payment"
                                                                        ? "border-brand-purple bg-brand-purple text-white"
                                                                        : "border-gray-300"
                                                        }`}
                                                >
                                                        <span className="font-bold">2</span>
                                                </div>
                                                <span className="ml-2 font-medium">Thanh toán</span>
                                        </div>
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
                                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                        Deliver to
                                                                </label>
                                                                <div className="grid grid-cols-2 gap-4">
                                                                        <RadioField
                                                                                label="Pickup"
                                                                                name="deliverStyle"
                                                                                value="pickup"
                                                                                checked={deliverStyle === "pickup"}
                                                                                onChange={() =>
                                                                                        setDeliverStyle("pickup")
                                                                                }
                                                                        />
                                                                        <RadioField
                                                                                label="Delivery"
                                                                                name="deliverStyle"
                                                                                value="delivery"
                                                                                checked={deliverStyle === "delivery"}
                                                                                onChange={() =>
                                                                                        setDeliverStyle("delivery")
                                                                                }
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
                                                                disabled={isSubmitting || orderItems.length === 0}
                                                                className="cursor-pointer w-full bg-brand-purple text-white font-bold text-lg py-3 rounded-lg hover:bg-brand-purple/90 transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                                        >
                                                                {isSubmitting
                                                                        ? "Đang tạo đơn hàng..."
                                                                        : `Tạo đơn hàng (${orderItems.length} items)`}
                                                        </button>
                                                </form>
                                        </div>

                                        {/* Cột bên phải: Your Order Summary */}
                                        <div className="space-y-8">
                                                <OrderSummary
                                                        subtotal={subtotal}
                                                        shipping={shipping}
                                                        items={orderItems}
                                                />
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
                                                                        <span className="font-medium">
                                                                                Số đơn hàng:
                                                                        </span>{" "}
                                                                        {createdOrderIds.length}
                                                                </p>
                                                                <p>
                                                                        <span className="font-medium">
                                                                                Mã đơn hàng:
                                                                        </span>{" "}
                                                                        {createdOrderIds.join(", ")}
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
                                                <OrderSummary
                                                        subtotal={subtotal}
                                                        shipping={shipping}
                                                        items={orderItems}
                                                />

                                                {/* Payment Method */}
                                                <div id="payment-method-section">
                                                        <PaymentMethodSelector
                                                                paymentMethod={paymentMethod}
                                                                onPaymentMethodChange={setPaymentMethod}
                                                                stripeClientSecret={stripeClientSecret}
                                                                isProcessingCardPayment={isProcessingCardPayment}
                                                                onPaymentSuccess={handleStripePaymentSuccess}
                                                                onPaymentError={handleStripePaymentError}
                                                        />
                                                </div>

                                                {/* Payment Submit Button */}
                                                <div className="mt-4">
                                                        {paymentMethod === "card" && !stripeClientSecret ? (
                                                                // Show button to create payment when card is selected but no clientSecret yet
                                                                <button
                                                                        onClick={handlePaymentSubmit}
                                                                        disabled={isProcessingCardPayment}
                                                                        className="cursor-pointer w-full bg-brand-purple text-white font-bold text-lg py-3 rounded-lg hover:bg-brand-purple/90 transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                                                >
                                                                        {isProcessingCardPayment
                                                                                ? "Đang chuẩn bị thanh toán..."
                                                                                : "Tạo thanh toán bằng thẻ"}
                                                                </button>
                                                        ) : paymentMethod !== "card" ? (
                                                                // Show button for cash/wallet payment
                                                                <button
                                                                        onClick={handlePaymentSubmit}
                                                                        disabled={isProcessingCardPayment}
                                                                        className="cursor-pointer w-full bg-brand-purple text-white font-bold text-lg py-3 rounded-lg hover:bg-brand-purple/90 transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                                                >
                                                                        {`Xác nhận thanh toán (${
                                                                                paymentMethod === "cash"
                                                                                        ? "Tiền mặt"
                                                                                        : "Ví điện tử"
                                                                        })`}
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
