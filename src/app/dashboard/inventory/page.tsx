"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
    HiPlus,
    HiSearch,
    HiInboxIn,
    HiExclamationCircle,
    HiChevronRight
} from "react-icons/hi";
import { FaBoxOpen } from "react-icons/fa";
import { getInventory } from "@/lib/services/inventory";
import { Product } from "@/lib/types";

export default function InventoryPage() {
    const router = useRouter();
    const [inventory, setInventory] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

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
                        onClick={() => router.push("/dashboard/inventory/new")}
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
                                            onClick={() => router.push(`/dashboard/inventory/${item.id}`)}
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
        </div>
    );
}
