"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    HiPlus, HiClipboardCheck, HiClock, HiCheckCircle,
    HiExclamation, HiUserGroup, HiChevronDown, HiChevronUp,
    HiPhone, HiLocationMarker, HiFilter, HiX
} from "react-icons/hi";
import { getAllTasks, createTask, updateTaskStatus, deleteTask, getTaskStats, TaskStats } from "@/lib/services/tasks";
import { getWorkers } from "@/lib/services/workers";
import { TaskAssignment, Worker, TaskStatus, TaskPriority } from "@/lib/types";

export default function TasksPage() {
    const [tasks, setTasks] = useState<TaskAssignment[]>([]);
    const [workers, setWorkers] = useState<Worker[]>([]);
    const [stats, setStats] = useState<TaskStats>({ total: 0, pending: 0, accepted: 0, in_progress: 0, completed: 0, verified: 0, rejected: 0, overdue: 0 });
    const [loading, setLoading] = useState(true);
    const [expandedTask, setExpandedTask] = useState<string | null>(null);
    const [filterStatus, setFilterStatus] = useState<string>('all');

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        setLoading(true);
        try {
            const [tasksData, workersData, statsData] = await Promise.all([
                getAllTasks(),
                getWorkers(),
                getTaskStats()
            ]);
            setTasks(tasksData);
            setWorkers(workersData.filter(w => w.status === 'active'));
            setStats(statsData);
        } catch (err) {
            console.error("Error loading tasks:", err);
        } finally {
            setLoading(false);
        }
    }

    async function handleDeleteTask(taskId: string) {
        if (confirm("Are you sure you want to delete this task?")) {
            const success = await deleteTask(taskId);
            if (success) loadData();
        }
    }

    async function handleVerify(taskId: string) {
        const success = await updateTaskStatus(taskId, 'verified', workers.find(w => w.hierarchy_role === 'admin')?.id || '', {});
        if (success) loadData();
    }

    const filteredTasks = tasks.filter(t => {
        if (filterStatus === 'all') return true;
        if (filterStatus === 'active') return ['pending', 'accepted', 'in_progress'].includes(t.status);
        if (filterStatus === 'done') return ['completed', 'verified'].includes(t.status);
        return t.status === filterStatus;
    });

    const getStatusBadge = (status: TaskStatus) => {
        const map: Record<TaskStatus, { bg: string; text: string; label: string }> = {
            pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'PENDING' },
            accepted: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'ACCEPTED' },
            rejected: { bg: 'bg-red-100', text: 'text-red-700', label: 'REJECTED' },
            in_progress: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'IN PROGRESS' },
            completed: { bg: 'bg-green-100', text: 'text-green-700', label: 'COMPLETED' },
            verified: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'VERIFIED' },
            reassigned: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'REASSIGNED' },
        };
        const s = map[status] || map['pending'];
        return <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${s.bg} ${s.text}`}>{s.label}</span>;
    };

    const getPriorityBadge = (priority: string) => {
        const map: Record<string, string> = {
            urgent: 'bg-red-500 text-white', high: 'bg-orange-500 text-white',
            medium: 'bg-blue-100 text-blue-700', low: 'bg-slate-100 text-slate-500'
        };
        return <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase ${map[priority] || map['medium']}`}>{priority}</span>;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6 md:space-y-8 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-black text-slate-800">Task Management</h2>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mt-1">
                        Assign, Track & Verify all field work
                    </p>
                </div>
                <Link
                    href="/dashboard/tasks/assign"
                    className="bg-blue-600 text-white font-black px-8 py-4 rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-blue-200 hover:bg-blue-700 transition-colors text-sm"
                >
                    <HiPlus className="text-xl" /> ASSIGN NEW TASK
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                    { label: 'Pending', value: stats.pending, icon: HiClock, bg: 'bg-yellow-50 border-yellow-100', color: 'text-yellow-600' },
                    { label: 'In Progress', value: stats.accepted + stats.in_progress, icon: HiClipboardCheck, bg: 'bg-purple-50 border-purple-100', color: 'text-purple-600' },
                    { label: 'Completed', value: stats.completed, icon: HiCheckCircle, bg: 'bg-green-50 border-green-100', color: 'text-green-600' },
                    { label: 'Overdue', value: stats.overdue, icon: HiExclamation, bg: 'bg-red-50 border-red-100', color: 'text-red-600' },
                ].map((stat) => (
                    <div key={stat.label} className={`${stat.bg} border p-4 md:p-6 rounded-2xl`}>
                        <stat.icon className={`text-2xl ${stat.color} mb-2`} />
                        <p className="text-2xl md:text-3xl font-black text-slate-900">{stat.value}</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mt-1">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Filter */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {[
                    { key: 'all', label: `All (${tasks.length})` },
                    { key: 'active', label: `Active` },
                    { key: 'pending', label: `Pending` },
                    { key: 'completed', label: `Completed` },
                    { key: 'done', label: `Verified` },
                    { key: 'rejected', label: `Rejected` },
                ].map((f) => (
                    <button
                        key={f.key}
                        onClick={() => setFilterStatus(f.key)}
                        className={`px-4 py-2 rounded-full text-xs font-black whitespace-nowrap transition-all shrink-0 ${filterStatus === f.key ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-slate-500 border border-slate-100'}`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Task List */}
            <div className="space-y-4">
                {filteredTasks.length === 0 ? (
                    <div className="bg-white rounded-[2rem] p-12 text-center border border-slate-100">
                        <HiClipboardCheck className="text-5xl text-slate-200 mx-auto mb-4" />
                        <p className="text-slate-400 font-bold text-lg">No tasks found</p>
                        <p className="text-slate-300 font-medium text-sm mt-1">Click "Assign New Task" to get started</p>
                    </div>
                ) : (
                    filteredTasks.map((task) => (
                        <motion.div
                            key={task.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-2xl md:rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm"
                        >
                            <div className="p-4 md:p-6 cursor-pointer" onClick={() => setExpandedTask(expandedTask === task.id ? null : task.id)}>
                                <div className="flex items-start justify-between gap-4">
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                                            {getStatusBadge(task.status)}
                                            {getPriorityBadge(task.priority)}
                                            {task.category && <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg uppercase">{task.category}</span>}
                                        </div>
                                        <h3 className="font-black text-slate-800 text-base md:text-lg">{task.title}</h3>
                                        <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4 mt-2 text-xs font-bold text-slate-400">
                                            <span>Assigned to: <span className="text-blue-600">{(task.assigned_to_worker as any)?.name || 'Unknown'}</span></span>
                                            {task.customer_name && <span>Customer: {task.customer_name}</span>}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        {task.deadline && (
                                            <span className={`text-[10px] font-black ${task.deadline < new Date().toISOString().split('T')[0] && !['completed', 'verified'].includes(task.status) ? 'text-red-500' : 'text-slate-400'}`}>
                                                {new Date(task.deadline).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                                            </span>
                                        )}
                                        {expandedTask === task.id ? <HiChevronUp className="text-slate-400" /> : <HiChevronDown className="text-slate-400" />}
                                    </div>
                                </div>
                            </div>

                            {expandedTask === task.id && (
                                <div className="border-t border-slate-100 p-4 md:p-6 space-y-4 bg-slate-50/50">
                                    {task.description && <p className="text-sm text-slate-600 font-medium">{task.description}</p>}
                                    
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        {task.service_address && (
                                            <div className="col-span-2 flex items-start gap-2">
                                                <HiLocationMarker className="text-blue-500 shrink-0 mt-0.5" />
                                                <div>
                                                    <span className="text-slate-600 font-bold block">{task.service_address}</span>
                                                    <a 
                                                        href={task.google_maps_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(task.service_address)}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="mt-1 inline-flex items-center gap-1 text-[10px] font-black text-blue-600 hover:text-blue-800 uppercase tracking-widest bg-blue-50 px-2 py-1 rounded-md"
                                                    >
                                                        <HiLocationMarker /> Open Map
                                                    </a>
                                                </div>
                                            </div>
                                        )}
                                        {task.customer_phone && (
                                            <div className="flex items-center gap-2">
                                                <HiPhone className="text-green-500" />
                                                <span className="text-slate-600 font-bold">{task.customer_phone}</span>
                                            </div>
                                        )}
                                        {task.estimated_hours > 0 && (
                                            <div><span className="text-slate-400 font-bold">Est. Hours:</span> <span className="text-slate-700 font-black">{task.estimated_hours}h</span></div>
                                        )}
                                        {task.estimated_cost > 0 && (
                                            <div><span className="text-slate-400 font-bold">Est. Cost:</span> <span className="text-slate-700 font-black">₹{task.estimated_cost.toLocaleString()}</span></div>
                                        )}
                                    </div>

                                    {task.rejection_reason && (
                                        <div className="bg-red-50 p-4 rounded-xl border border-red-200">
                                            <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">REJECTED — REASON</p>
                                            <p className="text-sm text-red-600 font-bold">{task.rejection_reason}</p>
                                        </div>
                                    )}

                                    {task.completion_notes && (
                                        <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                                            <p className="text-[10px] font-black text-green-400 uppercase tracking-widest mb-1">COMPLETION NOTES</p>
                                            <p className="text-sm text-green-600 font-bold">{task.completion_notes}</p>
                                        </div>
                                    )}

                                    {/* Admin Actions */}
                                    {task.status === 'completed' && (
                                        <button
                                            onClick={() => handleVerify(task.id)}
                                            className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-sm uppercase shadow-xl shadow-emerald-200"
                                        >
                                            ✅ VERIFY & APPROVE WORK
                                        </button>
                                    )}

                                    <div className="flex gap-2 pt-2 mt-4 border-t border-slate-200">
                                        <Link
                                            href={`/dashboard/tasks/${task.id}`}
                                            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold text-xs hover:bg-slate-200 transition-colors shadow-sm"
                                        >
                                            VIEW
                                        </Link>
                                        <Link
                                            href={`/dashboard/tasks/${task.id}/edit`}
                                            className="px-4 py-2 bg-blue-100 text-blue-700 rounded-xl font-bold text-xs hover:bg-blue-200 transition-colors shadow-sm"
                                        >
                                            EDIT
                                        </Link>
                                        <button
                                            onClick={() => handleDeleteTask(task.id)}
                                            className="px-4 py-2 bg-red-100 text-red-700 rounded-xl font-bold text-xs hover:bg-red-200 transition-colors shadow-sm"
                                        >
                                            DELETE
                                        </button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    ))
                )}
            </div>

        </div>
    );
}
