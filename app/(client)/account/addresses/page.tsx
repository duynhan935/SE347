"use client";

import AddressAutocomplete from "@/components/AddressAutocomplete";
import Button from "@/components/Button";
import { useConfirm } from "@/components/ui/ConfirmModal";
import { authApi } from "@/lib/api/authApi";
import { useAuthStore } from "@/stores/useAuthStore";
import { Address, AddressRequest } from "@/types";
import { Loader2, MapPin, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function AddressesPage() {
    const { user, loading: authLoading } = useAuthStore();
    const confirmAction = useConfirm();
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [isLocating, setIsLocating] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [newAddress, setNewAddress] = useState<AddressRequest>({
        location: "",
        longitude: 0,
        latitude: 0,
    });

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted && user?.id && !authLoading) {
            fetchAddresses();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mounted, user?.id, authLoading]);

    const fetchAddresses = async () => {
        if (!user?.id) return;

        setLoading(true);
        try {
            const data = await authApi.getUserAddresses(user.id);
            // Ensure data is always an array
            if (Array.isArray(data)) {
                setAddresses(data);
            } else {
                console.warn("Addresses data is not an array:", data);
                setAddresses([]);
            }
        } catch (error) {
            console.error("Error fetching addresses:", error);
            let errorMessage = "Failed to load addresses";
            if (error && typeof error === "object" && "response" in error) {
                const axiosError = error as {
                    response?: { data?: { message?: string } };
                    message?: string;
                };
                errorMessage = axiosError.response?.data?.message || axiosError.message || errorMessage;
            } else if (error instanceof Error) {
                errorMessage = error.message;
            }
            toast.error(errorMessage);
            // Set empty array on error to prevent map error
            setAddresses([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAddAddress = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.id) {
            toast.error("User information not available");
            return;
        }

        if (!newAddress.location.trim()) {
            toast.error("Please enter an address");
            return;
        }

        // Validate that coordinates are set
        if (!newAddress.latitude || !newAddress.longitude || newAddress.latitude === 0 || newAddress.longitude === 0) {
            toast.error("Please select an address from the suggestions to automatically get coordinates");
            return;
        }

        setSubmitting(true);
        try {
            await authApi.addAddress(user.id, {
                ...newAddress,
            });
            toast.success("Address added successfully!");
            setNewAddress({ location: "", longitude: 0, latitude: 0 });
            setIsAdding(false);
            fetchAddresses();
        } catch (error) {
            let errorMessage = "Failed to add address";
            if (error && typeof error === "object" && "response" in error) {
                const axiosError = error as {
                    response?: { data?: { message?: string } };
                    message?: string;
                };
                errorMessage = axiosError.response?.data?.message || axiosError.message || errorMessage;
            } else if (error instanceof Error) {
                errorMessage = error.message;
            }
            toast.error(errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    const handleUseCurrentLocation = async () => {
        if (submitting || isLocating) {
            return;
        }

        if (typeof window === "undefined" || !navigator?.geolocation) {
            toast.error("Geolocation is not supported by your browser");
            return;
        }

        setIsLocating(true);

        try {
            const coords = await new Promise<GeolocationCoordinates>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(
                    (pos) => resolve(pos.coords),
                    (err) => reject(err),
                    {
                        enableHighAccuracy: true,
                        timeout: 10000,
                        maximumAge: 30000,
                    },
                );
            });

            // Reverse geocode to get address string
            try {
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.latitude}&lon=${coords.longitude}&zoom=18&addressdetails=1&accept-language=en`,
                    {
                        headers: {
                            "User-Agent": "FoodEats/1.0",
                        },
                    },
                );
                const data = await response.json();

                let addressText = "";
                if (data.address) {
                    const address = data.address;
                    const parts: string[] = [];
                    if (address.house_number) parts.push(address.house_number);
                    if (address.road) parts.push(address.road);
                    if (address.suburb || address.neighbourhood) parts.push(address.suburb || address.neighbourhood);
                    if (address.city || address.town || address.village)
                        parts.push(address.city || address.town || address.village);
                    if (address.state) parts.push(address.state);
                    addressText = parts.length > 0 ? parts.join(", ") : data.display_name || "";
                } else if (data.display_name) {
                    addressText = data.display_name;
                }

                if (addressText) {
                    setNewAddress({
                        location: addressText,
                        latitude: coords.latitude,
                        longitude: coords.longitude,
                    });
                    toast.success("Current location retrieved successfully!");
                } else {
                    setNewAddress({
                        location: "",
                        latitude: coords.latitude,
                        longitude: coords.longitude,
                    });
                    toast.success("Coordinates retrieved. Please enter an address.");
                }
            } catch (geocodeError) {
                console.error("Reverse geocoding failed:", geocodeError);
                setNewAddress({
                    location: "",
                    latitude: coords.latitude,
                    longitude: coords.longitude,
                });
                toast.success("Coordinates retrieved. Please enter an address.");
            }
        } catch (error) {
            const geoError = error as { code?: number; message?: string };
            if (geoError?.code === 1) {
                toast.error("Location permission denied. Please allow location access and try again.");
            } else if (geoError?.code === 2) {
                toast.error("Unable to determine location. Please try again.");
            } else if (geoError?.code === 3) {
                toast.error("Location request timed out. Please try again.");
            } else {
                toast.error(geoError?.message || "Failed to get current location");
            }
        } finally {
            setIsLocating(false);
        }
    };

    const handleAddressChange = (address: string, latitude: number, longitude: number) => {
        setNewAddress({
            location: address,
            latitude,
            longitude,
        });
    };

    const handleDeleteAddress = async (addressId: string) => {
        const ok = await confirmAction({
            title: "Delete address?",
            description: "This address will be removed from your account.",
            confirmText: "Delete",
            cancelText: "Cancel",
            variant: "danger",
        });
        if (!ok) {
            return;
        }

        try {
            await authApi.deleteAddress(addressId);
            toast.success("Address deleted successfully!");
            fetchAddresses();
        } catch (error) {
            let errorMessage = "Failed to delete address";
            if (error && typeof error === "object" && "response" in error) {
                const axiosError = error as {
                    response?: { data?: { message?: string } };
                    message?: string;
                };
                errorMessage = axiosError.response?.data?.message || axiosError.message || errorMessage;
            } else if (error instanceof Error) {
                errorMessage = error.message;
            }
            toast.error(errorMessage);
        }
    };

    if (!mounted || authLoading || loading) {
        return (
            <div className="bg-white p-8 rounded-lg shadow-md flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-[#EE4D2D]" />
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold mb-2">My Addresses</h1>
                    <p className="text-gray-500">Manage your delivery addresses</p>
                </div>
                <Button
                    onClickFunction={() => setIsAdding(!isAdding)}
                    className="bg-[#EE4D2D] text-white hover:bg-[#EE4D2D]/90 cursor-pointer flex items-center gap-2"
                >
                    <Plus size={20} />
                    {isAdding ? "Cancel" : "Add Address"}
                </Button>
            </div>

            {/* Add Address Form */}
            {isAdding && (
                <div className="border-t pt-6">
                    <h2 className="text-xl font-semibold mb-4">Add New Address</h2>
                    <form onSubmit={handleAddAddress} className="space-y-4 max-w-2xl">
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Address <span className="text-red-500">*</span>
                            </label>
                            <AddressAutocomplete
                                value={newAddress.location}
                                onChange={handleAddressChange}
                                placeholder="Enter address (e.g., 123 Main Street, Ho Chi Minh City)..."
                                disabled={submitting}
                            />
                            <p className="mt-2 text-xs text-gray-500">
                                Enter an address and select from suggestions. Coordinates will be automatically retrieved.
                            </p>

                            {(newAddress.latitude !== 0 || newAddress.longitude !== 0) && (
                                <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
                                    <p className="text-xs text-green-700">
                                        <span className="font-semibold">Coordinates retrieved:</span> Lat:{" "}
                                        {newAddress.latitude.toFixed(6)}, Lng: {newAddress.longitude.toFixed(6)}
                                    </p>
                                </div>
                            )}

                            <div className="mt-3">
                                <button
                                    type="button"
                                    onClick={handleUseCurrentLocation}
                                    disabled={submitting || isLocating}
                                    className="inline-flex items-center gap-2 rounded-md border border-[#EE4D2D]/30 bg-[#EE4D2D]/10 px-3 py-2 text-sm font-semibold text-[#EE4D2D] hover:bg-[#EE4D2D]/15 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLocating ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <MapPin className="h-4 w-4" />
                                    )}
                                    Use Current Location
                                </button>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <Button
                                type="submit"
                                className="bg-[#EE4D2D] text-white hover:bg-[#EE4D2D]/90 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={submitting}
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                                        Adding...
                                    </>
                                ) : (
                                    "Add Address"
                                )}
                            </Button>
                            <Button
                                type="button"
                                onClickFunction={() => {
                                    setIsAdding(false);
                                    setNewAddress({
                                        location: "",
                                        longitude: 0,
                                        latitude: 0,
                                    });
                                }}
                                className="bg-gray-100 text-gray-800 hover:bg-gray-200 cursor-pointer"
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                </div>
            )}

            {/* Addresses List */}
            <div className="border-t pt-6">
                {!addresses || addresses.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="mb-6">
                            <svg
                                width="120"
                                height="120"
                                viewBox="0 0 120 120"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className="mx-auto text-gray-300"
                            >
                                <circle cx="60" cy="60" r="50" fill="currentColor" opacity="0.1" />
                                <path
                                    d="M60 30C45.6406 30 34 41.6406 34 56C34 70.3594 60 90 60 90C60 90 86 70.3594 86 56C86 41.6406 74.3594 30 60 30ZM60 65C55.5817 65 52 61.4183 52 57C52 52.5817 55.5817 49 60 49C64.4183 49 68 52.5817 68 57C68 61.4183 64.4183 65 60 65Z"
                                    fill="currentColor"
                                    opacity="0.3"
                                />
                            </svg>
                        </div>
                        <p className="text-gray-500 text-lg font-semibold mb-2">No addresses saved yet</p>
                        <p className="text-gray-400 text-sm">Add your first address to get started</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Array.isArray(addresses) &&
                            addresses.map((address) => (
                                <div
                                    key={address.id}
                                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <MapPin className="w-5 h-5 text-[#EE4D2D]" />
                                                <h3 className="font-semibold text-gray-800">Address</h3>
                                            </div>
                                            <p className="text-gray-600 text-sm mb-2">{address.location}</p>
                                            {address.longitude && address.latitude && (
                                                <p className="text-xs text-gray-400">
                                                    Coordinates: {address.latitude.toFixed(4)},{" "}
                                                    {address.longitude.toFixed(4)}
                                                </p>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => handleDeleteAddress(address.id)}
                                            className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                                            title="Delete address"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                    </div>
                )}
            </div>
        </div>
    );
}
