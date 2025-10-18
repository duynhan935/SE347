// File: app/become-a-partner/page.tsx
"use client";

import Button from "@/components/Button";
import { motion } from "framer-motion";
import { Eye, EyeOff, ShieldCheck, Store, Upload, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";

const cuisineOptions = [
        "Vietnamese",
        "Japanese",
        "Korean",
        "Italian",
        "American",
        "Thai",
        "Chinese",
        "Fast Food",
        "Other",
];
const steps = ["Getting Started", "Restaurant Details", "Finalize Account"];

export default function PartnerRegisterPage() {
        const [step, setStep] = useState(1);
        const [formData, setFormData] = useState({
                ownerName: "",
                email: "",
                phone: "",
                restaurantName: "",
                streetAddress: "",
                city: "",
                zipCode: "",
                cuisine: "",
                password: "",
                confirmPassword: "",
                agreedToTerms: false,
                businessHours: "9:00 AM - 10:00 PM",
                taxId: "",
        });
        const [logoPreview, setLogoPreview] = useState<string | null>(null);
        const [bannerPreview, setBannerPreview] = useState<string | null>(null);
        const logoInputRef = useRef<HTMLInputElement>(null);
        const bannerInputRef = useRef<HTMLInputElement>(null);

        const [showPassword, setShowPassword] = useState(false);
        const [showConfirmPassword, setShowConfirmPassword] = useState(false);

        const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
                const { name, value } = e.target;
                setFormData((prev) => ({ ...prev, [name]: value }));
        };

        const handleFileChange = (
                e: React.ChangeEvent<HTMLInputElement>,
                setter: React.Dispatch<React.SetStateAction<string | null>>
        ) => {
                const file = e.target.files?.[0];
                if (file) {
                        setter(URL.createObjectURL(file));
                }
        };

        const nextStep = () => setStep((prev) => Math.min(prev + 1, steps.length));
        const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

        const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
                e.preventDefault();
                if (formData.password !== formData.confirmPassword) {
                        alert("Passwords do not match!");
                        return;
                }
                if (!formData.agreedToTerms) {
                        alert("You must agree to the Terms and Conditions.");
                        return;
                }
                console.log("Partner registration data:", formData);
                alert("Application submitted! Thank you.");
        };

        return (
                <main className="bg-brand-yellowlight min-h-screen">
                        <section className="py-12 lg:py-16">
                                <div className="custom-container">
                                        {/* --- Header --- */}
                                        <div className="text-center max-w-3xl mx-auto">
                                                <h1 className="font-roboto-serif text-3xl md:text-5xl font-semibold">
                                                        Become a FoodEats Partner
                                                </h1>
                                                <p className="mt-4 text-brand-grey">
                                                        Join our network and grow your business with us.
                                                </p>
                                        </div>

                                        {/* --- Multi-Step Form --- */}
                                        <div className="mt-12 max-w-4xl mx-auto bg-white p-6 sm:p-8 rounded-xl shadow-lg">
                                                {/* Progress Bar */}
                                                <div className="mb-8">
                                                        <div className="flex justify-between mb-2">
                                                                {steps.map((s, i) => (
                                                                        <span
                                                                                key={i}
                                                                                className={`text-sm font-semibold ${
                                                                                        step > i
                                                                                                ? "text-brand-purple"
                                                                                                : "text-gray-400"
                                                                                }`}
                                                                        >
                                                                                {s}
                                                                        </span>
                                                                ))}
                                                        </div>
                                                        <div className="relative w-full bg-gray-200 rounded-full h-2">
                                                                <div
                                                                        className="absolute top-0 left-0 bg-brand-purple rounded-full h-2 transition-all duration-500"
                                                                        style={{
                                                                                width: `${
                                                                                        ((step - 1) /
                                                                                                (steps.length - 1)) *
                                                                                        100
                                                                                }%`,
                                                                        }}
                                                                />
                                                        </div>
                                                </div>

                                                <form onSubmit={handleSubmit}>
                                                        {/* --- Step 1: Getting Started --- */}
                                                        {step === 1 && (
                                                                <motion.div
                                                                        key="step1"
                                                                        initial={{ opacity: 0, x: 20 }}
                                                                        animate={{ opacity: 1, x: 0 }}
                                                                        className="space-y-6"
                                                                >
                                                                        <h2 className="text-xl font-bold flex items-center gap-3 border-b pb-3">
                                                                                <User className="text-brand-purple" />
                                                                                Getting Started
                                                                        </h2>
                                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                                                <div>
                                                                                        <label className="block text-sm font-medium mb-1">
                                                                                                Your Full Name
                                                                                        </label>
                                                                                        <input
                                                                                                title="Your Full Name"
                                                                                                placeholder="Your Full Name"
                                                                                                type="text"
                                                                                                name="ownerName"
                                                                                                onChange={handleChange}
                                                                                                value={
                                                                                                        formData.ownerName
                                                                                                }
                                                                                                required
                                                                                                className="w-full p-3 border rounded-md"
                                                                                        />
                                                                                </div>
                                                                                <div>
                                                                                        <label className="block text-sm font-medium mb-1">
                                                                                                Restaurant Name
                                                                                        </label>
                                                                                        <input
                                                                                                title="Restaurant Name"
                                                                                                placeholder="Restaurant Name"
                                                                                                type="text"
                                                                                                name="restaurantName"
                                                                                                onChange={handleChange}
                                                                                                value={
                                                                                                        formData.restaurantName
                                                                                                }
                                                                                                required
                                                                                                className="w-full p-3 border rounded-md"
                                                                                        />
                                                                                </div>
                                                                                <div className="md:col-span-2">
                                                                                        <label className="block text-sm font-medium mb-1">
                                                                                                Business Email
                                                                                        </label>
                                                                                        <input
                                                                                                title="Business Email"
                                                                                                type="email"
                                                                                                name="email"
                                                                                                onChange={handleChange}
                                                                                                value={formData.email}
                                                                                                required
                                                                                                className="w-full p-3 border rounded-md"
                                                                                        />
                                                                                </div>
                                                                                <div>
                                                                                        <label className="block text-sm font-medium mb-1">
                                                                                                Phone Number
                                                                                        </label>
                                                                                        <input
                                                                                                title="Phone Number"
                                                                                                type="tel"
                                                                                                name="phone"
                                                                                                onChange={handleChange}
                                                                                                value={formData.phone}
                                                                                                required
                                                                                                className="w-full p-3 border rounded-md"
                                                                                        />
                                                                                </div>
                                                                        </div>
                                                                </motion.div>
                                                        )}

                                                        {/* --- Step 2: Restaurant Details --- */}
                                                        {step === 2 && (
                                                                <motion.div
                                                                        key="step2"
                                                                        initial={{ opacity: 0, x: 20 }}
                                                                        animate={{ opacity: 1, x: 0 }}
                                                                        className="space-y-6"
                                                                >
                                                                        <h2 className="text-xl font-bold flex items-center gap-3 border-b pb-3">
                                                                                <Store className="text-brand-purple" />
                                                                                Restaurant Details
                                                                        </h2>
                                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                                                <div className="md:col-span-2">
                                                                                        <label className="block text-sm font-medium mb-2">
                                                                                                Logo & Banner Image
                                                                                        </label>
                                                                                        <div className="flex flex-col sm:flex-row gap-4">
                                                                                                <div className="flex flex-col items-center gap-2">
                                                                                                        <div
                                                                                                                onClick={() =>
                                                                                                                        logoInputRef.current?.click()
                                                                                                                }
                                                                                                                className=" cursor-pointer relative w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border"
                                                                                                        >
                                                                                                                {logoPreview ? (
                                                                                                                        <Image
                                                                                                                                src={
                                                                                                                                        logoPreview
                                                                                                                                }
                                                                                                                                alt="Logo Preview"
                                                                                                                                fill
                                                                                                                                className="object-cover"
                                                                                                                        />
                                                                                                                ) : (
                                                                                                                        <Upload className="text-gray-400 cursor-pointer" />
                                                                                                                )}
                                                                                                        </div>
                                                                                                        <button
                                                                                                                type="button"
                                                                                                                onClick={() =>
                                                                                                                        logoInputRef.current?.click()
                                                                                                                }
                                                                                                                className="text-sm text-brand-purple font-semibold"
                                                                                                        >
                                                                                                                Upload
                                                                                                                Logo
                                                                                                        </button>
                                                                                                        <input
                                                                                                                title="Logo Image"
                                                                                                                placeholder="Logo Image"
                                                                                                                type="file"
                                                                                                                ref={
                                                                                                                        logoInputRef
                                                                                                                }
                                                                                                                onChange={(
                                                                                                                        e
                                                                                                                ) =>
                                                                                                                        handleFileChange(
                                                                                                                                e,
                                                                                                                                setLogoPreview
                                                                                                                        )
                                                                                                                }
                                                                                                                className="hidden"
                                                                                                                accept="image/*"
                                                                                                        />
                                                                                                </div>
                                                                                                <div className="flex flex-col items-center gap-2 flex-grow">
                                                                                                        <div
                                                                                                                onClick={() =>
                                                                                                                        bannerInputRef.current?.click()
                                                                                                                }
                                                                                                                className=" cursor-pointer relative w-full h-24 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden border"
                                                                                                        >
                                                                                                                {bannerPreview ? (
                                                                                                                        <Image
                                                                                                                                src={
                                                                                                                                        bannerPreview
                                                                                                                                }
                                                                                                                                alt="Banner Preview"
                                                                                                                                fill
                                                                                                                                className="object-cover"
                                                                                                                        />
                                                                                                                ) : (
                                                                                                                        <Upload className="text-gray-400 cursor-pointer" />
                                                                                                                )}
                                                                                                        </div>
                                                                                                        <button
                                                                                                                type="button"
                                                                                                                onClick={() =>
                                                                                                                        bannerInputRef.current?.click()
                                                                                                                }
                                                                                                                className="text-sm text-brand-purple font-semibold"
                                                                                                        >
                                                                                                                Upload
                                                                                                                Banner
                                                                                                        </button>
                                                                                                        <input
                                                                                                                title="Banner Image"
                                                                                                                placeholder="Banner Image"
                                                                                                                name="bannerImage"
                                                                                                                type="file"
                                                                                                                ref={
                                                                                                                        bannerInputRef
                                                                                                                }
                                                                                                                onChange={(
                                                                                                                        e
                                                                                                                ) =>
                                                                                                                        handleFileChange(
                                                                                                                                e,
                                                                                                                                setBannerPreview
                                                                                                                        )
                                                                                                                }
                                                                                                                className="hidden"
                                                                                                                accept="image/*"
                                                                                                        />
                                                                                                </div>
                                                                                        </div>
                                                                                </div>
                                                                                <div className="md:col-span-2">
                                                                                        <label className="block text-sm font-medium mb-1">
                                                                                                Street Address
                                                                                        </label>
                                                                                        <input
                                                                                                title="Street Address"
                                                                                                placeholder="Street Address"
                                                                                                type="text"
                                                                                                name="streetAddress"
                                                                                                onChange={handleChange}
                                                                                                value={
                                                                                                        formData.streetAddress
                                                                                                }
                                                                                                required
                                                                                                className="w-full p-3 border rounded-md"
                                                                                        />
                                                                                </div>
                                                                                <div>
                                                                                        <label className="block text-sm font-medium mb-1">
                                                                                                City
                                                                                        </label>
                                                                                        <input
                                                                                                title="City"
                                                                                                placeholder="City"
                                                                                                type="text"
                                                                                                name="city"
                                                                                                onChange={handleChange}
                                                                                                value={formData.city}
                                                                                                required
                                                                                                className="w-full p-3 border rounded-md"
                                                                                        />
                                                                                </div>
                                                                                <div>
                                                                                        <label className="block text-sm font-medium mb-1">
                                                                                                ZIP Code
                                                                                        </label>
                                                                                        <input
                                                                                                title="ZIP Code"
                                                                                                placeholder="ZIP Code"
                                                                                                type="text"
                                                                                                name="zipCode"
                                                                                                onChange={handleChange}
                                                                                                value={formData.zipCode}
                                                                                                required
                                                                                                className="w-full p-3 border rounded-md"
                                                                                        />
                                                                                </div>
                                                                                <div>
                                                                                        <label className="block text-sm font-medium mb-1">
                                                                                                Type of Cuisine
                                                                                        </label>
                                                                                        <select
                                                                                                title="Type of Cuisine"
                                                                                                name="cuisine"
                                                                                                onChange={handleChange}
                                                                                                value={formData.cuisine}
                                                                                                required
                                                                                                className="w-full p-3 border rounded-md bg-white"
                                                                                        >
                                                                                                <option value="">
                                                                                                        Select a cuisine
                                                                                                </option>
                                                                                                {cuisineOptions.map(
                                                                                                        (opt) => (
                                                                                                                <option
                                                                                                                        key={
                                                                                                                                opt
                                                                                                                        }
                                                                                                                        value={
                                                                                                                                opt
                                                                                                                        }
                                                                                                                >
                                                                                                                        {
                                                                                                                                opt
                                                                                                                        }
                                                                                                                </option>
                                                                                                        )
                                                                                                )}
                                                                                        </select>
                                                                                </div>
                                                                                <div>
                                                                                        <label className="block text-sm font-medium mb-1">
                                                                                                Business Hours (e.g.,
                                                                                                9AM - 10PM)
                                                                                        </label>
                                                                                        <input
                                                                                                title="Business Hours"
                                                                                                placeholder="Business Hours"
                                                                                                type="text"
                                                                                                name="businessHours"
                                                                                                onChange={handleChange}
                                                                                                value={
                                                                                                        formData.businessHours
                                                                                                }
                                                                                                required
                                                                                                className="w-full p-3 border rounded-md"
                                                                                        />
                                                                                </div>
                                                                        </div>
                                                                </motion.div>
                                                        )}

                                                        {/* --- Step 3: Finalize Account --- */}
                                                        {step === 3 && (
                                                                <motion.div
                                                                        key="step3"
                                                                        initial={{ opacity: 0, x: 20 }}
                                                                        animate={{ opacity: 1, x: 0 }}
                                                                        className="space-y-6"
                                                                >
                                                                        <h2 className="text-xl font-bold flex items-center gap-3 border-b pb-3">
                                                                                <ShieldCheck className="text-brand-purple" />
                                                                                Account & Legal
                                                                        </h2>
                                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                                                <div>
                                                                                        <label className="block text-sm font-medium mb-1">
                                                                                                Business/Tax ID
                                                                                                (Optional)
                                                                                        </label>
                                                                                        <input
                                                                                                title="Business/Tax ID"
                                                                                                placeholder="Business/Tax ID"
                                                                                                type="text"
                                                                                                name="taxId"
                                                                                                value={formData.taxId}
                                                                                                onChange={handleChange}
                                                                                                className="w-full p-3 border rounded-md"
                                                                                        />
                                                                                </div>
                                                                                <div />
                                                                                <div>
                                                                                        <label className="block text-sm font-medium mb-1">
                                                                                                Create Password
                                                                                        </label>
                                                                                        <div className="relative">
                                                                                                <input
                                                                                                        title="Create Password"
                                                                                                        placeholder="Create Password"
                                                                                                        type={
                                                                                                                showPassword
                                                                                                                        ? "text"
                                                                                                                        : "password"
                                                                                                        }
                                                                                                        name="password"
                                                                                                        value={
                                                                                                                formData.password
                                                                                                        }
                                                                                                        onChange={
                                                                                                                handleChange
                                                                                                        }
                                                                                                        required
                                                                                                        className="w-full p-3 border rounded-md pr-10 "
                                                                                                />
                                                                                                <button
                                                                                                        type="button"
                                                                                                        onClick={() =>
                                                                                                                setShowPassword(
                                                                                                                        !showPassword
                                                                                                                )
                                                                                                        }
                                                                                                        className="cursor-pointer absolute inset-y-0 right-0 flex items-center px-3 text-gray-500"
                                                                                                >
                                                                                                        {showPassword ? (
                                                                                                                <EyeOff
                                                                                                                        size={
                                                                                                                                20
                                                                                                                        }
                                                                                                                />
                                                                                                        ) : (
                                                                                                                <Eye
                                                                                                                        size={
                                                                                                                                20
                                                                                                                        }
                                                                                                                />
                                                                                                        )}
                                                                                                </button>
                                                                                        </div>
                                                                                </div>
                                                                                <div>
                                                                                        <label className="block text-sm font-medium mb-1">
                                                                                                Confirm Password
                                                                                        </label>
                                                                                        <div className="relative">
                                                                                                <input
                                                                                                        title="Confirm Password"
                                                                                                        placeholder="Confirm Password"
                                                                                                        type={
                                                                                                                showConfirmPassword
                                                                                                                        ? "text"
                                                                                                                        : "password"
                                                                                                        }
                                                                                                        name="confirmPassword"
                                                                                                        value={
                                                                                                                formData.confirmPassword
                                                                                                        }
                                                                                                        onChange={
                                                                                                                handleChange
                                                                                                        }
                                                                                                        required
                                                                                                        className="w-full p-3 border rounded-md pr-10"
                                                                                                />
                                                                                                <button
                                                                                                        type="button"
                                                                                                        onClick={() =>
                                                                                                                setShowConfirmPassword(
                                                                                                                        !showConfirmPassword
                                                                                                                )
                                                                                                        }
                                                                                                        className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500"
                                                                                                >
                                                                                                        {showConfirmPassword ? (
                                                                                                                <EyeOff
                                                                                                                        size={
                                                                                                                                20
                                                                                                                        }
                                                                                                                />
                                                                                                        ) : (
                                                                                                                <Eye
                                                                                                                        size={
                                                                                                                                20
                                                                                                                        }
                                                                                                                />
                                                                                                        )}
                                                                                                </button>
                                                                                        </div>
                                                                                </div>
                                                                                <div className="md:col-span-2 mt-4">
                                                                                        <div className="flex items-start gap-3">
                                                                                                <input
                                                                                                        id="terms"
                                                                                                        name="agreedToTerms"
                                                                                                        type="checkbox"
                                                                                                        checked={
                                                                                                                formData.agreedToTerms
                                                                                                        }
                                                                                                        onChange={(e) =>
                                                                                                                setFormData(
                                                                                                                        (
                                                                                                                                prev
                                                                                                                        ) => ({
                                                                                                                                ...prev,
                                                                                                                                agreedToTerms:
                                                                                                                                        e
                                                                                                                                                .target
                                                                                                                                                .checked,
                                                                                                                        })
                                                                                                                )
                                                                                                        }
                                                                                                        className="h-5 w-5 mt-1 rounded border-gray-300 text-brand-purple focus:ring-brand-purple"
                                                                                                />
                                                                                                <label
                                                                                                        htmlFor="terms"
                                                                                                        className="text-sm text-gray-600"
                                                                                                >
                                                                                                        I confirm that I
                                                                                                        have the
                                                                                                        authority to
                                                                                                        register this
                                                                                                        business and
                                                                                                        agree to the{" "}
                                                                                                        <Link
                                                                                                                href="/terms"
                                                                                                                className="font-semibold text-brand-purple hover:underline"
                                                                                                        >
                                                                                                                Partner
                                                                                                                Terms
                                                                                                                and
                                                                                                                Conditions
                                                                                                        </Link>
                                                                                                        .
                                                                                                </label>
                                                                                        </div>
                                                                                </div>
                                                                        </div>
                                                                </motion.div>
                                                        )}

                                                        {/* Navigation Buttons */}
                                                        <div className="flex justify-between mt-10 border-t pt-6">
                                                                <Button
                                                                        type="button"
                                                                        onClickFunction={prevStep}
                                                                        disabled={step === 1}
                                                                        className="bg-gray-200 text-gray-800 hover:bg-gray-300 cursor-pointer"
                                                                >
                                                                        Previous
                                                                </Button>
                                                                {step < steps.length ? (
                                                                        <Button
                                                                                type="button"
                                                                                onClickFunction={nextStep}
                                                                                className="bg-brand-purple text-white hover:bg-brand-purple/90 cursor-pointer"
                                                                        >
                                                                                Next Step
                                                                        </Button>
                                                                ) : (
                                                                        <Button
                                                                                type="submit"
                                                                                className="bg-brand-green text-white hover:bg-brand-green/90 cursor-pointer"
                                                                        >
                                                                                Submit Application
                                                                        </Button>
                                                                )}
                                                        </div>
                                                </form>
                                        </div>
                                </div>
                        </section>
                </main>
        );
}
