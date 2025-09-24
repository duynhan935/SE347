import burgerImage from "@/assets/Restaurant/Burger.png";
import { StaticImageData } from "next/image";
import { create } from "zustand";

export interface CartItem {
        id: number; // ID của món ăn
        name: string;
        price: number;
        image: StaticImageData;
        quantity: number;
        restaurantId: number;
        restaurantName: string;
}

interface CartState {
        items: CartItem[];
        addItem: (itemToAdd: Omit<CartItem, "quantity">, quantity: number) => void;
        removeItem: (itemId: number) => void;
        updateQuantity: (itemId: number, quantity: number) => void;
        clearCart: () => void;
}

const initialFakeItems: CartItem[] = [
        {
                id: 101,
                name: "Eggs Benedict Burger",
                price: 7.5,
                image: burgerImage,
                quantity: 2,
                restaurantId: 1,
                restaurantName: "The Burger Cafe",
        },
        {
                id: 102,
                name: "Classic Cheeseburger",
                price: 9.99,
                image: burgerImage,
                quantity: 1,
                restaurantId: 1,
                restaurantName: "The Burger Cafe",
        },
        {
                id: 201,
                name: "Pepperoni Pizza",
                price: 15.0,
                image: burgerImage,
                quantity: 1,
                restaurantId: 2,
                restaurantName: "Pizza Palace",
        },
];

export const useCartStore = create<CartState>((set, get) => ({
        items: initialFakeItems,

        addItem: (itemToAdd, quantity) => {
                const { items } = get();
                const existingItem = items.find((item) => item.id === itemToAdd.id);

                if (existingItem) {
                        const updatedItems = items.map((item) =>
                                item.id === itemToAdd.id ? { ...item, quantity: item.quantity + quantity } : item
                        );
                        set({ items: updatedItems });
                } else {
                        set({ items: [...items, { ...itemToAdd, quantity }] });
                }
        },
        removeItem: (itemId) => {
                set((state) => ({
                        items: state.items.filter((item) => item.id !== itemId),
                }));
        },
        updateQuantity: (itemId, quantity) => {
                if (quantity <= 0) {
                        get().removeItem(itemId);
                } else {
                        set((state) => ({
                                items: state.items.map((item) => (item.id === itemId ? { ...item, quantity } : item)),
                        }));
                }
        },
        clearCart: () => {
                set({ items: [] });
        },
}));
