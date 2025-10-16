import RestaurantsContainer from "@/components/client/restaurants/RestaurantsContainer";

export default async function RestaurantsPage({
        searchParams,
}: {
        searchParams: { [key: string]: string | string[] | undefined };
}) {
        return (
                <section className="lg:mt-[55px]">
                        <RestaurantsContainer />
                </section>
        );
}
