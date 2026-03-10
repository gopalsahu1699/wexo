"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { HiPlus, HiSearch, HiIdentification, HiPhone, HiChevronRight } from "react-icons/hi";
import { getWorkers } from "@/lib/services/workers";
import { Worker } from "@/lib/types";

export default function WorkersPage() {
    const [workers, setWorkers] = useState<Worker[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        async function loadWorkers() {
            setLoading(true);
            try {
                const data = await getWorkers();
                setWorkers(data);
            } catch (err) {
                console.error("Error loading workers:", err);
            } finally {
                setLoading(false);
            }
        }
        loadWorkers();
    }, []);

    const filteredWorkers = workers.filter(w =>
        w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.role?.toLowerCase().includes(searchTerm.toLowerCase())
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
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">My Workforce</h1>
                    <p className="text-slate-500 font-bold">Manage your team and their assignments</p>
                </div>
                <button className="flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-black shadow-lg shadow-blue-200 transition-all transform hover:scale-105 active:scale-95 leading-none">
                    <HiPlus className="text-xl" />
                    <span>Register New Worker</span>
                </button>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1 relative group">
                    <HiSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 text-xl group-focus-within:text-blue-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search workers by name or role..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-16 pr-8 py-5 bg-white border-2 border-slate-100 rounded-2xl font-bold text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 transition-all shadow-sm"
                    />
                </div>
                <div className="flex gap-4">
                    <select className="px-8 py-5 bg-white border-2 border-slate-100 rounded-2xl font-bold text-slate-700 focus:outline-none focus:border-blue-500 transition-all shadow-sm appearance-none">
                        <option>All Status</option>
                        <option>Active</option>
                        <option>Inactive</option>
                    </select>
                </div>
            </div>

            <div className="glass rounded-[2.5rem] overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-slate-100">
                            <th className="p-8 text-sm font-black text-slate-400 uppercase tracking-widest">Name & Role</th>
                            <th className="p-8 text-sm font-black text-slate-400 uppercase tracking-widest">Status</th>
                            <th className="p-8 text-sm font-black text-slate-400 uppercase tracking-widest">Phone</th>
                            <th className="p-8 text-sm font-black text-slate-400 uppercase tracking-widest text-right">Job History</th>
                            <th className="p-8"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredWorkers.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-20 text-center">
                                    <p className="text-slate-400 font-bold">No workers found matching your search.</p>
                                </td>
                            </tr>
                        ) : (
                            filteredWorkers.map((worker, i) => (
                                <motion.tr
                                    key={worker.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="hover:bg-slate-50 transition-colors group cursor-pointer"
                                >
                                    <td className="p-8">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 font-bold text-lg">
                                                {worker.name.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <div>
                                                <p className="font-black text-slate-800">{worker.name}</p>
                                                <p className="text-slate-500 text-sm font-bold">{worker.role || 'No Role'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-8">
                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${worker.status === 'active' ? 'bg-green-100 text-green-700' :
                                                'bg-slate-100 text-slate-600'
                                            }`}>
                                            {worker.status}
                                        </span>
                                    </td>
                                    <td className="p-8">
                                        <div className="flex items-center gap-2 text-slate-600 font-bold">
                                            <HiPhone /> {worker.phone || 'No Phone'}
                                        </div>
                                    </td>
                                    <td className="p-8 text-right">
                                        <span className="font-black text-slate-800">{worker.total_jobs_completed || 0}</span>
                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Jobs Done</p>
                                    </td>
                                    <td className="p-8 text-right">
                                        <HiChevronRight className="text-2xl text-slate-300 group-hover:text-blue-600 transition-all" />
                                    </td>
                                </motion.tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
