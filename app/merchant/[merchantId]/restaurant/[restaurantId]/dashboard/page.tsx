"use client";
// --- Imports ---
import DateRangeSelector from "@/components/merchant/dashboard/DateRangeSelector";
import ReportsChart from "@/components/merchant/dashboard/ReportsChart";
import WidgetList from "@/components/merchant/dashboard/WidgetList";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/stores/useAuthStore";
import { useRestaurantStore } from "@/stores/useRestaurantStore";
import { Building, CheckCircle, Clock, Loader2, MapPin, Phone, Star, XCircle } from "lucide-react";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";

export default function RestaurantDashboardPage() {
        const router = useRouter();
        const params = useParams();
        const pathname = usePathname();

        const merchantId = params.merchantId as string;
        const restaurantIdFromUrl = params.restaurantId as string;

        const {
                restaurant,
                restaurants,
                loading: restaurantLoading,
                error: restaurantError,
                setSelectedRestaurantId,
                fetchRestaurantById,
                updateRestaurantStatus,
                getRestaurantByMerchantId,
        } = useRestaurantStore();

        const { user } = useAuthStore();
        const loggedInMerchantId = user?.role === "MERCHANT" ? user.id : null;

        const [range, setRange] = useState([
                {
                        startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                        endDate: new Date(),
                        key: "selection",
                },
        ]);

        useEffect(() => {
                if (!loggedInMerchantId || loggedInMerchantId !== merchantId) {
                        toast.error("Access Denied or Invalid Merchant.", { id: "auth-err" });
                        // router.push('/login'); // Chuyển hướng nếu cần
                        return;
                }

                if (!restaurantIdFromUrl) {
                        toast.error("Invalid Restaurant URL.", { id: "url-err" });
                        router.push(`/merchant/${merchantId}`);
                        return;
                }

                // 3. Set selectedRestaurantId trong store để đồng bộ context

                const currentSelectedIdInStore = useRestaurantStore.getState().selectedRestaurantId;
                if (currentSelectedIdInStore !== restaurantIdFromUrl) {
                        console.log("Dashboard: Setting selected ID in store:", restaurantIdFromUrl);
                        setSelectedRestaurantId(restaurantIdFromUrl);
                }

                if ((!restaurant || restaurant.id !== restaurantIdFromUrl) && !restaurantLoading) {
                        console.log("Dashboard: Fetching details for:", restaurantIdFromUrl);
                        fetchRestaurantById(restaurantIdFromUrl).catch((err) => {
                                console.error("Error fetching restaurant details:", err);
                        });
                }

                if (restaurants.length === 0 && !restaurantLoading && loggedInMerchantId) {
                        console.warn("Dashboard: Restaurant list empty, attempting to refetch...");
                        getRestaurantByMerchantId(loggedInMerchantId);
                }
        }, [
                restaurantIdFromUrl,
                merchantId,
                loggedInMerchantId,
                router,
                restaurantLoading,
                restaurant,
                fetchRestaurantById,
                setSelectedRestaurantId,
                restaurants.length,
                getRestaurantByMerchantId,
        ]);

        const handleToggleStatus = async () => {
                if (!restaurant) return;
                const action = restaurant.enabled ? "Deactivate" : "Activate";
                if (confirm(`${action} restaurant "${restaurant.resName}"?`)) {
                        const loadingToast = toast.loading(`${action}ing...`);
                        try {
                                await updateRestaurantStatus(restaurant.id);
                                toast.dismiss(loadingToast);
                                toast.success(`Restaurant ${action.toLowerCase()}d successfully!`);
                        } catch (err: any) {
                                toast.dismiss(loadingToast);
                                toast.error(`Failed to ${action.toLowerCase()}: ${err.message || "Unknown error"}`);
                        }
                }
        };

        if (restaurantLoading && (!restaurant || restaurant.id !== restaurantIdFromUrl)) {
                return (
                        <div className="flex flex-col justify-center items-center h-[calc(100vh-150px)]">
                                <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
                                <p className="mt-4 text-gray-600">Loading Restaurant Dashboard...</p>
                        </div>
                );
        }

        if (restaurantError && (!restaurant || restaurant.id !== restaurantIdFromUrl)) {
                return (
                        <div className="p-6 text-center space-y-4">
                                <XCircle className="w-12 h-12 mx-auto text-red-400" />
                                <h2 className="text-xl font-semibold text-red-700">Error Loading Data</h2>
                                <p className="text-red-600">{restaurantError} 😭</p>
                                <Link href={`/merchant/${merchantId}`} className="text-blue-500 hover:underline">
                                        Go back to restaurant selection
                                </Link>
                        </div>
                );
        }

        if (!restaurantLoading && !restaurant) {
                return (
                        <div className="p-6 text-center text-gray-500">
                                Restaurant not found or ID is invalid.{" "}
                                <Link href={`/merchant/${merchantId}`} className="text-blue-500 underline">
                                        Go back to selection
                                </Link>
                        </div>
                );
        }

        return (
                <div className="space-y-6">
                        <Toaster position="top-center" />
                        <Card className="overflow-hidden">
                                <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b p-4">
                                        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
                                                <CardTitle className="text-xl font-bold flex items-center gap-2 text-gray-800">
                                                        <Building size={20} className="text-gray-600 flex-shrink-0" />
                                                        {restaurant?.resName}
                                                </CardTitle>
                                                <div className="flex items-center gap-3 flex-shrink-0">
                                                        <button
                                                                onClick={handleToggleStatus}
                                                                disabled={
                                                                        restaurantLoading &&
                                                                        useRestaurantStore.getState().restaurant?.id ===
                                                                                restaurant?.id
                                                                }
                                                                className={`p-1.5 rounded-full ${
                                                                        restaurant?.enabled
                                                                                ? "bg-red-100 text-red-600 hover:bg-red-200"
                                                                                : "bg-green-100 text-green-600 hover:bg-green-200"
                                                                } disabled:opacity-50 transition-colors`}
                                                                title={
                                                                        restaurant?.enabled
                                                                                ? "Deactivate Restaurant"
                                                                                : "Activate Restaurant"
                                                                }
                                                        >
                                                                {restaurantLoading &&
                                                                useRestaurantStore.getState().restaurant?.id ===
                                                                        restaurant?.id ? (
                                                                        <Loader2 size={18} className="animate-spin" />
                                                                ) : restaurant?.enabled ? (
                                                                        <XCircle size={18} />
                                                                ) : (
                                                                        <CheckCircle size={18} />
                                                                )}
                                                        </button>
                                                        <Badge
                                                                variant={
                                                                        restaurant?.enabled ? "success" : "destructive"
                                                                }
                                                                className="flex items-center gap-1 text-xs px-2 py-0.5"
                                                        >
                                                                {" "}
                                                                {restaurant?.enabled ? (
                                                                        <CheckCircle size={14} />
                                                                ) : (
                                                                        <XCircle size={14} />
                                                                )}
                                                                {restaurant?.enabled ? "Active" : "Inactive"}
                                                        </Badge>
                                                </div>
                                        </div>
                                </CardHeader>
                                <CardContent className="pt-5 pb-5 grid md:grid-cols-2 gap-x-6 gap-y-3 text-[13px]">
                                        {" "}
                                        <div className="flex items-start gap-2 text-gray-600">
                                                <MapPin size={15} className="mt-0.5 flex-shrink-0 text-gray-400" />
                                                <span>
                                                        {restaurant?.address || (
                                                                <i className="text-gray-400">No address set</i>
                                                        )}
                                                </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-600">
                                                <Phone size={15} className="flex-shrink-0 text-gray-400" />
                                                <span>
                                                        {restaurant?.phone || (
                                                                <i className="text-gray-400">No phone set</i>
                                                        )}
                                                </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-600">
                                                <Clock size={15} className="flex-shrink-0 text-gray-400" />
                                                <span>
                                                        {restaurant?.openingTime} - {restaurant?.closingTime}
                                                </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-600">
                                                <Star
                                                        size={15}
                                                        className="text-yellow-400 fill-yellow-400 flex-shrink-0"
                                                />
                                                <span>
                                                        {restaurant?.rating?.toFixed(1) ?? "N/A"} (
                                                        {restaurant?.totalReview ?? 0} reviews)
                                                </span>
                                        </div>
                                        {/* Link to manage menu */}
                                        <div className="md:col-span-2 mt-2 pt-3 border-t border-gray-100">
                                                {" "}
                                                <Link
                                                        href={`/merchant/restaurant/${restaurantIdFromUrl}/menu-items`} //
                                                        className="text-[13px] font-medium text-orange-600 hover:underline hover:text-orange-700"
                                                >
                                                        Manage Menu Items →
                                                </Link>
                                        </div>
                                </CardContent>
                        </Card>

                        <WidgetList restaurantId={restaurantIdFromUrl} />
                        <div className="mb-4 flex items-center justify-end">
                                <DateRangeSelector range={range} setRange={setRange} />
                        </div>

                        <ReportsChart restaurantId={restaurantIdFromUrl} range={range} />
                </div>
        );
}
