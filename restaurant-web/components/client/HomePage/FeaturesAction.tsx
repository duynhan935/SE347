import burger from "@/app/_assets/HomePage/burger.png";
import noodle from "@/app/_assets/HomePage/noodles.png";
import partner from "@/app/_assets/HomePage/partner.svg";
import pizza from "@/app/_assets/HomePage/pizza.png";
import Button from "@/components/Button";
import Image from "next/image";
import Link from "next/link";

const FeaturesAction = () => {
        return (
                <div className="mt-[54px] grid grid-cols-2 gap-x-[30px]">
                        {/* Card Order food */}
                        <div className="w-[570px] group">
                                <div className="bg-brand-white shadow-xl rounded-[12px] overflow-hidden px-10 py-30 group-hover:scale-[105%] transition-all duration-500">
                                        <figure className="flex items-center justify-center">
                                                <Image
                                                        src={burger}
                                                        alt="burger"
                                                        width={100}
                                                        height={100}
                                                        className="text-center relative -right-[15px]"
                                                />
                                                <Image
                                                        src={pizza}
                                                        alt="burger"
                                                        width={100}
                                                        height={100}
                                                        className="relative right-[5px] top-[25px]"
                                                />
                                                <Image
                                                        src={noodle}
                                                        alt="noodle"
                                                        width={100}
                                                        height={100}
                                                        className="relative right-[20px] top-[5px]"
                                                />
                                        </figure>
                                        <h3 className="mt-[40px] font-manrope font-semibold leading-[40px] text-center">
                                                Order Food Now
                                        </h3>
                                        <p className="mt-[18px] font-manrope font-normal leading-[30px] text-center w-[474px] text-brand-grey">
                                                Order food and grocery delivery online from hundreds of restaurants and
                                                shops nearby.
                                        </p>
                                        <Link href="#" className="flex items-center justify-center ">
                                                <Button className="mt-[38px] bg-brand-black text-white font-manrope font-semibold leading-[30px] hover:bg-brand-black/80 cursor-pointer group-hover:scale-120 transition-all duration-500">
                                                        Order Now
                                                </Button>
                                        </Link>
                                </div>
                        </div>

                        {/* Card partner */}
                        <div className="w-[570px] group">
                                <div className="bg-brand-white shadow-xl rounded-[12px] overflow-hidden px-10 py-30 group-hover:scale-[105%] transition-all duration-500">
                                        <figure className="flex items-center justify-center">
                                                <Image
                                                        src={partner}
                                                        alt="partner"
                                                        width={150}
                                                        height={150}
                                                        className=""
                                                />
                                        </figure>
                                        <h3 className="mt-[40px] font-manrope font-semibold leading-[40px] text-center">
                                                Partner With Us
                                        </h3>
                                        <p className="mt-[18px] font-manrope font-normal leading-[30px] text-center w-[474px] text-brand-grey">
                                                Sign up today, start earning tomorrow. Build a new career in delivery
                                                service with us.
                                        </p>
                                        <Link href="#" className="flex items-center justify-center ">
                                                <Button className="mt-[38px] bg-brand-purple text-white font-manrope font-semibold leading-[30px] hover:bg-brand-purple/80 cursor-pointer group-hover:scale-120 transition-all duration-500">
                                                        Learn More
                                                </Button>
                                        </Link>
                                </div>
                        </div>
                </div>
        );
};

export default FeaturesAction;
