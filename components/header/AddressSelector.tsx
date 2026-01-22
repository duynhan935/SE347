"use client";

import { authApi } from "@/lib/api/authApi";
import { useAuthStore } from "@/stores/useAuthStore";
import { DEFAULT_ADDRESSES, LocationAddress, useLocationStore } from "@/stores/useLocationStore";
import { Address } from "@/types";
import { ChevronDown, MapPin, Navigation } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

export default function AddressSelector() {
    const { user, isAuthenticated } = useAuthStore();
    const { currentAddress, setCurrentAddress, setCurrentLocation, setLoading } = useLocationStore();
    const [isOpen, setIsOpen] = useState(false);
    const [userAddresses, setUserAddresses] = useState<Address[]>([]);
    const [isGettingLocation, setIsGettingLocation] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Fetch user addresses when authenticated
    useEffect(() => {
        if (isAuthenticated && user?.id) {
            authApi
                .getUserAddresses(user.id)
                .then((addresses) => {
                    if (Array.isArray(addresses) && addresses.length > 0) {
                        setUserAddresses(addresses);
                        // If no current address is set, use first user address
                        if (!currentAddress) {
                            const firstAddress = addresses[0];
                            setCurrentAddress({
                                id: firstAddress.id,
                                address: firstAddress.location,
                                lat: firstAddress.latitude,
                                lng: firstAddress.longitude,
                            });
                        }
                    }
                })
                .catch((error) => {
                    console.warn("Failed to fetch user addresses:", error);
                });
        }
    }, [isAuthenticated, user?.id, currentAddress, setCurrentAddress]);

    // Initialize with default if no location is set
    useEffect(() => {
        if (!currentAddress) {
            setCurrentAddress(DEFAULT_ADDRESSES[0]);
        }
    }, [currentAddress, setCurrentAddress]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    const handleAddressSelect = async (address: LocationAddress) => {
        // Set current address immediately for better UX
        setCurrentAddress(address);
        setIsOpen(false);
        
        // If user is authenticated, save address to database if it doesn't exist
        if (isAuthenticated && user?.id) {
            try {
                // Check if address already exists in user addresses
                const addressExists = userAddresses.some(
                    (userAddr) =>
                        userAddr.location === address.address &&
                        Math.abs(userAddr.latitude - address.lat) < 0.0001 &&
                        Math.abs(userAddr.longitude - address.lng) < 0.0001
                );

                // If address doesn't exist, save it
                if (!addressExists) {
                    try {
                        const savedAddress = await authApi.addAddress(user.id, {
                            location: address.address,
                            latitude: address.lat,
                            longitude: address.lng,
                        });

                        // Update user addresses list
                        const updatedAddresses = await authApi.getUserAddresses(user.id);
                        setUserAddresses(updatedAddresses);

                        // Update current address with saved ID
                        setCurrentAddress({
                            ...address,
                            id: savedAddress.id,
                        });

                        toast.success(`Address saved: ${address.address}`);
                    } catch (saveError) {
                        console.error("Failed to save address:", saveError);
                        // Still show success for setting location, but warn about save failure
                        toast.success(`Delivery location set to: ${address.address}`, {
                            icon: "⚠️",
                        });
                    }
                } else {
                    // Address already exists, just show success
                    toast.success(`Delivery location set to: ${address.address}`);
                }
            } catch (error) {
                console.error("Error checking/saving address:", error);
                // Still show success for setting location
                toast.success(`Delivery location set to: ${address.address}`);
            }
        } else {
            // User not authenticated, just set location
            toast.success(`Delivery location set to: ${address.address}`);
        }
    };

    // Reverse geocoding: Convert lat/lng to address string
    const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
        try {
            // Using OpenStreetMap Nominatim API (free, no API key required)
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
                {
                    headers: {
                        "User-Agent": "FoodEats/1.0", // Required by Nominatim
                    },
                },
            );
            const data = await response.json();

            if (data.address) {
                // Build readable address from components
                const address = data.address;
                const parts: string[] = [];

                if (address.road) parts.push(address.road);
                if (address.house_number) parts.unshift(address.house_number);
                if (address.suburb || address.neighbourhood) parts.push(address.suburb || address.neighbourhood);
                if (address.city || address.town || address.village)
                    parts.push(address.city || address.town || address.village);
                if (address.state) parts.push(address.state);

                if (parts.length > 0) {
                    return parts.join(", ");
                }

                // Fallback to display name
                if (data.display_name) {
                    return data.display_name.split(",").slice(0, 3).join(", "); // Take first 3 parts
                }
            }

            return `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`;
        } catch (error) {
            console.warn("Reverse geocoding failed:", error);
            // Return formatted coordinates as fallback
            return `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`;
        }
    };

    const handleGetCurrentLocation = async () => {
        if (!("geolocation" in navigator)) {
            toast.error("Geolocation is not supported by your browser");
            return;
        }

        if (!isAuthenticated || !user?.id) {
            toast.error("Please sign in to save your location");
            return;
        }

        setIsGettingLocation(true);
        setLoading(true);

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const { latitude, longitude } = position.coords;

                    // Reverse geocode to get address string
                    const addressText = await reverseGeocode(latitude, longitude);

                    // Save address to user's address list
                    try {
                        const savedAddress = await authApi.addAddress(user.id, {
                            location: addressText,
                            latitude,
                            longitude,
                        });

                        // Update user addresses list
                        const updatedAddresses = await authApi.getUserAddresses(user.id);
                        setUserAddresses(updatedAddresses);

                        // Set as current location in store
                        const locationAddress: LocationAddress = {
                            id: savedAddress.id,
                            address: addressText,
                            lat: latitude,
                            lng: longitude,
                        };
                        setCurrentAddress(locationAddress);

                        setIsOpen(false);
                        setIsGettingLocation(false);
                        setLoading(false);
                        toast.success(`Location saved: ${addressText}`);
                    } catch (saveError: unknown) {
                        console.error("Failed to save address:", saveError);
                        // Still set location even if save fails
                        setCurrentLocation(latitude, longitude, addressText);
                        setIsOpen(false);
                        setIsGettingLocation(false);
                        setLoading(false);
                        toast.error("Location set but failed to save. Please try again.");
                    }
                } catch (error) {
                    setIsGettingLocation(false);
                    setLoading(false);
                    toast.error("Failed to process location");
                }
            },
            (error) => {
                setIsGettingLocation(false);
                setLoading(false);
                let errorMessage = "Failed to get your location";
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage =
                            "Location permission denied. Please enable location access in your browser settings.";
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = "Location information unavailable. Please check your GPS/network.";
                        break;
                    case error.TIMEOUT:
                        errorMessage = "Location request timed out. Please try again.";
                        break;
                }
                toast.error(errorMessage);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000, // Cache for 5 minutes
            },
        );
    };

    const displayAddress = currentAddress?.address || "Select address";
    const displayText = displayAddress.length > 30 ? `${displayAddress.substring(0, 30)}...` : displayAddress;

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="hidden lg:flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-gray-200 hover:border-[#EE4D2D]/50 transition-all duration-200 text-sm font-medium text-gray-700 min-w-[180px] max-w-[240px]"
            >
                <MapPin className="w-4 h-4 text-[#EE4D2D] flex-shrink-0" />
                <span className="truncate text-left flex-1 text-xs">
                    {currentAddress ? `Deliver to: ${displayText}` : "Deliver to: Select address"}
                </span>
                <ChevronDown
                    className={`w-3.5 h-3.5 text-gray-400 flex-shrink-0 transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                    }`}
                />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-[320px] bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
                    <div className="p-3 border-b border-gray-100">
                        <h3 className="text-sm font-semibold text-gray-800">Select delivery address</h3>
                    </div>
                    <div className="max-h-[400px] overflow-y-auto">
                        {/* Current Location Button */}
                        <button
                            onClick={handleGetCurrentLocation}
                            disabled={isGettingLocation}
                            className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <div className="flex items-center gap-3">
                                <Navigation className="w-4 h-4 text-[#EE4D2D] mt-0.5 flex-shrink-0" />
                                <span className="text-sm font-medium text-[#EE4D2D]">
                                    {isGettingLocation ? "Getting location..." : "📍 Use Current Location"}
                                </span>
                            </div>
                        </button>

                        {/* User Addresses */}
                        {/* User Addresses */}
                        {userAddresses.length > 0 && (
                            <>
                                <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                                    <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                        My Addresses
                                    </h4>
                                </div>
                                {userAddresses.map((address) => {
                                    const locationAddress: LocationAddress = {
                                        id: address.id,
                                        address: address.location,
                                        lat: address.latitude,
                                        lng: address.longitude,
                                    };
                                    const isSelected = currentAddress?.id === address.id;
                                    return (
                                        <button
                                            key={address.id}
                                            onClick={() => handleAddressSelect(locationAddress)}
                                            className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0 ${
                                                isSelected ? "bg-[#EE4D2D]/5" : ""
                                            }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <MapPin
                                                    className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                                                        isSelected ? "text-[#EE4D2D]" : "text-gray-400"
                                                    }`}
                                                />
                                                <span
                                                    className={`text-sm ${
                                                        isSelected ? "font-medium text-[#EE4D2D]" : "text-gray-700"
                                                    }`}
                                                >
                                                    {address.location}
                                                </span>
                                            </div>
                                        </button>
                                    );
                                })}
                            </>
                        )}

                        {/* Default Addresses */}
                        {userAddresses.length > 0 && (
                            <div className="px-4 py-2 bg-gray-50 border-y border-gray-100">
                                <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                    Popular Areas
                                </h4>
                            </div>
                        )}
                        {DEFAULT_ADDRESSES.map((address) => {
                            const isSelected = currentAddress?.id === address.id;
                            return (
                                <button
                                    key={address.id}
                                    onClick={() => handleAddressSelect(address)}
                                    className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0 ${
                                        isSelected ? "bg-[#EE4D2D]/5" : ""
                                    }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <MapPin
                                            className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                                                isSelected ? "text-[#EE4D2D]" : "text-gray-400"
                                            }`}
                                        />
                                        <span
                                            className={`text-sm ${
                                                isSelected ? "font-medium text-[#EE4D2D]" : "text-gray-700"
                                            }`}
                                        >
                                            {address.address}
                                        </span>
                                    </div>
                                </button>
                            );
                        })}

                        {/* Add New Address Button */}
                        {isAuthenticated && (
                            <button
                                onClick={() => {
                                    window.location.href = "/account/addresses";
                                    setIsOpen(false);
                                }}
                                className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-t border-gray-100"
                            >
                                <div className="flex items-center gap-3">
                                    <MapPin className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                                    <span className="text-sm font-medium text-purple-600">+ Add new address</span>
                                </div>
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
