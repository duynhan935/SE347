// File: app/_components/client/Restaurant/RestaurantMenu.tsx
"use client";
import { type Category, type Product } from "@/types";
import { Variants, motion } from "framer-motion";
import { MenuItemCard } from "./MenuItemCard";

type MenuProps = { products: Product[]; categories: Category[] };

const listContainerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const itemVariants: Variants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

export default function RestaurantMenu({ products, categories }: MenuProps) {
        const slugify = (text: string) => text.toLowerCase().replace(/\s+/g, "-");
        const groupedMenu = categories.map((category) => ({
                categoryName: category.cateName,
                        items: products.filter((p) => p.categoryId?.toString() === category.id?.toString()),
        }));

        return (
                <div className="bg-white p-5 sm:p-8 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
                        <h2 className="text-2xl md:text-3xl font-bold font-roboto-serif mb-6">Menu</h2>
                        <div className="py-4 border-b border-gray-200 mb-8">
                                <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
                                        {categories.map((category, index) => (
                                                <a
                                                        key={category.id || `category-${index}`}
                                                        href={`#${slugify(category.cateName)}`}
                                                        className="px-5 py-2.5 bg-gray-100 rounded-full text-sm font-bold whitespace-nowrap hover:bg-brand-purple hover:text-white transition-all duration-200 shadow-sm hover:shadow-md"
                                                >
                                                        {category.cateName}
                                                </a>
                                        ))}
                                </div>
                        </div>
                        <div className="space-y-12">
                                {groupedMenu
                                        .filter((group) => group.items.length > 0)
                                        .map((group, index) => (
                                                <div
                                                        key={`${group.categoryName}-${index}`}
                                                        id={slugify(group.categoryName)}
                                                        className="scroll-mt-24"
                                                >
                                                        <h3 className="text-xl md:text-2xl font-bold mb-6 text-gray-900">
                                                                {group.categoryName}
                                                        </h3>
                                                        <motion.div
                                                                variants={listContainerVariants}
                                                                initial="hidden"
                                                                whileInView="visible"
                                                                viewport={{ once: true, amount: 0.1 }}
                                                                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6"
                                                        >
                                                                {group.items.map((item) => (
                                                                        <motion.div
                                                                                key={item.id}
                                                                                variants={itemVariants}
                                                                        >
                                                                                <MenuItemCard item={item} />
                                                                        </motion.div>
                                                                ))}
                                                        </motion.div>
                                                </div>
                                        ))}
                        </div>
                </div>
        );
}
