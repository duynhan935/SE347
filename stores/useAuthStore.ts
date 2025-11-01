// eslint-disable @typescript-eslint/no-explicit-any
import { authApi } from "@/lib/api/authApi";
import { User } from "@/types";
import { create } from "zustand";

interface AuthState {
        user: User | null;
        accessToken: string | null;
        refreshToken: string | null;
        isAuthenticated: boolean;
        loading: boolean;
        error: string | null;

        // Actions
        login: (credentials: { email?: string; password?: string }) => Promise<boolean>;
        register: (userData: {
                username: string;
                email: string;
                password?: string;
                confirmPassword?: string;
                role?: "USER" | "MERCHANT" | "ADMIN";
        }) => Promise<boolean>;
        logout: () => void;
        setTokens: (access: string, refresh: string) => void;
        fetchProfile: () => Promise<void>;
        initializeAuth: () => void;
        clearError: () => void;
}

const getInitialTokens = (): { accessToken: string | null; refreshToken: string | null } => {
        if (typeof window !== "undefined") {
                const accessToken = localStorage.getItem("accessToken");
                const refreshToken = localStorage.getItem("refreshToken");
                return { accessToken, refreshToken };
        }
        return { accessToken: null, refreshToken: null };
};

export const useAuthStore = create<AuthState>((set, get) => ({
        user: null,
        accessToken: getInitialTokens().accessToken,
        refreshToken: getInitialTokens().refreshToken,
        isAuthenticated: !!getInitialTokens().accessToken,
        loading: false,
        error: null,

        setTokens: (access, refresh) => {
                set({ accessToken: access, refreshToken: refresh, isAuthenticated: !!access });
                if (typeof window !== "undefined") {
                        localStorage.setItem("accessToken", access);
                        localStorage.setItem("refreshToken", refresh);
                }
        },

        login: async (credentials) => {
                set({ loading: true, error: null });
                try {
                        const { accessToken, refreshToken } = await authApi.login(credentials);
                        get().setTokens(accessToken, refreshToken);
                        await get().fetchProfile();
                        set({ loading: false });
                        return true;

                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                } catch (err: any) {
                        const errorMessage = err.response?.data?.message || err.message || "Login failed";
                        set({ error: errorMessage, loading: false, isAuthenticated: false });
                        return false;
                }
        },

        register: async (userData) => {
                set({ loading: true, error: null });
                try {
                        await authApi.register(userData);
                        set({ loading: false });

                        return true;
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                } catch (err: any) {
                        const errorMessage = err.response?.data?.message || err.message || "Registration failed";
                        set({ error: errorMessage, loading: false });
                        return false;
                }
        },

        fetchProfile: async () => {
                if (!get().isAuthenticated || !get().accessToken) {
                        set({ user: null });
                        return;
                }
                try {
                        const userData = await authApi.fetchUserProfile(get().user?.id || "");
                        set({ user: userData, error: null });
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                } catch (err: any) {
                        console.error("Failed to fetch user profile:", err);
                        set({ error: "Failed to load user profile.", user: null, isAuthenticated: false });
                }
        },

        logout: () => {
                set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false, error: null });
                if (typeof window !== "undefined") {
                        localStorage.removeItem("accessToken");
                        localStorage.removeItem("refreshToken");
                }
                // Optional: Redirect to login page
                // window.location.href = '/auth/login';
                console.log("User logged out.");
        },

        initializeAuth: () => {
                console.log("Initializing auth...");
                const { accessToken, refreshToken } = getInitialTokens();
                if (accessToken && refreshToken) {
                        set({ accessToken, refreshToken, isAuthenticated: true });
                        get().fetchProfile();
                } else {
                        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
                }
        },

        clearError: () => {
                set({ error: null });
        },
}));
