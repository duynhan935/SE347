"use client";

import Pagination from "@/components/client/Pagination";
import { useConfirm } from "@/components/ui/ConfirmModal";
import { categoryApi } from "@/lib/api/categoryApi";
import { productApi } from "@/lib/api/productApi";
import { restaurantApi } from "@/lib/api/restaurantApi";
import { sizeApi } from "@/lib/api/sizeApi";
import type { Category, Product, ProductCreateData, Restaurant, Size } from "@/types";
import { CheckCircle, Edit, Loader2, Plus, Search, Trash, XCircle } from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import ProductFormModal from "./ProductFormModal";

export default function ProductsList() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [sizes, setSizes] = useState<Size[]>([]);
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
    const confirmAction = useConfirm();

    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const ITEMS_PER_PAGE = 8;
    const currentPage = Number(searchParams.get("page")) || 1;

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [productsRes, categoriesRes, sizesRes, restaurantsRes] = await Promise.all([
                productApi.getAllProducts(new URLSearchParams()),
                categoryApi.getAllCategories(),
                sizeApi.getAllSizes(),
                restaurantApi.getAllRestaurants(new URLSearchParams({ lat: "10.762622", lon: "106.660172" })),
            ]);
            setProducts(productsRes.data.content);
            setCategories(categoriesRes.data);
            setSizes(sizesRes.data);
            setRestaurants(restaurantsRes.data.content);
        } catch (error) {
            console.error("Failed to fetch data:", error);
            toast.error("Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    const filteredProducts = useMemo(() => {
        if (!searchTerm) return products;

        const currentParams = new URLSearchParams(Array.from(searchParams.entries()));
        if (currentParams.has("page")) {
            currentParams.delete("page");
            router.replace(`${pathname}?${currentParams.toString()}`, { scroll: false });
        }

        return products.filter(
            (product) =>
                product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.categoryName.toLowerCase().includes(searchTerm.toLowerCase()),
        );
    }, [products, searchTerm, pathname, router, searchParams]);

    const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));

    const paginatedProducts = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        return filteredProducts.slice(startIndex, endIndex);
    }, [filteredProducts, currentPage]);

    const handleOpenModal = (product: Product | null) => {
        setCurrentProduct(product);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setCurrentProduct(null);
        setIsModalOpen(false);
    };

    const handleSaveProduct = async (productData: ProductCreateData, imageFile?: File) => {
        try {
            if (currentProduct) {
                await productApi.updateProduct(currentProduct.id, productData, imageFile);
                toast.success("Product updated successfully!");
            } else {
                await productApi.createProduct(productData, imageFile);
                toast.success("Product created successfully!");
            }
            handleCloseModal();
            fetchData();
        } catch (error: unknown) {
            console.error(error);
            const message = error instanceof Error ? error.message : "Failed to save product";
            toast.error(message);
        }
    };

    const handleToggleStatus = async (product: Product) => {
        try {
            await productApi.updateProductStatus(product.id);
            toast.success("Product status updated!");
            fetchData();
        } catch (error: unknown) {
            console.error("Failed to update status", error);
            toast.error("Failed to update status");
        }
    };

    const handleDelete = async (productId: string) => {
        const ok = await confirmAction({
            title: "Delete product?",
            description: "This action cannot be undone.",
            confirmText: "Delete",
            cancelText: "Cancel",
            variant: "danger",
        });
        if (!ok) return;
        try {
            await productApi.deleteProduct(productId);
            toast.success("Product deleted successfully!");
            fetchData();
        } catch (error: unknown) {
            console.error("Failed to delete product", error);
            const message = error instanceof Error ? error.message : "Failed to delete product";
            toast.error(message);
        }
    };

    return (
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
                <div className="relative w-full sm:max-w-sm">
                    <input
                        type="text"
                        placeholder="Search by name or category..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
                <button
                    onClick={() => handleOpenModal(null)}
                    className="h-11 inline-flex items-center justify-center gap-2 bg-brand-purple text-white px-4 rounded-lg font-semibold hover:bg-brand-purple/90 transition-colors w-full sm:w-auto"
                >
                    <Plus className="w-5 h-5" />
                    Add Product
                </button>
            </div>

            {loading && (
                <div className="flex justify-center items-center my-10">
                    <Loader2 className="w-8 h-8 animate-spin text-brand-purple" />
                    <span className="ml-3 text-lg">Loading products...</span>
                </div>
            )}

            {!loading && (
                <>
                    {/* Mobile: Card view (preferred) */}
                    <div className="md:hidden space-y-3">
                        {paginatedProducts.length === 0 ? (
                            <div className="rounded-lg border border-gray-200 p-4 text-sm text-gray-600">
                                No products found.
                            </div>
                        ) : (
                            paginatedProducts.map((product) => (
                                <div key={product.id} className="rounded-lg border border-gray-200 p-4">
                                    <div className="flex items-start gap-3">
                                        <div className="w-16 h-16 relative rounded-lg overflow-hidden shrink-0">
                                            {product.imageURL &&
                                            typeof product.imageURL === "string" &&
                                            product.imageURL.trim() !== "" ? (
                                                <Image
                                                    src={product.imageURL}
                                                    alt={product.productName}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                                    <span className="text-gray-400 text-xs">No image</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-semibold text-gray-900 truncate">
                                                {product.productName}
                                            </p>
                                            <p className="mt-1 text-xs text-gray-500 truncate">
                                                {product.categoryName}
                                            </p>
                                            <p className="mt-1 text-xs text-gray-500 truncate">
                                                {product.restaurant?.resName || "N/A"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-3 flex items-center justify-between gap-3">
                                        <button
                                            onClick={() => handleToggleStatus(product)}
                                            className={`h-11 px-4 text-sm font-semibold rounded-lg inline-flex items-center justify-center gap-2 ${
                                                product.available
                                                    ? "bg-green-100 text-green-800 hover:bg-green-200"
                                                    : "bg-red-100 text-red-800 hover:bg-red-200"
                                            } transition-colors`}
                                        >
                                            {product.available ? (
                                                <>
                                                    <CheckCircle className="w-4 h-4" />
                                                    Available
                                                </>
                                            ) : (
                                                <>
                                                    <XCircle className="w-4 h-4" />
                                                    Unavailable
                                                </>
                                            )}
                                        </button>

                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleOpenModal(product)}
                                                className="h-11 w-11 inline-flex items-center justify-center rounded-lg text-blue-600 hover:bg-blue-50"
                                                title="Edit"
                                            >
                                                <Edit className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(product.id)}
                                                className="h-11 w-11 inline-flex items-center justify-center rounded-lg text-red-600 hover:bg-red-50"
                                                title="Delete"
                                            >
                                                <Trash className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Desktop/tablet: table with controlled horizontal scroll */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Image
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Category
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Restaurant
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {paginatedProducts.map((product) => (
                                    <tr key={product.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="w-16 h-16 relative rounded-lg overflow-hidden">
                                                {product.imageURL &&
                                                typeof product.imageURL === "string" &&
                                                product.imageURL.trim() !== "" ? (
                                                    <Image
                                                        src={product.imageURL}
                                                        alt={product.productName}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                                        <span className="text-gray-400 text-xs">No image</span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap font-medium">
                                            {product.productName}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">{product.categoryName}</td>
                                        <td className="px-6 py-4 whitespace-nowrap truncate max-w-xs">
                                            {product.restaurant?.resName || "N/A"}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button
                                                onClick={() => handleToggleStatus(product)}
                                                className={`px-3 py-1 text-xs font-semibold rounded-full flex items-center gap-1 ${
                                                    product.available
                                                        ? "bg-green-100 text-green-800 hover:bg-green-200"
                                                        : "bg-red-100 text-red-800 hover:bg-red-200"
                                                } transition-colors`}
                                            >
                                                {product.available ? (
                                                    <>
                                                        <CheckCircle className="w-3 h-3" />
                                                        Available
                                                    </>
                                                ) : (
                                                    <>
                                                        <XCircle className="w-3 h-3" />
                                                        Unavailable
                                                    </>
                                                )}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleOpenModal(product)}
                                                    className="text-blue-600 hover:text-blue-800"
                                                    title="Edit"
                                                >
                                                    <Edit className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(product.id)}
                                                    className="text-red-600 hover:text-red-800"
                                                    title="Delete"
                                                >
                                                    <Trash className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredProducts.length > ITEMS_PER_PAGE && (
                        <div className="mt-6">
                            <Pagination currentPage={currentPage} totalPages={totalPages} />
                        </div>
                    )}
                </>
            )}

            {isModalOpen && (
                <ProductFormModal
                    product={currentProduct}
                    categories={categories}
                    sizes={sizes}
                    restaurants={restaurants}
                    onSave={handleSaveProduct}
                    onClose={handleCloseModal}
                />
            )}
        </div>
    );
}
