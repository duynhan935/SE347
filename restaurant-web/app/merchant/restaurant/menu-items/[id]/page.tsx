"use client";
import React, { useState } from "react";
import { ChevronLeft, Save, ChevronDown, Trash2, Plus, Edit } from "lucide-react";
import Link from "next/link";

interface MenuFormData {
    name: string;
    price: string;
    priority: string;
    category: string;
    ingredients: string;
    mealtime: string;
    locations: string;
    minimumQuantity: string;
    stockQuantity: string;
    orderRestriction: "delivery" | "pickup";
    status: boolean;
    description: string;
    image: File | null;
}

export default function MenuEditForm() {
    const [activeTab, setActiveTab] = useState<"menu" | "options" | "specials">("menu");
    const [formData, setFormData] = useState<MenuFormData>({
        name: "Boiled Plantain",
        price: "9.99",
        priority: "0",
        category: "",
        ingredients: "",
        mealtime: "",
        locations: "",
        minimumQuantity: "1",
        stockQuantity: "0",
        orderRestriction: "delivery",
        status: false,
        description: "w/spinach soup",
        image: null,
    });

    const [dropdownStates, setDropdownStates] = useState({
        category: false,
        ingredients: false,
        mealtime: false,
        locations: false,
    });

    const categories = ["Appetizers", "Main Course", "Desserts", "Beverages"];
    const ingredients = ["Plantain", "Spinach", "Onions", "Tomatoes", "Spices"];
    const mealtimes = ["Breakfast", "Lunch", "Dinner", "All Day"];
    const locations = ["Kitchen 1", "Kitchen 2", "Bar", "Main Kitchen"];

    const handleInputChange = (field: keyof MenuFormData, value: string | boolean) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const toggleDropdown = (dropdown: keyof typeof dropdownStates) => {
        setDropdownStates((prev) => ({
            ...prev,
            [dropdown]: !prev[dropdown],
        }));
    };

    const selectOption = (dropdown: keyof typeof dropdownStates, value: string) => {
        handleInputChange(dropdown, value);
        setDropdownStates((prev) => ({
            ...prev,
            [dropdown]: false,
        }));
    };

    const handleSave = () => {
        console.log("Saving menu data:", formData);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFormData((prev) => ({
                ...prev,
                image: file,
            }));
        }
    };

    const renderDropdown = (field: keyof typeof dropdownStates, options: string[], placeholder: string) => (
        <div className="relative">
            <button
                type="button"
                onClick={() => toggleDropdown(field)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-left focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent flex items-center justify-between"
            >
                <span className={formData[field] ? "text-gray-900" : "text-gray-400"}>
                    {formData[field] || placeholder}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>

            {dropdownStates[field] && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                    {options.map((option) => (
                        <button
                            key={option}
                            type="button"
                            onClick={() => selectOption(field, option)}
                            className="w-full px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                        >
                            {option}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b">
                <div className="px-6 py-4">
                    <div className="flex items-center gap-2 mb-4">
                        <Link href="/merchant/restaurant/menu-items" className="hover:text-gray-700">
                            <ChevronLeft className="w-5 h-5 text-gray-600" />
                        </Link>
                        <h1 className="text-xl font-semibold text-gray-900">Menu</h1>
                        <span className="text-gray-400">Edit</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3 mb-4">
                        <button
                            onClick={handleSave}
                            className="inline-flex items-center px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-md transition-colors"
                        >
                            <Save className="w-4 h-4 mr-2" />
                            Save
                        </button>
                        <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-md">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-6">
                        {(["menu", "options", "specials"] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors capitalize ${
                                    activeTab === tab
                                        ? "text-orange-500 border-orange-500"
                                        : "text-gray-500 border-transparent hover:text-gray-700"
                                }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* Form Content */}
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Left Column */}
                            <div className="space-y-6">
                                {/* Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => handleInputChange("name", e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    />
                                </div>

                                {/* Category */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                                    {renderDropdown("category", categories, "- please select -")}
                                </div>

                                {/* Mealtime */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Mealtime</label>
                                    {renderDropdown("mealtime", mealtimes, "- please select -")}
                                    <p className="text-xs text-gray-500 mt-1">
                                        Set what time of day your customers can order this menu. Mealtimes can be
                                        managed under Kitchen &gt; Mealtimes
                                    </p>
                                </div>

                                {/* Minimum Quantity */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Minimum Quantity
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.minimumQuantity}
                                        onChange={(e) => handleInputChange("minimumQuantity", e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Enter the minimum quantity that can be ordered by customers.
                                    </p>
                                </div>

                                {/* Order Restriction */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Order Restriction
                                    </label>
                                    <div className="flex gap-4">
                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                name="orderRestriction"
                                                value="delivery"
                                                checked={formData.orderRestriction === "delivery"}
                                                onChange={(e) =>
                                                    handleInputChange(
                                                        "orderRestriction",
                                                        e.target.value as "delivery" | "pickup"
                                                    )
                                                }
                                                className="mr-2"
                                            />
                                            Delivery
                                        </label>
                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                name="orderRestriction"
                                                value="pickup"
                                                checked={formData.orderRestriction === "pickup"}
                                                onChange={(e) =>
                                                    handleInputChange(
                                                        "orderRestriction",
                                                        e.target.value as "delivery" | "pickup"
                                                    )
                                                }
                                                className="mr-2"
                                            />
                                            Pick-up
                                        </label>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Whether to restrict the menu to a specific order type.
                                    </p>
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => handleInputChange("description", e.target.value)}
                                        rows={4}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                                    />
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className="space-y-6">
                                {/* Price & Priority */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                                                £
                                            </span>
                                            <input
                                                type="text"
                                                value={formData.price}
                                                onChange={(e) => handleInputChange("price", e.target.value)}
                                                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                                        <input
                                            type="text"
                                            value={formData.priority}
                                            onChange={(e) => handleInputChange("priority", e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                {/* Ingredients/Allergens */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Ingredients/Allergens
                                    </label>
                                    {renderDropdown("ingredients", ingredients, "- please select -")}
                                </div>

                                {/* Location(s) */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Location(s)</label>
                                    {renderDropdown("locations", locations, "- please select -")}
                                </div>

                                {/* Stock Quantity */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Stock Quantity
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            value={formData.stockQuantity}
                                            onChange={(e) => handleInputChange("stockQuantity", e.target.value)}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        />
                                        <button className="p-2 text-gray-400 hover:text-gray-600">
                                            <Edit className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Total stock available for this menu at all selected locations.
                                    </p>
                                </div>

                                {/* Status */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                                    <div className="flex items-center">
                                        <button
                                            onClick={() => handleInputChange("status", !formData.status)}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
                                                formData.status ? "bg-orange-500" : "bg-gray-200"
                                            }`}
                                        >
                                            <span
                                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                                    formData.status ? "translate-x-6" : "translate-x-1"
                                                }`}
                                            />
                                        </button>
                                        <span className="ml-3 text-sm text-gray-700">Disabled/Enabled</span>
                                    </div>
                                </div>

                                {/* Image */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Image</label>
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-gray-400 transition-colors">
                                        <Plus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="hidden"
                                            id="image-upload"
                                        />
                                        <label
                                            htmlFor="image-upload"
                                            className="cursor-pointer text-sm text-gray-500 hover:text-gray-700"
                                        >
                                            Select a file to update menu image, otherwise leave blank.
                                        </label>
                                        {formData.image && (
                                            <p className="mt-2 text-sm text-green-600">
                                                Selected: {formData.image.name}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
