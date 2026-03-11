"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    HiClipboardCheck, HiClock, HiCheckCircle,
    HiExclamation, HiLogout, HiPhone, HiLocationMarker,
    HiChevronDown, HiChevronUp, HiCamera
} from "react-icons/hi";
import { getStaffSession, staffLogout } from "@/lib/services/auth-role";
import { getTasksAssignedTo, updateTaskStatus, getTaskStats, TaskStats } from "@/lib/services/tasks";
import { TaskAssignment, StaffSession, TaskStatus } from "@/lib/types";

export default function MemberDashboard() {
    const router = useRouter();
    const [session, setSession] = useState<StaffSession | null>(null);
    const [tasks, setTasks] = useState<TaskAssignment[]>([]);
    const [stats, setStats] = useState<TaskStats>({ total: 0, pending: 0, accepted: 0, in_progress: 0, completed: 0, verified: 0, rejected: 0, overdue: 0 });
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
                getTasksAssignedTo(s.staffId),
                getTaskStats(s.staffId, 'assigned_to')
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
        const success = await updateTaskStatus(taskId, newStatus, session.staffId, extras);
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

    const getStatusBadge = (status: TaskStatus) => {
        const map: Record<TaskStatus, { bg: string; text: string; label: string }> = {
            pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'NEW TASK' },
            accepted: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'ACCEPTED' },
            rejected: { bg: 'bg-red-100', text: 'text-red-700', label: 'REJECTED' },
            in_progress: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'WORKING' },
            completed: { bg: 'bg-green-100', text: 'text-green-700', label: 'DONE' },
            verified: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'APPROVED' },
            reassigned: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'MOVED' },
        };
        const s = map[status] || map['pending'];
        return <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${s.bg} ${s.text}`}>{s.label}</span>;
    };

    const getPriorityLabel = (priority: string) => {
        const map: Record<string, { color: string; label: string }> = {
            urgent: { color: 'text-red-600 bg-red-50', label: '🔴 URGENT' },
            high: { color: 'text-orange-600 bg-orange-50', label: '🟠 HIGH' },
            medium: { color: 'text-blue-600 bg-blue-50', label: '🔵 MEDIUM' },
            low: { color: 'text-slate-500 bg-slate-50', label: '⚪ LOW' },
        };
        const p = map[priority] || map['medium'];
        return <span className={`px-2 py-1 rounded-lg text-[10px] font-black ${p.color}`}>{p.label}</span>;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Mobile Header */}
            <div className="bg-green-600 text-white px-4 md:px-8 py-5 sticky top-0 z-30 shadow-lg">
                <div className="max-w-3xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center font-black text-xl">
                            {session?.staffName?.[0] || 'T'}
                        </div>
                        <div>
                            <h1 className="font-black text-lg leading-tight">{session?.staffName}</h1>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-80">TEAM MEMBER</p>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="flex items-center gap-2 text-white/80 hover:text-white font-bold text-sm">
                        <HiLogout className="text-xl" />
                    </button>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 md:px-8 pt-6 space-y-6">
                {/* Quick Stats */}
                <div className="grid grid-cols-4 gap-2">
                    {[
                        { label: 'New', value: stats.pending, color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
                        { label: 'Active', value: stats.accepted + stats.in_progress, color: 'bg-purple-50 text-purple-700 border-purple-200' },
                        { label: 'Done', value: stats.completed + stats.verified, color: 'bg-green-50 text-green-700 border-green-200' },
                        { label: 'Late', value: stats.overdue, color: 'bg-red-50 text-red-700 border-red-200' },
                    ].map((stat) => (
                        <div key={stat.label} className={`${stat.color} p-3 rounded-2xl text-center border`}>
                            <p className="text-2xl font-black">{stat.value}</p>
                            <p className="text-[9px] font-black uppercase tracking-wider mt-0.5">{stat.label}</p>
                        </div>
                    ))}
                </div>

                {/* Filter Chips */}
                <div className="flex gap-2 overflow-x-auto no-scrollbar">
                    {[
                        { key: 'all', label: `All (${tasks.length})` },
                        { key: 'pending', label: `New (${stats.pending})` },
                        { key: 'in_progress', label: `Working (${stats.accepted + stats.in_progress})` },
                        { key: 'completed', label: `Done (${stats.completed + stats.verified})` },
                    ].map((f) => (
                        <button
                            key={f.key}
                            onClick={() => setFilter(f.key as any)}
                            className={`px-4 py-2 rounded-full text-xs font-black whitespace-nowrap transition-all ${filter === f.key ? 'bg-green-600 text-white shadow-lg' : 'bg-white text-slate-500 border border-slate-100'}`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>

                {/* Task Cards */}
                <div className="space-y-4">
                    {filteredTasks.length === 0 ? (
                        <div className="bg-white rounded-[2rem] p-12 text-center border border-slate-100">
                            <HiCheckCircle className="text-5xl text-green-200 mx-auto mb-4" />
                            <p className="text-slate-400 font-bold text-lg">No tasks here!</p>
                            <p className="text-slate-300 font-medium text-sm mt-1">You are all caught up 👍</p>
                        </div>
                    ) : (
                        filteredTasks.map((task) => (
                            <motion.div
                                key={task.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm"
                            >
                                {/* Urgent ribbon */}
                                {task.priority === 'urgent' && (
                                    <div className="bg-red-500 text-white text-center py-1 text-[10px] font-black uppercase tracking-widest animate-pulse">
                                        ⚡ URGENT — DO THIS FIRST
                                    </div>
                                )}

                                <div
                                    className="p-4 cursor-pointer"
                                    onClick={() => setExpandedTask(expandedTask === task.id ? null : task.id)}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <h3 className="font-black text-slate-800 text-base leading-tight">{task.title}</h3>
                                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                                                {getStatusBadge(task.status)}
                                                {getPriorityLabel(task.priority)}
                                            </div>
                                            {task.assigned_by_worker && (
                                                <p className="text-slate-400 text-[10px] font-black uppercase tracking-wider mt-2">
                                                    From: {(task.assigned_by_worker as any)?.name || 'Admin'}
                                                </p>
                                            )}
                                        </div>
                                        {expandedTask === task.id ? <HiChevronUp className="text-slate-400 shrink-0 text-xl" /> : <HiChevronDown className="text-slate-400 shrink-0 text-xl" />}
                                    </div>

                                    {task.deadline && (
                                        <div className="mt-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-slate-400">
                                            <HiClock className="text-sm" />
                                            Deadline: {new Date(task.deadline).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            {task.deadline < new Date().toISOString().split('T')[0] && !['completed', 'verified'].includes(task.status) && (
                                                <span className="text-red-500 animate-pulse ml-1">⚠️ OVERDUE</span>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Expanded */}
                                {expandedTask === task.id && (
                                    <div className="border-t border-slate-100 p-4 space-y-4 bg-slate-50/50">
                                        {task.description && (
                                            <div className="bg-white p-4 rounded-xl border border-slate-100">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">WHAT TO DO</p>
                                                <p className="text-sm text-slate-700 font-medium leading-relaxed whitespace-pre-wrap">{task.description}</p>
                                            </div>
                                        )}

                                        {task.service_address && (
                                            <a 
                                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(task.service_address)}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-start gap-3 bg-blue-50 p-4 rounded-xl border border-blue-100"
                                            >
                                                <HiLocationMarker className="text-blue-500 text-xl shrink-0 mt-0.5" />
                                                <div>
                                                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">LOCATION (Tap to open Maps)</p>
                                                    <p className="text-sm text-blue-700 font-bold">{task.service_address}</p>
                                                </div>
                                            </a>
                                        )}

                                        {task.customer_phone && (
                                            <a href={`tel:${task.customer_phone}`} className="flex items-center gap-3 bg-green-50 p-4 rounded-xl border border-green-100">
                                                <HiPhone className="text-green-500 text-xl" />
                                                <div>
                                                    <p className="text-[10px] font-black text-green-400 uppercase tracking-widest">CALL CUSTOMER</p>
                                                    <p className="text-sm text-green-700 font-bold">{task.customer_name || ''} — {task.customer_phone}</p>
                                                </div>
                                            </a>
                                        )}

                                        {/* ACTION BUTTONS - Large, touch-friendly */}
                                        <div className="space-y-3 pt-2">
                                            {task.status === 'pending' && (
                                                <div className="grid grid-cols-2 gap-3">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleStatusChange(task.id, 'accepted'); }}
                                                        className="py-4 bg-green-600 text-white rounded-2xl font-black text-sm uppercase shadow-xl shadow-green-200 active:scale-95 transition-transform"
                                                    >
                                                        ✅ ACCEPT
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            const reason = prompt("Why are you rejecting? (Reason):");
                                                            if (reason) handleStatusChange(task.id, 'rejected', { rejection_reason: reason });
                                                        }}
                                                        className="py-4 bg-red-500 text-white rounded-2xl font-black text-sm uppercase shadow-xl shadow-red-200 active:scale-95 transition-transform"
                                                    >
                                                        ❌ REJECT
                                                    </button>
                                                </div>
                                            )}

                                            {task.status === 'accepted' && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleStatusChange(task.id, 'in_progress'); }}
                                                    className="w-full py-4 bg-purple-600 text-white rounded-2xl font-black text-sm uppercase shadow-xl shadow-purple-200 active:scale-95 transition-transform"
                                                >
                                                    🔨 START WORK NOW
                                                </button>
                                            )}

                                            {task.status === 'in_progress' && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        const notes = prompt("Work done notes (optional):");
                                                        handleStatusChange(task.id, 'completed', { completion_notes: notes || undefined });
                                                    }}
                                                    className="w-full py-4 bg-green-600 text-white rounded-2xl font-black text-sm uppercase shadow-xl shadow-green-200 active:scale-95 transition-transform"
                                                >
                                                    ✅ MARK AS DONE
                                                </button>
                                            )}

                                            {task.status === 'completed' && (
                                                <div className="bg-green-50 p-4 rounded-xl border border-green-200 text-center">
                                                    <HiCheckCircle className="text-3xl text-green-500 mx-auto mb-2" />
                                                    <p className="text-green-700 font-black text-sm">SUBMITTED — Waiting for verification</p>
                                                </div>
                                            )}

                                            {task.status === 'verified' && (
                                                <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 text-center">
                                                    <p className="text-emerald-700 font-black text-sm">✅ TASK APPROVED BY MANAGER</p>
                                                </div>
                                            )}

                                            {task.rejection_reason && (
                                                <div className="bg-red-50 p-4 rounded-xl border border-red-200">
                                                    <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">REJECTION REASON</p>
                                                    <p className="text-sm text-red-600 font-bold">{task.rejection_reason}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
