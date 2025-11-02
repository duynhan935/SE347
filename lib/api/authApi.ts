import { Address, AddressRequest, User, UserUpdateAfterLogin } from "@/types";
import api from "../axios";

interface LoginResponse {
        accessToken: string;
        refreshToken: string;
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

interface AddressResponse {
        id: string;
        location: string;
        longitude: number;
        latitude: number;
        user: User;
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
                const response = await api.post(`/users/email?email=${email}`);
                return response.data;
        },

        // Token endpoints
        getUserByAccessToken: async () => {
                const response = await api.get<User>("/users/accesstoken");
                return response.data;
        },
        refreshAccessToken: async (refreshToken: string) => {
                const response = await api.get<RefreshTokenResponse>("/users/refreshtoken", {
                        headers: {
                                "Refresh-Token": refreshToken,
                        },
                });
                // The backend returns message field with the new access token
                return response.data.message;
        },

        // User endpoints
        getAllUsers: async () => {
                const response = await api.get<User[]>("/users");
                return response.data;
        },
        getUserById: async (id: string) => {
                const response = await api.get<User>(`/users/${id}`);
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
                const response = await api.get<Address[]>(`/users/addresses/${userId}`);
                return response.data;
        },
};
