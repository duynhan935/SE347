"use client";

import { useCartStore } from "@/stores/cartStore";
import { useState } from "react";
import { InputField } from "./InputField";
import { RadioField } from "./RadioField";
import { SelectField } from "./SelectField";

const SHIPPING_FEE = 21.0; // Định nghĩa phí ship mặc định
const OrderSummary = ({ subtotal, shipping }: { subtotal: number; shipping: number }) => {
        const savings = 0;
        const tax = subtotal * 0.05;
        const total = subtotal - savings + shipping + tax;

        return (
                <div className="bg-gray-50 p-6 rounded-lg border w-full">
                        <h2 className="text-xl font-bold mb-4">Your order</h2>
                        <div className="space-y-3 text-gray-600">
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
        const [paymentMethod, setPaymentMethod] = useState("card");
        const [deliverStyle, setDeliverStyle] = useState("pickup");
        const [billingDetails, setBillingDetails] = useState({
                email: "",
                deliverTo: "residence",
                country: "united-states",
                firstName: "",
                lastName: "",
                address: "",
                city: "",
                state: "texas",
                zipCode: "",
                phone: "",
                orderNote: "",
        });

        // Lấy dữ liệu từ cart store
        const items = useCartStore((state) => state.items);
        const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
        const shipping = deliverStyle === "pickup" ? 0 : SHIPPING_FEE;

        const handleBillingChange = (
                e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
        ) => {
                const { name, value } = e.target;
                setBillingDetails((prev) => ({ ...prev, [name]: value }));
        };

        return (
                <div className="custom-container py-12">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                                {/* Cột bên trái: Billing Details */}
                                <div className="space-y-6">
                                        <h1 className="text-3xl font-bold">Billing details</h1>

                                        <form className="space-y-5">
                                                <InputField
                                                        label="Your email address"
                                                        id="email"
                                                        type="email"
                                                        name="email"
                                                        value={billingDetails.email}
                                                        onChange={handleBillingChange}
                                                />

                                                {/* << THAY ĐỔI: Thay thế SelectField bằng Radio Buttons >> */}
                                                <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                Deliver to
                                                        </label>
                                                        <div className="grid grid-cols-2 gap-4">
                                                                <RadioField
                                                                        label="Pickup"
                                                                        name="deliverTo"
                                                                        value="pickup"
                                                                        checked={deliverStyle === "pickup"}
                                                                        onChange={() => setDeliverStyle("pickup")}
                                                                />
                                                                <RadioField
                                                                        label="Delivery"
                                                                        name="deliverTo"
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
                                                                name="deliveryTo"
                                                                value={billingDetails.deliverTo}
                                                                onChange={handleBillingChange}
                                                        >
                                                                <option value="residence">Residence</option>
                                                                <option value="office">Office</option>
                                                        </SelectField>
                                                )}

                                                <SelectField
                                                        label="Country"
                                                        id="country"
                                                        name="country"
                                                        value={billingDetails.country}
                                                        onChange={handleBillingChange}
                                                >
                                                        <option value="united-states">United States</option>
                                                        <option value="vietnam">Vietnam</option>
                                                </SelectField>

                                                <div className="grid grid-cols-2 gap-4">
                                                        <InputField
                                                                label="Your first name"
                                                                id="firstName"
                                                                name="firstName"
                                                                value={billingDetails.firstName}
                                                                onChange={handleBillingChange}
                                                        />
                                                        <InputField
                                                                label="Your last name"
                                                                id="lastName"
                                                                name="lastName"
                                                                value={billingDetails.lastName}
                                                                onChange={handleBillingChange}
                                                        />
                                                </div>

                                                <InputField
                                                        label="Your address"
                                                        id="address"
                                                        name="address"
                                                        value={billingDetails.address}
                                                        onChange={handleBillingChange}
                                                />

                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                                        <InputField
                                                                label="City"
                                                                id="city"
                                                                name="city"
                                                                value={billingDetails.city}
                                                                onChange={handleBillingChange}
                                                        />
                                                        <SelectField
                                                                label="State"
                                                                id="state"
                                                                name="state"
                                                                value={billingDetails.state}
                                                                onChange={handleBillingChange}
                                                        >
                                                                <option value="texas">Texas</option>
                                                                <option value="california">California</option>
                                                        </SelectField>
                                                        <InputField
                                                                label="Zip code"
                                                                id="zipCode"
                                                                name="zipCode"
                                                                value={billingDetails.zipCode}
                                                                onChange={handleBillingChange}
                                                        />
                                                </div>

                                                <InputField
                                                        label="Your phone number"
                                                        id="phone"
                                                        type="tel"
                                                        name="phone"
                                                        value={billingDetails.phone}
                                                        onChange={handleBillingChange}
                                                />

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
                                                                value={billingDetails.orderNote}
                                                                onChange={handleBillingChange}
                                                                className="mt-1 block w-full border-gray-700 border-1 p-2 px-4 rounded-md focus:ring-brand-purple focus:border-brand-purple"
                                                                placeholder="Tell us what you think"
                                                        ></textarea>
                                                </div>
                                        </form>
                                </div>

                                {/* Cột bên phải: Your Order & Pay with */}
                                <div className="space-y-8">
                                        <OrderSummary subtotal={subtotal} shipping={shipping} />

                                        <div>
                                                <h2 className="text-xl font-bold mb-4">Pay with</h2>
                                                <div className="space-y-4">
                                                        <div className="border rounded-lg p-4">
                                                                <div className="flex items-center">
                                                                        <input
                                                                                type="radio"
                                                                                id="card"
                                                                                name="paymentMethod"
                                                                                value="card"
                                                                                checked={paymentMethod === "card"}
                                                                                onChange={() =>
                                                                                        setPaymentMethod("card")
                                                                                }
                                                                                className="h-4 w-4 text-brand-purple focus:ring-brand-purple border-gray-700 "
                                                                        />
                                                                        <label
                                                                                htmlFor="card"
                                                                                className="ml-3 block text-sm font-medium text-gray-700"
                                                                        >
                                                                                Card
                                                                        </label>
                                                                </div>
                                                                {paymentMethod === "card" && (
                                                                        <div className="mt-4 grid grid-cols-2 gap-4">
                                                                                <input
                                                                                        type="text"
                                                                                        placeholder="Card number"
                                                                                        className="col-span-2 border-gray-700 rounded-md border-1 p-2"
                                                                                />
                                                                                <input
                                                                                        type="text"
                                                                                        placeholder="Expiration date"
                                                                                        className="border-gray-700 rounded-md border-1 p-2"
                                                                                />
                                                                                <input
                                                                                        type="text"
                                                                                        placeholder="Security code"
                                                                                        className="border-gray-700 rounded-md border-1 p-2"
                                                                                />
                                                                                <button className=" cursor-pointer col-span-2 bg-green-600 text-white font-bold py-3 rounded-md hover:bg-green-700">
                                                                                        Done
                                                                                </button>
                                                                        </div>
                                                                )}
                                                        </div>
                                                        {/* Lựa chọn thanh toán bằng Paypal */}
                                                        <div className="border rounded-lg p-4">
                                                                <div className="flex items-center">
                                                                        <input
                                                                                type="radio"
                                                                                id="paypal"
                                                                                name="paymentMethod"
                                                                                value="paypal"
                                                                                checked={paymentMethod === "paypal"}
                                                                                onChange={() =>
                                                                                        setPaymentMethod("paypal")
                                                                                }
                                                                                className="h-4 w-4 text-brand-purple focus:ring-brand-purple border-gray-700 border-1"
                                                                        />
                                                                        <label
                                                                                htmlFor="paypal"
                                                                                className="ml-3 block text-sm font-medium text-gray-700"
                                                                        >
                                                                                Paypal
                                                                        </label>
                                                                </div>
                                                                {paymentMethod === "paypal" && (
                                                                        <div className="mt-4">
                                                                                <button className="w-full cursor-pointer bg-yellow-400 text-black font-bold py-3 rounded-md hover:bg-yellow-500">
                                                                                        Place Order
                                                                                </button>
                                                                        </div>
                                                                )}
                                                        </div>
                                                </div>
                                        </div>
                                </div>
                        </div>
                </div>
        );
}
