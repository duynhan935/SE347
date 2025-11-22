"use client";
import { useAuthStore } from "@/stores/useAuthStore";
import { ChevronDown, Save } from "lucide-react";
import React, { useEffect, useState } from "react";

interface StaffMember {
        fullName: string;
        email: string;
        telephone: string;
        username: string;
        language: string;
        password: string;
        passwordConfirm: string;
}

const StaffMemberEdit: React.FC = () => {
        const { user } = useAuthStore();
        const [formData, setFormData] = useState<StaffMember>({
                fullName: "",
                email: "",
                telephone: "",
                username: "",
                language: "",
                password: "",
                passwordConfirm: "",
        });

        // Initialize form with user data
        useEffect(() => {
                if (user) {
                        setFormData((prev) => ({
                                ...prev,
                                fullName: user.username || "",
                                email: user.email || "",
                                username: user.username || "",
                                telephone: user.phone || "",
                        }));
                }
        }, [user]);

        const [isLanguageOpen, setIsLanguageOpen] = useState(false);

        const languageOptions = ["English", "Tiếng Việt", "Français", "Español", "Deutsch", "中文", "日本語"];

        const handleInputChange = (field: keyof StaffMember, value: string) => {
                setFormData((prev) => ({
                        ...prev,
                        [field]: value,
                }));
        };

        const handleLanguageSelect = (language: string) => {
                setFormData((prev) => ({
                        ...prev,
                        language: language,
                }));
                setIsLanguageOpen(false);
        };

        const handleSave = () => {
                console.log("Saving staff member data:", formData);
                // Add your save logic here
        };

        return (
                <div className="min-h-screen">
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                                <h1 className="text-2xl font-semibold text-gray-900">Staff member Edit</h1>
                        </div>
                        <div className="mx-auto bg-white rounded-lg shadow-sm">
                                {/* Form */}
                                <div className="p-6">
                                        {/* Save Button */}
                                        <button
                                                onClick={handleSave}
                                                className="mb-6 inline-flex items-center px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-md transition-colors"
                                        >
                                                <Save className="w-4 h-4 mr-2" />
                                                Save
                                        </button>

                                        {/* Form Fields */}
                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                                {/* Full Name */}
                                                <div>
                                                        <label
                                                                htmlFor="fullName"
                                                                className="block text-sm font-medium text-gray-700 mb-2"
                                                        >
                                                                Full Name
                                                        </label>
                                                        <input
                                                                id="fullName"
                                                                type="text"
                                                                value={formData.fullName}
                                                                onChange={(e) =>
                                                                        handleInputChange("fullName", e.target.value)
                                                                }
                                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                                                placeholder="Enter full name"
                                                        />
                                                </div>

                                                {/* Email */}
                                                <div>
                                                        <label
                                                                htmlFor="email"
                                                                className="block text-sm font-medium text-gray-700 mb-2"
                                                        >
                                                                Email
                                                        </label>
                                                        <input
                                                                id="email"
                                                                type="email"
                                                                value={formData.email}
                                                                onChange={(e) =>
                                                                        handleInputChange("email", e.target.value)
                                                                }
                                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                                                placeholder="Enter email address"
                                                        />
                                                </div>

                                                {/* Telephone */}
                                                <div>
                                                        <label
                                                                htmlFor="telephone"
                                                                className="block text-sm font-medium text-gray-700 mb-2"
                                                        >
                                                                Telephone
                                                        </label>
                                                        <input
                                                                id="telephone"
                                                                type="tel"
                                                                value={formData.telephone}
                                                                onChange={(e) =>
                                                                        handleInputChange("telephone", e.target.value)
                                                                }
                                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                                                placeholder="Enter phone number"
                                                        />
                                                </div>

                                                {/* Username */}
                                                <div>
                                                        <label
                                                                htmlFor="username"
                                                                className="block text-sm font-medium text-gray-700 mb-2"
                                                        >
                                                                Username
                                                        </label>
                                                        <input
                                                                id="username"
                                                                type="text"
                                                                value={formData.username}
                                                                onChange={(e) =>
                                                                        handleInputChange("username", e.target.value)
                                                                }
                                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                                                placeholder="Enter username"
                                                        />
                                                </div>

                                                {/* Language */}
                                                <div className="relative">
                                                        <label
                                                                htmlFor="language"
                                                                className="block text-sm font-medium text-gray-700 mb-2"
                                                        >
                                                                Language
                                                        </label>
                                                        <button
                                                                type="button"
                                                                onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                                                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-left focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent flex items-center justify-between"
                                                        >
                                                                <span
                                                                        className={
                                                                                formData.language
                                                                                        ? "text-gray-900"
                                                                                        : "text-gray-400"
                                                                        }
                                                                >
                                                                        {formData.language || "- please select -"}
                                                                </span>
                                                                <ChevronDown className="w-4 h-4 text-gray-400" />
                                                        </button>

                                                        {isLanguageOpen && (
                                                                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                                                                        {languageOptions.map((option) => (
                                                                                <button
                                                                                        key={option}
                                                                                        type="button"
                                                                                        onClick={() =>
                                                                                                handleLanguageSelect(
                                                                                                        option
                                                                                                )
                                                                                        }
                                                                                        className="w-full px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                                                                                >
                                                                                        {option}
                                                                                </button>
                                                                        ))}
                                                                </div>
                                                        )}
                                                </div>

                                                {/* Empty space for grid alignment */}
                                                <div></div>

                                                {/* Password */}
                                                <div>
                                                        <label
                                                                htmlFor="password"
                                                                className="block text-sm font-medium text-gray-700 mb-2"
                                                        >
                                                                Password
                                                        </label>
                                                        <input
                                                                id="password"
                                                                type="password"
                                                                value={formData.password}
                                                                onChange={(e) =>
                                                                        handleInputChange("password", e.target.value)
                                                                }
                                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                                                placeholder="Enter password"
                                                        />
                                                </div>

                                                {/* Password Confirm */}
                                                <div>
                                                        <label
                                                                htmlFor="passwordConfirm"
                                                                className="block text-sm font-medium text-gray-700 mb-2"
                                                        >
                                                                Password Confirm
                                                        </label>
                                                        <input
                                                                id="passwordConfirm"
                                                                type="password"
                                                                value={formData.passwordConfirm}
                                                                onChange={(e) =>
                                                                        handleInputChange(
                                                                                "passwordConfirm",
                                                                                e.target.value
                                                                        )
                                                                }
                                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                                                placeholder="Confirm password"
                                                        />
                                                </div>
                                        </div>
                                </div>
                        </div>
                </div>
        );
};

export default StaffMemberEdit;
