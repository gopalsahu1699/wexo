"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
    HiPlus,
    HiSearch,
    HiPhone,
    HiBriefcase,
    HiBadgeCheck,
    HiUserGroup,
    HiArrowRight
} from "react-icons/hi";
import { getWorkers } from "@/lib/services/workers";
import { Worker } from "@/lib/types";
import { getStaffSession } from "@/lib/services/auth-role";
import { createClient } from "@/lib/supabase";

export default function WorkersPage() {
    const router = useRouter();
    const [workers, setWorkers] = useState<Worker[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [role, setRole] = useState<string | null>(null);

    useEffect(() => {
        loadWorkers();
        const session = getStaffSession();
        if (session) setRole(session.role);

        const supabase = createClient();
        const channel = supabase
            .channel('workers-realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'staff_members' }, () => loadWorkers())
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

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

    const filteredWorkers = workers.filter(w =>
        w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (w.role || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (w.phone || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 md:space-y-8">
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                <div className="text-center md:text-left">
                    <h2 className="text-3xl font-black text-slate-800">Team Members</h2>
                    <div className="flex items-center justify-center md:justify-start gap-2 mt-1">
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-[10px] font-black uppercase tracking-wider">
                            Real-time Workforce
                        </span>
                        <p className="text-slate-400 text-xs font-bold hidden sm:block">Manage and track your field team</p>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row flex-1 gap-4 max-w-2xl xl:ml-auto">
                    <div className="relative flex-1">
                        <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
                        <input
                            type="text"
                            placeholder="Search team..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white border border-slate-100 rounded-2xl py-4 pl-12 pr-4 font-medium focus:ring-2 focus:ring-blue-500 outline-none shadow-sm transition-all"
                        />
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => router.push("/dashboard/workForce/attendance")}
                            className="flex-1 md:flex-none bg-white text-slate-700 font-bold px-6 py-4 rounded-2xl flex items-center justify-center gap-2 border border-slate-100 hover:bg-slate-50 transition-colors shadow-sm text-sm"
                        >
                            <HiBadgeCheck className="text-xl text-blue-600" /> Attendance
                        </button>
                        {role !== 'team_member' && (
                            <button
                                onClick={() => router.push("/dashboard/workForce/new")}
                                className="flex-1 md:flex-none btn-3d bg-blue-600 text-white font-bold px-8 py-4 rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-blue-200 hover:bg-blue-700 transition-colors text-sm"
                            >
                                <HiPlus className="text-xl" /> Add New
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredWorkers.length === 0 ? (
                    <div className="col-span-full py-20 bg-white border-2 border-dashed border-slate-100 rounded-[2.5rem] text-center">
                        <HiUserGroup className="text-6xl text-slate-100 mx-auto mb-4" />
                        <p className="text-slate-400 font-bold text-lg mb-2">No workers found</p>
                        <p className="text-slate-300 font-bold text-sm">Add your first team member to start assigning jobs</p>
                    </div>
                ) : (
                    filteredWorkers.map((w, i) => (
                        <motion.div
                            key={w.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.05 }}
                            onClick={() => router.push(`/dashboard/workForce/${w.id}`)}
                            className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all cursor-pointer group"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 font-black text-lg md:text-xl shadow-inner group-hover:scale-110 transition-transform">
                                    {w.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                </div>
                                <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider ${w.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                                    {w.status}
                                </span>
                            </div>

                            <h3 className="text-xl md:text-2xl font-black text-slate-800 mb-2 truncate group-hover:text-blue-600 transition-colors">{w.name}</h3>
                            
                            <div className="flex items-center gap-2 text-slate-500 font-bold text-xs mb-6">
                                <HiBriefcase className="text-base text-blue-500" />
                                <span className="truncate">{w.role || "No Role Assigned"}</span>
                            </div>

                            <div className="space-y-4 mb-8">
                                {w.phone && (
                                    <div className="flex items-center gap-3 text-slate-600 font-bold bg-slate-50 p-3 md:p-4 rounded-xl border border-slate-100 text-sm">
                                        <HiPhone className="text-lg text-green-500 shrink-0" /> 
                                        {w.phone}
                                    </div>
                                )}
                                
                                <div className="grid grid-cols-2 gap-3 md:gap-4">
                                    <div className="bg-orange-50 p-3 md:p-4 rounded-xl border border-orange-100">
                                        <p className="text-[9px] font-black text-orange-400 uppercase tracking-wider mb-1">Rating</p>
                                        <div className="flex items-center gap-1">
                                            <span className="text-base md:text-lg font-black text-orange-700">{w.rating || "5.0"}</span>
                                            <HiBadgeCheck className="text-orange-500 text-sm md:text-base" />
                                        </div>
                                    </div>
                                    <div className="bg-purple-50 p-3 md:p-4 rounded-xl border border-purple-100">
                                        <p className="text-[9px] font-black text-purple-400 uppercase tracking-wider mb-1">
                                            {w.pay_basis === 'daily' ? 'Day Wage' : 'Salary'}
                                        </p>
                                        <div className="flex flex-col">
                                            <span className="text-base md:text-lg font-black text-purple-700">
                                                ₹{(w.salary || 0).toLocaleString()}
                                            </span>
                                            {w.pay_basis === 'daily' && w.half_day_salary > 0 && (
                                                <span className="text-[8px] font-bold text-purple-500 italic">
                                                    (H.D. ₹{w.half_day_salary.toLocaleString()})
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                                <div className="text-blue-600 font-black text-xs md:text-sm group-hover:translate-x-2 transition-transform">
                                    View Profile →
                                </div>
                                <div className="w-8 h-8 rounded-full border-2 border-slate-100 flex items-center justify-center text-slate-300 group-hover:border-blue-600 group-hover:text-blue-600 transition-colors">
                                    <HiArrowRight className="text-xs" />
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
}
