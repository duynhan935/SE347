import RestaurantsContainer from "@/components/client/restaurants/RestaurantsContainer";
import { Suspense } from "react";

export default function RestaurantsPage() {
    return (
        <section className="lg:mt-[55px]">
            <Suspense fallback={<div className="p-4">Loading...</div>}>
                <RestaurantsContainer />
            </Suspense>
        </section>
    );
}
