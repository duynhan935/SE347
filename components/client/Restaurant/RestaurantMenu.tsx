"use client";
import { type Category, type Product } from "@/types";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { CompactFoodCard } from "../HomePage/CompactFoodCard";

type MenuProps = {
    restaurantId: string;
    restaurantName: string;
    restaurantSlug?: string;
    restaurantDuration?: number;
    products: Product[];
    categories: Category[];
    highlightProductId?: string;
};

export default function RestaurantMenu({
    restaurantId,
    restaurantName,
    restaurantSlug,
    restaurantDuration,
    products,
    categories,
    highlightProductId,
}: MenuProps) {
    const slugify = (text: string) =>
        text
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-");

    const groups = useMemo(() => {
        const safeProducts = Array.isArray(products) ? products : [];
        const safeCategories = Array.isArray(categories) ? categories : [];

        const getProductCategoryId = (product: Product) => {
            const candidate = (product as unknown as { categoryId?: unknown }).categoryId;
            if (typeof candidate === "string" || typeof candidate === "number") return String(candidate);

            const cateId = (product as unknown as { cateId?: unknown }).cateId;
            if (typeof cateId === "string" || typeof cateId === "number") return String(cateId);

            const nested = (product as unknown as { category?: { id?: unknown; _id?: unknown } }).category;
            const nestedId = nested?.id ?? nested?._id;
            if (typeof nestedId === "string" || typeof nestedId === "number") return String(nestedId);

            return "";
        };

        const getProductCategoryName = (product: Product) => {
            const direct = (product as unknown as { categoryName?: unknown }).categoryName;
            if (typeof direct === "string" && direct.trim()) return direct.trim();

            const cateName = (product as unknown as { cateName?: unknown }).cateName;
            if (typeof cateName === "string" && cateName.trim()) return cateName.trim();

            const nested = (product as unknown as { category?: { cateName?: unknown; name?: unknown } }).category;
            const nestedName = nested?.cateName ?? nested?.name;
            if (typeof nestedName === "string" && nestedName.trim()) return nestedName.trim();

            return "";
        };

        const categorySeeds: Array<{ categoryId: string; categoryName: string; value: string }> =
            safeCategories.length > 0
                ? safeCategories.map((category) => {
                      const categoryId = String(
                          (category as unknown as { id?: unknown; _id?: unknown }).id ??
                              (category as unknown as { _id?: unknown })._id ??
                              ""
                      );
                      const categoryName = String(
                          (category as unknown as { cateName?: unknown; name?: unknown }).cateName ??
                              (category as unknown as { name?: unknown }).name ??
                              "Category"
                      );
                      const value = categoryId ? `cat-${categoryId}` : `cat-${slugify(categoryName)}`;
                      return { categoryId, categoryName, value };
                  })
                : (() => {
                      const seen = new Map<string, { categoryId: string; categoryName: string; value: string }>();

                      for (const product of safeProducts) {
                          const categoryId = getProductCategoryId(product);
                          const categoryName = getProductCategoryName(product);

                          const normalizedName = categoryName ? slugify(categoryName) : "";
                          const key = categoryId
                              ? `id:${categoryId}`
                              : normalizedName
                              ? `name:${normalizedName}`
                              : "uncategorized";

                          if (seen.has(key)) continue;

                          const finalName = categoryName?.trim() || "Other";
                          const value = categoryId ? `cat-${categoryId}` : `cat-${normalizedName || "other"}`;
                          seen.set(key, { categoryId, categoryName: finalName, value });
                      }

                      return Array.from(seen.values());
                  })();

        return categorySeeds.map(({ categoryId, categoryName, value }) => {
            const normalizedCategoryName = slugify(categoryName);

            const items = safeProducts.filter((product) => {
                const productCategoryId = getProductCategoryId(product);
                if (categoryId && productCategoryId) return productCategoryId === categoryId;

                const productCategoryName = getProductCategoryName(product);
                if (!productCategoryName) return false;

                return slugify(productCategoryName) === normalizedCategoryName;
            });

            return { value, categoryName, items };
        });
    }, [products, categories]);

    const searchParams = useSearchParams();
    const productIdFromUrl = highlightProductId || searchParams.get("productId");
    const [highlightedProductId, setHighlightedProductId] = useState<string | null>(productIdFromUrl || null);
    const categoryRefs = useRef<Map<string, HTMLDivElement>>(new Map());

    // Scroll to highlighted product
    useEffect(() => {
        if (!productIdFromUrl || groups.length === 0) return;

        const categoryWithProduct = groups.find((group) => 
            group.items.some((item) => item.id === productIdFromUrl)
        );

        if (categoryWithProduct) {
            const categoryElement = categoryRefs.current.get(categoryWithProduct.value);
            if (categoryElement) {
                setTimeout(() => {
                    categoryElement.scrollIntoView({ behavior: "smooth", block: "start" });
                }, 300);
            }
        }
    }, [productIdFromUrl, groups]);

    // Remove highlight after 3 seconds
    useEffect(() => {
        if (highlightedProductId) {
            const timer = setTimeout(() => {
                setHighlightedProductId(null);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [highlightedProductId]);

    if (groups.length === 0) {
        return (
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-lg sm:p-8">
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">Menu</h2>
                </div>
                <div className="mt-6 rounded-xl border border-dashed border-gray-200 bg-gray-50 p-5 text-sm text-gray-600">
                    No categories available.
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-lg sm:p-8">
            <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
                <h2 className="text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">Menu</h2>
                <p className="text-sm text-gray-500">Browse by category</p>
            </div>

            {/* Category Quick Navigation */}
            <div className="mb-6 border-b border-gray-200 pb-4">
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {groups.map((group) => (
                        <button
                            key={group.value}
                            type="button"
                            onClick={() => {
                                const element = categoryRefs.current.get(group.value);
                                element?.scrollIntoView({ behavior: "smooth", block: "start" });
                            }}
                            className={
                                "rounded-full px-4 py-2 text-sm font-semibold transition-all whitespace-nowrap " +
                                "bg-gray-100 text-gray-700 hover:bg-[#EE4D2D]/10 hover:text-[#EE4D2D]"
                            }
                        >
                            {group.categoryName}
                        </button>
                    ))}
                </div>
            </div>

            {/* Long-List Scrolling Layout */}
            <div className="space-y-12">
                {groups.map((group) => (
                    <div
                        key={group.value}
                        id={group.value}
                        ref={(el) => {
                            if (el) categoryRefs.current.set(group.value, el);
                        }}
                        className="scroll-mt-24"
                    >
                        {/* Sticky Category Header */}
                        <div className="sticky top-20 z-10 bg-white/95 backdrop-blur-sm py-4 mb-6 border-b-2 border-[#EE4D2D] -mx-5 px-5 sm:-mx-8 sm:px-8">
                            <h3 className="text-xl md:text-2xl font-bold text-gray-900">
                                {group.categoryName}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                                {group.items.length} {group.items.length === 1 ? "item" : "items"}
                            </p>
                        </div>

                        {/* Food Items Grid */}
                        {group.items.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-5 text-sm text-gray-600">
                                No items available in this category.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                                {group.items.map((item) => {
                                    const isHighlighted = highlightedProductId === item.id;
                                    return (
                                        <div
                                            key={item.id}
                                            id={`product-${item.id}`}
                                            className={`transition-all duration-500 ${
                                                isHighlighted 
                                                    ? "ring-4 ring-[#EE4D2D] ring-offset-2 rounded-2xl" 
                                                    : ""
                                            }`}
                                            ref={(el) => {
                                                if (isHighlighted && el) {
                                                    setTimeout(() => {
                                                        el.scrollIntoView({ behavior: "smooth", block: "center" });
                                                    }, 500);
                                                }
                                            }}
                                        >
                                            {/* Reuse the same card design as Featured Foods on home page */}
                                            <CompactFoodCard
                                                product={item}
                                                restaurant={{
                                                    id: restaurantId,
                                                    resName: restaurantName,
                                                    slug: restaurantSlug,
                                                    duration: restaurantDuration,
                                                }}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
