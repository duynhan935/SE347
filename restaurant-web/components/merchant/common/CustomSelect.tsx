"use client";

import { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

export interface DropdownOption {
    value: string;
    label: string;
}

interface CustomSelectProps {
    options: DropdownOption[];
    placeholder: string;
    value?: string;
    onChange?: (value: string) => void;
    className?: string;
}

export default function CustomSelect({ options, placeholder, value, onChange, className = "" }: CustomSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedValue, setSelectedValue] = useState(value || (options.length > 0 ? options[0].value : ""));

    const handleSelect = (optionValue: string) => {
        setSelectedValue(optionValue);
        setIsOpen(false);
        onChange?.(optionValue);
    };

    const selectedOption = options.find((opt) => opt.value === selectedValue);
    const displayText = selectedOption ? selectedOption.label : placeholder;

    return (
        <div className={`relative w-full ${className}`}>
            {/* Trigger Button */}
            <button
                type="button"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-left text-gray-500 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-between"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="text-sm">{displayText}</span>
                {isOpen ? (
                    <ChevronUp size={16} className="text-gray-400" />
                ) : (
                    <ChevronDown size={16} className="text-gray-400" />
                )}
            </button>

            {/* Dropdown Options */}
            {isOpen && (
                <div className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 overflow-hidden">
                    {/* Selected Option Header */}
                    <div className="bg-orange-300 px-4 py-2 text-white text-sm flex items-center justify-between">
                        <span>{displayText}</span>
                        <span className="text-xs opacity-75">Press to select</span>
                    </div>

                    {/* Options List */}
                    {options.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            className="w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0 text-sm"
                            onClick={() => handleSelect(option.value)}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            )}

            {/* Overlay để đóng dropdown khi click outside */}
            {isOpen && <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />}
        </div>
    );
}
