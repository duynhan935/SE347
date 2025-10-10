import Slider from "./Slider";

const HomePageReviews = () => {
        return (
                <section className="mt-16 lg:mt-[60px] pb-24 lg:pb-[100px] bg-[#FFCF54]">
                        <div className="custom-container p-4 lg:p-0 pt-20 lg:pt-[100px] ">
                                {/* Title */}
                                <div className="text-center lg:text-left">
                                        <h2 className="font-roboto-serif font-semibold leading-[100%] max-w-[480px] tracking-wide mx-auto lg:mx-0">
                                                What food lovers are saying about us
                                        </h2>
                                </div>

                                {/* Slider */}
                                <div className="mt-12 lg:mt-[69px]">
                                        <Slider />
                                </div>
                        </div>
                </section>
        );
};

export default HomePageReviews;
