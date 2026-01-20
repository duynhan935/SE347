"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";

export default function FilterSection({
    title,
    defaultOpen = true,
    children,
}: {
    title: string;
    defaultOpen?: boolean;
    children: React.ReactNode;
}) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="py-4 border-b border-gray-200">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center mb-3">
                <h5 className="font-semibold text-gray-900 text-sm">{title}</h5>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>
            {isOpen && <div className="space-y-2">{children}</div>}
        </div>
    );
}


