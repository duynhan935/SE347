import RestaurantList from "@/components/admin/restaurants/RestaurantsList";
import { Loader2 } from "lucide-react";
import { Suspense } from "react";

export default async function AdminRestaurantsPage() {
        return (
                <div className="p-6">
                        <h1 className="text-3xl font-bold mb-6">Restaurant Management</h1>
                        {/* RestaurantList giờ sẽ tự fetch data qua store */}
                        <Suspense fallback={<Loader2 className="animate-spin" />}>
                                <RestaurantList />
                        </Suspense>
                </div>
        );
}
