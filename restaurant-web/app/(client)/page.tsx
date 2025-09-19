import Features from "@/components/client/HomePage/Features";
import Hero from "@/components/client/HomePage/Hero";

export default function HomePage() {
        return (
                <section className=" ">
                        {/* Hero section */}
                        <Hero />

                        {/* Features section */}
                        <Features />
                </section>
        );
}
