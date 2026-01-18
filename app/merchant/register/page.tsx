"use client";

import { Logo } from "@/constants";
import { authApi } from "@/lib/api/authApi";
import { restaurantApi } from "@/lib/api/restaurantApi";
import { Check, Eye, EyeOff, MapPin, Upload } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

export default function MerchantRegisterPage() {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    // Restaurant information
    const [resName, setResName] = useState("");
    const [address, setAddress] = useState("");
    const [longitude, setLongitude] = useState<number>(0);
    const [latitude, setLatitude] = useState<number>(0);
    const [openingTime, setOpeningTime] = useState("09:00");
    const [closingTime, setClosingTime] = useState("22:00");
    const [phone, setPhone] = useState("");
    const [restaurantImage, setRestaurantImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setRestaurantImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleGetLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLatitude(position.coords.latitude);
                    setLongitude(position.coords.longitude);
                    toast.success("Location retrieved successfully!");
                },
                () => {
                    toast.error("Unable to retrieve location. Please enter manually.");
                },
            );
        } else {
            toast.error("Browser does not support location services.");
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error("Password and confirm password do not match");
            return;
        }

        if (password.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        // Validate restaurant information
        if (!resName.trim()) {
            toast.error("Please enter restaurant name");
            return;
        }

        if (!address.trim()) {
            toast.error("Please enter restaurant address");
            return;
        }

        if (longitude === 0 || latitude === 0) {
            toast.error("Please enter restaurant coordinates");
            return;
        }

        if (!phone.trim()) {
            toast.error("Please enter restaurant phone number");
            return;
        }

        setLoading(true);
        try {
            // Step 1: Register user
            await authApi.register({
                username,
                email,
                password,
                confirmPassword,
                role: "MERCHANT",
            });

            // Step 2: Get userId by fetching all users and finding the newly registered one
            let userId: string | null = null;
            try {
                const usersPage = await authApi.getAllUsers();
                const users = Array.isArray(usersPage?.content) ? usersPage.content : [];
                const newUser = users.find((u) => u.email === email && u.role === "MERCHANT");
                if (newUser) {
                    userId = newUser.id;
                }
            } catch (userError) {
                console.error("Could not fetch users to get userId:", userError);
            }

            // Step 3: Create restaurant if we have userId
            if (userId) {
                try {
                    const restaurantData = {
                        resName,
                        address,
                        longitude,
                        latitude,
                        openingTime,
                        closingTime,
                        phone,
                        merchantId: userId,
                    };

                    await restaurantApi.createRestaurant(restaurantData, restaurantImage || undefined);

                    toast.success(
                        "Merchant registration successful! Your request has been submitted and is pending admin approval. You will receive an email notification when approved.",
                        { duration: 5000 },
                    );
                } catch (restaurantError: unknown) {
                    const errorMsg =
                        (restaurantError as { response?: { data?: { message?: string } } })?.response?.data?.message ||
                        (restaurantError as { message?: string })?.message ||
                        "Unable to create restaurant at this time";
                    console.error("Restaurant creation error:", errorMsg);

                    // Save restaurant info to localStorage for later creation
                    const restaurantInfo = {
                        resName,
                        address,
                        longitude,
                        latitude,
                        openingTime,
                        closingTime,
                        phone,
                        email,
                        imageFile: restaurantImage
                            ? {
                                  name: restaurantImage.name,
                                  type: restaurantImage.type,
                                  size: restaurantImage.size,
                              }
                            : null,
                    };
                    localStorage.setItem(`pending_restaurant_${email}`, JSON.stringify(restaurantInfo));

                    toast.success(
                        "Merchant registration successful! Restaurant information has been saved. Restaurant will be created after approval. You will receive an email notification when approved.",
                        { duration: 5000 },
                    );
                }
            } else {
                // If we can't get userId, save restaurant info for later
                const restaurantInfo = {
                    resName,
                    address,
                    longitude,
                    latitude,
                    openingTime,
                    closingTime,
                    phone,
                    email,
                    imageFile: restaurantImage
                        ? {
                              name: restaurantImage.name,
                              type: restaurantImage.type,
                              size: restaurantImage.size,
                          }
                        : null,
                };
                localStorage.setItem(`pending_restaurant_${email}`, JSON.stringify(restaurantInfo));

                toast.success(
                    "Merchant registration successful! Restaurant information has been saved. Restaurant will be created after approval. You will receive an email notification when approved.",
                    { duration: 5000 },
                );
            }

            // Redirect to login page after successful registration
            // Merchant will be able to login only after admin approval
            setTimeout(() => {
                router.push("/login");
            }, 2000);
        } catch (error: unknown) {
            let errorMessage = "Unable to submit request. Please try again.";

            const errorResponse = error as {
                response?: {
                    data?: {
                        message?: string;
                        errorCode?: string;
                    };
                };
                message?: string;
            };

            if (errorResponse?.response?.data) {
                const errorData = errorResponse.response.data;

                if (
                    errorData.errorCode === "CONFLICT" ||
                    errorData.errorCode === "ILLEGAL_ARGUMENT" ||
                    errorData.message?.includes("Duplicate entry") ||
                    errorData.message?.includes("already in use") ||
                    errorData.message?.toLowerCase().includes("email") ||
                    errorData.message?.toLowerCase().includes("duplicate")
                ) {
                    if (errorData.message?.includes("already in use")) {
                        errorMessage = errorData.message;
                    } else {
                        errorMessage =
                            "This email is already in use. Please use a different email or login if you already have an account.";
                    }
                } else if (errorData.message) {
                    errorMessage = errorData.message;
                }
            } else if (errorResponse?.message) {
                errorMessage = errorResponse.message;
            }

            toast.error(errorMessage);
            console.error("Registration error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col lg:flex-row">
            {/* Left Column - Marketing/Hero Section */}
            <div className="w-full lg:w-1/2 bg-[#EE4D2D] relative overflow-hidden flex items-center justify-center p-8 lg:p-12">
                {/* Background Pattern - Simple gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5"></div>

                {/* Content */}
                <div className="relative z-10 max-w-md text-white">
                    {/* Logo */}
                    <div className="mb-8">
                        <Link href="/" className="inline-block">
                            <Image
                                src={Logo}
                                alt="FoodEats Logo"
                                width={160}
                                height={53}
                                className="h-12 w-auto brightness-0 invert"
                                priority
                            />
                        </Link>
                    </div>

                    {/* Headline */}
                    <h1 className="text-4xl lg:text-5xl font-bold mb-4 leading-tight">
                        Grow your business with FoodEats
                    </h1>

                    {/* Sub-headline */}
                    <p className="text-lg lg:text-xl mb-8 text-white/90">
                        Reach millions of new customers and boost your sales today.
                    </p>

                    {/* Benefits List */}
                    <ul className="space-y-4 mb-8">
                        <li className="flex items-center gap-3">
                            <div className="flex-shrink-0 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                                <Check className="w-4 h-4" />
                            </div>
                            <span className="text-lg">Free registration</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <div className="flex-shrink-0 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                                <Check className="w-4 h-4" />
                            </div>
                            <span className="text-lg">24/7 Support</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <div className="flex-shrink-0 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                                <Check className="w-4 h-4" />
                            </div>
                            <span className="text-lg">Fast Payouts</span>
                        </li>
                    </ul>

                    {/* Illustration */}
                    <div className="mt-12">
                        <svg
                            width="300"
                            height="250"
                            viewBox="0 0 300 250"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="mx-auto opacity-80"
                        >
                            <circle cx="150" cy="125" r="100" fill="white" fillOpacity="0.1" />
                            <path
                                d="M100 100C100 95.5817 103.582 92 108 92H192C196.418 92 200 95.5817 200 100V140C200 144.418 196.418 148 192 148H108C103.582 148 100 144.418 100 140V100Z"
                                fill="white"
                                fillOpacity="0.2"
                            />
                            <circle cx="130" cy="120" r="8" fill="white" fillOpacity="0.4" />
                            <circle cx="150" cy="120" r="8" fill="white" fillOpacity="0.4" />
                            <circle cx="170" cy="120" r="8" fill="white" fillOpacity="0.4" />
                            <path
                                d="M110 150C110 148.343 111.343 147 113 147H187C188.657 147 190 148.343 190 150C190 151.657 188.657 153 187 153H113C111.343 153 110 151.657 110 150Z"
                                fill="white"
                                fillOpacity="0.4"
                            />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Right Column - Form Section */}
            <div className="w-full lg:w-1/2 bg-white flex items-center justify-center p-8 lg:p-12">
                <div className="w-full max-w-lg">
                    {/* Form Header */}
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Partner Registration</h2>
                        <p className="text-gray-600">Fill in the form below to become our partner.</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Group 1: Account Information */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                                Account Information
                            </h3>

                            {/* Row 1: Username & Email */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                                        Username <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#EE4D2D] focus:border-[#EE4D2D] transition"
                                        placeholder="johndoe"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                        Email <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#EE4D2D] focus:border-[#EE4D2D] transition"
                                        placeholder="you@example.com"
                                    />
                                </div>
                            </div>

                            {/* Row 2: Password & Confirm Password */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                        Password <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            id="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#EE4D2D] focus:border-[#EE4D2D] transition pr-10"
                                            placeholder="••••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700"
                                        >
                                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label
                                        htmlFor="confirmPassword"
                                        className="block text-sm font-medium text-gray-700 mb-1"
                                    >
                                        Confirm Password <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            id="confirmPassword"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#EE4D2D] focus:border-[#EE4D2D] transition pr-10"
                                            placeholder="••••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700"
                                        >
                                            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Group 2: Restaurant Profile */}
                        <div className="space-y-4 border-t border-gray-200 pt-6">
                            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                                Restaurant Profile
                            </h3>

                            {/* Restaurant Name */}
                            <div>
                                <label htmlFor="resName" className="block text-sm font-medium text-gray-700 mb-1">
                                    Restaurant Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="resName"
                                    value={resName}
                                    onChange={(e) => setResName(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#EE4D2D] focus:border-[#EE4D2D] transition"
                                    placeholder="Enter restaurant name"
                                />
                            </div>

                            {/* Address */}
                            <div>
                                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                                    Address <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="address"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#EE4D2D] focus:border-[#EE4D2D] transition"
                                    placeholder="Enter restaurant address"
                                />
                            </div>

                            {/* Location Coordinates */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Location Coordinates <span className="text-red-500">*</span>
                                </label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                                    <div>
                                        <label htmlFor="latitude" className="block text-xs text-gray-600 mb-1">
                                            Latitude
                                        </label>
                                        <input
                                            type="number"
                                            id="latitude"
                                            value={latitude || ""}
                                            onChange={(e) => setLatitude(parseFloat(e.target.value) || 0)}
                                            required
                                            step="any"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#EE4D2D] focus:border-[#EE4D2D] transition"
                                            placeholder="10.762622"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="longitude" className="block text-xs text-gray-600 mb-1">
                                            Longitude
                                        </label>
                                        <input
                                            type="number"
                                            id="longitude"
                                            value={longitude || ""}
                                            onChange={(e) => setLongitude(parseFloat(e.target.value) || 0)}
                                            required
                                            step="any"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#EE4D2D] focus:border-[#EE4D2D] transition"
                                            placeholder="106.660172"
                                        />
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleGetLocation}
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#EE4D2D] border border-[#EE4D2D] rounded-md hover:bg-[#EE4D2D]/10 transition-colors"
                                >
                                    <MapPin className="h-4 w-4" />
                                    Auto-detect Location
                                </button>
                            </div>

                            {/* Opening & Closing Time */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label
                                        htmlFor="openingTime"
                                        className="block text-sm font-medium text-gray-700 mb-1"
                                    >
                                        Opening Time <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="time"
                                        id="openingTime"
                                        value={openingTime}
                                        onChange={(e) => setOpeningTime(e.target.value)}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#EE4D2D] focus:border-[#EE4D2D] transition"
                                    />
                                </div>
                                <div>
                                    <label
                                        htmlFor="closingTime"
                                        className="block text-sm font-medium text-gray-700 mb-1"
                                    >
                                        Closing Time <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="time"
                                        id="closingTime"
                                        value={closingTime}
                                        onChange={(e) => setClosingTime(e.target.value)}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#EE4D2D] focus:border-[#EE4D2D] transition"
                                    />
                                </div>
                            </div>

                            {/* Phone */}
                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                                    Phone Number <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="tel"
                                    id="phone"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#EE4D2D] focus:border-[#EE4D2D] transition"
                                    placeholder="0123456789"
                                />
                            </div>

                            {/* Restaurant Image */}
                            <div>
                                <label
                                    htmlFor="restaurantImage"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Restaurant Image
                                </label>
                                <div className="flex items-center gap-4">
                                    <label
                                        htmlFor="restaurantImage"
                                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 transition-colors"
                                    >
                                        <Upload className="h-4 w-4" />
                                        <span className="text-sm">Choose image</span>
                                        <input
                                            type="file"
                                            id="restaurantImage"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="hidden"
                                        />
                                    </label>
                                    {imagePreview && (
                                        <div className="relative">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                className="h-16 w-16 object-cover rounded-md"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setRestaurantImage(null);
                                                    setImagePreview(null);
                                                }}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Info Note */}
                        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 text-sm text-blue-800">
                            <p className="font-semibold mb-1">Note:</p>
                            <p>
                                Your request will be sent to admin for approval. You will receive an email notification
                                when approved or rejected. Restaurant information will be created after you are
                                approved. You can log in after approval.
                            </p>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 px-6 bg-[#EE4D2D] text-white font-bold rounded-md hover:bg-[#EE4D2D]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#EE4D2D] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                        >
                            {loading ? "Submitting..." : "Submit Registration"}
                        </button>

                        {/* Footer Link */}
                        <p className="text-center text-sm text-gray-600">
                            Already a partner?{" "}
                            <Link
                                href="/login"
                                className="font-semibold text-[#EE4D2D] hover:text-[#EE4D2D]/80 hover:underline"
                            >
                                Sign In
                            </Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}
