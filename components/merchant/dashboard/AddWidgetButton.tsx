import { Plus, ChevronDown } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

export default function AddWidgetButton({ onClick }: { onClick: () => void }) {
    return (
        <div className="flex bg-orange-500 rounded shadow-sm overflow-hidden">
            <button
                className="flex items-center gap-2 px-4 py-2 text-white text-p3 font-medium hover:bg-orange-600 transition-colors cursor-pointer"
                onClick={onClick}
            >
                <Plus size={16} />
                Add Widget
            </button>
            <div className="w-px bg-orange-600"></div>
            <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                    <button className="px-3 py-2 bg-white hover:bg-orange-600 text-brand-orange hover:text-white transition-colors cursor-pointer">
                        <ChevronDown size={16} />
                    </button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content
                    sideOffset={8}
                    align="end"
                    className="bg-white rounded-lg shadow-lg border border-gray-200 p-1 min-w-[140px] z-50"
                >
                    <DropdownMenu.Item className="flex items-center text-red-500 font-medium text-sm px-3 py-2 rounded hover:bg-red-50 cursor-pointer outline-none">
                        Reset Widgets
                    </DropdownMenu.Item>
                    <DropdownMenu.Arrow className="fill-white drop-shadow-sm" />
                </DropdownMenu.Content>
            </DropdownMenu.Root>
        </div>
    );
}
