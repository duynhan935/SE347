import RestaurantList from "@/components/admin/restaurants/RestaurantsList";

export default function AdminRestaurantsPage() {
        return (
                <div className="p-6">
                        <h1 className="text-3xl font-bold mb-6">Restaurant Management</h1>
                        <RestaurantList />
                </div>
        );
}
