"use client";

import { categoryApi } from "@/lib/api/categoryApi";
import type { Category, CategoryData } from "@/types";
import { Edit, Loader2, Plus, Trash } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import CategoryFormModal from "./CategoryFormModal";

export default function CategoriesList() {
        const [categories, setCategories] = useState<Category[]>([]);
        const [loading, setLoading] = useState(true);
        const [isModalOpen, setIsModalOpen] = useState(false);
        const [currentCategory, setCurrentCategory] = useState<Category | null>(null);

        useEffect(() => {
                fetchCategories();
        }, []);

        const fetchCategories = async () => {
                try {
                        setLoading(true);
                        const response = await categoryApi.getAllCategories();
                        setCategories(response.data);
                } catch (error) {
                        console.error("Failed to fetch categories:", error);
                        toast.error("Failed to load categories");
                } finally {
                        setLoading(false);
                }
        };

        const handleOpenModal = (category: Category | null) => {
                setCurrentCategory(category);
                setIsModalOpen(true);
        };

        const handleCloseModal = () => {
                setCurrentCategory(null);
                setIsModalOpen(false);
        };

        const handleSaveCategory = async (categoryData: CategoryData) => {
                try {
                        if (currentCategory) {
                                await categoryApi.updateCategory(currentCategory.id, categoryData);
                                toast.success("Category updated successfully!");
                        } else {
                                await categoryApi.createCategory(categoryData);
                                toast.success("Category created successfully!");
                        }
                        handleCloseModal();
                        fetchCategories();
                } catch (error: unknown) {
                        console.error(error);
                        const message = error instanceof Error ? error.message : "Failed to save category";
                        toast.error(message);
                }
        };

        const handleDelete = async (categoryId: string) => {
                if (!window.confirm("Are you sure you want to delete this category?")) {
                        return;
                }
                try {
                        await categoryApi.deleteCategory(categoryId);
                        toast.success("Category deleted successfully!");
                        fetchCategories();
                } catch (error: unknown) {
                        console.error("Failed to delete category", error);
                        const message = error instanceof Error ? error.message : "Failed to delete category";
                        toast.error(message);
                }
        };

        return (
                <div className="bg-white p-6 rounded-lg shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-semibold">All Categories</h2>
                                <button
                                        onClick={() => handleOpenModal(null)}
                                        className="flex items-center gap-2 bg-brand-purple text-white px-4 py-2 rounded-lg font-semibold hover:bg-brand-purple/90 transition-colors"
                                >
                                        <Plus className="w-5 h-5" />
                                        Add Category
                                </button>
                        </div>

                        {loading && (
                                <div className="flex justify-center items-center my-10">
                                        <Loader2 className="w-8 h-8 animate-spin text-brand-purple" />
                                        <span className="ml-3 text-lg">Loading categories...</span>
                                </div>
                        )}

                        {!loading && (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {categories.map((category, index) => (
                                                <div
                                                        key={category.id}
                                                        className="border rounded-lg p-4 hover:shadow-md transition-shadow flex justify-between items-center"
                                                >
                                                        <div>
                                                                <h3 className="font-semibold text-lg">
                                                                        {index + 1}. {category.cateName}
                                                                </h3>
                                                        </div>
                                                        <div className="flex gap-2">
                                                                <button
                                                                        onClick={() => handleOpenModal(category)}
                                                                        className="text-blue-600 hover:text-blue-800 p-2"
                                                                        title="Edit"
                                                                >
                                                                        <Edit className="w-5 h-5" />
                                                                </button>
                                                                <button
                                                                        onClick={() => handleDelete(category.id)}
                                                                        className="text-red-600 hover:text-red-800 p-2"
                                                                        title="Delete"
                                                                >
                                                                        <Trash className="w-5 h-5" />
                                                                </button>
                                                        </div>
                                                </div>
                                        ))}
                                </div>
                        )}

                        {!loading && categories.length === 0 && (
                                <div className="text-center py-10 text-gray-500">
                                        <p>No categories found. Create your first category!</p>
                                </div>
                        )}

                        {isModalOpen && (
                                <CategoryFormModal
                                        category={currentCategory}
                                        onSave={handleSaveCategory}
                                        onClose={handleCloseModal}
                                />
                        )}
                </div>
        );
}
