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
        isLoggingOut: boolean;

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
        isLoggingOut: false,

        setTokens: (access, refresh) => {
                // Set tokens and authentication state immediately
                set({
                        accessToken: access,
                        refreshToken: refresh,
                        isAuthenticated: !!access,
                });
                if (typeof window !== "undefined") {
                        localStorage.setItem("accessToken", access);
                        localStorage.setItem("refreshToken", refresh);
                }
        },

        login: async (credentials) => {
                set({ loading: true, error: null });
                try {
                        const { accessToken, refreshToken } = await authApi.login(credentials);
                        // Set tokens first to mark as authenticated immediately
                        get().setTokens(accessToken, refreshToken);
                        // Fetch profile in background - don't block login success
                        // Use Promise.race with timeout to prevent hanging
                        const profilePromise = get().fetchProfile();
                        const timeoutPromise = new Promise<void>((resolve) => {
                                setTimeout(() => resolve(), 5000); // 5 second timeout
                        });
                        try {
                                await Promise.race([profilePromise, timeoutPromise]);
                        } catch (profileError) {
                                // Log but don't fail login if profile fetch fails
                                console.warn("Profile fetch failed during login:", profileError);
                        }
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
                        set({ user: null, isAuthenticated: false, loading: false });
                        return;
                }
                try {
                        // Use getUserByAccessToken endpoint which extracts user from token automatically
                        const userData = await authApi.getUserByAccessToken();
                        set({ user: userData, error: null, isAuthenticated: true, loading: false });
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                } catch (err: any) {
                        // Check if it's a timeout error
                        const isTimeout = err.code === "ECONNABORTED" || err.message?.includes("timeout");

                        // Only log non-timeout errors
                        if (!isTimeout) {
                                console.error("Failed to fetch user profile:", err);
                        }

                        // For timeout errors, don't clear tokens - might just be slow network
                        // Only clear tokens for actual authentication errors (401, 403)
                        const isAuthError = err.response?.status === 401 || err.response?.status === 403;

                        if (isAuthError && !isTimeout) {
                                // If token is invalid, clear everything
                                set({
                                        error: "Failed to load user profile.",
                                        user: null,
                                        isAuthenticated: false,
                                        loading: false,
                                });
                                // Clear invalid tokens
                                if (typeof window !== "undefined") {
                                        localStorage.removeItem("accessToken");
                                        localStorage.removeItem("refreshToken");
                                }
                        } else {
                                // For timeout or other errors, just set loading to false
                                // Keep tokens and authentication state
                                set({ loading: false });
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
                set({
                        user: null,
                        accessToken: null,
                        refreshToken: null,
                        isAuthenticated: false,
                        error: null,
                        loading: false,
                        isLoggingOut: true,
                });
                if (typeof window !== "undefined") {
                        localStorage.removeItem("accessToken");
                        localStorage.removeItem("refreshToken");
                        // Reset isLoggingOut after a short delay
                        setTimeout(() => {
                                set({ isLoggingOut: false });
                        }, 2000);
                }
                console.log("User logged out.");
        },

        initializeAuth: async () => {
                // Quick check - if no tokens, skip immediately
                const { accessToken, refreshToken } = getInitialTokens();
                if (!accessToken || !refreshToken) {
                        set({
                                user: null,
                                accessToken: null,
                                refreshToken: null,
                                isAuthenticated: false,
                                loading: false,
                        });
                        return;
                }

                // Set tokens immediately for faster UI response
                set({ accessToken, refreshToken, isAuthenticated: true, loading: true });

                try {
                        // Fetch user profile in background - don't block if it fails
                        // Use Promise.race with timeout to prevent hanging
                        const profilePromise = get().fetchProfile();
                        const timeoutPromise = new Promise<never>((_, reject) => {
                                setTimeout(() => reject(new Error("Profile fetch timeout")), 10000);
                        });

                        await Promise.race([profilePromise, timeoutPromise]);
                } catch (err) {
                        // Silently handle errors - fetchProfile already handles cleanup
                        // Check if it's a timeout error
                        const isTimeout = err instanceof Error && err.message === "Profile fetch timeout";

                        // Only log non-timeout errors in development, or if it's a real API error
                        if (process.env.NODE_ENV === "development" && !isTimeout) {
                                console.error("Error during auth initialization:", err);
                        }

                        // Ensure loading is cleared
                        const currentState = get();
                        if (currentState.loading) {
                                set({ loading: false });
                        }

                        // If timeout, don't clear tokens - might just be slow network
                        // fetchProfile will handle invalid token cleanup
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
                        const axiosError = err as {
                                response?: { data?: { message?: string } };
                                message?: string;
                        };
                        const errorMessage =
                                axiosError.response?.data?.message || axiosError.message || "OAuth login failed";
                        set({ error: errorMessage, loading: false, isAuthenticated: false });
                        return false;
                }
        },
}));
