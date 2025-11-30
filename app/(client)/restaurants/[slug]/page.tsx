// File: app/(client)/restaurants/[slug]/page.tsx
import { restaurantApi } from "@/lib/api/restaurantApi";
import { notFound } from "next/navigation";

// -- Import các component --
import ScrollReveal from "@/components/client/Animations/ScrollReveal";
import RestaurantHero from "@/components/client/Restaurant/RestaurantHero";
import RestaurantInfo from "@/components/client/Restaurant/RestaurantInfo";
import RestaurantMenu from "@/components/client/Restaurant/RestaurantMenu";
import RestaurantNavTabs from "@/components/client/Restaurant/RestaurantNavTabs";
import RestaurantReviews from "@/components/client/Restaurant/RestaurantReviews";

export default async function RestaurantDetailPage({ params }: { params: Promise<{ slug: string }> }) {
        const { slug } = await params;
        const restaurantResponse = await restaurantApi.getByRestaurantSlug(slug);
        const restaurant = restaurantResponse.data;

        if (!restaurant) notFound();

        const reviewsResponse = await restaurantApi.getAllReviews(restaurant.id);
        const reviews = reviewsResponse.data;

        return (
                <main className="bg-gray-50">
                        <RestaurantHero restaurant={restaurant} />
                        <RestaurantNavTabs />
                        <div className="custom-container py-8 lg:py-12">
                                <div className="w-full space-y-16">
                                        <ScrollReveal>
                                                <section id="menu" className="scroll-mt-24">
                                                        <RestaurantMenu
                                                                products={restaurant.products}
                                                                categories={restaurant.cate}
                                                        />
                                                </section>
                                        </ScrollReveal>
                                        <ScrollReveal delay={0.1}>
                                                <section id="about" className="scroll-mt-24">
                                                        <RestaurantInfo
                                                                name={restaurant.resName}
                                                                about={"About restaurant"}
                                                                address={restaurant.address}
                                                                phone={restaurant.phone}
                                                                openingTime={restaurant.openingTime}
                                                                closingTime={restaurant.closingTime}
                                                        />
                                                </section>
                                        </ScrollReveal>

                                        <ScrollReveal delay={0.2}>
                                                <section id="reviews" className="scroll-mt-24">
                                                        <RestaurantReviews reviews={reviews || []} />
                                                </section>
                                        </ScrollReveal>
                                </div>
                        </div>
                </main>
        );
}
