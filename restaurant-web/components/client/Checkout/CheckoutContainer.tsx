"use client";

import { Mail, MapPin, Phone, User } from "lucide-react";
import Image, { StaticImageData } from "next/image";
import { useState } from "react";
import { FormInput } from "../FormInput";
import { FormSelect } from "../FormSelect";

export default function CheckoutPageClient({ backgroundImage }: { backgroundImage: StaticImageData }) {
        const [formData, setFormData] = useState({
                name: "",
                phone: "",
                email: "",
                address: "",
                district: "",
                town: "",
        });

        const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
                const { name, value } = e.target;
                setFormData((prev) => ({ ...prev, [name]: value }));
        };

        const handleSubmit = (e: React.FormEvent) => {
                e.preventDefault();
                console.log("Order placed with data:", formData);
                alert("Your order has been placed!");
        };

        return (
                <div className="relative min-h-screen  items-center justify-start py-12 px-4 flex flex-col overflow-hidden">
                        <Image
                                src={backgroundImage}
                                alt="Burger background"
                                layout="fill"
                                objectFit="cover"
                                className="brightness-50 blur-sm"
                                priority
                        />

                        <div className="relative text-center text-brand-black my-10 z-10">
                                <h1 className="text-6xl font-extrabold tracking-wider leading-tight">
                                        Online Reservation
                                </h1>
                                <p className="mt-5 text-xl font-medium">Order your food now</p>
                        </div>
                        <div className="relative w-full max-w-6xl bg-black/60 backdrop-blur-sm rounded-xl shadow-2xl p-10 md:p-16">
                                <form onSubmit={handleSubmit} className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                <FormInput
                                                        icon={User}
                                                        name="name"
                                                        placeholder="Your name"
                                                        value={formData.name}
                                                        onChange={handleChange}
                                                />
                                                <FormInput
                                                        icon={Phone}
                                                        name="phone"
                                                        type="tel"
                                                        placeholder="Phone number"
                                                        value={formData.phone}
                                                        onChange={handleChange}
                                                />
                                                <FormInput
                                                        icon={Mail}
                                                        name="email"
                                                        type="email"
                                                        placeholder="Email address"
                                                        value={formData.email}
                                                        onChange={handleChange}
                                                />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                <div className="md:col-span-1">
                                                        <FormInput
                                                                icon={MapPin}
                                                                name="address"
                                                                placeholder="Address"
                                                                value={formData.address}
                                                                onChange={handleChange}
                                                        />
                                                </div>
                                                <FormSelect
                                                        icon={MapPin}
                                                        name="district"
                                                        placeholder="District"
                                                        value={formData.district}
                                                        onChange={handleChange}
                                                        options={["District 1", "District 2", "District 3"]}
                                                />
                                                <FormSelect
                                                        icon={MapPin}
                                                        name="town"
                                                        placeholder="Town"
                                                        value={formData.town}
                                                        onChange={handleChange}
                                                        options={["Town A", "Town B", "Town C"]}
                                                />
                                        </div>

                                        <div className="pt-4">
                                                <button
                                                        type="submit"
                                                        className="cursor-pointer w-full bg-brand-purple text-white font-bold text-lg py-3 rounded-lg hover:bg-brand-purple/90 transition-transform transform hover:scale-105"
                                                >
                                                        Place Order
                                                </button>
                                        </div>
                                </form>
                        </div>
                </div>
        );
}
