"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { HiArrowLeft, HiTrash, HiSave } from "react-icons/hi";
import { getProduct, addProduct, updateProduct, deleteProduct } from "@/lib/services/inventory";
import { Product } from "@/lib/types";
import { use } from "react";

export default function ProductDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const { id } = resolvedParams;
    const isNew = id === 'new';

    const router = useRouter();

    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);
    const [product, setProduct] = useState({
        name: "",
        category: "",
        stock_quantity: 0,
        unit: "pcs",
        min_stock_level: 0,
        price: 0,
        purchase_price: 0,
    });

    useEffect(() => {
        if (!isNew) {
            loadProduct();
        }
    }, [isNew, id]);

    async function loadProduct() {
        setLoading(true);
        try {
            const data = await getProduct(id);
            if (data) {
                setProduct({
                    name: data.name || "",
                    category: data.category || "",
                    stock_quantity: data.stock_quantity || 0,
                    unit: data.unit || "pcs",
                    min_stock_level: data.min_stock_level || 0,
                    price: data.price || 0,
                    purchase_price: data.purchase_price || 0,
                });
            } else {
                router.push("/dashboard/inventory");
            }
        } catch (err) {
            console.error("Error loading product:", err);
            router.push("/dashboard/inventory");
        } finally {
            setLoading(false);
        }
    }

    async function handleSave() {
        if (!product.name.trim()) return;
        setSaving(true);
        try {
            if (isNew) {
                await addProduct(product as Partial<Product>);
            } else {
                await updateProduct(id, product as Partial<Product>);
            }
            router.push('/dashboard/inventory');
        } catch (err) {
            console.error("Error saving product:", err);
            alert("Failed to save product. Please try again.");
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete() {
        if (confirm("Are you sure you want to delete this specific product item?")) {
            setSaving(true);
            try {
                await deleteProduct(id);
                router.push('/dashboard/inventory');
            } catch (err) {
                console.error("Error deleting product:", err);
                alert("Failed to delete product.");
                setSaving(false);
            }
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-3xl mx-auto">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => router.push('/dashboard/inventory')}
                    className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors shadow-sm"
                >
                    <HiArrowLeft className="text-xl" />
                </button>
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                        {isNew ? 'Add New Item' : 'Edit Item'}
                    </h1>
                    <p className="text-slate-500 font-bold">
                        {isNew ? 'Add a new product or part' : 'Update details and stock levels'}
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-[2rem] p-8 shadow-sm border-2 border-slate-100">
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-black text-slate-600 mb-2">Item Name *</label>
                        <input
                            type="text"
                            value={product.name}
                            onChange={(e) => setProduct(p => ({ ...p, name: e.target.value }))}
                            placeholder="e.g. Copper Wire 1.5mm"
                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 font-bold text-slate-800 focus:outline-none focus:border-blue-500 transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-black text-slate-600 mb-2">Category</label>
                        <input
                            type="text"
                            value={product.category}
                            onChange={(e) => setProduct(p => ({ ...p, category: e.target.value }))}
                            placeholder="e.g. Electrical"
                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 font-bold text-slate-800 focus:outline-none focus:border-blue-500 transition-all"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-black text-slate-600 mb-2">Stock Qty</label>
                            <input
                                type="number"
                                value={product.stock_quantity}
                                onChange={(e) => setProduct(p => ({ ...p, stock_quantity: +e.target.value }))}
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 font-bold text-slate-800 focus:outline-none focus:border-blue-500 transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-black text-slate-600 mb-2">Unit</label>
                            <select
                                value={product.unit}
                                onChange={(e) => setProduct(p => ({ ...p, unit: e.target.value }))}
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 font-bold text-slate-800 focus:outline-none focus:border-blue-500 transition-all appearance-none"
                            >
                                <option value="pcs">Pieces</option>
                                <option value="m">Meters</option>
                                <option value="ft">Feet</option>
                                <option value="kg">Kilograms</option>
                                <option value="l">Liters</option>
                                <option value="box">Boxes</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-black text-slate-600 mb-2">Sell Price (₹)</label>
                            <input
                                type="number"
                                value={product.price}
                                onChange={(e) => setProduct(p => ({ ...p, price: +e.target.value }))}
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 font-bold text-slate-800 focus:outline-none focus:border-blue-500 transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-black text-slate-600 mb-2">Min Stock Level</label>
                            <input
                                type="number"
                                value={product.min_stock_level}
                                onChange={(e) => setProduct(p => ({ ...p, min_stock_level: +e.target.value }))}
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 font-bold text-slate-800 focus:outline-none focus:border-blue-500 transition-all"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4 mt-10 pt-8 border-t border-slate-100">
                    <button
                        onClick={handleSave}
                        disabled={saving || !product.name.trim()}
                        className="flex-1 px-6 py-4 bg-blue-600 text-white rounded-xl font-black shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        <HiSave className="text-xl" />
                        {saving ? "Saving..." : "Save Item"}
                    </button>
                    {!isNew && (
                        <button
                            onClick={handleDelete}
                            disabled={saving}
                            className="md:w-auto px-6 py-4 bg-red-50 text-red-600 rounded-xl font-black hover:bg-red-100 transition-all flex items-center justify-center gap-2"
                        >
                            <HiTrash className="text-xl" />
                            Delete
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
