import { Order } from "@/types/order.type";

export const OrderSummary = ({ order }: { order: Order }) => {
                const originalPrice = Number(order.totalAmount ?? 0);
                const savings = Number(order.discount ?? 0);
                const shipping = Number(order.deliveryFee ?? 0);
                const tax = Number(order.tax ?? 0);
                const total = Number(order.finalAmount ?? originalPrice - savings + shipping + tax);

        return (
                <div className="bg-gray-50 p-6 rounded-lg border w-full lg:sticky lg:top-24">
                        <h2 className="text-xl font-bold mb-4">Order Summary</h2>
                        <div className="space-y-3 text-gray-600">
                                <div className="flex justify-between">
                                                                        <span>Original Price</span>
                                                                        <span>${originalPrice.toFixed(2)}</span>
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
                        <button className="cursor-pointer w-full mt-6 bg-yellow-400 text-black font-bold py-3 rounded-md hover:bg-yellow-500 transition-colors">
                                Buy Again
                        </button>
                </div>
        );
};
