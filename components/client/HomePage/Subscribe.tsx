"use client";

import Link from "next/link";

const Subscribe = () => {
        return (
                <form className="flex items-center gap-[16px] md:flex-row flex-col">
                        <input
                                type="text"
                                name="text"
                                title="Location"
                                className="border-[1.5px] border-brand-black py-[15px] px-[10px] w-[310px] rounded-[6px] bg-brand-white text-p2 font-normal leading-[28px] font-manrope focus:outline-none focus:border-brand-purple focus:ring-0 focus:shadow-xs focus:shadow-brand-purple "
                                placeholder="Enter your email..."
                        />
                        <Link
                                href={"restaurants"}
                                className="btn cursor-pointer bg-brand-purple text-p1 font-manrope font-semibold leading-[30px] text-brand-white hover:bg-brand-purple/90 hover:shadow-sm hover:shadow-brand-purple/90 transition-all duration-300"
                        >
                                Subscribe
                        </Link>
                </form>
        );
};

export default Subscribe;
