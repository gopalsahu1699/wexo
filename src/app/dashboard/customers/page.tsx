"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    HiPlus,
    HiSearch,
    HiPhone,
    HiLocationMarker,
    HiClock,
    HiCurrencyRupee,
    HiX
} from "react-icons/hi";
import { createClient } from "@/lib/supabase";
import { Customer } from "@/lib/types";

export default function CustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [showAddModal, setShowAddModal] = useState(false);
    const [adding, setAdding] = useState(false);
    const [newCustomer, setNewCustomer] = useState({
        name: "",
        phone: "",
        email: "",
        billing_address: "",
        type: "customer" as const,
    });

    useEffect(() => {
        loadCustomers();
    }, []);

    async function loadCustomers() {
        setLoading(true);
        try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('customers')
                .select('*')
                .eq('user_id', user.id)
                .order('name');

            if (error) throw error;
            setCustomers((data || []) as Customer[]);
        } catch (err) {
            console.error("Error loading customers:", err);
        } finally {
            setLoading(false);
        }
    }

    async function handleAddCustomer() {
        if (!newCustomer.name.trim()) return;
        setAdding(true);
        try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            const { error } = await supabase
                .from('customers')
                .insert([{ ...newCustomer, user_id: user.id }]);

            if (error) throw error;
            setShowAddModal(false);
            setNewCustomer({ name: "", phone: "", email: "", billing_address: "", type: "customer" });
            await loadCustomers();
        } catch (err) {
            console.error("Error adding customer:", err);
            alert("Failed to add customer. Please try again.");
        } finally {
            setAdding(false);
        }
    }

    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.billing_address?.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                <div>
                    <h2 className="text-3xl font-black text-slate-800">Customers & Clients</h2>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-[10px] font-black uppercase tracking-wider">
                            Shared with BillMensor
                        </span>
                        <p className="text-slate-400 text-xs font-bold">Data syncs across all your business tools</p>
                    </div>
                </div>

                <div className="flex flex-1 gap-4 max-w-md md:ml-auto">
                    <div className="relative flex-1">
                        <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
                        <input
                            type="text"
                            placeholder="Search customers..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white border border-slate-100 rounded-2xl py-4 pl-12 pr-4 font-medium focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                        />
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="btn-3d bg-blue-600 text-white font-bold px-8 py-4 rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-blue-200 hover:bg-blue-700 transition-colors"
                    >
                        <HiPlus className="text-xl" /> Add New
                    </button>
                </div>
            </div>

            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredCustomers.length === 0 ? (
                    <div className="col-span-full py-20 bg-white border-2 border-dashed border-slate-100 rounded-[2.5rem] text-center">
                        <p className="text-slate-400 font-bold text-lg mb-2">No customers found</p>
                        <p className="text-slate-300 font-bold">Add your first customer to get started</p>
                    </div>
                ) : (
                    filteredCustomers.map((c, i) => (
                        <motion.div
                            key={c.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.05 }}
                            className="glass p-8 rounded-[2.5rem] card-3d border border-slate-100"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 font-black text-xl">
                                    {c.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${c.type === 'customer' ? 'bg-green-100 text-green-700' :
                                        c.type === 'supplier' ? 'bg-purple-100 text-purple-700' :
                                            'bg-blue-100 text-blue-700'
                                    }`}>
                                    {c.type}
                                </span>
                            </div>

                            <h3 className="text-2xl font-black text-slate-800 mb-4">{c.name}</h3>

                            <div className="space-y-3 mb-8">
                                {c.phone && (
                                    <div className="flex items-center gap-3 text-slate-500 font-bold">
                                        <HiPhone className="text-xl text-blue-500" /> {c.phone}
                                    </div>
                                )}
                                {c.billing_address && (
                                    <div className="flex items-center gap-3 text-slate-500 font-bold">
                                        <HiLocationMarker className="text-xl text-orange-500" /> {c.billing_address}
                                    </div>
                                )}
                                <div className="flex items-center gap-3 text-slate-500 font-bold">
                                    <HiClock className="text-xl text-yellow-500" /> Since {new Date(c.created_at).toLocaleDateString()}
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Balance</p>
                                    <div className="flex items-center gap-1">
                                        <HiCurrencyRupee className="text-slate-400" />
                                        <span className={`text-xl font-black ${c.current_balance > 0 ? 'text-red-500' : 'text-slate-800'}`}>
                                            {(c.current_balance || 0).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Add Customer Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-[2rem] p-10 w-full max-w-lg shadow-2xl"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-black text-slate-900">Add New Customer</h2>
                            <button onClick={() => setShowAddModal(false)} className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center hover:bg-red-100 hover:text-red-600 transition-colors"><HiX className="text-xl" /></button>
                        </div>
                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-black text-slate-600 mb-2">Customer Name *</label>
                                <input type="text" value={newCustomer.name} onChange={(e) => setNewCustomer(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Rajesh Kumar" className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 font-bold text-slate-800 focus:outline-none focus:border-blue-500 transition-all" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-black text-slate-600 mb-2">Phone</label>
                                    <input type="text" value={newCustomer.phone} onChange={(e) => setNewCustomer(p => ({ ...p, phone: e.target.value }))} placeholder="+91 98765 43210" className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 font-bold text-slate-800 focus:outline-none focus:border-blue-500 transition-all" />
                                </div>
                                <div>
                                    <label className="block text-sm font-black text-slate-600 mb-2">Email</label>
                                    <input type="email" value={newCustomer.email} onChange={(e) => setNewCustomer(p => ({ ...p, email: e.target.value }))} placeholder="email@example.com" className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 font-bold text-slate-800 focus:outline-none focus:border-blue-500 transition-all" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-black text-slate-600 mb-2">Billing Address</label>
                                <textarea value={newCustomer.billing_address} onChange={(e) => setNewCustomer(p => ({ ...p, billing_address: e.target.value }))} placeholder="Full address..." rows={2} className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 font-bold text-slate-800 focus:outline-none focus:border-blue-500 transition-all resize-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-black text-slate-600 mb-2">Type</label>
                                <select value={newCustomer.type} onChange={(e) => setNewCustomer(p => ({ ...p, type: e.target.value as any }))} className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 font-bold text-slate-800 focus:outline-none focus:border-blue-500 transition-all appearance-none">
                                    <option value="customer">Customer</option>
                                    <option value="supplier">Supplier</option>
                                    <option value="both">Both</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex gap-4 mt-10">
                            <button onClick={() => setShowAddModal(false)} className="flex-1 px-6 py-4 bg-slate-100 text-slate-700 rounded-xl font-black hover:bg-slate-200 transition-all">Cancel</button>
                            <button onClick={handleAddCustomer} disabled={adding || !newCustomer.name.trim()} className="flex-1 px-6 py-4 bg-blue-600 text-white rounded-xl font-black shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                                {adding ? "Adding..." : "Add Customer"}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
