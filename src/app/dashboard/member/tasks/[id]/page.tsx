"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    HiArrowLeft,
    HiLocationMarker,
    HiPhone,
    HiClock,
    HiCurrencyRupee,
    HiCheckCircle,
    HiCamera,
    HiShieldCheck,
    HiArrowRight,
    HiLightningBolt
} from "react-icons/hi";
import { getStaffSession } from "@/lib/services/auth-role";
import { getTaskById, updateTaskStatus } from "@/lib/services/tasks";
import { TaskAssignment, StaffSession, TaskStatus } from "@/lib/types";

export default function MemberTaskDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const { id } = resolvedParams;
    const router = useRouter();
    const [session, setSession] = useState<StaffSession | null>(null);
    const [task, setTask] = useState<TaskAssignment | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        const s = getStaffSession();
        if (!s || s.role !== 'team_member') {
            router.push('/staff-login');
            return;
        }
        setSession(s);
        fetchTask(s);
    }, [id, router]);

    async function fetchTask(s: StaffSession) {
        setLoading(true);
        try {
            const data = await getTaskById(id, s.ownerId);
            setTask(data);
        } catch (error) {
            console.error("Error fetching task", error);
        } finally {
            setLoading(false);
        }
    }

    async function handleStatusChange(newStatus: TaskStatus, extras?: { rejection_reason?: string; completion_notes?: string }) {
        if (!session || !task) return;
        setUpdating(true);
        try {
            const success = await updateTaskStatus(task.id, newStatus, session.staffId, { ...extras, ownerId: session.ownerId });
            if (success) {
                await fetchTask(session);
            } else {
                alert("Failed to update status");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setUpdating(false);
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" />
                    <p className="font-black text-slate-900 tracking-[0.2em] text-[10px] uppercase">Reviewing Gig...</p>
                </div>
            </div>
        );
    }

    if (!task) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-10 text-center">
                <HiShieldCheck className="text-6xl text-slate-100 mb-4" />
                <h2 className="text-xl font-black text-slate-900">Gig Not Found</h2>
                <p className="text-slate-400 mt-2 mb-8">This assignment might have been removed or re-assigned.</p>
                <button 
                    onClick={() => router.push('/dashboard/member')}
                    className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest"
                >
                    Back to Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FDFDFE] pb-20 font-sans">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-md border-b border-slate-100 px-5 py-6 sticky top-0 z-40">
                <div className="max-w-md mx-auto flex items-center gap-4">
                    <button 
                        onClick={() => router.push('/dashboard/member')}
                        className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center hover:text-slate-900 transition-colors"
                    >
                        <HiArrowLeft className="text-xl" />
                    </button>
                    <div>
                        <h1 className="font-black text-slate-900 text-base leading-none uppercase tracking-tight">Gig Details</h1>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">ID: {task.id.slice(0, 12).toUpperCase()}</p>
                    </div>
                </div>
            </div>

            <main className="max-w-md mx-auto px-5 pt-8">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                >
                    {/* Status & Priority */}
                    <div className="flex items-center gap-2">
                         <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                            task.status === 'pending' ? 'bg-orange-50 text-orange-600' :
                            task.status === 'accepted' ? 'bg-indigo-50 text-indigo-600' :
                            task.status === 'in_progress' ? 'bg-emerald-50 text-emerald-600' :
                            'bg-slate-50 text-slate-400'
                        }`}>
                            {task.status.replace('_', ' ')}
                        </span>
                        {task.priority === 'urgent' && (
                            <span className="bg-red-500 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase flex items-center gap-1.5 shadow-lg shadow-red-200 animate-pulse">
                                <HiLightningBolt /> Hot Gig
                            </span>
                        )}
                    </div>

                    {/* Title & Pay */}
                    <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-slate-200/50 border border-slate-50 relative overflow-hidden">
                         <div className="absolute top-0 right-0 p-8 opacity-5">
                            <HiCurrencyRupee className="text-9xl text-slate-900" />
                        </div>
                        <div className="relative z-10">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Service Objective</p>
                            <h2 className="text-3xl font-black text-slate-900 leading-tight uppercase tracking-tight mb-8">
                                {task.title}
                            </h2>
                            <div className="flex items-end justify-between pt-6 border-t border-slate-50">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Guaranteed Pay</p>
                                    <div className="flex items-center gap-1 text-emerald-600 font-black text-4xl">
                                        <span className="text-xl">₹</span>
                                        {task.estimated_cost?.toLocaleString('en-IN') || 0}
                                    </div>
                                </div>
                                <div className="text-right">
                                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Time Limit</p>
                                     <div className="flex items-center gap-2 font-black text-slate-900 text-lg">
                                        <HiClock className="text-orange-500" />
                                        {task.deadline ? new Date(task.deadline).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : 'ASAP'}
                                     </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    {task.description && (
                        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Job Description</h3>
                            <p className="text-slate-700 font-bold leading-relaxed text-sm">
                                {task.description}
                            </p>
                        </div>
                    )}

                    {/* Map & Actions */}
                    <div className="grid grid-cols-2 gap-4">
                        <a 
                            href={task.google_maps_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(task.service_address || '')}`}
                            target="_blank" rel="noopener"
                            className="bg-white p-6 rounded-[2rem] flex flex-col items-center gap-3 border border-slate-100 shadow-sm active:scale-95 transition-all text-center group"
                        >
                            <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                <HiLocationMarker className="text-2xl" />
                            </div>
                            <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Navigation</span>
                        </a>
                        
                        <a 
                            href={`tel:${task.customer_phone}`}
                            className="bg-white p-6 rounded-[2rem] flex flex-col items-center gap-3 border border-slate-100 shadow-sm active:scale-95 transition-all text-center group"
                        >
                            <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                                <HiPhone className="text-2xl" />
                            </div>
                            <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Call Client</span>
                        </a>
                    </div>

                    {/* Address Display */}
                    <div className="bg-slate-900/5 p-8 rounded-[2.5rem] border border-slate-100">
                         <div className="flex items-start gap-3">
                            <HiLocationMarker className="text-xl text-emerald-500 shrink-0 mt-1" />
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Service Location</p>
                                <p className="text-sm font-black text-slate-900 leading-snug">{task.service_address || 'Field Visit Required'}</p>
                            </div>
                         </div>
                    </div>

                    {/* Workflow Actions */}
                    <div className="pt-6">
                        {updating ? (
                            <div className="w-full py-6 flex items-center justify-center bg-slate-100 rounded-[1.5rem]">
                                <div className="w-6 h-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : (
                            <div className="space-y-4 pb-20">
                                {task.status === 'pending' && (
                                    <>
                                        <button
                                            onClick={() => handleStatusChange('accepted')}
                                            className="w-full py-6 bg-slate-900 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-slate-200 active:scale-95 mt-4"
                                        >
                                            Accept Gig
                                        </button>
                                        <button
                                            onClick={() => {
                                                const r = prompt("Reason for decline?");
                                                if (r) handleStatusChange('rejected', { rejection_reason: r });
                                            }}
                                            className="w-full py-4 text-slate-400 font-black text-[9px] uppercase tracking-widest"
                                        >
                                            Decline Assignment
                                        </button>
                                    </>
                                )}

                                {task.status === 'accepted' && (
                                    <button
                                        onClick={() => handleStatusChange('in_progress')}
                                        className="w-full py-6 bg-indigo-600 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-indigo-100 active:scale-95 flex items-center justify-center gap-3"
                                    >
                                        Arrived at Location <HiArrowRight />
                                    </button>
                                )}

                                {task.status === 'in_progress' && (
                                    <div className="space-y-4">
                                        <div className="bg-white p-12 rounded-[3rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-3 active:bg-slate-50 transition-colors cursor-pointer group">
                                            <HiCamera className="text-4xl text-slate-300 group-active:text-indigo-500" />
                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Snapshot Required</span>
                                        </div>
                                        <button
                                            onClick={() => {
                                                const n = prompt("Final notes for verification?");
                                                handleStatusChange('completed', { completion_notes: n || undefined });
                                            }}
                                            className="w-full py-6 bg-slate-900 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] active:scale-95"
                                        >
                                            Securely Complete Gig
                                        </button>
                                    </div>
                                )}

                                {task.status === 'completed' && (
                                    <div className="bg-amber-50 p-10 rounded-[3rem] border border-amber-100/50 text-center flex flex-col items-center gap-4">
                                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm">
                                            <HiShieldCheck className="text-4xl text-amber-500" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-amber-700 uppercase tracking-[0.2em] mb-1">Verifying Data</p>
                                            <p className="text-xs text-amber-600/70 font-bold px-4">Manager review in progress. Payout will credit soon.</p>
                                        </div>
                                    </div>
                                )}

                                {task.status === 'verified' && (
                                    <div className="bg-emerald-50 p-10 rounded-[3rem] border border-emerald-100/50 text-center flex flex-col items-center gap-4">
                                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-xl border border-emerald-50">
                                            <HiCheckCircle className="text-6xl text-emerald-500" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-emerald-700 uppercase tracking-[0.2em] mb-1">Payment Released</p>
                                            <p className="text-3xl font-black text-emerald-600 tracking-tighter leading-none">₹{task.estimated_cost?.toLocaleString()}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </motion.div>
            </main>
        </div>
    );
}
