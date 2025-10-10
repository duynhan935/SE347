import Link from "next/link";
import { ChevronDown, ChevronRight } from "@/constants"; 

interface MenuItemProps {
    icon: React.ComponentType<{ size?: number }>;
    label: string;
    href?: string;
    children?: Array<{
        label: string;
        href: string;
    }>;
    isOpen?: boolean;
    onToggle?: () => void;
}

export default function MenuItem({ icon: Icon, label, href, children, isOpen, onToggle }: MenuItemProps) {
    if (children && children.length > 0) {
        return (
            <div>
                <button
                    onClick={onToggle}
                    className="flex items-center justify-between w-full gap-3 py-2 px-3 rounded hover:bg-gray-100 text-left"
                >
                    <div className="flex items-center gap-3">
                        <Icon size={20} />
                        <p className="text-p2">{label}</p>
                    </div>
                    {isOpen ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                </button>
                {isOpen && (
                    <div className="ml-8 mt-1 space-y-1">
                        {children.map((child, index) => (
                            <Link
                                key={index}
                                href={child.href}
                                className="block py-2 px-3 rounded hover:bg-gray-100 text-sm text-gray-600 hover:text-gray-900"
                            >
                                {child.label}
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    return (
        <Link href={href || "#"} className="flex items-center gap-3 py-2 px-3 rounded hover:bg-gray-100">
            <Icon size={20} />
            <p className="text-p2">{label}</p>
        </Link>
    );
};
