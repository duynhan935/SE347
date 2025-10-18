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
        console.log(categories);
        const slugify = (text: string) => text.toLowerCase().replace(/\s+/g, "-");
        const groupedMenu = categories.map((category) => ({
                categoryName: category.cateName,
                items: products.filter((p) => p.categoryId?.toString() === category.cateId?.toString()),
        }));

        return (
                <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg">
                        <h2 className="text-3xl font-bold font-roboto-serif">Menu</h2>
                        <div className="py-4 border-b my-6">
                                <div className="flex gap-3 overflow-x-auto scrollbar-hide">
                                        {categories.map((category) => (
                                                <a
                                                        key={category.cateId}
                                                        href={`#${slugify(category.cateName)}`}
                                                        className="px-4 py-2 bg-gray-100 rounded-full text-sm font-semibold whitespace-nowrap hover:bg-gray-200"
                                                >
                                                        {category.cateName}
                                                </a>
                                        ))}
                                </div>
                        </div>
                        <div className="space-y-12">
                                {groupedMenu.map(
                                        (group) =>
                                                group.items.length > 0 && (
                                                        <div
                                                                key={group.categoryName}
                                                                id={slugify(group.categoryName)}
                                                                className="scroll-mt-24"
                                                        >
                                                                <h3 className="text-2xl font-bold mb-6">
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
                                                )
                                )}
                        </div>
                </div>
        );
}
