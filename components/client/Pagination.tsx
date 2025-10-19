// File: app/restaurants/_components/Pagination.tsx
"use client";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type PaginationProps = {
        totalResults: number;
        itemsPerPage: number;
};

export default function Pagination({ totalResults, itemsPerPage }: PaginationProps) {
        const router = useRouter();
        const pathname = usePathname();
        const searchParams = useSearchParams();

        const currentPage = Number(searchParams.get("page")) || 1;
        const totalPages = Math.ceil(totalResults / itemsPerPage);

        const handlePageChange = (page: number) => {
                if (page < 1 || page > totalPages) return;

                const currentParams = new URLSearchParams(Array.from(searchParams.entries()));
                currentParams.set("page", String(page));
                router.push(`${pathname}?${currentParams.toString()}`, { scroll: false });
        };

        const generatePageNumbers = () => {
                const pages = [];
                if (totalPages <= 5) {
                        for (let i = 1; i <= totalPages; i++) {
                                pages.push(i);
                        }
                } else {
                        pages.push(1);
                        if (currentPage > 3) pages.push("...");
                        if (currentPage > 2) pages.push(currentPage - 1);
                        if (currentPage !== 1 && currentPage !== totalPages) pages.push(currentPage);
                        if (currentPage < totalPages - 1) pages.push(currentPage + 1);
                        if (currentPage < totalPages - 2) pages.push("...");
                        pages.push(totalPages);
                }
                return [...new Set(pages)];
        };

        const pageNumbers = generatePageNumbers();
        const startItem = (currentPage - 1) * itemsPerPage + 1;
        const endItem = Math.min(currentPage * itemsPerPage, totalResults);

        if (totalPages <= 1) return null;

        return (
                <div className="mt-12 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <p className="text-sm text-gray-600">
                                Showing <span className="font-semibold">{startItem}</span> -{" "}
                                <span className="font-semibold">{endItem}</span> of{" "}
                                <span className="font-semibold">{totalResults}</span> results
                        </p>

                        <nav>
                                <ul className="flex items-center -space-x-px h-8 text-sm">
                                        {/* Previous */}
                                        <li>
                                                <button
                                                        onClick={() => handlePageChange(currentPage - 1)}
                                                        disabled={currentPage === 1}
                                                        className="flex items-center justify-center px-3 h-8 ms-0 leading-tight text-gray-500 bg-white border border-e-0 border-gray-300 rounded-s-lg hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                                >
                                                        <ChevronLeft className="w-4 h-4" />
                                                        <span className="sr-only">Previous</span>
                                                </button>
                                        </li>

                                        {/* Các nút số trang */}
                                        {pageNumbers.map((page, index) => (
                                                <li key={index}>
                                                        {typeof page === "number" ? (
                                                                <button
                                                                        onClick={() => handlePageChange(page)}
                                                                        className={`flex items-center justify-center px-3 h-8 leading-tight border border-gray-300 transition-colors cursor-pointer ${
                                                                                currentPage === page
                                                                                        ? "bg-brand-purple text-white border-brand-purple z-10"
                                                                                        : "bg-white text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                                                                        }`}
                                                                >
                                                                        {page}
                                                                </button>
                                                        ) : (
                                                                <span className="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 cursor-pointer">
                                                                        ...
                                                                </span>
                                                        )}
                                                </li>
                                        ))}

                                        {/* Next */}
                                        <li>
                                                <button
                                                        onClick={() => handlePageChange(currentPage + 1)}
                                                        disabled={currentPage === totalPages}
                                                        className="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 rounded-e-lg hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
