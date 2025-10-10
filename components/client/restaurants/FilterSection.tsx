"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";

const FilterSection = ({ title, children }: { title: string; children: React.ReactNode }) => {
        const [isOpen, setIsOpen] = useState(true);
        return (
                <div className="py-6 border-b">
                        <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center">
                                <h5 className="font-semibold ">{title}</h5>
                                <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                        </button>
                        {isOpen && <div className="mt-4 space-y-3">{children}</div>}
                </div>
        );
};

export default FilterSection;
