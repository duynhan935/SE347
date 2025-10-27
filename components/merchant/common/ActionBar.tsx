import { Plus } from "lucide-react";
import { ReactNode } from "react";

interface ActionBarProps {
        newLabel?: string;
        secondaryLabel?: string;
        tertiaryLabel?: string;
        secondaryIcon?: ReactNode;
        restaurantId?: string;
        onSecondary?: () => void;
        onTertiary?: () => void;
}

export default function ActionBar({
        newLabel = "New",
        secondaryLabel,
        secondaryIcon,
        restaurantId,
        onSecondary,
        tertiaryLabel,
        onTertiary,
}: ActionBarProps) {
        return (
                <div className="flex items-center gap-3">
                        <button
                                onClick={() =>
                                        (window.location.href = `/merchant/restaurant/${restaurantId}/menu-items/create`)
                                }
                                className="bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg px-4 py-2 flex items-center gap-2 text-sm cursor-pointer"
                        >
                                <Plus size={16} />
                                {newLabel}
                        </button>
                        {secondaryLabel && (
                                <button
                                        className="bg-white border border-gray-300 rounded-lg px-4 py-2 flex items-center gap-2 text-gray-700 font-medium text-sm hover:bg-gray-50"
                                        onClick={onSecondary}
                                >
                                        {secondaryLabel}
                                        {secondaryIcon && secondaryIcon}
                                </button>
                        )}
                        {tertiaryLabel && (
                                <button
                                        className="bg-white border border-gray-300 rounded-lg px-4 py-2 flex items-center gap-2 text-gray-700 font-medium text-sm hover:bg-gray-50"
                                        onClick={onTertiary}
                                >
                                        {tertiaryLabel}
                                </button>
                        )}
                </div>
        );
}
