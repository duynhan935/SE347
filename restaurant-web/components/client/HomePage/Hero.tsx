import burger from "@/assets/HomePage/burger.png";
import hero from "@/assets/HomePage/hero.png";
import pizza from "@/assets/HomePage/pizza.png";
import Image from "next/image";
import Link from "next/link";
import { FaFacebookF, FaInstagram } from "react-icons/fa";
import Explore from "./Explore";

const Hero = () => {
        return (
                <section className="p-4 lg:p-0 bg-brand-yellowlight py-12 lg:py-[100px] ">
                        <div className="grid grid-cols-1 lg:grid-cols-2 custom-container items-center gap-y-8">
                                {/* Left part */}

                                <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
                                        <p className="font-manrope text-brand-purple font-medium leading-[30px] tracking-[3.6px]">
                                                #The Best in Town
                                        </p>

                                        {/* title */}
                                        <div className="-mt-[10px] relative">
                                                <h1 className="font-roboto-serif font-semibold leading-[100%] mt-[14px] max-w-[490px]">
                                                        Get food delivery and more
                                                </h1>
                                                <p className="mt-[16px] font-manrope font-light leading-[30px] max-w-[470px]">
                                                        You want it. We get it. Food, drinks, groceries, and more
                                                        available for delivery and pickup.
                                                </p>

                                                <Image
                                                        src={pizza}
                                                        alt="pizza"
                                                        width={54}
                                                        height={54}
                                                        priority
                                                        className="absolute hidden xl:block 2xl:top-[25px] 2xl:right-[90px] xl:top-[20px] xl:right-[90px]"
                                                />
                                                <Image
                                                        src={burger}
                                                        alt="burger"
                                                        width={54}
                                                        height={54}
                                                        priority
                                                        className="absolute hidden xl:block 2xl:bottom-[82px] 2xl:right-[220px] xl:bottom-[82px] xl:right-[210px]"
                                                />
                                        </div>

                                        {/* Location and Search */}
                                        <div className="mt-[38px] w-full max-w-md">
                                                <Explore />
                                        </div>

                                        {/* Get the app */}
                                        <div className="mt-[30px] flex items-center gap-x-[16px]">
                                                <h5 className="font-manrope font-bold leading-[30px]">
                                                        Connect with us:{" "}
                                                </h5>
                                                <div className="flex items-center gap-x-[16px]">
                                                        <Link
                                                                href="#"
                                                                className="w-[40px] h-[40px] rounded-full bg-brand-white flex items-center justify-center border-[1.5px] border-brand-black overflow-hidden cursor-pointer hover:bg-blue-600 hover:text-brand-white transition-all duration-500 group active:scale-95"
                                                        >
                                                                <FaFacebookF className="text-blue-600 group-hover:text-brand-white" />
                                                        </Link>
                                                        <Link
                                                                href="#"
                                                                className="w-[40px] h-[40px] rounded-full bg-brand-white flex items-center justify-center border-[1.5px] border-brand-black overflow-hidden cursor-pointer hover:bg-pink-600 hover:text-brand-white transition-all duration-500 group active:scale-95"
                                                        >
                                                                <FaInstagram className="text-pink-600 group-hover:text-brand-white" />
                                                        </Link>
                                                </div>
                                        </div>
                                </div>

                                {/* Right part */}
                                <div className="mt-[10px] hidden lg:block lg:mt-0 flex justify-center">
                                        <Image
                                                src={hero}
                                                alt="hero"
                                                width={662}
                                                height={594}
                                                priority
                                                className="w-full h-auto"
                                        />
                                </div>
                        </div>
                </section>
        );
};

export default Hero;
