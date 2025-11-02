import { Address, User, UserUpdateAfterLogin } from "@/types";
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

export const authApi = {
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
        fetchUserProfile: async (id: string) => {
                const response = await api.get<User>(`/users/${id}`);
                return response.data;
        },
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
        confirmAccount: async (code: string) => {
                const response = await api.get(`/users/confirmation?code=${code}`);
                return response.data;
        },
        resendVerificationEmail: async (email: string) => {
                const response = await api.post(`/users/email?email=${email}`);
                return response.data;
        },
        updateUserAfterLogin: async (id: string, userData: UserUpdateAfterLogin) => {
                const response = await api.put<User>(`/users/profile/${id}`, userData);
                return response.data;
        },
        getUserAddresses: async (id: string) => {
                const response = await api.get<Address[]>(`/users/addresses/${id}`);
                return response.data;
        },
};
