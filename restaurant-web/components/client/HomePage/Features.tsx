import FeaturesAction from "./FeaturesAction";

const Features = () => {
        return (
                <div className="custom-container mt-[150px] pb-[100px]">
                        <h2 className="font-roboto-serif font-semibold leading-[100%] text-center">
                                Everything in one platform.
                        </h2>
                        <p className="mt-[18px] font-manrope font-normal leading-[30px] text-center max-w-[470px] mx-auto">
                                Order food and grocery delivery online from hundreds of restaurants and shops nearby.
                        </p>

                        {/* Features Action */}
                        <FeaturesAction />
                </div>
        );
};

export default Features;
