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
        login: (credentials: { username: string; password: string }) => Promise<boolean>;
        register: (userData: {
                username: string;
                email: string;
                password: string;
                confirmPassword: string;
                role: string;
        }) => Promise<boolean>;
        logout: () => void;
        setTokens: (access: string, refresh: string) => void;
        fetchProfile: () => Promise<void>;
        updateProfile: (userData: { username: string; phone: string }) => Promise<boolean>;
        initializeAuth: () => Promise<void>;
        clearError: () => void;
        resendVerificationEmail: (email: string) => Promise<boolean>;
        handleOAuthLogin: (accessToken: string) => Promise<boolean>;
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
                        const errorCode = err.response?.data?.errorCode;
                        const errorMessage = err.response?.data?.message || err.message || "Login failed";

                        // Store error code and message for handling
                        set({
                                error: errorCode ? `${errorCode}: ${errorMessage}` : errorMessage,
                                loading: false,
                                isAuthenticated: false,
                        });

                        // Re-throw error so login page can handle INACTIVATED_ACCOUNT specifically
                        if (errorCode === "INACTIVATED_ACCOUNT") {
                                throw err;
                        }

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
                const accessToken = get().accessToken;
                // Check token directly instead of isAuthenticated flag
                if (!accessToken) {
                        set({ user: null, isAuthenticated: false });
                        return;
                }
                try {
                        // Use getUserByAccessToken endpoint which extracts user from token automatically
                        const userData = await authApi.getUserByAccessToken();
                        set({ user: userData, error: null, isAuthenticated: true });
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                } catch (err: any) {
                        console.error("Failed to fetch user profile:", err);
                        // If token is invalid, clear everything
                        set({ error: "Failed to load user profile.", user: null, isAuthenticated: false });
                        // Clear invalid tokens
                        if (typeof window !== "undefined") {
                                localStorage.removeItem("accessToken");
                                localStorage.removeItem("refreshToken");
                        }
                }
        },

        updateProfile: async (userData) => {
                if (!get().user?.id) {
                        return false;
                }
                set({ loading: true, error: null });
                try {
                        const updatedUser = await authApi.updateUser(get().user!.id, userData);
                        set({ user: updatedUser, loading: false });
                        return true;
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                } catch (err: any) {
                        const errorMessage = err.response?.data?.message || err.message || "Failed to update profile";
                        set({ error: errorMessage, loading: false });
                        return false;
                }
        },

        logout: () => {
                // Clear all auth state synchronously
                set({
                        user: null,
                        accessToken: null,
                        refreshToken: null,
                        isAuthenticated: false,
                        error: null,
                        loading: false,
                });
                if (typeof window !== "undefined") {
                        localStorage.removeItem("accessToken");
                        localStorage.removeItem("refreshToken");
                }
                console.log("User logged out.");
        },

        initializeAuth: async () => {
                console.log("Initializing auth...");
                const { accessToken, refreshToken } = getInitialTokens();
                if (accessToken && refreshToken) {
                        set({ accessToken, refreshToken, isAuthenticated: true, loading: true });
                        // Fetch user profile to get current user data including role
                        await get().fetchProfile();
                        set({ loading: false });
                } else {
                        set({
                                user: null,
                                accessToken: null,
                                refreshToken: null,
                                isAuthenticated: false,
                                loading: false,
                        });
                }
        },

        clearError: () => {
                set({ error: null });
        },

        resendVerificationEmail: async (email: string) => {
                set({ loading: true, error: null });
                try {
                        console.log("Sending verification email to:", email);
                        await authApi.resendVerificationEmail(email);
                        console.log("Verification email sent successfully");
                        set({ loading: false, error: null });
                        return true;
                } catch (err) {
                        console.error("Resend verification email error:", err);
                        let errorMessage = "Failed to send verification email";

                        if (err && typeof err === "object" && "response" in err) {
                                const axiosError = err as {
                                        response?: {
                                                status?: number;
                                                data?: { message?: string; errorCode?: string };
                                        };
                                };

                                console.error("Axios error details:", {
                                        status: axiosError.response?.status,
                                        data: axiosError.response?.data,
                                });

                                errorMessage = axiosError.response?.data?.message || errorMessage;

                                // Handle specific error cases
                                if (
                                        axiosError.response?.data?.errorCode === "USER_NOT_FOUND" ||
                                        errorMessage.toLowerCase().includes("not found") ||
                                        errorMessage.toLowerCase().includes("user not found")
                                ) {
                                        errorMessage = "Email not found. Please check your email address.";
                                } else if (
                                        errorMessage.toLowerCase().includes("already activated") ||
                                        errorMessage.toLowerCase().includes("account is already")
                                ) {
                                        errorMessage = "This account is already activated. You can log in now.";
                                } else if (axiosError.response?.status === 404) {
                                        errorMessage = "Email not found. Please check your email address.";
                                } else if (axiosError.response?.status === 400) {
                                        errorMessage =
                                                errorMessage || "Invalid request. Please check your email address.";
                                }
                        } else if (err instanceof Error) {
                                errorMessage = err.message;
                        }

                        set({ error: errorMessage, loading: false });
                        return false;
                }
        },

        handleOAuthLogin: async (accessToken: string) => {
                set({ loading: true, error: null });
                try {
                        // Set the access token (OAuth doesn't provide refresh token in this flow)
                        // Store accessToken as both access and refresh for now
                        // Backend should handle token refresh separately if needed
                        get().setTokens(accessToken, accessToken);
                        // Fetch user profile to complete login
                        await get().fetchProfile();
                        set({ loading: false });
                        return true;
                } catch (err) {
                        console.error("OAuth login error:", err);
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const errorMessage =
                                (err as any).response?.data?.message || (err as any).message || "OAuth login failed";
                        set({ error: errorMessage, loading: false, isAuthenticated: false });
                        return false;
                }
        },
}));
