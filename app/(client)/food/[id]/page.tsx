import FoodDetail from "@/components/client/Food/FoodDetail";
import { productApi } from "@/lib/api/productApi";
import { restaurantApi } from "@/lib/api/restaurantApi";

export default async function FoodDetailPage({ params }: { params: { id: string } }) {
        const res = await productApi.getProductById(params.id);
        const restaurantRes = await restaurantApi.getRestaurantById(res.data?.restaurant);
        const foodItem = res.data;
        const restaurant = restaurantRes.data;

        return (
                <main className="bg-white">
                        <div className="custom-container py-12 md:py-20">
                                <FoodDetail foodItem={foodItem} restaurant={restaurant} />
                        </div>
                </main>
        );
}
