import { Address, AddressRequest, PageableResponse, User, UserUpdateAfterLogin } from "@/types";
import api from "../axios";

interface LoginResponse {
    accessToken: string;
}

interface RegisterResponse {
    message: string;
}

interface RefreshTokenResponse {
    message: string;
}

interface UserUpdateRequest {
    username: string;
    phone: string;
}

interface PasswordUpdateRequest {
    password: string;
    confirmPassword: string;
}

// Backend Address response may include nested user object (circular reference)
interface AddressResponse {
    id: string;
    location: string;
    longitude: number;
    latitude: number;
    user?: User | unknown; // Nested user object (we don't need it, but backend returns it)
}

interface RejectionRequest {
    reason: string;
}

export const authApi = {
    // Authentication endpoints
    login: async (credentials: { username: string; password: string }) => {
        const response = await api.post<LoginResponse>("/users/login", credentials);
        return response.data;
    },
    register: async (userData: {
        username: string;
        email: string;
        password: string;
        confirmPassword: string;
        role: string;
    }) => {
        const response = await api.post<RegisterResponse>("/users/register", userData);
        return response.data;
    },
    confirmAccount: async (code: string) => {
        const response = await api.get(`/users/confirmation?code=${code}`);
        return response.data;
    },
    resendVerificationEmail: async (email: string) => {
        // Encode email properly for URL
        const encodedEmail = encodeURIComponent(email);
        const response = await api.post(`/users/email?email=${encodedEmail}`);
        return response.data;
    },

    // Token endpoints
    getUserByAccessToken: async () => {
        const response = await api.get<User>("/users/accesstoken", {
            timeout: 30000,
        });
        return response.data;
    },
    refreshAccessToken: async (refreshToken?: string) => {
        const response = await api.get<RefreshTokenResponse>("/users/refreshtoken", {
            // Backend primarily uses HttpOnly cookie refresh token; header is an optional fallback.
            headers: refreshToken
                ? {
                      "Refresh-Token": refreshToken,
                  }
                : undefined,
        });
        // The backend returns message field with the new access token
        return response.data.message;
    },
    getOneTimeToken: async () => {
        const response = await api.get<{ accessToken: string }>("/users/one-time-token");
        // Backend returns TokenResponse with accessToken field
        return response.data.accessToken;
    },

    // User endpoints
    getAllUsers: async (params?: { page?: number; size?: number; sort?: string }) => {
        const response = await api.get<PageableResponse<User>>("/users", {
            params,
        });
        return response.data;
    },
    getUserById: async (id: string) => {
        const response = await api.get<User>(`/users/admin/${id}`);
        return response.data;
    },
    updateUser: async (id: string, userData: UserUpdateRequest) => {
        const response = await api.put<User>(`/users/${id}`, userData);
        return response.data;
    },
    deleteUser: async (id: string) => {
        const response = await api.delete<{ message: string }>(`/users/${id}`);
        return response.data;
    },
    updateUserAfterLogin: async (id: string, userData: UserUpdateAfterLogin) => {
        const response = await api.put<User>(`/users/profile/${id}`, userData);
        return response.data;
    },
    resetPassword: async (id: string, passwordData: PasswordUpdateRequest) => {
        const response = await api.put<User>(`/users/password/${id}`, passwordData);
        return response.data;
    },

    // Roles
    getRoles: async () => {
        const response = await api.get<string[]>("/users/roles");
        return response.data;
    },

    // Merchant approval/rejection
    approveMerchant: async (id: string) => {
        const response = await api.put<{ message: string }>(`/users/approvement/${id}`);
        return response.data;
    },
    rejectMerchant: async (id: string, rejection: RejectionRequest) => {
        const response = await api.delete<{ message: string }>(`/users/rejection/${id}`, {
            data: rejection,
        });
        return response.data;
    },

    // Merchant approval queue
    getMerchantsPendingConsideration: async (params?: { page?: number; size?: number; sort?: string }) => {
        const response = await api.get<PageableResponse<User>>("/users/merchants/consideration", {
            params,
        });
        return response.data;
    },
    // Address endpoints
    addAddress: async (userId: string, address: AddressRequest) => {
        const response = await api.post<AddressResponse>(`/users/address/${userId}`, address);
        return response.data;
    },
    deleteAddress: async (addressId: string) => {
        const response = await api.delete<{ message: string }>(`/users/address/${addressId}`);
        return response.data;
    },
    getUserAddresses: async (userId: string) => {
        try {
            // Request raw response to handle potential circular reference issues
            const response = await api.get(`/users/addresses/${userId}`, {
                responseType: "text", // Get raw text response
            });

            // Parse JSON manually to handle circular references
            let data: unknown;
            try {
                data = JSON.parse(response.data as string);
            } catch (parseError) {
                console.error("Failed to parse addresses JSON:", parseError);
                // Try to extract addresses from potentially corrupted JSON
                // If response.data is already an object (shouldn't happen with responseType: text)
                if (typeof response.data === "object" && response.data !== null) {
                    data = response.data;
                } else {
                    return [];
                }
            }

            // Handle null or undefined
            if (!data) {
                console.warn("getUserAddresses: Response data is null or undefined");
                return [];
            }

            // Check if data is an array
            if (Array.isArray(data)) {
                // Map to extract only address fields, removing nested user object to avoid circular reference
                try {
                    return data.map((addr: AddressResponse) => {
                        // Safely extract fields, handling potential undefined values
                        const address: Address = {
                            id: addr?.id || "",
                            location: addr?.location || "",
                            longitude: typeof addr?.longitude === "number" ? addr.longitude : 0,
                            latitude: typeof addr?.latitude === "number" ? addr.latitude : 0,
                        };
                        return address;
                    });
                } catch (mapError) {
                    console.error("Failed to map addresses:", mapError);
                    return [];
                }
            }

            // If data is not an array, log and return empty array
            console.warn("getUserAddresses: Response data is not an array:", typeof data, Array.isArray(data));
            return [];
        } catch (error) {
            console.error("getUserAddresses: Error fetching addresses:", error);
            // Return empty array on any error
            return [];
        }
    },
};
