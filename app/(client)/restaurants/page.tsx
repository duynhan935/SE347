import RestaurantsContainer from "@/components/client/restaurants/RestaurantsContainer";
import GlobalLoader from "@/components/ui/GlobalLoader";
import { Suspense } from "react";

export default function RestaurantsPage() {
    return (
        <section className="lg:mt-[55px]">
            <Suspense fallback={<GlobalLoader label="Loading" sublabel="Fetching restaurants" />}>
                <RestaurantsContainer />
            </Suspense>
        </section>
    );
}
