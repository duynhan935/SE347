import About from "@/components/client/HomePage/About";
import Features from "@/components/client/HomePage/Features";
import FeedYourEmployee from "@/components/client/HomePage/FeedYourEmployee";
import Hero from "@/components/client/HomePage/Hero";
import HomePageReviews from "@/components/client/HomePage/HomePageReviews";

export default function HomePage() {
        return (
                <section className="scroll-smooth">
                        {/* Hero section */}
                        <Hero />

                        {/* Features section */}
                        <Features />

                        {/* About section */}
                        <About />

                        {/* Feed your employee section */}
                        <FeedYourEmployee />

                        {/* Review section */}
                        <HomePageReviews />
                </section>
        );
}
