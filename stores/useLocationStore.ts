"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface LocationAddress {
    id: string;
    address: string;
    lat: number;
    lng: number;
    isDefault?: boolean;
    isCurrentLocation?: boolean;
}

interface LocationState {
    currentAddress: LocationAddress | null;
    isLocationSet: boolean;
    isLoading: boolean;
    setCurrentAddress: (address: LocationAddress) => void;
    setCurrentLocation: (lat: number, lng: number, address?: string) => void;
    clearLocation: () => void;
    setLoading: (loading: boolean) => void;
}

// Default addresses in Ho Chi Minh City with coordinates
export const DEFAULT_ADDRESSES: LocationAddress[] = [
    {
        id: "default-1",
        address: "District 1, Ho Chi Minh City",
        lat: 10.7769,
        lng: 106.7009,
        isDefault: false,
    },
    {
        id: "default-2",
        address: "District 3, Ho Chi Minh City",
        lat: 10.7830,
        lng: 106.6952,
        isDefault: false,
    },
    {
        id: "default-3",
        address: "District 7, Ho Chi Minh City",
        lat: 10.7308,
        lng: 106.7179,
        isDefault: false,
    },
    {
        id: "default-4",
        address: "Binh Thanh District, Ho Chi Minh City",
        lat: 10.8033,
        lng: 106.7120,
        isDefault: false,
    },
    {
        id: "default-5",
        address: "Tan Binh District, Ho Chi Minh City",
        lat: 10.8014,
        lng: 106.6483,
        isDefault: false,
    },
];

// Fallback default location (District 1 center)
const FALLBACK_LOCATION: LocationAddress = {
    id: "fallback",
    address: "District 1, Ho Chi Minh City",
    lat: 10.7769,
    lng: 106.7009,
    isDefault: true,
};

export const useLocationStore = create<LocationState>()(
    persist(
        (set) => ({
            currentAddress: null,
            isLocationSet: false,
            isLoading: false,

            setCurrentAddress: (address: LocationAddress) => {
                set({
                    currentAddress: address,
                    isLocationSet: true,
                });
            },

            setCurrentLocation: (lat: number, lng: number, address?: string) => {
                set({
                    currentAddress: {
                        id: `current-${Date.now()}`,
                        address: address || "Current Location",
                        lat,
                        lng,
                        isCurrentLocation: true,
                    },
                    isLocationSet: true,
                });
            },

            clearLocation: () => {
                set({
                    currentAddress: null,
                    isLocationSet: false,
                });
            },

            setLoading: (loading: boolean) => {
                set({ isLoading: loading });
            },
        }),
        {
            name: "location-storage",
            // cSpell:ignore partialize
            partialize: (state) => ({
                currentAddress: state.currentAddress,
                isLocationSet: state.isLocationSet,
            }),
        }
    )
);

// Helper function to initialize default location if needed
export const initializeDefaultLocation = () => {
    const state = useLocationStore.getState();
    if (!state.isLocationSet || !state.currentAddress) {
        useLocationStore.setState({
            currentAddress: FALLBACK_LOCATION,
            isLocationSet: true,
        });
    }
};

