"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
    HiPlus,
    HiSearch,
    HiPhone,
    HiLocationMarker,
    HiClock,
    HiCurrencyRupee
} from "react-icons/hi";
import { getCustomers } from "@/lib/services/customers";
import { Customer } from "@/lib/types";

export default function CustomersPage() {
    const router = useRouter();
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        loadCustomers();
    }, []);

    async function loadCustomers() {
        setLoading(true);
        try {
            const data = await getCustomers();
            setCustomers(data);
        } catch (err) {
            console.error("Error loading customers:", err);
        } finally {
            setLoading(false);
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
                            Shared with Wexo
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
                        onClick={() => router.push("/dashboard/customers/new")}
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
                            onClick={() => router.push(`/dashboard/customers/${c.id}`)}
                            className="glass p-8 rounded-[2.5rem] card-3d border border-slate-100 cursor-pointer"
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
        </div>
    );
}
