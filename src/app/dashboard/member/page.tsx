"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    HiCheckCircle,
    HiClock,
    HiLogout,
    HiPhone,
    HiLocationMarker,
    HiChevronDown,
    HiChevronUp,
    HiCamera,
    HiCurrencyRupee,
    HiLightningBolt,
    HiShieldCheck,
    HiOutlineDocumentText,
    HiArrowRight,
    HiPlus
} from "react-icons/hi";
import { getStaffSession, staffLogout } from "@/lib/services/auth-role";
import { getTasksAssignedTo, updateTaskStatus, getTaskStats, TaskStats } from "@/lib/services/tasks";
import { TaskAssignment, StaffSession, TaskStatus } from "@/lib/types";

export default function MemberDashboard() {
    const router = useRouter();
    const [session, setSession] = useState<StaffSession | null>(null);
    const [tasks, setTasks] = useState<TaskAssignment[]>([]);
    const [stats, setStats] = useState<TaskStats>({ 
        total: 0, 
        pending: 0, 
        accepted: 0, 
        in_progress: 0, 
        completed: 0, 
        verified: 0, 
        rejected: 0, 
        overdue: 0,
        totalEarnings: 0
    });
    const [loading, setLoading] = useState(true);
    const [expandedTask, setExpandedTask] = useState<string | null>(null);
    const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all');

    useEffect(() => {
        const s = getStaffSession();
        if (!s || s.role !== 'team_member') {
            router.push('/staff-login');
            return;
        }
        setSession(s);
        loadData(s);
    }, [router]);

    async function loadData(s: StaffSession) {
        setLoading(true);
        try {
            const [tasksData, statsData] = await Promise.all([
                getTasksAssignedTo(s.staffId, s.ownerId),
                getTaskStats(s.staffId, 'assigned_to', s.ownerId)
            ]);
            setTasks(tasksData);
            setStats(statsData);
        } catch (err) {
            console.error("Error loading member data:", err);
        } finally {
            setLoading(false);
        }
    }

    async function handleStatusChange(taskId: string, newStatus: TaskStatus, extras?: { rejection_reason?: string; completion_notes?: string }) {
        if (!session) return;
        const success = await updateTaskStatus(taskId, newStatus, session.staffId, { ...extras, ownerId: session.ownerId });
        if (success) {
            loadData(session);
        } else {
            alert("Failed to update task");
        }
    }

    function handleLogout() {
        staffLogout();
        router.push('/staff-login');
    }

    const filteredTasks = tasks.filter(t => {
        if (filter === 'all') return true;
        if (filter === 'pending') return t.status === 'pending';
        if (filter === 'in_progress') return ['accepted', 'in_progress'].includes(t.status);
        if (filter === 'completed') return ['completed', 'verified'].includes(t.status);
        return true;
    });

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" />
                    <p className="font-black text-slate-900 tracking-[0.2em] text-[10px] uppercase">Locating Gigs...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FDFDFE] pb-36 font-sans selection:bg-slate-900 selection:text-white">
            {/* Header - Mobile App Bar Style */}
            <div className="bg-white/80 backdrop-blur-md border-b border-slate-100 px-5 py-5 sticky top-0 z-40">
                <div className="max-w-md mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-slate-200">
                            <HiLightningBolt className="text-xl" />
                        </div>
                        <div>
                            <h1 className="font-black text-slate-900 text-sm leading-none flex items-center gap-1.5">
                                {session?.staffName?.split(' ')[0]} 
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                            </h1>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Rider ID: {session?.staffId.slice(0, 5)}</p>
                        </div>
                    </div>
                    
                    <button onClick={handleLogout} className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-400 rounded-xl hover:text-red-500 transition-colors">
                        <HiLogout className="text-lg" />
                    </button>
                </div>
            </div>

            <main className="max-w-md mx-auto px-5 pt-8 space-y-8">
                {/* Modern Earnings Display */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-[2.5rem] p-8 shadow-2xl shadow-slate-200/60 border border-slate-50 relative overflow-hidden"
                >
                    <div className="relative z-10 flex flex-col items-center">
                        <div className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest mb-3 border border-emerald-100">
                            Verified Payouts
                        </div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-sm font-black text-slate-400">₹</span>
                            <span className="text-5xl font-black text-slate-900 tracking-tighter">
                                {stats.totalEarnings.toLocaleString('en-IN')}
                            </span>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2">Lifetime Earnings</p>
                        
                        <div className="mt-8 w-full flex gap-3">
                            <button className="flex-1 py-3 bg-slate-50 text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-slate-100">
                                History
                            </button>
                            <button className="flex-1 py-3 bg-slate-950 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-slate-200">
                                Withdrawal
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Status Pills - Mobile Friendly */}
                <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
                    {[
                        { key: 'all', label: 'All Jobs' },
                        { key: 'pending', label: 'Invitations' },
                        { key: 'in_progress', label: 'Active' },
                        { key: 'completed', label: 'Done' },
                    ].map((f) => (
                        <button
                            key={f.key}
                            onClick={() => setFilter(f.key as any)}
                            className={`px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all duration-300 ${filter === f.key ? 'bg-slate-900 text-white shadow-xl shadow-slate-200 -translate-y-0.5' : 'bg-white text-slate-400 border border-slate-100'}`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>

                {/* Gig List */}
                <div className="space-y-5">
                    <AnimatePresence mode='popLayout'>
                        {filteredTasks.length === 0 ? (
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="py-20 text-center bg-slate-50 rounded-[3rem] border border-dashed border-slate-200"
                            >
                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                                    <HiOutlineDocumentText className="text-3xl text-slate-200" />
                                </div>
                                <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">No Active Assignments</p>
                            </motion.div>
                        ) : (
                            filteredTasks.map((task, idx) => (
                                <motion.div
                                    key={task.id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className={`bg-white rounded-[2.5rem] border overflow-hidden transition-all duration-300 ${expandedTask === task.id ? 'border-emerald-200 ring-4 ring-emerald-50 shadow-2xl scale-[1.02]' : 'border-slate-100 shadow-sm'}`}
                                >
                                    {/* Task Card Header */}
                                    <div 
                                        className="p-7 cursor-pointer"
                                        onClick={() => setExpandedTask(expandedTask === task.id ? null : task.id)}
                                    >
                                        <div className="flex items-start justify-between mb-5">
                                            <div className="flex-1 pr-4">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className={`px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${
                                                        task.status === 'pending' ? 'bg-orange-50 text-orange-600' :
                                                        task.status === 'accepted' ? 'bg-indigo-50 text-indigo-600' :
                                                        task.status === 'in_progress' ? 'bg-emerald-50 text-emerald-600' :
                                                        'bg-slate-50 text-slate-400'
                                                    }`}>
                                                        {task.status.replace('_', ' ')}
                                                    </span>
                                                    {task.priority === 'urgent' && <span className="bg-red-500 text-white text-[8px] font-black px-2.5 py-1 rounded-lg uppercase animate-pulse">Hot Gig</span>}
                                                </div>
                                                <h3 className="text-lg font-black text-slate-900 leading-tight tracking-tight">{task.title}</h3>
                                            </div>
                                            
                                            <div className="text-right">
                                                <div className="flex items-center gap-0.5 text-emerald-600 font-black text-2xl">
                                                    <span className="text-sm">₹</span>
                                                    {task.estimated_cost || 0}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-4 pt-5 border-t border-slate-50">
                                            <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px]">
                                                <HiLocationMarker className="text-emerald-500 text-sm" />
                                                <span className="truncate max-w-[150px]">{task.service_address || 'Field Visit'}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px]">
                                                <HiClock className="text-orange-500 text-sm" />
                                                <span>{task.deadline ? new Date(task.deadline).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : 'ASAP'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Expandable Actions */}
                                    <AnimatePresence>
                                        {expandedTask === task.id && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="bg-slate-50 border-t border-slate-100"
                                            >
                                                <div className="p-7 space-y-6">
                                                    {task.description && (
                                                        <div className="bg-white p-5 rounded-3xl border border-slate-200">
                                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Objective</p>
                                                            <p className="text-xs text-slate-700 font-bold leading-relaxed">{task.description}</p>
                                                        </div>
                                                    )}

                                                    {/* App-like Communication Grid */}
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <a 
                                                            href={task.google_maps_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(task.service_address || '')}`}
                                                            target="_blank" rel="noopener"
                                                            className="bg-white p-4 rounded-3xl flex flex-col items-center gap-2 border border-slate-200 shadow-sm active:scale-95 transition-all"
                                                        >
                                                            <HiLocationMarker className="text-xl text-blue-500" />
                                                            <span className="text-[9px] font-black text-slate-800 uppercase">Directions</span>
                                                        </a>
                                                        <a 
                                                            href={`tel:${task.customer_phone}`}
                                                            className="bg-white p-4 rounded-3xl flex flex-col items-center gap-2 border border-slate-200 shadow-sm active:scale-95 transition-all"
                                                        >
                                                            <HiPhone className="text-xl text-emerald-500" />
                                                            <span className="text-[9px] font-black text-slate-800 uppercase">Call Client</span>
                                                        </a>
                                                    </div>

                                                    {/* Work State Buttons */}
                                                    <div className="pt-2">
                                                        {task.status === 'pending' && (
                                                            <div className="space-y-4">
                                                                <button
                                                                    onClick={() => handleStatusChange(task.id, 'accepted')}
                                                                    className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-slate-200 active:scale-95 transition-all flex items-center justify-center gap-3"
                                                                >
                                                                    Accept & Add to Route
                                                                </button>
                                                                <button
                                                                    onClick={() => {
                                                                        const r = prompt("Reason for decline?");
                                                                        if (r) handleStatusChange(task.id, 'rejected', { rejection_reason: r });
                                                                    }}
                                                                    className="w-full py-2 text-slate-400 font-black text-[9px] uppercase tracking-widest"
                                                                >
                                                                    Decline Gig
                                                                </button>
                                                            </div>
                                                        )}

                                                        {task.status === 'accepted' && (
                                                            <button
                                                                onClick={() => handleStatusChange(task.id, 'in_progress')}
                                                                className="w-full py-5 bg-emerald-600 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-emerald-100 active:scale-95 transition-all flex items-center justify-center gap-3"
                                                            >
                                                                Start Execution
                                                            </button>
                                                        )}

                                                        {task.status === 'in_progress' && (
                                                            <div className="space-y-4">
                                                                <div className="bg-white p-6 rounded-[2rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 active:bg-slate-50 transition-colors cursor-pointer">
                                                                    <HiCamera className="text-3xl text-slate-300" />
                                                                    <span className="text-[9px] font-black text-slate-500 uppercase">Upload Delivery Snapshot</span>
                                                                </div>
                                                                <button
                                                                    onClick={() => {
                                                                        const n = prompt("Notes on completion?");
                                                                        handleStatusChange(task.id, 'completed', { completion_notes: n || undefined });
                                                                    }}
                                                                    className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] active:scale-95 transition-all flex items-center justify-center gap-3"
                                                                >
                                                                    Complete Gig
                                                                </button>
                                                            </div>
                                                        )}

                                                        {task.status === 'completed' && (
                                                            <div className="bg-amber-50 p-6 rounded-[2rem] border border-amber-100/50 text-center flex flex-col items-center gap-2">
                                                                <HiShieldCheck className="text-3xl text-amber-500" />
                                                                <p className="text-[9px] font-black text-amber-700 uppercase tracking-widest">Verification Pending</p>
                                                                <p className="text-[10px] text-amber-600/70 font-bold px-4">Payout will credit once the manager approves details.</p>
                                                            </div>
                                                        )}

                                                        {task.status === 'verified' && (
                                                            <div className="bg-emerald-50 p-6 rounded-[2rem] border border-emerald-100/50 text-center flex flex-col items-center gap-2">
                                                                <HiCheckCircle className="text-3xl text-emerald-500" />
                                                                <p className="text-[9px] font-black text-emerald-700 uppercase tracking-widest">Success</p>
                                                                <p className="text-xl font-black text-emerald-600 leading-none">₹{task.actual_cost} Credited</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>
            </main>

            {/* Bottom Floating Navigation (App-like) */}
            <div className="fixed bottom-8 left-0 right-0 px-6 z-50 flex justify-center">
                <div className="bg-white/90 backdrop-blur-xl border border-slate-100 px-3 py-3 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex items-center gap-2">
                    <button className="w-12 h-12 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-lg">
                        <HiLightningBolt className="text-xl" />
                    </button>
                    <button className="px-6 h-12 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/50 rounded-full">
                        Activity
                    </button>
                    <button className="px-6 h-12 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/50 rounded-full">
                        Support
                    </button>
                </div>
            </div>

            {/* Prominent "New Gig" Notification */}
            {stats.pending > 0 && filter !== 'pending' && (
                <div className="fixed bottom-28 left-0 right-0 px-5 z-40 pointer-events-none flex justify-center">
                    <motion.button 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        onClick={() => { setFilter('pending'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        className="pointer-events-auto bg-orange-600 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl shadow-orange-600/30 flex items-center gap-3 animate-bounce"
                    >
                        <HiPlus className="text-lg" />
                        {stats.pending} New Gigs Nearby!
                    </motion.button>
                </div>
            )}
        </div>
    );
}
