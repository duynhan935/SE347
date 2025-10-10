"use client";
import { User, Clipboard, Edit3, Star, Trash2 } from "lucide-react";
import { useState } from "react";

interface ThemeSelectorProps {
    themeName?: string;
    themeSlug?: string;
    recordsText?: string;
}

export default function ThemeSelector({
    themeName = "Orange Theme [child]",
    themeSlug = "igniter-orange-child",
    recordsText = "Showing 1-1 of 1 records",
}: ThemeSelectorProps) {
    const [selectedTheme, setSelectedTheme] = useState(themeName);

    const handleIconClick = (action: string) => {
        console.log(`${action} clicked`);
    };

    return (
        <div className="bg-white border border-gray-200 rounded-lg">
            {/* Top section with icons and theme name */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center gap-2">
                    {/* Action Icons */}
                    <div className="flex gap-1">
                        <button
                            onClick={() => handleIconClick("user")}
                            className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors"
                            title="User"
                        >
                            <User size={18} className="text-gray-600" />
                        </button>

                        <button
                            onClick={() => handleIconClick("clipboard")}
                            className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors"
                            title="Copy"
                        >
                            <Clipboard size={18} className="text-gray-600" />
                        </button>

                        <button
                            onClick={() => handleIconClick("edit")}
                            className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors"
                            title="Edit"
                        >
                            <Edit3 size={18} className="text-gray-600" />
                        </button>

                        <button
                            onClick={() => handleIconClick("star")}
                            className="w-10 h-10 bg-orange-100 hover:bg-orange-200 rounded-lg flex items-center justify-center transition-colors"
                            title="Favorite"
                        >
                            <Star size={18} className="text-orange-500 fill-orange-500" />
                        </button>

                        <button
                            onClick={() => handleIconClick("delete")}
                            className="w-10 h-10 bg-gray-100 hover:bg-red-100 rounded-lg flex items-center justify-center transition-colors"
                            title="Delete"
                        >
                            <Trash2 size={18} className="text-gray-600 hover:text-red-500" />
                        </button>
                    </div>

                    {/* Theme Name */}
                    <div className="ml-4">
                        <h3 className="font-medium text-gray-900">{selectedTheme}</h3>
                        <p className="text-sm text-gray-500">{themeSlug}</p>
                    </div>
                </div>
            </div>

            {/* Bottom section - empty content area */}
            <div className="p-8">
                {/* This would be where theme preview or content goes */}
                <div className="h-32 bg-gray-50 rounded-lg flex items-center justify-center">
                    <p className="text-gray-400 text-sm">Theme Preview Area</p>
                </div>
            </div>

            {/* Footer with records count */}
            <div className="flex justify-end px-4 py-3 border-t border-gray-200">
                <span className="text-sm text-gray-500">{recordsText}</span>
            </div>
        </div>
    );
}
