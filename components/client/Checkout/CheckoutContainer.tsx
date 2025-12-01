        "use client";

        import { Mail, MapPin, Phone, User } from "lucide-react";
        import Image, { StaticImageData } from "next/image";
        import { useRouter, useSearchParams } from "next/navigation";
        import { useEffect, useState } from "react";
        import { FormInput } from "./FormInput";
        import { useCartStore, type CartItem } from "@/stores/cartStore";
        import { useAuthStore } from "@/stores/useAuthStore";
        import { orderApi, type CreateOrderRequest } from "@/lib/api/orderApi";
        import { useGeolocation } from "@/lib/userLocation";
        import type { User } from "@/types";
        import toast from "react-hot-toast";

        type ExtendedUser = User & {
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

        export default function CheckoutPageClient({ backgroundImage }: { backgroundImage: StaticImageData }) {
        const router = useRouter();
        const searchParams = useSearchParams();
        const restaurantId = searchParams.get("restaurantId");

        const { items, clearRestaurant } = useCartStore();
        const { user } = useAuthStore();
        const { coords, error: locationError } = useGeolocation();

        const extendedUser = (user as ExtendedUser | null) ?? null;
        const defaultAddress = extendedUser?.defaultAddress ?? null;

        const [isSubmitting, setIsSubmitting] = useState(false);
        const [formData, setFormData] = useState({
                name: extendedUser?.username || "",
                phone: extendedUser?.phoneNumber || extendedUser?.phone || "",
                email: extendedUser?.email || "",
                street: defaultAddress?.street ?? "",
                city: defaultAddress?.city ?? "",
                state: defaultAddress?.state ?? "",
                zipCode: defaultAddress?.zipCode ?? "",
                paymentMethod: "cash" as CreateOrderRequest["paymentMethod"],
                notes: "",
        });

        // Filter items by restaurant if restaurantId provided
        const orderItems = restaurantId ? items.filter((item) => item.restaurantId === restaurantId) : items;

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

                const latitude =
                coords?.latitude ?? defaultAddress?.latitude ?? extendedUser.latitude ?? undefined;
                const longitude =
                coords?.longitude ?? defaultAddress?.longitude ?? extendedUser.longitude ?? undefined;

                if (typeof latitude !== "number" || typeof longitude !== "number") {
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
                                paymentMethod: formData.paymentMethod,
                                orderNote: formData.notes.trim() ? formData.notes.trim() : undefined,
                                userLat: latitude,
                                userLon: longitude,
                        };

                        return orderApi.createOrder(payload);
                        }),
                );

                for (const [restId] of restaurantEntries) {
                        await clearRestaurant(restId);
                }

                toast.success(`Successfully created ${orders.length} order(s)!`);
                router.push("/orders");
                } catch (error) {
                console.error("Failed to create order:", error);
                toast.error("Failed to create order. Please try again.");
                } finally {
                setIsSubmitting(false);
                }
        };

        return (
                <div className="relative min-h-screen  items-center justify-start py-12 px-4 flex flex-col overflow-hidden">
                <Image
                        src={backgroundImage}
                        alt="Burger background"
                        layout="fill"
                        objectFit="cover"
                        className="brightness-50 blur-sm"
                        priority
                />

                <div className="relative text-center text-brand-black my-10 z-10">
                        <h1 className="text-6xl font-extrabold tracking-wider leading-tight">Online Reservation</h1>
                        <p className="mt-5 text-xl font-medium">Order your food now</p>
                </div>
                <div className="relative w-full max-w-6xl bg-black/60 backdrop-blur-sm rounded-xl shadow-2xl p-10 md:p-16">
                        <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <FormInput
                                icon={User}
                                name="name"
                                placeholder="Your name"
                                value={formData.name}
                                onChange={handleChange}
                                />
                                <FormInput
                                icon={Phone}
                                name="phone"
                                type="tel"
                                placeholder="Phone number"
                                value={formData.phone}
                                onChange={handleChange}
                                />
                                <FormInput
                                icon={Mail}
                                name="email"
                                type="email"
                                placeholder="Email address"
                                value={formData.email}
                                onChange={handleChange}
                                />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormInput
                                icon={MapPin}
                                name="street"
                                placeholder="Street address"
                                value={formData.street}
                                onChange={handleChange}
                                />
                                <FormInput
                                icon={MapPin}
                                name="city"
                                placeholder="City"
                                value={formData.city}
                                onChange={handleChange}
                                />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormInput
                                icon={MapPin}
                                name="state"
                                placeholder="State / Province"
                                value={formData.state}
                                onChange={handleChange}
                                />
                                <FormInput
                                icon={MapPin}
                                name="zipCode"
                                placeholder="Zip / Postal Code"
                                value={formData.zipCode}
                                onChange={handleChange}
                                />
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                                <div>
                                <label className="block text-white font-semibold mb-2">Payment Method</label>
                                <select
                                        name="paymentMethod"
                                        value={formData.paymentMethod}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-white/10 text-white rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-brand-purple"
                                >
                                        <option value="cash" className="text-black">
                                        Cash on Delivery
                                        </option>
                                        <option value="card" className="text-black">
                                        Credit/Debit Card
                                        </option>
                                        <option value="wallet" className="text-black">
                                        E-Wallet
                                        </option>
                                </select>
                                </div>
                                <div>
                                <label className="block text-white font-semibold mb-2">Delivery Notes (optional)</label>
                                <textarea
                                        name="notes"
                                        placeholder="Add any special instructions for delivery"
                                        value={formData.notes}
                                        onChange={handleChange}
                                        rows={3}
                                        className="w-full px-4 py-3 bg-white/10 text-white rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-brand-purple resize-none"
                                />
                                </div>
                        </div>

                        {orderItems.length > 0 && (
                                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mt-4">
                                <h3 className="text-white font-bold text-lg mb-3">Order Summary</h3>
                                <div className="space-y-2 text-white">
                                        {orderItems.map((item, idx) => (
                                        <div key={idx} className="flex justify-between text-sm">
                                                <span>
                                                {item.name} x{item.quantity}
                                                </span>
                                                <span>${(item.price * item.quantity).toFixed(2)}</span>
                                        </div>
                                        ))}
                                        <div className="border-t border-white/20 pt-2 mt-2 flex justify-between font-bold">
                                        <span>Total</span>
                                        <span>
                                                $
                                                {orderItems
                                                .reduce((sum, item) => sum + item.price * item.quantity, 0)
                                                .toFixed(2)}
                                        </span>
                                        </div>
                                </div>
                                </div>
                        )}

                        <div className="pt-4">
                                <button
                                type="submit"
                                disabled={isSubmitting || orderItems.length === 0}
                                className="cursor-pointer w-full bg-brand-purple text-white font-bold text-lg py-3 rounded-lg hover:bg-brand-purple/90 transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                >
                                {isSubmitting ? "Processing..." : `Place Order (${orderItems.length} items)`}
                                </button>
                        </div>
                        </form>
                </div>
                </div>
        );
        }
