import foodeat from "@/assets/HomePage/foodeat.png";
import leaf from "@/assets/HomePage/leaf.png";
import pizza from "@/assets/HomePage/pizza.png";
import Button from "@/components/Button";
import ScrollReveal from "@/components/client/Animations/ScrollReveal";
import { Variants } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

const slideInFromLeft: Variants = { hidden: { opacity: 0, x: -100 }, visible: { opacity: 1, x: 0 } };
const slideInFromRight: Variants = { hidden: { opacity: 0, x: 100 }, visible: { opacity: 1, x: 0 } };
const HomePageAbout = () => {
        return (
                <section className="mt-40 lg:mt-[260px] relative bg-brand-yellowlight  p-5 lg:p-0 lg:pb-[100px] ">
                        <div className="custom-container">
                                {/* Top about */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-y-8 text-center md:text-left md:justify-items-center items-center py-10 px-5 bg-brand-black text-brand-white overflow-hidden relative -top-20 lg:-top-[100px] rounded-lg">
                                        <Image
                                                src={pizza}
                                                alt="pizza Image"
                                                width={100}
                                                height={100}
                                                className="absolute -top-[50%] translate-y-[50%] left-0 -translate-x-[50%] object-cover hidden md:block"
                                        />
                                        <Image
                                                src={leaf}
                                                alt="leaf Image"
                                                width={100}
                                                height={100}
                                                className="absolute translate-y-[50%] right-0 translate-x-[50%] object-cover hidden md:block"
                                        />

                                        {/* Order per minute */}
                                        <div className="flex flex-col">
                                                <h2 className="font-roboto-serif font-semibold leading-[44px]">350+</h2>
                                                <p className="mt-2 md:mt-[18px] font-manrope font-normal leading-[30px]">
                                                        Order per minute
                                                </p>
                                        </div>

                                        {/* Faster delivery */}
                                        <div className="flex flex-col">
                                                <h2 className="font-roboto-serif font-semibold leading-[44px]">10x</h2>
                                                <p className="mt-2 md:mt-[18px] font-manrope font-normal leading-[30px]">
                                                        Faster delivery
                                                </p>
                                        </div>

                                        {/* InCountry */}
                                        <div className="flex flex-col">
                                                <h2 className="font-roboto-serif font-semibold leading-[44px]">10+</h2>
                                                <p className="mt-2 md:mt-[18px] font-manrope font-normal leading-[30px]">
                                                        In Country
                                                </p>
                                        </div>

                                        {/* Order accuracy */}
                                        <div className="flex flex-col">
                                                <h2 className="font-roboto-serif font-semibold leading-[44px]">
                                                        99.9%
                                                </h2>
                                                <p className="mt-2 md:mt-[18px] font-manrope font-normal leading-[30px]">
                                                        Order accuracy
                                                </p>
                                        </div>
                                </div>

                                {/* Main About */}

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-[130px] items-center">
                                        {/* Image container */}

                                        <ScrollReveal variants={slideInFromLeft}>
                                                <div className="w-full h-[350px] md:h-[500px] lg:h-[594px] relative">
                                                        <Image
                                                                src={foodeat}
                                                                alt="foodeat Image"
                                                                fill
                                                                className="object-cover rounded-lg"
                                                        />
                                                </div>
                                        </ScrollReveal>

                                        {/* Text content */}

                                        <ScrollReveal variants={slideInFromRight} delay={0.2}>
                                                <div className="text-center lg:text-left">
                                                        <h2 className="font-roboto-serif font-semibold leading-[44px]">
                                                                About <strong>Foodeats</strong>
                                                        </h2>
                                                        <p className="mt-[18px] font-manrope font-light leading-[30px] text-brand-grey">
                                                                <strong> Foodeats</strong> helps you find and order food
                                                                from wherever you are. How it works: you type in an
                                                                address, we tell you the restaurants that deliver to
                                                                that locale as well as showing you droves of pickup
                                                                restaurants near you.
                                                        </p>

                                                        <p className="mt-[20px] font-manrope font-light leading-[30px] text-brand-grey">
                                                                Want to be more specific? Search by cuisine, restaurant
                                                                name or menu item. We&apos;ll filter your results
                                                                accordingly.
                                                        </p>

                                                        <Link href="/restaurants" className="inline-block">
                                                                <Button className="mt-[38px] bg-brand-purple text-brand-white cursor-pointer hover:bg-brand-purple/80 transition-all duration-300">
                                                                        Learn More
                                                                </Button>
                                                        </Link>
                                                </div>
                                        </ScrollReveal>
                                </div>
                        </div>
                </section>
        );
};

export default HomePageAbout;
