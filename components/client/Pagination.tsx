"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type PaginationProps = {
        currentPage: number;
        totalPages: number;
        onPageChange?: (page: number) => void;
        showInfo?: boolean;
        scrollToTop?: boolean;
        className?: string;
};

export default function Pagination({
        currentPage,
        totalPages,
        onPageChange,
        showInfo = true,
        scrollToTop = true,
        className = "",
}: PaginationProps) {
        const router = useRouter();
        const pathname = usePathname();
        const searchParams = useSearchParams();

        const handlePageChange = (page: number) => {
                if (page < 1 || page > totalPages) return;

                // Scroll to top if enabled
                if (scrollToTop) {
                        window.scrollTo({ top: 0, behavior: "smooth" });
                }

                // If custom handler provided, use it
                if (onPageChange) {
                        onPageChange(page);
                        return;
                }

                // Otherwise, update URL params
                const currentParams = new URLSearchParams(Array.from(searchParams.entries()));
                currentParams.set("page", String(page));
                router.push(`${pathname}?${currentParams.toString()}`, { scroll: false });
        };

        const generatePageNumbers = () => {
                const pages: (number | string)[] = [];
                const maxVisible = 7; // Maximum number of page buttons to show

                if (totalPages <= maxVisible) {
                        // Show all pages if total pages is small
                        for (let i = 1; i <= totalPages; i++) {
                                pages.push(i);
                        }
                } else {
                        // Always show first page
                        pages.push(1);

                        if (currentPage > 3) {
                                pages.push("...");
                        }

                        // Show pages around current page
                        const start = Math.max(2, currentPage - 1);
                        const end = Math.min(totalPages - 1, currentPage + 1);

                        for (let i = start; i <= end; i++) {
                                if (i !== 1 && i !== totalPages) {
                                        pages.push(i);
                                }
                        }

                        if (currentPage < totalPages - 2) {
                                pages.push("...");
                        }

                        // Always show last page
                        if (totalPages > 1) {
                                pages.push(totalPages);
                        }
                }

                // Remove duplicates and ellipsis at start/end
                const result: (number | string)[] = [];
                for (let i = 0; i < pages.length; i++) {
                        if (i === 0 || i === pages.length - 1) {
                                result.push(pages[i]);
                        } else if (pages[i] !== pages[i - 1]) {
                                result.push(pages[i]);
                        }
                }

                return result;
        };

        const pageNumbers = generatePageNumbers();

        if (totalPages <= 1) return null;

        return (
                <div className={`flex flex-col sm:flex-row justify-between items-center gap-4 ${className}`}>
                        {showInfo && (
                                <p className="text-sm text-gray-600">
                                        Trang <span className="font-semibold">{currentPage}</span> /{" "}
                                        <span className="font-semibold">{totalPages}</span>
                                </p>
                        )}

                        <nav aria-label="Pagination">
                                <ul className="flex items-center -space-x-px h-10 text-sm">
                                        {/* Previous Button */}
                                        <li>
                                                <button
                                                        onClick={() => handlePageChange(currentPage - 1)}
                                                        disabled={currentPage === 1}
                                                        className="flex items-center justify-center px-3 h-10 ms-0 leading-tight text-gray-500 bg-white border border-e-0 border-gray-300 rounded-s-lg hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                        aria-label="Trang trước"
                                                >
                                                        <ChevronLeft className="w-4 h-4" />
                                                        <span className="sr-only">Previous</span>
                                                </button>
                                        </li>

                                        {/* Page Numbers */}
                                        {pageNumbers.map((page, index) => (
                                                <li key={`${page}-${index}`}>
                                                        {typeof page === "number" ? (
                                                                <button
                                                                        onClick={() => handlePageChange(page)}
                                                                        className={`flex items-center justify-center px-4 h-10 leading-tight border border-gray-300 transition-colors ${
                                                                                currentPage === page
                                                                                        ? "bg-brand-purple text-white border-brand-purple z-10 font-semibold"
                                                                                        : "bg-white text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                                                                        }`}
                                                                        aria-label={`Trang ${page}`}
                                                                        aria-current={
                                                                                currentPage === page
                                                                                        ? "page"
                                                                                        : undefined
                                                                        }
                                                                >
                                                                        {page}
                                                                </button>
                                                        ) : (
                                                                <span className="flex items-center justify-center px-3 h-10 leading-tight text-gray-500 bg-white border border-gray-300">
                                                                        ...
                                                                </span>
                                                        )}
                                                </li>
                                        ))}

                                        {/* Next Button */}
                                        <li>
                                                <button
                                                        onClick={() => handlePageChange(currentPage + 1)}
                                                        disabled={currentPage === totalPages}
                                                        className="flex items-center justify-center px-3 h-10 leading-tight text-gray-500 bg-white border border-gray-300 rounded-e-lg hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                        aria-label="Trang sau"
                                                >
                                                        <ChevronRight className="w-4 h-4" />
                                                        <span className="sr-only">Next</span>
                                                </button>
                                        </li>
                                </ul>
                        </nav>
                </div>
        );
}
