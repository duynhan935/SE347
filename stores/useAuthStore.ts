// eslint-disable @typescript-eslint/no-explicit-any
import { authApi } from "@/lib/api/authApi";
import { User } from "@/types";
import { create } from "zustand";

interface AuthState {
    user: User | null;
    accessToken: string | null;
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
    setAccessToken: (access: string | null) => void;
    fetchProfile: () => Promise<void>;
    updateProfile: (userData: { username: string; phone: string }) => Promise<boolean>;
    initializeAuth: () => Promise<void>;
    clearError: () => void;
    resendVerificationEmail: (email: string) => Promise<boolean>;
    handleOAuthLogin: (accessToken: string) => Promise<boolean>;
}

const getInitialTokens = (): { accessToken: string | null } => {
    if (typeof window !== "undefined") {
        const accessToken = localStorage.getItem("accessToken");
        return { accessToken };
    }
    return { accessToken: null };
};

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    accessToken: getInitialTokens().accessToken,
    isAuthenticated: !!getInitialTokens().accessToken,
    loading: false,
    error: null,
    isLoggingOut: false,

    setAccessToken: (access) => {
        set({ accessToken: access, isAuthenticated: !!access });
        if (typeof window !== "undefined") {
            if (access) localStorage.setItem("accessToken", access);
            else localStorage.removeItem("accessToken");
        }
    },

    login: async (credentials) => {
        set({ loading: true, error: null });
        try {
            const { accessToken } = await authApi.login(credentials);
            // Save access token; refresh token is stored in HttpOnly cookie by backend
            get().setAccessToken(accessToken);
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
        const logoutApiCall = async () => {
            try {
                await authApi.logout();
            } catch (err) {
                console.error("Logout API call failed:", err);
            }
        };
        logoutApiCall();
        set({
            user: null,
            accessToken: null,
            isAuthenticated: false,
            error: null,
            loading: false,
            isLoggingOut: true,
        });
        if (typeof window !== "undefined") {
            localStorage.removeItem("accessToken");
            // Reset isLoggingOut after a short delay
            setTimeout(() => {
                set({ isLoggingOut: false });
            }, 2000);
        }
        console.log("User logged out.");
    },

    initializeAuth: async () => {
        // Quick check - if no tokens, skip immediately
        const { accessToken } = getInitialTokens();
        if (!accessToken) {
            set({
                user: null,
                accessToken: null,
                isAuthenticated: false,
                loading: false,
            });
            return;
        }

        // Set tokens immediately for faster UI response
        set({ accessToken, isAuthenticated: true, loading: true });

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
                    errorMessage = errorMessage || "Invalid request. Please check your email address.";
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
            // OAuth flow provides access token; refresh still relies on backend cookie strategy
            get().setAccessToken(accessToken);
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
            const errorMessage = axiosError.response?.data?.message || axiosError.message || "OAuth login failed";
            set({ error: errorMessage, loading: false, isAuthenticated: false });
            return false;
        }
    },
}));
