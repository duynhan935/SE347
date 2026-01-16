// File: app/_components/about/ContentSection.tsx
import Button from "@/components/Button"; // Assume you have Button component
import Image, { StaticImageData } from "next/image";
import Link from "next/link";

type ContentSectionProps = {
        image: StaticImageData;
        title: string;
        children: React.ReactNode;
        reverse?: boolean; // Prop to reverse layout
};

export default function ContentSection({ image, title, children, reverse = false }: ContentSectionProps) {
        return (
                <section className="py-16 lg:py-24">
                        <div className="custom-container grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                                {/* Image column */}
                                <div
                                        className={`relative h-80 lg:h-[400px] rounded-lg overflow-hidden ${
                                                reverse ? "lg:order-last" : ""
                                        }`}
                                >
                                        <Image src={image} alt={title} fill className="object-cover" />
                                </div>

                                {/* Content column */}
                                <div className={`text-center lg:text-left ${reverse ? "lg:order-first" : ""}`}>
                                        <h2 className="font-roboto-serif text-3xl md:text-4xl font-semibold">
                                                {title}
                                        </h2>
                                        <div className="mt-4 text-base leading-relaxed">{children}</div>
                                        <Link href="/restaurants">
                                                <Button className="mt-8 bg-brand-purple text-white hover:bg-brand-purple/90">
                                                        Learn More
                                                </Button>
                                        </Link>
                                </div>
                        </div>
                </section>
        );
}
