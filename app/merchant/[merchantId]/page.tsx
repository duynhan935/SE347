"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/stores/useAuthStore";
import { useRestaurantStore } from "@/stores/useRestaurantStore";
import { Building, Loader2, MapPin, Pencil, PlusCircle } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import toast from "react-hot-toast";

export default function SelectRestaurantPage() {
        const router = useRouter();
        const params = useParams();
        const merchantId = params.merchantId as string;

        const { user } = useAuthStore();
        const loggedInMerchantId = user?.role === "MERCHANT" ? user.id : null;

        const { restaurants, loading, error, getRestaurantByMerchantId, setSelectedRestaurantId } =
                useRestaurantStore();

        useEffect(() => {
                if (!loggedInMerchantId || loggedInMerchantId !== merchantId) {
                        toast.error("Access Denied.", { id: "auth-err" });
                        // router.push('/login');
                        return;
                }

                // Fetch list nếu rỗng hoặc của merchant khác
                if (merchantId && (restaurants.length === 0 || restaurants[0]?.merchantId !== merchantId)) {
                        console.log("SelectPage: Fetching restaurant list for merchant:", merchantId);
                        getRestaurantByMerchantId(merchantId);
                }
        }, [merchantId, loggedInMerchantId, getRestaurantByMerchantId, restaurants, router]); // Thêm router

        const handleRestaurantSelect = (restaurant: { id: string; slug: string }) => {
                console.log("SelectPage: Setting selected restaurant:", restaurant);
                setSelectedRestaurantId(restaurant.id);

                router.push(`/merchant/restaurant/${restaurant.slug}/menu-items`);
        };

        const handleEditRestaurant = (e: React.MouseEvent, restaurant: { slug: string }) => {
                // Stop event propagation to prevent card click
                e.stopPropagation();
                router.push(`/merchant/restaurant/${restaurant.slug}/settings`);
        };

        if (loading && restaurants.length === 0 && !error) {
                return (
                        <div className="flex justify-center items-center h-screen">
                                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                                <p className="ml-3 text-gray-600">Loading your restaurants...</p>
                        </div>
                );
        }

        if (error && restaurants.length === 0) {
                return <p className="p-6 text-center text-red-600">Error loading restaurants: {error} 😭</p>;
        }

        if (!loading && restaurants.length === 0 && loggedInMerchantId) {
                return (
                        <div className="p-6 text-center space-y-4 mt-10">
                                <Building size={48} className="mx-auto text-gray-400" />
                                <h2 className="text-xl font-semibold">No Restaurants Found</h2>
                                <p className="text-gray-500">You haven&apos;t added any restaurants yet.</p>
                                <Link
                                        href={`/merchant/${merchantId}/restaurant/create`} // Link tới trang tạo
                                        className="inline-flex items-center px-6 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 font-semibold transition-colors"
                                >
                                        <PlusCircle size={18} className="mr-2" /> Add Your First Restaurant
                                </Link>
                        </div>
                );
        }

        return (
                <div className="space-y-6 p-6">
                        {" "}
                        <h1 className="text-3xl font-bold text-gray-800">Select Restaurant</h1>
                        <p className="text-gray-600">Choose the restaurant you want to manage.</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {restaurants.map((res) => (
                                        <Card
                                                key={res.id}
                                                className="hover:shadow-lg transition-shadow cursor-pointer border hover:border-orange-400 group relative"
                                                onClick={() => handleRestaurantSelect({ id: res.id, slug: res.slug })}
                                        >
                                                {/* Edit Button */}
                                                <button
                                                        onClick={(e) => handleEditRestaurant(e, { slug: res.slug })}
                                                        className="absolute top-3 right-3 p-2 rounded-md bg-white hover:bg-orange-50 border border-gray-200 hover:border-orange-300 shadow-sm transition-colors z-10"
                                                        title="Edit Restaurant"
                                                        aria-label="Edit restaurant"
                                                >
                                                        <Pencil
                                                                size={16}
                                                                className="text-gray-600 hover:text-orange-600"
                                                        />
                                                </button>

                                                <CardHeader>
                                                        <CardTitle className="flex justify-between items-center text-lg pr-10">
                                                                {" "}
                                                                <span className="truncate flex items-center gap-2 font-semibold">
                                                                        <Building
                                                                                size={16}
                                                                                className="text-gray-500 flex-shrink-0"
                                                                        />
                                                                        {res.resName}
                                                                </span>
                                                                <Badge
                                                                        variant={
                                                                                res.enabled ? "default" : "destructive"
                                                                        }
                                                                        className="text-xs flex-shrink-0 h-5 px-1.5"
                                                                >
                                                                        {" "}
                                                                        {res.enabled ? "Active" : "Inactive"}
                                                                </Badge>
                                                        </CardTitle>
                                                        <CardDescription className="flex items-start gap-1.5 pt-1 text-xs text-gray-500 group-hover:text-gray-600">
                                                                {" "}
                                                                <MapPin
                                                                        size={12}
                                                                        className="mt-0.5 text-gray-400 flex-shrink-0 group-hover:text-gray-500"
                                                                />
                                                                <span className="line-clamp-2">
                                                                        {res.address || (
                                                                                <i className="text-gray-400">
                                                                                        No address
                                                                                </i>
                                                                        )}
                                                                </span>
                                                        </CardDescription>
                                                </CardHeader>
                                        </Card>
                                ))}

                                <Link href={`/merchant/${merchantId}/restaurant/create`}>
                                        <Card className="h-full border-2 border-dashed border-gray-300 hover:border-orange-500 text-gray-500 hover:text-orange-600 transition flex flex-col items-center justify-center cursor-pointer min-h-[150px] group">
                                                <PlusCircle
                                                        size={32}
                                                        className="group-hover:scale-110 transition-transform"
                                                />
                                                <p className="mt-2 font-semibold">Add New Restaurant</p>
                                        </Card>
                                </Link>
                        </div>
                </div>
        );
}
