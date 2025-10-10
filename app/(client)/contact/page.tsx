"use client";

import Button from "@/components/client/Button";
import { FoodEat } from "@/constants";
import Image from "next/image";
import { useState } from "react";
export default function ContactPage() {
        const [formData, setFormData] = useState({
                name: "",
                email: "",
                phone: "",
                subject: "",
                message: "",
        });

        const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
                const { name, value } = e.target;
                setFormData((prev) => ({ ...prev, [name]: value }));
        };

        const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
                e.preventDefault();
                // Đây là nơi bạn sẽ xử lý logic gửi form (ví dụ: gọi API)
                console.log("Form data submitted:", formData);
                alert("Thank you for your message! We will get back to you shortly.");
                // Reset form sau khi gửi (tùy chọn)
                setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
        };

        return (
                <main className="bg-brand-white">
                        <section className="py-16 px-4">
                                <div className="custom-container">
                                        {/* --- Header Section --- */}
                                        <div className="text-center max-w-2xl mx-auto">
                                                <h1 className="font-roboto-serif text-3xl md:text-5xl font-semibold">
                                                        Let&apos;s talk with us for any issues or problem
                                                </h1>

                                                <div className="relative w-full max-w-sm mx-auto mt-8 h-64">
                                                        <Image
                                                                src={FoodEat}
                                                                alt="Contact Illustration"
                                                                fill
                                                                className="object-contain"
                                                        />
                                                </div>
                                        </div>

                                        {/* --- Form Section --- */}
                                        <div className="mt-16 max-w-4xl mx-auto">
                                                <form onSubmit={handleSubmit}>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                                {/* Name Input */}
                                                                <input
                                                                        type="text"
                                                                        name="name"
                                                                        value={formData.name}
                                                                        onChange={handleChange}
                                                                        placeholder="Your name here"
                                                                        required
                                                                        className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-brand-purple outline-none"
                                                                />

                                                                {/* Email Input */}
                                                                <input
                                                                        type="email"
                                                                        name="email"
                                                                        value={formData.email}
                                                                        onChange={handleChange}
                                                                        placeholder="Your email here"
                                                                        required
                                                                        className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-brand-purple outline-none"
                                                                />

                                                                {/* Phone Input */}
                                                                <input
                                                                        type="tel"
                                                                        name="phone"
                                                                        value={formData.phone}
                                                                        onChange={handleChange}
                                                                        placeholder="Your phone number here"
                                                                        required
                                                                        className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-brand-purple outline-none"
                                                                />

                                                                {/* Subject Input */}
                                                                <input
                                                                        type="text"
                                                                        name="subject"
                                                                        value={formData.subject}
                                                                        onChange={handleChange}
                                                                        placeholder="Sub. I want to become a partner"
                                                                        required
                                                                        className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-brand-purple outline-none"
                                                                />

                                                                {/* Message Textarea */}
                                                                <textarea
                                                                        name="message"
                                                                        value={formData.message}
                                                                        onChange={handleChange}
                                                                        placeholder="Write your message here"
                                                                        required
                                                                        rows={8}
                                                                        className="md:col-span-2 w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-brand-purple outline-none"
                                                                />

                                                                {/* Submit Button */}
                                                                <div className="md:col-span-2 flex justify-center">
                                                                        <Button
                                                                                type="submit"
                                                                                className="bg-brand-purple text-white hover:bg-brand-purple/90 outline-none cursor-pointer"
                                                                        >
                                                                                Send Message
                                                                        </Button>
                                                                </div>
                                                        </div>
                                                </form>
                                        </div>
                                </div>
                        </section>
                </main>
        );
}
