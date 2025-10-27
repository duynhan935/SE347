// File: stores/useAuthStore.ts (PLACEHOLDER - REPLACE WITH YOUR AUTH LOGIC)
import { User } from "@/types"; // Adjust path if needed
import { create } from "zustand";

interface AuthState {
        user: User | null;
        isAuthenticated: boolean;
        // Add login/logout functions that set the user
        login: (userData: User) => void;
        logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
        // Simulate a logged-in merchant for testing
        user: {
                id: "testmerchantid", // Your example merchant ID
                username: "testmerchant",
                email: "testmerchant@gmail.com",
                enabled: true,
                role: "MERCHANT",
                phone: "0762612697",
        },
        isAuthenticated: true, // Assume logged in

        // Dummy login/logout
        login: (userData) => set({ user: userData, isAuthenticated: true }),
        logout: () => set({ user: null, isAuthenticated: false }),
}));
