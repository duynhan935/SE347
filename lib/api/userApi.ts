import api from "../axios";
import { User } from "@/types";

export interface Address {
    id: string;
    userId: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    isDefault: boolean;
}

export interface AddressData {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    isDefault?: boolean;
}

export const userApi = {
    // Get user by ID
    getUserById: async (id: string) => {
        const response = await api.get<User>(`/api/users/admin/${id}`);
        return response.data;
    },

    // Update user profile
    updateUserProfile: async (id: string, userData: Partial<User>) => {
        const response = await api.put<User>(`/api/users/profile/${id}`, userData);
        return response.data;
    },

    // Update password
    updatePassword: async (id: string, passwordData: { oldPassword: string; newPassword: string }) => {
        const response = await api.put<User>(`/api/users/password/${id}`, passwordData);
        return response.data;
    },

    // Get user addresses
    getUserAddresses: async (userId: string) => {
        const response = await api.get<Address[]>(`/api/users/addresses/${userId}`);
        return response.data;
    },

    // Add address
    addAddress: async (userId: string, addressData: AddressData) => {
        const response = await api.post<Address>(`/api/users/address/${userId}`, addressData);
        return response.data;
    },

    // Delete address
    deleteAddress: async (addressId: string) => {
        const response = await api.delete(`/api/users/address/${addressId}`);
        return response.data;
    },
};
