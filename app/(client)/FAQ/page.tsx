import FaqAccordion from "@/components/client/FAQ/FaqAccordion";
import { FoodEat } from "@/constants";
import Image from "next/image";
export default function FAQPage() {
        return (
                <main className="bg-brand-white">
                        <section className="py-16 lg:py-24">
                                <div className="custom-container text-center">
                                        {/* --- Hero Section --- */}
                                        <h1 className="font-roboto-serif text-3xl md:text-5xl font-semibold max-w-2xl mx-auto">
                                                Most asked questions by our beloved customers
                                        </h1>

                                        <div className="relative w-full max-w-xs mx-auto mt-8 h-48">
                                                <Image
                                                        src={FoodEat}
                                                        alt="FAQ Illustration"
                                                        fill
                                                        className="object-contain"
                                                />
                                        </div>

                                        {/* --- FAQ Accordion Section --- */}
                                        <div className="mt-16">
                                                <FaqAccordion />
                                        </div>
                                </div>
                        </section>
                </main>
        );
}
