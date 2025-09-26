import { Logo, SocialIcons } from "@/constants";
import Image from "next/image";
import Link from "next/link";

export default function Footer() {
    return (
        <footer className="bg-orange-50 py-12 px-6">
            <div className="custom-container">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
                    {/* Left: Logo, Description, Social Icons */}
                    <div className="md:col-span-4 flex flex-col items-start max-w-xs">
                        <Link href="/" className="flex items-center mb-2">
                            <Image src={Logo} alt="FoodEats Logo" />
                        </Link>
                        <p className="text-p2 text-brand-grey font-manrope mb-4">
                            Food, Drinks, groceries, and more available for delivery and pickup.
                        </p>
                        <div className="flex space-x-3">
                            <a
                                href="#"
                                className="bg-brand-black hover:bg-brand-purple p-3 rounded-lg flex items-center justify-center transition"
                            >
                                <SocialIcons.Facebook size={20} color="#fff" />
                            </a>
                            <a
                                href="#"
                                className="bg-brand-black hover:bg-brand-purple p-3 rounded-lg flex items-center justify-center transition"
                            >
                                <SocialIcons.Linkedin size={20} color="#fff" />
                            </a>
                            <a
                                href="#"
                                className="bg-brand-black hover:bg-brand-purple p-3 rounded-lg flex items-center justify-center transition"
                            >
                                <SocialIcons.Twitter size={20} color="#fff" />
                            </a>
                            <a
                                href="#"
                                className="bg-brand-black hover:bg-brand-purple p-3 rounded-lg flex items-center justify-center transition"
                            >
                                <SocialIcons.Instagram size={20} color="#fff" />
                            </a>
                        </div>
                    </div>
                    {/* Right: 4 menu columns */}
                    <div className="ml-2 md:col-span-8">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
                            {/* Get Started */}
                            <div>
                                <h5 className="font-semibold text-brand-black mb-4">Get Started</h5>
                                <ul className="space-y-3 text-sm text-gray-600">
                                    <li>
                                        <a
                                            href="#"
                                            className="text-p2 text-brand-grey font-manrope hover:text-brand-orange transition-colors"
                                        >
                                            FoodEats Sign In
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="#"
                                            className="text-p2 text-brand-grey font-manrope hover:text-brand-orange transition-colors"
                                        >
                                            FoodEats Sign Up
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="#"
                                            className="text-p2 text-brand-grey font-manrope hover:text-brand-orange transition-colors"
                                        >
                                            Become a Rider
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="#"
                                            className="text-p2 text-brand-grey font-manrope hover:text-brand-orange transition-colors"
                                        >
                                            Become a Partner
                                        </a>
                                    </li>
                                </ul>
                            </div>
                            {/* Get Help */}
                            <div>
                                <h5 className="font-semibold text-brand-black mb-4">Get Help</h5>
                                <ul className="space-y-3 text-sm text-gray-600">
                                    <li>
                                        <a
                                            href="#"
                                            className="text-p2 text-brand-grey font-manrope hover:text-brand-orange transition-colors"
                                        >
                                            Resources
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="#"
                                            className="text-p2 text-brand-grey font-manrope hover:text-brand-orange transition-colors"
                                        >
                                            Support
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="#"
                                            className="text-p2 text-brand-grey font-manrope hover:text-brand-orange transition-colors"
                                        >
                                            Contact Us
                                        </a>
                                    </li>
                                </ul>
                            </div>
                            {/* Company */}
                            <div>
                                <h5 className="font-semibold text-brand-black mb-4">Company</h5>
                                <ul className="space-y-3 text-sm text-gray-600">
                                    <li>
                                        <a
                                            href="#"
                                            className="text-p2 text-brand-grey font-manrope hover:text-brand-orange transition-colors"
                                        >
                                            About Us
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="#"
                                            className="text-p2 text-brand-grey font-manrope hover:text-brand-orange transition-colors"
                                        >
                                            Customer Rights
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="#"
                                            className="text-p2 text-brand-grey font-manrope hover:text-brand-orange transition-colors"
                                        >
                                            Career
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="#"
                                            className="text-p2 text-brand-grey font-manrope hover:text-brand-orange transition-colors"
                                        >
                                            Press
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="#"
                                            className="text-p2 text-brand-grey font-manrope hover:text-brand-orange transition-colors"
                                        >
                                            Blog
                                        </a>
                                    </li>
                                </ul>
                            </div>
                            {/* FoodEats For */}
                            <div>
                                <h5 className="font-semibold text-brand-black mb-4">FoodEats For</h5>
                                <ul className="space-y-3 text-sm text-gray-600">
                                    <li>
                                        <a
                                            href="#"
                                            className="text-p2 text-brand-grey font-manrope hover:text-brand-orange transition-colors"
                                        >
                                            Enterprise
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="#"
                                            className="text-p2 text-brand-grey font-manrope hover:text-brand-orange transition-colors"
                                        >
                                            For Small Business
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="#"
                                            className="text-p2 text-brand-grey font-manrope hover:text-brand-orange transition-colors"
                                        >
                                            Personal
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="#"
                                            className="text-p2 text-brand-grey font-manrope hover:text-brand-orange transition-colors"
                                        >
                                            Riders
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Bottom section */}
                <div className="border-t border-gray-300 mt-12 pt-6 flex flex-col md:flex-row md:justify-between md:items-center text-sm text-gray-600">
                    <p className="text-p2 text-brand-grey font-manrope md:text-left text-center w-full md:w-auto">
                        Copyright © 2022 UBILUT All rights reserved.
                    </p>
                    <div className="flex flex-col md:flex-row md:space-x-6 space-y-2 md:space-y-0 md:text-right text-center w-full md:w-auto md:justify-end">
                        <a
                            href="#"
                            className="text-p2 text-brand-grey font-manrope hover:text-brand-orange transition-colors"
                        >
                            Privacy Policy
                        </a>
                        <a
                            href="#"
                            className="text-p2 text-brand-grey font-manrope hover:text-brand-orange transition-colors"
                        >
                            Terms & Conditions
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
