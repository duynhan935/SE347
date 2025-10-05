// File: app/about/page.tsx
import AboutHero from "@/components/client/About/AboutHero";
import ContentSection from "@/components/client/About/ContentSection";
import StatsBanner from "@/components/client/About/StatsBanner";
import ScrollReveal from "@/components/client/Animations/ScrollReveal";
import HomePageReviews from "@/components/client/HomePage/HomePageReviews";
import NewsLetter from "@/components/client/HomePage/NewsLetter";
import { AboutPageImages } from "@/constants/images";

export default function AboutPage() {
        return (
                <main>
                        {/*  */}
                        <ScrollReveal className="bg-brand-yellowlight">
                                <AboutHero />
                        </ScrollReveal>

                        <ScrollReveal delay={0.1}>
                                <ContentSection image={AboutPageImages.OurStory} title="Our story.">
                                        <p className="mt-4 text-brand-grey">
                                                Foodeats was founded in 2023 by a team of food lovers who were tired of
                                                the limited and unreliable food delivery options available.
                                        </p>
                                        <p className="mt-4 text-brand-grey">
                                                We set out to create a platform that would connect people with the best
                                                local restaurants and provide a seamless and enjoyable ordering
                                                experience.
                                        </p>
                                </ContentSection>
                        </ScrollReveal>

                        <ScrollReveal delay={0.2}>
                                <ContentSection image={AboutPageImages.OurMission} title="Our Mission" reverse={true}>
                                        <p className="mt-4 text-brand-grey">
                                                Our mission is to make it easy for everyone to enjoy the best food their
                                                city has to offer. We are committed to supporting local businesses and
                                                providing our customers with a wide variety of high-quality and
                                                delicious options.
                                        </p>
                                </ContentSection>
                        </ScrollReveal>

                        <ScrollReveal delay={0.1}>
                                <StatsBanner />
                        </ScrollReveal>

                        <ScrollReveal>
                                <HomePageReviews />
                                <NewsLetter />
                        </ScrollReveal>
                </main>
        );
}
