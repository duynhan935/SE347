import { getImageUrl } from "@/lib/utils";
import { useCartStore } from "@/stores/cartStore";
import { Star } from "lucide-react";
import Image, { StaticImageData } from "next/image";

type SuggestedProduct = {
        id: number;
        name: string;
        category: string;
        image: StaticImageData;
        rating: number;
        reviewCount: number;
        price: number;
};

export const ProductSuggestionCard = ({ product }: { product: SuggestedProduct }) => {
        const { addItem } = useCartStore();

        const handleAddToCart = () => {
                const itemToAdd = {
                        id: product.id.toString(),
                        name: product.name,
                        price: product.price,
                        image: getImageUrl(product.image),
                        restaurantId: "3",
                        restaurantName: "The Burger Shop",
                };
                addItem(itemToAdd, 1);
                alert(`${product.name} has been added to your cart.`);
        };

        return (
                <div className="border rounded-lg p-4 text-center">
                        <Image
                                src={product.image}
                                alt={product.name}
                                width={300}
                                height={200}
                                className="w-full h-48 object-cover rounded-md mb-4"
                        />
                        <p className="text-sm text-gray-500">{product.category}</p>
                        <h3 className="font-bold text-lg my-1">{product.name}</h3>
                        <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-2">
                                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                <span>
                                        {product.rating} ({product.reviewCount})
                                </span>
                        </div>
                        <p className="font-extrabold text-xl mb-4">${product.price.toFixed(2)}</p>
                        <button
                                onClick={handleAddToCart}
                                className="cursor-pointer w-full bg-white border border-gray-300 font-semibold py-2 rounded-md hover:bg-gray-100 transition-colors"
                        >
                                Add to Cart
                        </button>
                </div>
        );
};
