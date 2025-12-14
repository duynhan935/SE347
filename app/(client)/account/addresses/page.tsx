"use client";

import Button from "@/components/Button";
import { authApi } from "@/lib/api/authApi";
import { useAuthStore } from "@/stores/useAuthStore";
import { Address, AddressRequest } from "@/types";
import { Loader2, MapPin, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function AddressesPage() {
        const { user, loading: authLoading } = useAuthStore();
        const [addresses, setAddresses] = useState<Address[]>([]);
        const [loading, setLoading] = useState(true);
        const [isAdding, setIsAdding] = useState(false);
        const [submitting, setSubmitting] = useState(false);
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

                setSubmitting(true);
                try {
                        // For now, we'll use default coordinates. In a real app, you'd use a map API or geocoding
                        // You might want to integrate with Google Maps API or similar for lat/lng
                        await authApi.addAddress(user.id, {
                                ...newAddress,
                                longitude: newAddress.longitude || 106.6297, // Default Ho Chi Minh City coordinates
                                latitude: newAddress.latitude || 10.8231,
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

        const handleDeleteAddress = async (addressId: string) => {
                if (!confirm("Are you sure you want to delete this address?")) {
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
                                <Loader2 className="w-8 h-8 animate-spin text-brand-purple" />
                        </div>
                );
        }

        return (
                <div className="bg-white p-8 rounded-lg shadow-md space-y-6">
                        <div className="flex justify-between items-center">
                                <div>
                                        <h1 className="text-2xl font-bold mb-2">My Addresses</h1>
                                        <p className="text-gray-500">Manage your delivery addresses</p>
                                </div>
                                <Button
                                        onClickFunction={() => setIsAdding(!isAdding)}
                                        className="bg-brand-purple text-white hover:bg-brand-purple/90 cursor-pointer flex items-center gap-2"
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
                                                        <textarea
                                                                value={newAddress.location}
                                                                onChange={(e) =>
                                                                        setNewAddress({
                                                                                ...newAddress,
                                                                                location: e.target.value,
                                                                        })
                                                                }
                                                                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-purple focus:border-brand-purple disabled:opacity-50"
                                                                placeholder="Enter full address (street, ward, district, city)"
                                                                rows={3}
                                                                required
                                                                disabled={submitting}
                                                        />
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                                <label className="block text-sm font-medium mb-1">
                                                                        Longitude (optional)
                                                                </label>
                                                                <input
                                                                        type="number"
                                                                        step="any"
                                                                        value={newAddress.longitude || ""}
                                                                        onChange={(e) =>
                                                                                setNewAddress({
                                                                                        ...newAddress,
                                                                                        longitude:
                                                                                                parseFloat(
                                                                                                        e.target.value
                                                                                                ) || 0,
                                                                                })
                                                                        }
                                                                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-purple focus:border-brand-purple disabled:opacity-50"
                                                                        placeholder="106.6297"
                                                                        disabled={submitting}
                                                                />
                                                        </div>
                                                        <div>
                                                                <label className="block text-sm font-medium mb-1">
                                                                        Latitude (optional)
                                                                </label>
                                                                <input
                                                                        type="number"
                                                                        step="any"
                                                                        value={newAddress.latitude || ""}
                                                                        onChange={(e) =>
                                                                                setNewAddress({
                                                                                        ...newAddress,
                                                                                        latitude:
                                                                                                parseFloat(
                                                                                                        e.target.value
                                                                                                ) || 0,
                                                                                })
                                                                        }
                                                                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-purple focus:border-brand-purple disabled:opacity-50"
                                                                        placeholder="10.8231"
                                                                        disabled={submitting}
                                                                />
                                                        </div>
                                                </div>
                                                <div className="flex gap-4">
                                                        <Button
                                                                type="submit"
                                                                className="bg-brand-purple text-white hover:bg-brand-purple/90 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
                                        <div className="text-center py-12">
                                                <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                                <p className="text-gray-500 text-lg">No addresses saved yet</p>
                                                <p className="text-gray-400 text-sm mt-2">
                                                        Add your first address to get started
                                                </p>
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
                                                                                                <MapPin className="w-5 h-5 text-brand-purple" />
                                                                                                <h3 className="font-semibold text-gray-800">
                                                                                                        Address
                                                                                                </h3>
                                                                                        </div>
                                                                                        <p className="text-gray-600 text-sm mb-2">
                                                                                                {address.location}
                                                                                        </p>
                                                                                        {address.longitude &&
                                                                                                address.latitude && (
                                                                                                        <p className="text-xs text-gray-400">
                                                                                                                Coordinates:{" "}
                                                                                                                {address.latitude.toFixed(
                                                                                                                        4
                                                                                                                )}
                                                                                                                ,{" "}
                                                                                                                {address.longitude.toFixed(
                                                                                                                        4
                                                                                                                )}
                                                                                                        </p>
                                                                                                )}
                                                                                </div>
                                                                                <button
                                                                                        onClick={() =>
                                                                                                handleDeleteAddress(
                                                                                                        address.id
                                                                                                )
                                                                                        }
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
