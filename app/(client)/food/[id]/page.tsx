import FoodDetail from "@/components/client/Food/FoodDetail";
import { productApi } from "@/lib/api/productApi";
// import { restaurantApi } from "@/lib/api/restaurantApi"; // 1. Không cần gọi API này nữa
import { Product } from "@/types"; // Giả sử types được export từ @/types
import { notFound } from "next/navigation";

export default async function FoodDetailPage({ params }: { params: { id: string } }) {
        const foodResponse = await productApi.getProductById(params.id);
        const foodItem: Product | null = foodResponse.data;
        console.log(foodItem);
        if (!foodItem || !foodItem.restaurant) {
                notFound();
        }

        const restaurant = foodItem.restaurant;

        return (
                <main className="bg-white">
                        <div className="custom-container py-12 md:py-20">
                                <FoodDetail foodItem={foodItem} restaurant={restaurant} />
                        </div>
                </main>
        );
}
