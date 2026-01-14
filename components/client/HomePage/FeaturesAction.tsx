"use client";

import burger from "@/assets/HomePage/burger.png";
import noodle from "@/assets/HomePage/noodles.png";
import partner from "@/assets/HomePage/partner.svg";
import pizza from "@/assets/HomePage/pizza.png";
import Button from "@/components/Button";
import Image from "next/image";
import Link from "next/link";

const FeaturesAction = () => {
        return (
                <div className="mt-[54px] grid grid-cols-1 lg:grid-cols-2 gap-x-[30px] gap-y-8 lg:gap-y-0">
                        <div className="w-full group">
                                <div className="bg-brand-white shadow-xl rounded-[12px] overflow-hidden px-10 py-10 h-full flex flex-col group-hover:scale-[105%] transition-all duration-500">
                                        <figure className="flex items-center justify-center">
                                                <Image
                                                        src={burger}
                                                        alt="burger"
                                                        width={150}
                                                        height={150}
                                                        className="text-center relative -right-[50px] object-cover"
                                                />
                                                <Image
                                                        src={pizza}
                                                        alt="pizza"
                                                        width={150}
                                                        height={150}
                                                        className="relative right-[5px] top-[20px]"
                                                />
                                                <Image
                                                        src={noodle}
                                                        alt="noodle"
                                                        width={150}
                                                        height={150}
                                                        className="relative right-[50px] top-[5px]"
                                                />
                                        </figure>
                                        <div className="flex-grow flex flex-col items-center">
                                                <h3 className="mt-[40px] font-manrope font-semibold leading-[40px] text-center">
                                                        Order Food Now
                                                </h3>

                                                <p className="mt-[18px] font-manrope font-normal leading-[30px] text-center max-w-lg mx-auto text-brand-grey">
                                                        Order food and grocery delivery online from hundreds of
                                                        restaurants and shops nearby.
                                                </p>
                                        </div>
                                        <Link href="/?type=foods" className="flex items-center justify-center mt-auto">
                                                <Button className="mt-[38px] bg-brand-black text-white font-manrope font-semibold leading-[30px] hover:bg-brand-black/80 cursor-pointer group-hover:scale-120 transition-all duration-500">
                                                        Order Now
                                                </Button>
                                        </Link>
                                </div>
                        </div>

                        <div className="w-full group">
                                <div className="bg-brand-white shadow-xl rounded-[12px] overflow-hidden px-10 py-10 h-full flex flex-col group-hover:scale-[105%] transition-all duration-500">
                                        <figure className="flex items-center justify-center relative w-full h-[150px]">
                                                <Image
                                                        src={partner}
                                                        alt="partner"
                                                        fill
                                                        className="flex items-center justify-center object-contain"
                                                />
                                        </figure>
                                        <div className="flex-grow flex flex-col items-center">
                                                <h3 className="mt-[40px] font-manrope font-semibold leading-[40px] text-center">
                                                        Partner With Us
                                                </h3>

                                                <p className="mt-[18px] font-manrope font-normal leading-[30px] text-center max-w-lg mx-auto text-brand-grey">
                                                        Sign up today, start earning tomorrow. Build a new career in
                                                        delivery service with us.
                                                </p>
                                        </div>
                                        <Link href="/merchant/register" className="flex items-center justify-center mt-auto">
                                                <Button className="mt-[38px] bg-[#EE4D2D] text-white font-manrope font-semibold leading-[30px] hover:bg-[#EE4D2D]/80 cursor-pointer group-hover:scale-120 transition-all duration-500">
                                                        Learn More
                                                </Button>
                                        </Link>
                                </div>
                        </div>
                </div>
        );
};

export default FeaturesAction;
