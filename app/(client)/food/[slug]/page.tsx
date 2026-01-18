import FoodDetail from "@/components/client/Food/FoodDetail";
import { productApi } from "@/lib/api/productApi";
// import { restaurantApi } from "@/lib/api/restaurantApi"; // 1. No longer need to call this API
import { Product } from "@/types"; // Assume types are exported from @/types
import { notFound } from "next/navigation";

export default async function FoodDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const foodResponse = await productApi.getProductBySlug(slug);
    const foodItem: Product | null = foodResponse.data;
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
