// File: app/page.tsx
import ScrollReveal from "@/components/client/Animations/ScrollReveal"; // Import component
import About from "@/components/client/HomePage/About";
import Features from "@/components/client/HomePage/Features";
import FeedYourEmployee from "@/components/client/HomePage/FeedYourEmployee";
import Hero from "@/components/client/HomePage/Hero";
import HomePageReviews from "@/components/client/HomePage/HomePageReviews";
import NewsLetter from "@/components/client/HomePage/NewsLetter";
import { Variants } from "framer-motion";

const slideInFromLeft: Variants = {
        hidden: { opacity: 0, x: -100 },
        visible: { opacity: 1, x: 0 },
};

const zoomIn: Variants = {
        hidden: { opacity: 0, scale: 0.8 },
        visible: { opacity: 1, scale: 1 },
};

export default function HomePage() {
        return (
                <main>
                        <Hero />

                        <ScrollReveal variants={zoomIn}>
                                <Features />
                        </ScrollReveal>

                        <About />

                        <ScrollReveal variants={slideInFromLeft}>
                                <FeedYourEmployee />
                        </ScrollReveal>

                        <ScrollReveal variants={zoomIn}>
                                <HomePageReviews />
                                <NewsLetter />
                        </ScrollReveal>
                </main>
        );
}
