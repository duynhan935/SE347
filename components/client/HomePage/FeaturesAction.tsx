"use client";

import burger from "@/assets/HomePage/burger.png";
import noodle from "@/assets/HomePage/noodles.png";
import partner from "@/assets/HomePage/partner.svg";
import pizza from "@/assets/HomePage/pizza.png";
import Button from "@/components/Button";
import { MerchantRequestForm } from "@/components/auth/MerchantRequestForm";
import { useAuthStore } from "@/stores/useAuthStore";
import { X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";

const FeaturesAction = () => {
        const [showMerchantForm, setShowMerchantForm] = useState(false);
        const { user } = useAuthStore();
        return (
                <div className="mt-[54px] grid grid-cols-1 lg:grid-cols-2 gap-x-[30px] gap-y-8 lg:gap-y-0">
                        <div className="w-full group">
                                <div className="bg-brand-white shadow-xl rounded-[12px] overflow-hidden px-10 py-10 h-full flex flex-col group-hover:scale-[105%] transition-all duration-500">
                                        <figure className="flex items-center justify-center">
                                                <Image
                                                        src={burger}
                                                        alt="burger"
                                                        width={150}
                                                        height={150}
                                                        className="text-center relative -right-[50px] object-cover"
                                                />
                                                <Image
                                                        src={pizza}
                                                        alt="pizza"
                                                        width={150}
                                                        height={150}
                                                        className="relative right-[5px] top-[20px]"
                                                />
                                                <Image
                                                        src={noodle}
                                                        alt="noodle"
                                                        width={150}
                                                        height={150}
                                                        className="relative right-[50px] top-[5px]"
                                                />
                                        </figure>
                                        <div className="flex-grow flex flex-col items-center">
                                                <h3 className="mt-[40px] font-manrope font-semibold leading-[40px] text-center">
                                                        Order Food Now
                                                </h3>

                                                <p className="mt-[18px] font-manrope font-normal leading-[30px] text-center max-w-lg mx-auto text-brand-grey">
                                                        Order food and grocery delivery online from hundreds of
                                                        restaurants and shops nearby.
                                                </p>
                                        </div>
                                        <Link href="/restaurants" className="flex items-center justify-center mt-auto">
                                                <Button className="mt-[38px] bg-brand-black text-white font-manrope font-semibold leading-[30px] hover:bg-brand-black/80 cursor-pointer group-hover:scale-120 transition-all duration-500">
                                                        Order Now
                                                </Button>
                                        </Link>
                                </div>
                        </div>

                        <div className="w-full group">
                                <div className="bg-brand-white shadow-xl rounded-[12px] overflow-hidden px-10 py-10 h-full flex flex-col group-hover:scale-[105%] transition-all duration-500">
                                        <figure className="flex items-center justify-center relative w-full h-[150px]">
                                                <Image
                                                        src={partner}
                                                        alt="partner"
                                                        fill
                                                        className="flex items-center justify-center object-contain"
                                                />
                                        </figure>
                                        <div className="flex-grow flex flex-col items-center">
                                                <h3 className="mt-[40px] font-manrope font-semibold leading-[40px] text-center">
                                                        Partner With Us
                                                </h3>

                                                <p className="mt-[18px] font-manrope font-normal leading-[30px] text-center max-w-lg mx-auto text-brand-grey">
                                                        Sign up today, start earning tomorrow. Build a new career in
                                                        delivery service with us.
                                                </p>
                                        </div>
                                        <div className="flex items-center justify-center mt-auto">
                                                <Button
                                                        onClickFunction={() => setShowMerchantForm(true)}
                                                        className="mt-[38px] bg-brand-purple text-white font-manrope font-semibold leading-[30px] hover:bg-brand-purple/80 cursor-pointer group-hover:scale-120 transition-all duration-500"
                                                >
                                                        Learn More
                                                </Button>
                                        </div>
                                </div>
                        </div>

                        {/* Merchant Request Form Dialog */}
                        {showMerchantForm && (
                                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                                        <div
                                                className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl max-h-[90vh] overflow-y-auto"
                                                onClick={(e) => e.stopPropagation()}
                                        >
                                                <div className="flex justify-between items-center mb-4">
                                                        <h3 className="text-xl font-bold text-gray-900">
                                                                Yêu cầu trở thành Merchant
                                                        </h3>
                                                        <button
                                                                onClick={() => setShowMerchantForm(false)}
                                                                className="text-gray-400 hover:text-gray-600"
                                                                aria-label="Close merchant registration form"
                                                                title="Close"
                                                        >
                                                                <X className="w-5 h-5" />
                                                        </button>
                                                </div>
                                                <MerchantRequestForm
                                                        initialEmail={user?.email || ""}
                                                        initialUsername={user?.username || ""}
                                                        onSuccess={() => {
                                                                setShowMerchantForm(false);
                                                                toast.success(
                                                                        "Yêu cầu đã được gửi! Vui lòng kiểm tra email để xác nhận tài khoản và chờ admin phê duyệt."
                                                                );
                                                        }}
                                                        onCancel={() => setShowMerchantForm(false)}
                                                />
                                        </div>
                                </div>
                        )}
                </div>
        );
};

export default FeaturesAction;
