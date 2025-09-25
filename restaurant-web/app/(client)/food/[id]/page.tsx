import burgerImage from "@/assets/Restaurant/Burger.png";
import FoodDetail from "@/components/client/Food/FoodDetail";
import { StaticImageData } from "next/image";
import { notFound } from "next/navigation";

type MenuItem = {
        id: number;
        name: string;
        ingredients: string;
        description: string;
        price: number;
        image: StaticImageData;
};
type RestaurantInfo = {
        id: number;
        name: string;
};

const ALL_FOODS_DATABASE = [
        {
                foodItem: {
                        id: 101,
                        name: "Eggs Benedict Burger",
                        ingredients: "Ground beef, hollandaise sauce mix, stone ground mustard...",
                        description:
                                "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.",
                        price: 7.5,
                        image: burgerImage,
                },
                restaurant: { id: 1, name: "The Burger Cafe" },
        },
        {
                foodItem: {
                        id: 102,
                        name: "Classic Cheeseburger",
                        ingredients: "Beef patty, cheddar cheese, lettuce, tomato, onion.",
                        description:
                                "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.",
                        price: 9.99,
                        image: burgerImage,
                },
                restaurant: { id: 1, name: "The Burger Cafe" },
        },
        {
                foodItem: {
                        id: 103,
                        name: "Bacon Avocado Burger",
                        ingredients: "Beef patty, crispy bacon, avocado, swiss cheese.",
                        description:
                                "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.",
                        price: 12.99,
                        image: burgerImage,
                },
                restaurant: { id: 1, name: "The Burger Cafe" },
        },
        {
                foodItem: {
                        id: 201,
                        name: "Pepperoni Pizza",
                        ingredients: "Classic pepperoni and cheese.",
                        description:
                                "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.",
                        price: 15.0,
                        image: burgerImage,
                },
                restaurant: { id: 2, name: "Pizza Palace" },
        },
];

// --- Hàm Fetch Dữ liệu Mới (Hiệu quả hơn) ---
async function fetchFoodById(foodId: string): Promise<{ foodItem: MenuItem; restaurant: RestaurantInfo } | null> {
        console.log(`Fetching food ID directly: ${foodId}`);

        const numericFoodId = Number(foodId);

        const data = ALL_FOODS_DATABASE.find((entry) => entry.foodItem.id === numericFoodId);

        return data || null;
}

export default async function FoodDetailPage({ params }: { params: { id: string } }) {
        const data = await fetchFoodById(params.id);

        if (!data) {
                notFound();
        }

        const { foodItem, restaurant } = data;

        return (
                <main className="bg-white">
                        <div className="custom-container py-12 md:py-20">
                                <FoodDetail foodItem={foodItem} restaurant={restaurant} />
                        </div>
                </main>
        );
}
