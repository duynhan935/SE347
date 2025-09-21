import Slider from "./Slider";

const HomePageReviews = () => {
        return (
                <section className="mt-[60px] pb-[100px] bg-[#FFCF54]">
                        <div className="custom-container pt-[100px]">
                                {/* Title */}
                                <div>
                                        <h2 className="font-roboto-serif font-semibold leading-[100%] max-w-[480px] tracking-wide">
                                                What food lovers are saying about us
                                        </h2>
                                </div>

                                {/* Slider */}
                                <div className="mt-[69px]">
                                        <Slider />
                                </div>
                        </div>
                </section>
        );
};

export default HomePageReviews;
