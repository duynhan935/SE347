"use client";

import { type RestaurantDetail } from "@/app/(client)/restaurants/[id]/page";
import { MenuItemCard } from "./MenuItemCard";

export default function RestaurantMenu({ menu }: { menu: RestaurantDetail["menu"] }) {
        const slugify = (text: string) => text.toLowerCase().replace(/\s+/g, "-");

        return (
                <div className="bg-white p-6 rounded-lg shadow-lg">
                        <h2 className="text-2xl font-bold">Food Menu</h2>

                        <div className="py-4 border-b mb-6">
                                <div className="flex gap-3 overflow-x-auto scrollbar-hide">
                                        {menu.map((category) => (
                                                <a
                                                        key={category.category}
                                                        href={`#${slugify(category.category)}`}
                                                        className="px-4 py-2 bg-gray-100 rounded-full text-sm font-semibold whitespace-nowrap hover:bg-gray-200"
                                                >
                                                        {category.category}
                                                </a>
                                        ))}
                                </div>
                        </div>

                        <div className="space-y-8">
                                {menu.map((category) => (
                                        <div key={category.category} id={slugify(category.category)}>
                                                <h3 className="text-xl font-bold mb-4">{category.category}</h3>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                                        {category.items.map((item) => (
                                                                <MenuItemCard key={item.id} item={item} />
                                                        ))}
                                                </div>
                                        </div>
                                ))}
                        </div>
                </div>
        );
}
