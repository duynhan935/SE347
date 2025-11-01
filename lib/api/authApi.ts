import { User } from "@/types";
import api from "../axios";

interface LoginResponse {
        accessToken: string;
        refreshToken: string;
}

interface RegisterResponse {
        message: string;
}

export const authApi = {
        login: async (credentials: { email?: string; password?: string }) => {
                const response = await api.post<LoginResponse>("/users/login", credentials);
                return response.data;
        },
        register: async (userData: {
                username: string;
                email: string;
                password?: string;
                confirmPassword?: string;
                role?: "USER" | "MERCHANT" | "ADMIN";
        }) => {
                const registerPayload = {
                        username: userData.username,
                        email: userData.email,
                        password: userData.password,
                        confirmPassword: userData.confirmPassword,
                        role: userData.role || "USER",
                };
                const response = await api.post<RegisterResponse>("/users/register", userData);
                return response.data;
        },
        fetchUserProfile: async (id: string) => {
                const response = await api.get<User>(`/users/${id}`);
                return response.data;
        },
};
