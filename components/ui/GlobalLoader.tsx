import { Logo } from "@/constants";
import Image from "next/image";

type GlobalLoaderProps = {
    label?: string;
    sublabel?: string;
    className?: string;
    showLogo?: boolean;
};

export default function GlobalLoader({
    label = "Loading",
    sublabel = "Please wait a moment",
    className,
    showLogo = false,
}: GlobalLoaderProps) {
    return (
        <div
            className={
                "fixed inset-0 z-[60] flex items-center justify-center " +
                "bg-gradient-to-b from-brand-purple/10 via-black/10 to-black/20 " +
                "backdrop-blur-md p-6 " +
                (className ?? "")
            }
            role="status"
            aria-live="polite"
            aria-busy="true"
        >
            <div className="relative w-full max-w-md rounded-2xl border border-white/30 bg-white/70 px-6 py-8 shadow-[0_24px_80px_rgba(0,0,0,0.18)] backdrop-blur-xl dark:border-white/10 dark:bg-gray-900/60">
                <div className="absolute -inset-px rounded-2xl bg-gradient-to-r from-brand-purple/20 via-transparent to-violet-500/20" />
                <div className="relative flex flex-col items-center">
                    {showLogo && (
                        <div className="relative mb-5 h-10 w-40 opacity-95">
                            <Image src={Logo} alt="Brand logo" fill className="object-contain" priority />
                        </div>
                    )}

                    <div className="relative mb-5 grid place-items-center">
                        <div className="absolute h-20 w-20 rounded-full border border-brand-purple/15 bg-brand-purple/10 blur-[1px]" />
                        <div className="absolute h-20 w-20 rounded-full border-2 border-brand-purple/20 animate-ping" />
                        <div className="h-14 w-14 rounded-full border-2 border-brand-purple/25 border-t-brand-purple animate-spin" />
                    </div>

                    <div className="text-center">
                        <p className="text-base font-semibold tracking-tight text-gray-900 dark:text-white">{label}</p>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{sublabel}</p>
                    </div>

                    <div className="mt-6 h-1.5 w-full overflow-hidden rounded-full bg-gray-200/70 dark:bg-white/10">
                        <div className="h-full w-1/2 animate-[loaderbar_1.2s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-brand-purple to-violet-500" />
                    </div>
                </div>
            </div>
        </div>
    );
}
