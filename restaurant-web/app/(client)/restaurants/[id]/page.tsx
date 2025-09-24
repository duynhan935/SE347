import burgerImage from "@/assets/Restaurant/Burger.png";
import { StaticImageData } from "next/image";
import { notFound } from "next/navigation";

// -- Import các component --
import RestaurantHero from "@/components/client/Restaurant/RestaurantHero";
import RestaurantInfo from "@/components/client/Restaurant/RestaurantInfo";
import RestaurantMenu from "@/components/client/Restaurant/RestaurantMenu";
import RestaurantNavTabs from "@/components/client/Restaurant/RestaurantNavTabs";
import RestaurantReviews from "@/components/client/Restaurant/RestaurantReviews";

// --- Kiểu dữ liệu chi tiết ---
export type RestaurantDetail = {
        id: number;
        name: string;
        image: StaticImageData;
        bannerImage: StaticImageData;
        deliveryFee: string;
        deliveryTime: number;
        foodType: string;
        rating: number;
        reviewCount: number;
        about: string;
        address: string;
        phone: string;
        reviews: {
                id: number;
                author: string;
                rating: number;
                text: string;
        }[];
        menu: {
                category: string;
                items: {
                        id: number;
                        name: string;
                        description: string;
                        price: number;
                        image: StaticImageData;
                }[];
        }[];
        foodGood: number;
        deliveryOnTime: number;
        orderCorrect: number;
};

// --- Hàm Fetch Dữ liệu Giả Lập ---
async function fetchRestaurantById(id: string): Promise<RestaurantDetail | null> {
        console.log(`Fetching details for restaurant ID: ${id}`);

        const fakeDetailedData: RestaurantDetail = {
                id: 1,
                name: "The Burger Cafe",
                image: burgerImage,
                bannerImage: burgerImage,
                deliveryFee: "$0",
                deliveryTime: 20,
                foodType: "Burger",
                rating: 4.6,
                reviewCount: 2200,
                foodGood: 94,
                deliveryOnTime: 96,
                orderCorrect: 90,
                about: "The Burger Cafe has been serving up the juiciest, most flavorful burgers in town since 2010. We believe in using only the freshest, locally-sourced ingredients to create unforgettable meals. Come taste the difference!",
                address: "123 Flavor St, Foodie City, 90210",
                phone: "(555) 123-4567",
                reviews: [
                        {
                                id: 1,
                                author: "Jane Doe",
                                rating: 5,
                                text: "Absolutely the best burger I've ever had! The staff is friendly and the atmosphere is great.",
                        },
                        {
                                id: 2,
                                author: "John Smith",
                                rating: 4,
                                text: "Great food, quick service. A solid choice for a casual meal.",
                        },
                        {
                                id: 3,
                                author: "Emily White",
                                rating: 5,
                                text: "The vegetarian options are surprisingly delicious. Highly recommend the black bean burger!",
                        },
                ],
                menu: [
                        {
                                category: "Popular Items",
                                items: [
                                        {
                                                id: 101,
                                                name: "Eggs Benedict Burger",
                                                description:
                                                        "Ground beef, hollandaise sauce mix, stone ground mustard, with a egg it's so much taste...",
                                                price: 13.99,
                                                image: burgerImage,
                                        },
                                        {
                                                id: 102,
                                                name: "Classic Cheeseburger",
                                                description: "Beef patty, cheddar cheese, lettuce, tomato, onion.",
                                                price: 9.99,
                                                image: burgerImage,
                                        },
                                        {
                                                id: 103,
                                                name: "Bacon Avocado Burger",
                                                description: "Beef patty, crispy bacon, avocado, swiss cheese.",
                                                price: 12.99,

                                                image: burgerImage,
                                        },
                                        {
                                                id: 104,
                                                name: "Bacon Avocado Burger",
                                                description: "Beef patty, crispy bacon, avocado, swiss cheese.",
                                                price: 12.99,
                                                image: burgerImage,
                                        },
                                ],
                        },
                        {
                                category: "Cheeseburger",
                                items: [
                                        {
                                                id: 201,
                                                name: "Double Cheeseburger",
                                                description: "Two beef patties, double cheddar cheese.",
                                                price: 12.99,
                                                image: burgerImage,
                                        },
                                ],
                        },
                        {
                                category: "Chicken Burger",
                                items: [
                                        {
                                                id: 301,
                                                name: "Crispy Chicken Sandwich",
                                                description: "Fried chicken breast, pickles, special sauce.",
                                                price: 10.99,
                                                image: burgerImage,
                                        },
                                        {
                                                id: 302,
                                                name: "Grilled Chicken Club",
                                                description: "Grilled chicken, bacon, lettuce, tomato, mayo.",
                                                price: 11.99,
                                                image: burgerImage,
                                        },
                                ],
                        },
                ],
        };

        if (id === String(fakeDetailedData.id)) {
                return fakeDetailedData;
        }
        return null;
}

export default async function RestaurantDetailPage({ params }: { params: { id: string } }) {
        const restaurant = await fetchRestaurantById(params.id);

        if (!restaurant) {
                notFound();
        }

        return (
                <main className="bg-gray-50">
                        <RestaurantHero restaurant={restaurant} />
                        <RestaurantNavTabs />

                        <div className="custom-container py-8">
                                <div className="w-full space-y-12">
                                        <section id="menu">
                                                <RestaurantMenu menu={restaurant.menu} />
                                        </section>

                                        <section id="about">
                                                <RestaurantInfo
                                                        about={restaurant.about}
                                                        address={restaurant.address}
                                                        phone={restaurant.phone}
                                                />
                                        </section>

                                        <section id="reviews">
                                                <RestaurantReviews reviews={restaurant.reviews} />
                                        </section>
                                </div>
                        </div>
                </main>
        );
}
