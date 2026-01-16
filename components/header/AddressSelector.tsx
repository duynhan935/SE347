"use client";

import { ChevronDown, MapPin } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const popularAddresses = [
    "123 Main Street, District 1, HCMC",
    "456 Second Avenue, District 1, HCMC",
    "789 Third Boulevard, Binh Thanh District, HCMC",
    "321 Fourth Road, District 3, HCMC",
];

export default function AddressSelector() {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedAddress, setSelectedAddress] = useState("Deliver to: Select address");
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    const handleAddressSelect = (address: string) => {
        setSelectedAddress(`Deliver to: ${address}`);
        setIsOpen(false);
        // TODO: Update location filter in URL params or store
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="hidden lg:flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-gray-200 hover:border-[#EE4D2D]/50 transition-all duration-200 text-sm font-medium text-gray-700 min-w-[180px] max-w-[240px]"
            >
                <MapPin className="w-4 h-4 text-[#EE4D2D] flex-shrink-0" />
                <span className="truncate text-left flex-1 text-xs">{selectedAddress}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-gray-400 flex-shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-[320px] bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
                    <div className="p-3 border-b border-gray-100">
                        <h3 className="text-sm font-semibold text-gray-800">Select delivery address</h3>
                    </div>
                    <div className="max-h-[300px] overflow-y-auto">
                        {popularAddresses.map((address, index) => (
                            <button
                                key={index}
                                onClick={() => handleAddressSelect(address)}
                                className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0"
                            >
                                <div className="flex items-start gap-3">
                                    <MapPin className="w-4 h-4 text-brand-orange mt-0.5 flex-shrink-0" />
                                    <span className="text-sm text-gray-700">{address}</span>
                                </div>
                            </button>
                        ))}
                        <button
                            onClick={() => {
                                // TODO: Open address input modal
                                setIsOpen(false);
                            }}
                            className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-t border-gray-100"
                        >
                            <div className="flex items-center gap-3">
                                <MapPin className="w-4 h-4 text-brand-purple mt-0.5 flex-shrink-0" />
                                <span className="text-sm font-medium text-brand-purple">+ Add new address</span>
                            </div>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

