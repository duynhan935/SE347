import { Chef, DeliveryGreen, DeliveryRed } from "@/constants";
import Image from "next/image";

export default function AboutHero() {
        return (
                <section className="bg-brand-yellowlight pt-6 md:pb-[100px]">
                        <div className="custom-container text-center">
                                <h1 className="font-roboto-serif text-3xl md:text-5xl font-semibold max-w-2xl mx-auto">
                                        Connect people with the best foods
                                </h1>
                                <p className="mt-4 max-w-xl mx-auto text-brand-grey">
                                        We are a team of food lovers who are passionate about connecting people with the
                                        best local restaurants and providing a seamless and enjoyable ordering
                                        experience.
                                </p>

                                <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                        <div className=" rounded-lg ">
                                                <Image
                                                        src={DeliveryRed}
                                                        alt="Delivery person in red"
                                                        width={662}
                                                        height={594}
                                                        className="object-cover"
                                                />
                                        </div>
                                        <div className=" rounded-lg ">
                                                <Image
                                                        src={Chef}
                                                        alt="Chef"
                                                        className="object-cover"
                                                        width={662}
                                                        height={594}
                                                />
                                        </div>
                                        <div className="rounded-lg hidden lg:block ">
                                                <Image
                                                        src={DeliveryGreen}
                                                        alt="Delivery person in green"
                                                        width={662}
                                                        height={594}
                                                        className="object-cover"
                                                />
                                        </div>
                                </div>
                        </div>
                </section>
        );
}
