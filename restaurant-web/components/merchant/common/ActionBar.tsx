import { ReactNode } from "react";
import { Plus } from "lucide-react";

interface ActionBarProps {
    onNew?: () => void;
    newLabel?: string;
    secondaryLabel: string;
    secondaryIcon?: ReactNode;
    onSecondary?: () => void;
}

export default function ActionBar({
    onNew,
    newLabel = "New",
    secondaryLabel,
    secondaryIcon,
    onSecondary,
}: ActionBarProps) {
    return (
        <div className="flex items-center gap-3">
            <button
                className="bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg px-4 py-2 flex items-center gap-2 text-sm"
                onClick={onNew}
            >
                <Plus size={16} />
                {newLabel}
            </button>
            <button
                className="bg-white border border-gray-300 rounded-lg px-4 py-2 flex items-center gap-2 text-gray-700 font-medium text-sm hover:bg-gray-50"
                onClick={onSecondary}
            >
                {secondaryLabel}
                {secondaryIcon && secondaryIcon}
            </button>
        </div>
    );
}
