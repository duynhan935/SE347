import foodeat from "@/assets/HomePage/foodeat.png";
import leaf from "@/assets/HomePage/leaf.png";
import pizza from "@/assets/HomePage/pizza.png";
import Button from "@/components/Button";
import Image from "next/image";
import Link from "next/link";
const HomePageAbout = () => {
        return (
                <section className="mt-[260px]  relative bg-brand-yellowlight pb-[100px]">
                        <div className="custom-container">
                                {/* Top about */}
                                <div className="flex justify-evenly items-center py-10 px-5 bg-brand-black text-brand-white overflow-hidden relative -top-[100px]">
                                        <Image
                                                src={pizza}
                                                alt="pizza Image"
                                                width={100}
                                                height={100}
                                                className="absolute -top-[50%]  translate-y-[50%] left-0 -translate-x-[50%] object-cover"
                                        />
                                        <Image
                                                src={leaf}
                                                alt="leaf Image"
                                                width={100}
                                                height={100}
                                                className="absolute   translate-y-[50%] right-0 translate-x-[50%] object-cover"
                                        />

                                        {/* Order per minute */}
                                        <div className="flex flex-col">
                                                <h2 className="font-roboto-serif font-semibold leading-[44px]">350+</h2>
                                                <p className="mt-[18px] font-manrope font-normal leading-[30px]">
                                                        Order per minute
                                                </p>
                                        </div>

                                        {/* Faster delivery */}
                                        <div className="flex flex-col">
                                                <h2 className="font-roboto-serif font-semibold leading-[44px]">10x</h2>
                                                <p className="mt-[18px] font-manrope font-normal leading-[30px]">
                                                        Faster delivery
                                                </p>
                                        </div>

                                        {/* InCountry */}
                                        <div className="flex flex-col">
                                                <h2 className="font-roboto-serif font-semibold leading-[44px]">10+</h2>
                                                <p className="mt-[18px] font-manrope font-normal leading-[30px]">
                                                        In Country
                                                </p>
                                        </div>

                                        {/* Order accuracy */}
                                        <div className="flex flex-col">
                                                <h2 className="font-roboto-serif font-semibold leading-[44px]">
                                                        99.9%
                                                </h2>
                                                <p className="mt-[18px] font-manrope font-normal leading-[30px]">
                                                        Order accuracy
                                                </p>
                                        </div>
                                </div>

                                {/* Main About */}
                                <div className=" grid grid-cols-2 gap-[130px] items-center">
                                        <div className="w-full h-full lg:h-[594px] lg:w-[570px] relative ">
                                                <Image
                                                        src={foodeat}
                                                        alt="foodeat Image"
                                                        fill
                                                        className="object-cover"
                                                />
                                        </div>

                                        <div>
                                                <h2 className="font-roboto-serif font-semibold leading-[44px]">
                                                        About <strong>Foodeats</strong>
                                                </h2>
                                                <p className="mt-[18px] font-manrope font-light leading-[30px] text-brand-grey">
                                                        <strong> Foodeats</strong> helps you find and order food from
                                                        wherever you are. How it works: you type in an address, we tell
                                                        you the restaurants that deliver to that locale as well as
                                                        showing you droves of pickup restaurants near you.
                                                </p>

                                                <p className="mt-[20px] font-manrope font-light leading-[30px] text-brand-grey">
                                                        Want to be more specific? Search by cuisine, restaurant name or
                                                        menu item. We&apos;ll filter your results accordingly.
                                                </p>

                                                <Link href="/restaurants">
                                                        <Button className="mt-[38px] bg-brand-purple text-brand-white cursor-pointer hover:bg-brand-purple/80 transition-all duration-300">
                                                                Learn More
                                                        </Button>
                                                </Link>
                                        </div>
                                </div>
                        </div>
                </section>
        );
};

export default HomePageAbout;
