"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    HiPlus,
    HiSearch,
    HiInboxIn,
    HiExclamationCircle,
    HiChevronRight,
    HiX
} from "react-icons/hi";
import { FaBoxOpen } from "react-icons/fa";
import { getInventory, addProduct } from "@/lib/services/inventory";
import { Product } from "@/lib/types";

export default function InventoryPage() {
    const [inventory, setInventory] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [showAddModal, setShowAddModal] = useState(false);
    const [adding, setAdding] = useState(false);
    const [newProduct, setNewProduct] = useState({
        name: "",
        category: "",
        stock_quantity: 0,
        unit: "pcs",
        min_stock_level: 0,
        price: 0,
        purchase_price: 0,
    });

    useEffect(() => {
        loadInventory();
    }, []);

    async function loadInventory() {
        setLoading(true);
        try {
            const data = await getInventory();
            setInventory(data);
        } catch (err) {
            console.error("Error loading inventory:", err);
        } finally {
            setLoading(false);
        }
    }

    async function handleAddProduct() {
        if (!newProduct.name.trim()) return;
        setAdding(true);
        try {
            await addProduct(newProduct as Partial<Product>);
            setShowAddModal(false);
            setNewProduct({ name: "", category: "", stock_quantity: 0, unit: "pcs", min_stock_level: 0, price: 0, purchase_price: 0 });
            await loadInventory();
        } catch (err) {
            console.error("Error adding product:", err);
            alert("Failed to add product. Please try again.");
        } finally {
            setAdding(false);
        }
    }

    const filteredInventory = inventory.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const lowStockItems = inventory.filter(item => item.stock_quantity < item.min_stock_level);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="relative flex-1 max-w-md">
                    <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
                    <input
                        type="text"
                        placeholder="Search parts or tools..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white border border-slate-100 rounded-2xl py-4 pl-12 pr-4 font-medium focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                    />
                </div>

                <div className="flex gap-4">
                    <button className="btn-3d bg-white text-slate-800 font-bold px-6 py-4 rounded-2xl flex items-center justify-center gap-2 border border-slate-200 hover:bg-slate-50 transition-all">
                        <HiInboxIn className="text-xl text-green-600" /> Stock In
                    </button>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="btn-3d bg-blue-600 text-white font-bold px-8 py-4 rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-blue-200 hover:bg-blue-700 transition-colors"
                    >
                        <HiPlus className="text-xl" /> Add New Item
                    </button>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 glass rounded-[2.5rem] overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100">
                                <th className="p-8 text-sm font-black text-slate-400 uppercase tracking-widest">Item Detail</th>
                                <th className="p-8 text-sm font-black text-slate-400 uppercase tracking-widest">Stock Level</th>
                                <th className="p-8 text-sm font-black text-slate-400 uppercase tracking-widest text-right">Unit Price</th>
                                <th className="p-8"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredInventory.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-20 text-center">
                                        <FaBoxOpen className="text-5xl text-slate-300 mx-auto mb-4" />
                                        <p className="text-slate-400 font-bold">No inventory items found.</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredInventory.map((item) => {
                                    const isLow = item.stock_quantity < item.min_stock_level;
                                    return (
                                        <motion.tr
                                            key={item.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="hover:bg-slate-50 transition-colors group cursor-pointer"
                                        >
                                            <td className="p-8">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 text-xl">
                                                        <HiInboxIn />
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-slate-800">{item.name}</p>
                                                        <p className="text-slate-500 text-sm font-bold">{item.category || 'Uncategorized'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-8">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-32 bg-slate-100 h-2 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full ${isLow ? 'bg-orange-500' : 'bg-green-500'}`}
                                                            style={{ width: `${Math.min((item.stock_quantity / (item.min_stock_level || 1)) * 50, 100)}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className={`font-black ${isLow ? 'text-orange-600' : 'text-slate-700'}`}>
                                                        {item.stock_quantity} {item.unit}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-8 text-right font-black text-slate-800">
                                                ₹{item.price?.toLocaleString() || '0'}
                                            </td>
                                            <td className="p-8 text-right">
                                                <HiChevronRight className="text-2xl text-slate-300 group-hover:text-blue-600 transition-all" />
                                            </td>
                                        </motion.tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="space-y-8">
                    <div className="glass rounded-[2rem] p-8 border-l-4 border-orange-500">
                        <div className="flex items-center gap-3 mb-6">
                            <HiExclamationCircle className="text-orange-500 text-3xl" />
                            <h3 className="text-xl font-black text-slate-800">Low Stock Alerts</h3>
                        </div>
                        <div className="space-y-4">
                            {lowStockItems.length === 0 ? (
                                <div className="p-6 bg-green-50 rounded-2xl border border-green-100 text-center">
                                    <p className="text-green-700 font-bold text-sm">All items are in stock!</p>
                                </div>
                            ) : (
                                lowStockItems.map(item => (
                                    <div key={item.id} className="p-4 bg-orange-50 rounded-2xl border border-orange-100">
                                        <p className="font-bold text-slate-800 mb-1">{item.name}</p>
                                        <p className="text-xs text-orange-700 font-bold uppercase tracking-wider">
                                            Critical: {item.stock_quantity} left (Min: {item.min_stock_level})
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="glass rounded-[2rem] p-8">
                        <h3 className="text-xl font-black text-slate-800 mb-4">Summary</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500 font-bold">Total Items</span>
                                <span className="font-black text-slate-900">{inventory.length}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500 font-bold">Low Stock</span>
                                <span className="font-black text-orange-600">{lowStockItems.length}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500 font-bold">Total Value</span>
                                <span className="font-black text-green-600">
                                    ₹{inventory.reduce((sum, item) => sum + (item.price * item.stock_quantity), 0).toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Product Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-[2rem] p-10 w-full max-w-lg shadow-2xl"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-black text-slate-900">Add New Item</h2>
                            <button onClick={() => setShowAddModal(false)} className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center hover:bg-red-100 hover:text-red-600 transition-colors">
                                <HiX className="text-xl" />
                            </button>
                        </div>

                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-black text-slate-600 mb-2">Item Name *</label>
                                <input type="text" value={newProduct.name} onChange={(e) => setNewProduct(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Copper Wire 1.5mm" className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 font-bold text-slate-800 focus:outline-none focus:border-blue-500 transition-all" />
                            </div>
                            <div>
                                <label className="block text-sm font-black text-slate-600 mb-2">Category</label>
                                <input type="text" value={newProduct.category} onChange={(e) => setNewProduct(p => ({ ...p, category: e.target.value }))} placeholder="e.g. Electrical" className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 font-bold text-slate-800 focus:outline-none focus:border-blue-500 transition-all" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-black text-slate-600 mb-2">Stock Qty</label>
                                    <input type="number" value={newProduct.stock_quantity} onChange={(e) => setNewProduct(p => ({ ...p, stock_quantity: +e.target.value }))} className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 font-bold text-slate-800 focus:outline-none focus:border-blue-500 transition-all" />
                                </div>
                                <div>
                                    <label className="block text-sm font-black text-slate-600 mb-2">Unit</label>
                                    <select value={newProduct.unit} onChange={(e) => setNewProduct(p => ({ ...p, unit: e.target.value }))} className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 font-bold text-slate-800 focus:outline-none focus:border-blue-500 transition-all appearance-none">
                                        <option value="pcs">Pieces</option>
                                        <option value="m">Meters</option>
                                        <option value="ft">Feet</option>
                                        <option value="kg">Kilograms</option>
                                        <option value="l">Liters</option>
                                        <option value="box">Boxes</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-black text-slate-600 mb-2">Sell Price (₹)</label>
                                    <input type="number" value={newProduct.price} onChange={(e) => setNewProduct(p => ({ ...p, price: +e.target.value }))} className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 font-bold text-slate-800 focus:outline-none focus:border-blue-500 transition-all" />
                                </div>
                                <div>
                                    <label className="block text-sm font-black text-slate-600 mb-2">Min Stock Level</label>
                                    <input type="number" value={newProduct.min_stock_level} onChange={(e) => setNewProduct(p => ({ ...p, min_stock_level: +e.target.value }))} className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 font-bold text-slate-800 focus:outline-none focus:border-blue-500 transition-all" />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4 mt-10">
                            <button onClick={() => setShowAddModal(false)} className="flex-1 px-6 py-4 bg-slate-100 text-slate-700 rounded-xl font-black hover:bg-slate-200 transition-all">Cancel</button>
                            <button onClick={handleAddProduct} disabled={adding || !newProduct.name.trim()} className="flex-1 px-6 py-4 bg-blue-600 text-white rounded-xl font-black shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                                {adding ? "Adding..." : "Add Item"}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
