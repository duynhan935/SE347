import { CartItem, useCartStore } from "@/stores/cartStore";
import { Minus, Plus, Trash2 } from "lucide-react";
import Image from "next/image";

export const CartItemRow = ({ item }: { item: CartItem }) => {
        const { updateQuantity, removeItem } = useCartStore();

        return (
                <div className="flex flex-col sm:flex-row items-center gap-4 py-4 border-b">
                        <Image
                                src={item.image}
                                alt={item.name}
                                width={100}
                                height={100}
                                className="rounded-md object-cover"
                        />
                        <div className="flex-grow text-center sm:text-left ">
                                <p className="font-semibold text-lg">{item.name}</p>
                                <p className="text-sm text-gray-500">${item.price.toFixed(2)}</p>
                                <div className="flex items-center justify-center sm:justify-start gap-2 mt-2 sm:hidden">
                                        <button
                                                title="Remove item"
                                                onClick={() => removeItem(item.id)}
                                                className="text-md p-4 text-gray-500 hover:text-red-500"
                                        >
                                                Remove
                                        </button>
                                </div>
                        </div>
                        <div className="flex items-center border rounded-md">
                                <button
                                        title="Decrease item"
                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                        className="p-3 hover:bg-gray-100"
                                >
                                        <Minus className="w-4 h-4" />
                                </button>
                                <span className="px-5 font-semibold">{item.quantity}</span>
                                <button
                                        title="Increase item"
                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                        className="p-3 hover:bg-gray-100"
                                >
                                        <Plus className="w-4 h-4" />
                                </button>
                        </div>
                        <p className="font-bold w-24 text-center md:text-right text-lg">
                                ${(item.price * item.quantity).toFixed(2)}
                        </p>
                        <button
                                title="Remove item"
                                onClick={() => removeItem(item.id)}
                                className="text-gray-500 hover:text-red-500 hidden sm:block cursor-pointer"
                        >
                                <Trash2 className="w-5 h-5" />
                        </button>
                </div>
        );
};
