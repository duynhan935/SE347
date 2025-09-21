import FeaturesAction from "./FeaturesAction";

const Features = () => {
        return (
                <section className="custom-container mt-[150px] ">
                        <h2 className="font-roboto-serif font-semibold leading-[100%] text-center">
                                <em> Everything in one platform.</em>
                        </h2>
                        <p className="mt-[18px] font-manrope font-normal leading-[30px] text-center max-w-[470px] mx-auto">
                                Order food and grocery delivery online from hundreds of restaurants and shops nearby.
                        </p>

                        {/* Features Action */}
                        <FeaturesAction />
                </section>
        );
};

export default Features;
