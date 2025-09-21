import feedyouremployee from "@/assets/HomePage/feedyouremployee.png";
import Button from "@/components/Button";
import Image from "next/image";

const FeedYourEmployee = () => {
        return (
                <section className="mt-15 lg:mt-[160px] lg:pb-[100px] ">
                        <div className="custom-container grid grid-cols-1 lg:grid-cols-2 gap-y-12 lg:gap-x-16 items-center">
                                {/* Title */}
                                <div className="order-last lg:order-first text-center lg:text-left">
                                        <h2 className="font-roboto-serif font-semibold leading-[100%]">
                                                Start Your Business
                                        </h2>
                                        <p className="mt-[18px] font-manrope font-light leading-[30px] text-brand-grey max-w-[500px] mx-auto lg:mx-0">
                                                Start selling food online with <strong>Foodeats</strong>, a modern
                                                platform designed to help restaurants, cafes, and food vendors reach
                                                more customers effortlessly.
                                        </p>
                                        <p className="mt-[18px] font-manrope font-light leading-[30px] text-brand-grey max-w-[500px] mx-auto lg:mx-0">
                                                <strong>Foodeats</strong> offers a variety of benefits for your
                                                business: seamless online ordering, secure payments, real-time order
                                                tracking, and built-in marketing tools to grow your customer base and
                                                increase sales.
                                        </p>
                                        <div className="flex justify-center lg:justify-start">
                                                <Button className="mt-[70px] bg-brand-purple text-brand-white font-manrope font-semibold leading-[30px] hover:bg-brand-purple/80 cursor-pointer">
                                                        Get Started Now
                                                </Button>
                                        </div>
                                </div>

                                {/* Image */}

                                <div className="relative w-full h-[300px] md:h-[400px] lg:h-[556px]">
                                        <Image
                                                src={feedyouremployee}
                                                alt="feedyouremployee"
                                                fill
                                                className="object-cover rounded-lg"
                                        />
                                </div>
                        </div>
                </section>
        );
};

export default FeedYourEmployee;
