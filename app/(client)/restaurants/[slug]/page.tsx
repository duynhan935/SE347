import { restaurantApi } from "@/lib/api/restaurantApi";
import { notFound } from "next/navigation";

// -- Import các component --
import ScrollReveal from "@/components/client/Animations/ScrollReveal";
import RestaurantActions from "@/components/client/Restaurant/RestaurantActions";
import RestaurantBreadcrumb from "@/components/client/Restaurant/RestaurantBreadcrumb";
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
                        <div className="custom-container">
                                <RestaurantBreadcrumb restaurant={restaurant} />
                        </div>
                        <div className="custom-container ">
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                                        {/* Left column: Menu, About, Reviews */}
                                        <div className="lg:col-span-2 space-y-16">
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

                                        {/* Right column: Chat with restaurant (sticky) */}
                                        <div className="lg:col-span-1">
                                                <div className="sticky top-8">
                                                        <ScrollReveal delay={0.05}>
                                                                <section id="actions" className="scroll-mt-24">
                                                                        <RestaurantActions restaurant={restaurant} />
                                                                </section>
                                                        </ScrollReveal>
                                                </div>
                                        </div>
                                </div>
                        </div>
                </main>
        );
}
