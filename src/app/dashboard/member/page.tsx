"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    HiClock,
    HiLogout,
    HiLocationMarker,
    HiCurrencyRupee,
    HiLightningBolt,
    HiShieldCheck,
    HiOutlineDocumentText,
    HiArrowRight,
    HiPlus
} from "react-icons/hi";
import { getStaffSession, staffLogout } from "@/lib/services/auth-role";
import { getTasksAssignedTo, getTaskStats, TaskStats } from "@/lib/services/tasks";
import { TaskAssignment, StaffSession } from "@/lib/types";
import { createClient } from "@/lib/supabase";

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
        totalEarnings: 0,
        paidEarnings: 0
    });
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all');

    useEffect(() => {
        const s = getStaffSession();
        if (!s || s.role !== 'team_member') {
            router.push('/staff-login');
            return;
        }
        setSession(s);
        loadData(s);

        const supabase = createClient();
        const channel = supabase
            .channel('member-realtime')
            .on('postgres_changes', { 
                event: '*', 
                schema: 'public', 
                table: 'task_assignments',
                filter: `assigned_to=eq.${s.staffId}`
            }, () => {
                loadData(s);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
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
            {/* Header - Adaptive Style */}
            <div className="bg-white/80 backdrop-blur-md border-b border-slate-100 px-5 py-4 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-slate-200">
                            <HiLightningBolt className="text-xl md:text-2xl" />
                        </div>
                        <div>
                            <h1 className="font-black text-slate-900 text-sm md:text-base leading-none flex items-center gap-1.5">
                                {session?.staffName || 'Rider'} 
                                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                            </h1>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">ID: {session?.staffId.slice(0, 8)}</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <div className="hidden md:flex flex-col items-end mr-4">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Verified Balance</p>
                            <p className="font-black text-emerald-600 text-lg">₹{stats.totalEarnings.toLocaleString('en-IN')}</p>
                        </div>
                        <button onClick={handleLogout} className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-slate-50 text-slate-400 rounded-2xl hover:text-red-500 hover:bg-red-50 transition-all border border-transparent hover:border-red-100">
                            <HiLogout className="text-lg md:text-xl" />
                        </button>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-5 pt-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column: Stats & Profile (Desktop) / Top Section (Mobile) */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Modern Earnings Display */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-[2.5rem] p-8 shadow-2xl shadow-slate-200/50 border border-slate-50 relative overflow-hidden group"
                        >
                            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform duration-500">
                                <HiCurrencyRupee className="text-8xl text-emerald-900" />
                            </div>
                            
                            <div className="relative z-10">
                                <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-100 italic">
                                    Verified Payouts
                                </span>
                                <div className="mt-4 flex flex-col">
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-xl font-black text-slate-300">₹</span>
                                        <span className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter">
                                            {(stats.totalEarnings - ((stats as any).paidEarnings || 0)).toLocaleString('en-IN')}
                                        </span>
                                    </div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Pending Balance • ₹{stats.totalEarnings.toLocaleString('en-IN')} Lifetime</p>
                                </div>
                                
                                <div className="mt-10 grid grid-cols-2 gap-4">
                                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Gigs Done</p>
                                        <p className="text-2xl font-black text-slate-800">{stats.completed + stats.verified}</p>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Active</p>
                                        <p className="text-2xl font-black text-slate-800">{stats.in_progress + stats.accepted}</p>
                                    </div>
                                </div>

                                <div className="mt-6 flex gap-3">
                                    <button className="flex-1 py-4 bg-slate-950 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-slate-200 active:scale-95 transition-all">
                                        Payout Request
                                    </button>
                                </div>
                            </div>
                        </motion.div>

                        {/* Additional Info / Performance (Desktop Only) */}
                        <div className="hidden lg:block bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-4">
                                    <HiShieldCheck className="text-xl text-emerald-400" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Trust Score</span>
                                </div>
                                <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-2">
                                    <motion.div 
                                        initial={{ width: 0 }} 
                                        animate={{ width: '92%' }} 
                                        className="h-full bg-emerald-400" 
                                    />
                                </div>
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest opacity-60">
                                    <span>Bronze</span>
                                    <span className="text-emerald-400">92% Superior</span>
                                </div>
                            </div>
                            <div className="absolute -bottom-4 -right-4 opacity-10">
                                <HiPlus className="text-9xl rotate-45" />
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Gig List & Filters */}
                    <div className="lg:col-span-8 space-y-6">
                        {/* Status Pills */}
                        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1 sticky top-[84px] md:top-24 bg-[#FDFDFE]/90 backdrop-blur-sm z-30 py-2">
                            {[
                                { key: 'all', label: 'All Jobs' },
                                { key: 'pending', label: 'Invitations' },
                                { key: 'in_progress', label: 'Active' },
                                { key: 'completed', label: 'Done' },
                            ].map((f) => (
                                <button
                                    key={f.key}
                                    onClick={() => setFilter(f.key as any)}
                                    className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all duration-300 ${filter === f.key ? 'bg-slate-900 text-white shadow-xl shadow-slate-200 -translate-y-0.5' : 'bg-white text-slate-400 border border-slate-100 hover:border-slate-300'}`}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>

                        {/* Gig List Container */}
                        <div className="space-y-5">
                            <div>
                                {filteredTasks.length === 0 ? (
                                    <motion.div 
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="py-32 text-center bg-white rounded-[3rem] border border-dashed border-slate-200"
                                    >
                                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-slate-100">
                                            <HiOutlineDocumentText className="text-4xl text-slate-200" />
                                        </div>
                                        <h3 className="text-slate-900 font-black text-lg mb-1">No Jobs Found</h3>
                                        <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Check back later or change filter</p>
                                    </motion.div>
                                ) : (
                                    filteredTasks.map((task, idx) => (
                                        <motion.div
                                            key={task.id}
                                            layout
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            onClick={() => router.push(`/dashboard/member/tasks/${task.id}`)}
                                            className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all duration-300 cursor-pointer group"
                                        >
                                            <div className="p-8">
                                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                                    <div className="flex-1 space-y-4">
                                                        <div className="flex items-center gap-3">
                                                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                                                task.status === 'pending' ? 'bg-orange-50 text-orange-600' :
                                                                task.status === 'accepted' ? 'bg-indigo-50 text-indigo-600' :
                                                                task.status === 'in_progress' ? 'bg-emerald-50 text-emerald-600' :
                                                                'bg-slate-50 text-slate-400'
                                                            }`}>
                                                                {task.status.replace('_', ' ')}
                                                            </span>
                                                            {task.priority === 'urgent' && (
                                                                <span className="bg-red-500 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase flex items-center gap-1.5">
                                                                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-blink" />
                                                                    Priority
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <h3 className="text-xl md:text-2xl font-black text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{task.title}</h3>
                                                            <div className="flex flex-wrap gap-x-6 gap-y-3 mt-4">
                                                                <div className="flex items-center gap-2 text-slate-400 font-bold text-[11px] uppercase tracking-wider">
                                                                    <HiLocationMarker className="text-emerald-500 text-base" />
                                                                    <span className="max-w-[200px] truncate">{task.service_address || 'Field Visit'}</span>
                                                                </div>
                                                                <div className="flex items-center gap-2 text-slate-400 font-bold text-[11px] uppercase tracking-wider">
                                                                    <HiClock className="text-orange-500 text-base" />
                                                                    <span>{task.deadline ? new Date(task.deadline).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : 'ASAP'}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="flex items-center justify-between pt-6 md:pt-0 border-t md:border-t-0 border-slate-50 gap-6">
                                                        <div className="flex flex-col md:items-end">
                                                            <div className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Pay</div>
                                                            <div className="flex items-center gap-1 text-emerald-600 font-black text-3xl leading-none">
                                                                <span className="text-lg">₹</span>
                                                                {task.estimated_cost?.toLocaleString('en-IN') || 0}
                                                            </div>
                                                        </div>
                                                        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                                                            <HiArrowRight className="text-xl group-hover:translate-x-1 transition-transform" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Bottom Floating Navigation (Mobile Only) */}
            <div className="md:hidden fixed bottom-8 left-0 right-0 px-6 z-50 flex justify-center">
                <div className="bg-white/90 backdrop-blur-xl border border-slate-100 px-3 py-3 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex items-center gap-2">
                    <button 
                        onClick={() => { setFilter('all'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all ${filter === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400'}`}
                    >
                        <HiLightningBolt className="text-xl" />
                    </button>
                    <button 
                        onClick={() => { setFilter('completed'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        className={`px-6 h-12 text-[10px] font-black uppercase tracking-widest rounded-full transition-all ${filter === 'completed' ? 'bg-slate-900 text-white' : 'bg-slate-50/50 text-slate-400'}`}
                    >
                        Activity
                    </button>
                    <button 
                        onClick={() => alert(`WEXO SUPPORT\n\nFor technical issues, contact your Manager or Admin directly.\n\nCompany ID: ${session?.ownerId.slice(0, 8)}`)}
                        className="px-6 h-12 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/50 rounded-full hover:bg-slate-100 transition-all"
                    >
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
