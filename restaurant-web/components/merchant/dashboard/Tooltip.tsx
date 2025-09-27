export default function Tooltip({ children, text }: { children: React.ReactNode; text: string }) {
    return (
        <div className="group relative flex items-center justify-center">
            {children}
            <span
                className="pointer-events-none absolute top-full left-1/2 -translate-x-1/2 mt-2 z-20
                whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100 transition"
            >
                {/* Mũi tên tam giác quay xuống */}
                <span
                    className="absolute left-1/2 -top-2 -translate-x-1/2 w-0 h-0 
                    border-l-8 border-r-8 border-b-8  border-l-transparent border-r-transparent border-b-gray-900"
                ></span>
                {text}
            </span>
        </div>
    );
}
