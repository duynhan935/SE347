import burger from "@/assets/HomePage/burger.png";
import pizza from "@/assets/HomePage/pizza.png";
import Image from "next/image";
import Subscribe from "./Subscribe";
const NewsLetter = () => {
        return (
                <section className="pt-[60px] pb-[100px] bg-brand-green relative">
                        <div className="mt-[40px] custom-container flex items-center justify-center flex-col">
                                <h2 className="font-roboto-serif font-semibold leading-[100%] text-brand-white max-w-[500px] text-center">
                                        Subscribe newsletter to get updates
                                </h2>
                                <p className="mt-[20px] font-manrope font-light leading-[30px] text-brand-white max-w-[470px] text-center">
                                        Download the Just Eat app for faster ordering and more personalised
                                        recommendations.
                                </p>

                                {/* Subcribe */}
                                <div className="mt-[38px]">
                                        {" "}
                                        <Subscribe />
                                </div>
                        </div>

                        {/* Burger */}
                        <div className="w-[150px] h-[150px] absolute -top-[80px] -left-[70px]">
                                <Image src={burger} alt="burger" fill />
                        </div>

                        {/* Pizza */}
                        <div className="w-[150px] h-[150px] absolute -top-[80px] -right-[70px]">
                                <Image src={pizza} alt="pizza" fill />
                        </div>
                </section>
        );
};

export default NewsLetter;
