"use client";
import { type Category, type Product } from "@/types";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { MenuItemCard } from "./MenuItemCard";
import { useEffect, useMemo, useState } from "react";

type MenuProps = {
    restaurantId: string;
    restaurantName: string;
    products: Product[];
    categories: Category[];
};

export default function RestaurantMenu({ restaurantId, restaurantName, products, categories }: MenuProps) {
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

    const firstNonEmpty = groups.find((g) => g.items.length > 0)?.value;
    const [openValue, setOpenValue] = useState<string>(firstNonEmpty ?? groups[0]?.value ?? "");

    useEffect(() => {
        if (groups.length === 0) return;
        if (openValue && groups.some((g) => g.value === openValue)) return;

        const next = groups.find((g) => g.items.length > 0)?.value ?? groups[0]?.value ?? "";
        setOpenValue(next);
    }, [groups, openValue]);

    if (groups.length === 0) {
        return (
            <div className="rounded-2xl border border-brand-purple/10 bg-white/70 p-5 shadow-[0_10px_40px_rgba(0,0,0,0.08)] backdrop-blur-md sm:p-8">
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
        <div className="rounded-2xl border border-brand-purple/10 bg-white/70 p-5 shadow-[0_10px_40px_rgba(0,0,0,0.08)] backdrop-blur-md sm:p-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <h2 className="text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">Menu</h2>
                <p className="text-sm text-gray-500">Browse by category</p>
            </div>

            <div className="mt-6 border-b border-gray-200/70 pb-4">
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {groups.map((group) => (
                        <button
                            key={group.value}
                            type="button"
                            onClick={() => {
                                setOpenValue(group.value);
                                const element = document.getElementById(group.value);
                                element?.scrollIntoView({ behavior: "smooth", block: "start" });
                            }}
                            className={
                                "rounded-full px-4 py-2 text-sm font-semibold transition-all " +
                                (openValue === group.value
                                    ? "bg-brand-purple text-white shadow-sm"
                                    : "bg-gray-100 text-gray-700 hover:bg-brand-purple/10 hover:text-brand-purple")
                            }
                        >
                            {group.categoryName}
                        </button>
                    ))}
                </div>
            </div>

            <div className="mt-6">
                <Accordion
                    type="single"
                    collapsible
                    value={openValue}
                    onValueChange={(value) => {
                        if (value) setOpenValue(value);
                    }}
                    className="space-y-4"
                >
                    {groups.map((group) => (
                        <AccordionItem
                            key={group.value}
                            value={group.value}
                            id={group.value}
                            className="scroll-mt-24 rounded-2xl border border-gray-200/70 bg-white/70"
                        >
                            <AccordionTrigger className="px-5 py-4 text-left hover:no-underline">
                                <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="truncate text-base font-bold text-gray-900">
                                            {group.categoryName}
                                        </p>
                                        <p className="mt-0.5 text-xs font-medium text-gray-500">
                                            {group.items.length} items
                                        </p>
                                    </div>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="px-5 pb-5">
                                {group.items.length === 0 ? (
                                    <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-5 text-sm text-gray-600">
                                        No items available in this category.
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                                        {group.items.map((item) => (
                                            <MenuItemCard
                                                key={item.id}
                                                item={item}
                                                restaurantId={restaurantId}
                                                restaurantName={restaurantName}
                                            />
                                        ))}
                                    </div>
                                )}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </div>
    );
}
