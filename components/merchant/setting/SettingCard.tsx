
interface SettingCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    variant?: "default" | "warning";
    onClick?: () => void;
}

export default function SettingCard({ icon, title, description, variant = "default", onClick }: SettingCardProps) {
    const borderClass =
        variant === "warning" ? "border-red-200 bg-red-50" : "border-gray-200 bg-white hover:bg-gray-50";

    return (
        <div
            className={`${borderClass} border rounded-lg p-3 cursor-pointer transition-colors group relative`}
            onClick={onClick}
        >
            <div className="flex items-center gap-3">
                <div className={`flex-shrink-0 ${variant === "warning" ? "text-gray-600" : "text-gray-600"}`}>
                    {icon}
                </div>
                <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2 text-lg group-hover:text-gray-700">{title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
                </div>
            </div>
        </div>
    );
}
