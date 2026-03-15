"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    HiClipboardCheck, HiClock, HiCheckCircle, HiXCircle,
    HiExclamation, HiUserGroup, HiLogout, HiPlus,
    HiChevronDown, HiChevronUp, HiPhone, HiLocationMarker
} from "react-icons/hi";
import { getStaffSession, staffLogout } from "@/lib/services/auth-role";
import { getTasksAssignedTo, getTasksAssignedBy, updateTaskStatus, getTaskStats, TaskStats, getTeamTasksForManager } from "@/lib/services/tasks";
import { TaskAssignment, StaffSession, TaskStatus } from "@/lib/types";
import { createClient } from "@/lib/supabase";

export default function ManagerDashboard() {
    const router = useRouter();
    const [session, setSession] = useState<StaffSession | null>(null);
    const [myTasks, setMyTasks] = useState<TaskAssignment[]>([]);
    const [teamTasks, setTeamTasks] = useState<TaskAssignment[]>([]);
    const [stats, setStats] = useState<TaskStats>({ total: 0, pending: 0, accepted: 0, in_progress: 0, completed: 0, verified: 0, rejected: 0, overdue: 0, totalEarnings: 0, paidEarnings: 0 });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'my_tasks' | 'team_tasks'>('my_tasks');
    const [expandedTask, setExpandedTask] = useState<string | null>(null);

    useEffect(() => {
        const s = getStaffSession();
        if (!s || s.role !== 'manager') {
            router.push('/staff-login');
            return;
        }
        setSession(s);
        loadData(s);

        const supabase = createClient();
        const channel = supabase
            .channel('manager-realtime')
            .on('postgres_changes', { 
                event: '*', 
                schema: 'public', 
                table: 'task_assignments' 
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
            const [myTasksData, teamTasksData, myStats] = await Promise.all([
                getTasksAssignedTo(s.staffId, s.ownerId),
                getTeamTasksForManager(s.staffId, s.ownerId),
                getTaskStats(s.staffId, 'assigned_to', s.ownerId)
            ]);
            setMyTasks(myTasksData);
            setTeamTasks(teamTasksData);

            // Combine stats: manager's own tasks + team tasks summary
            const teamPending = teamTasksData.filter(t => t.status === 'pending').length;
            const teamInProgress = teamTasksData.filter(t => ['accepted', 'in_progress'].includes(t.status)).length;
            const teamCompleted = teamTasksData.filter(t => ['completed', 'verified'].includes(t.status)).length;
            const today = new Date().toISOString().split('T')[0];
            const teamOverdue = teamTasksData.filter(t => t.deadline && t.deadline < today && !['completed', 'verified', 'rejected'].includes(t.status)).length;

            setStats({
                ...myStats,
                total: myStats.total + teamTasksData.length,
                pending: myStats.pending + teamPending,
                in_progress: myStats.in_progress + teamInProgress,
                completed: myStats.completed + teamCompleted,
                overdue: myStats.overdue + teamOverdue,
            });
        } catch (err) {
            console.error("Error loading manager data:", err);
        } finally {
            setLoading(false);
        }
    }

    async function handleStatusChange(taskId: string, newStatus: TaskStatus, reason?: string) {
        if (!session) return;
        const success = await updateTaskStatus(taskId, newStatus, session.staffId, {
            rejection_reason: reason,
            ownerId: session.ownerId,
        });
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

    const getStatusBadge = (status: TaskStatus) => {
        const map: Record<TaskStatus, { bg: string; text: string; label: string }> = {
            pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'NEW' },
            accepted: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'ACCEPTED' },
            rejected: { bg: 'bg-red-100', text: 'text-red-700', label: 'REJECTED' },
            in_progress: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'IN PROGRESS' },
            completed: { bg: 'bg-green-100', text: 'text-green-700', label: 'DONE' },
            verified: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'VERIFIED' },
            reassigned: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'REASSIGNED' },
        };
        const s = map[status] || map['pending'];
        return <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${s.bg} ${s.text}`}>{s.label}</span>;
    };

    const getPriorityDot = (priority: string) => {
        const colors: Record<string, string> = {
            urgent: 'bg-red-500', high: 'bg-orange-500', medium: 'bg-blue-500', low: 'bg-slate-400'
        };
        return <div className={`w-3 h-3 rounded-full ${colors[priority] || colors['medium']} animate-pulse`} />;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-slate-100 px-4 md:px-8 py-4 sticky top-0 z-30">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white font-black">
                            {session?.staffName?.[0] || 'M'}
                        </div>
                        <div>
                            <h1 className="font-black text-slate-900 text-lg leading-tight">{session?.staffName}</h1>
                            <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest">MANAGER</p>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="flex items-center gap-2 text-slate-400 hover:text-red-500 font-bold text-sm transition-colors">
                        <HiLogout className="text-xl" /> Logout
                    </button>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 md:px-8 pt-6 space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                        { label: 'New Tasks', value: stats.pending, icon: HiClock, color: 'text-yellow-600', bg: 'bg-yellow-50' },
                        { label: 'In Progress', value: stats.in_progress, icon: HiClipboardCheck, color: 'text-purple-600', bg: 'bg-purple-50' },
                        { label: 'Completed', value: stats.completed + stats.verified, icon: HiCheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
                        { label: 'Overdue', value: stats.overdue, icon: HiExclamation, color: 'text-red-600', bg: 'bg-red-50' },
                    ].map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className={`${stat.bg} p-4 md:p-6 rounded-2xl border border-slate-100`}
                        >
                            <stat.icon className={`text-2xl ${stat.color} mb-2`} />
                            <p className="text-2xl md:text-3xl font-black text-slate-900">{stat.value}</p>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mt-1">{stat.label}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Tab Switcher */}
                <div className="flex bg-white rounded-2xl p-1 border border-slate-100 shadow-sm">
                    <button
                        onClick={() => setActiveTab('my_tasks')}
                        className={`flex-1 py-3 rounded-xl font-black text-sm transition-all ${activeTab === 'my_tasks' ? 'bg-orange-500 text-white shadow-lg' : 'text-slate-400'}`}
                    >
                        MY TASKS ({myTasks.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('team_tasks')}
                        className={`flex-1 py-3 rounded-xl font-black text-sm transition-all ${activeTab === 'team_tasks' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400'}`}
                    >
                        TEAM TASKS ({teamTasks.length})
                    </button>
                </div>

                {/* Task List */}
                <div className="space-y-4">
                    {(activeTab === 'my_tasks' ? myTasks : teamTasks).length === 0 ? (
                        <div className="bg-white rounded-[2rem] p-12 text-center border border-slate-100">
                            <HiClipboardCheck className="text-5xl text-slate-200 mx-auto mb-4" />
                            <p className="text-slate-400 font-bold">No tasks found</p>
                        </div>
                    ) : (
                        (activeTab === 'my_tasks' ? myTasks : teamTasks).map((task) => (
                            <motion.div
                                key={task.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-2xl md:rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm"
                            >
                                {/* Task Header */}
                                <div
                                    className="p-4 md:p-6 cursor-pointer"
                                    onClick={() => setExpandedTask(expandedTask === task.id ? null : task.id)}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-start gap-3 min-w-0">
                                            {getPriorityDot(task.priority)}
                                            <div className="min-w-0">
                                                <h3 className="font-black text-slate-800 text-sm md:text-base truncate">{task.title}</h3>
                                                {task.customer_name && (
                                                    <p className="text-slate-400 text-xs font-bold mt-1 truncate">
                                                        {task.customer_name} {task.customer_phone && `• ${task.customer_phone}`}
                                                    </p>
                                                )}
                                                {activeTab === 'team_tasks' && task.assigned_to_worker && (
                                                    <p className="text-blue-500 text-[10px] font-black uppercase tracking-wider mt-1">
                                                        Assigned to: {(task.assigned_to_worker as any)?.name}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            {getStatusBadge(task.status)}
                                            {expandedTask === task.id ? <HiChevronUp className="text-slate-400" /> : <HiChevronDown className="text-slate-400" />}
                                        </div>
                                    </div>

                                    {task.deadline && (
                                        <div className="mt-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-slate-400">
                                            <HiClock className="text-sm" />
                                            Deadline: {new Date(task.deadline).toLocaleDateString('en-IN')}
                                            {task.deadline < new Date().toISOString().split('T')[0] && !['completed', 'verified'].includes(task.status) && (
                                                <span className="text-red-500 animate-pulse">OVERDUE</span>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Expanded Details */}
                                {expandedTask === task.id && (
                                    <div className="border-t border-slate-100 p-4 md:p-6 space-y-4 bg-slate-50/50">
                                        {task.description && (
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Description</p>
                                                <p className="text-sm text-slate-700 font-medium leading-relaxed">{task.description}</p>
                                            </div>
                                        )}

                                        {task.service_address && (
                                            <div className="flex items-start gap-2">
                                                <HiLocationMarker className="text-blue-500 mt-0.5 shrink-0" />
                                                <div>
                                                    <p className="text-sm text-slate-600 font-bold">{task.service_address}</p>
                                                    <a 
                                                        href={task.google_maps_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(task.service_address)}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="mt-1 inline-flex items-center gap-1 text-[10px] font-black text-blue-600 hover:text-blue-800 uppercase tracking-widest bg-blue-50 px-2 py-1 rounded-md"
                                                    >
                                                        <HiLocationMarker /> Open Google Maps
                                                    </a>
                                                </div>
                                            </div>
                                        )}

                                        {task.customer_phone && (
                                            <a href={`tel:${task.customer_phone}`} className="flex items-center gap-2 text-green-600 font-bold text-sm">
                                                <HiPhone /> Call Customer: {task.customer_phone}
                                            </a>
                                        )}

                                        {/* Action Buttons (only for my tasks) */}
                                        {activeTab === 'my_tasks' && (
                                            <div className="flex flex-wrap gap-2 pt-4">
                                                {task.status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleStatusChange(task.id, 'accepted'); }}
                                                            className="flex-1 py-3 bg-green-600 text-white rounded-xl font-black text-xs uppercase shadow-lg"
                                                        >
                                                            ACCEPT TASK
                                                        </button>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); const reason = prompt("Rejection reason:"); if (reason) handleStatusChange(task.id, 'rejected', reason); }}
                                                            className="flex-1 py-3 bg-red-500 text-white rounded-xl font-black text-xs uppercase shadow-lg"
                                                        >
                                                            REJECT
                                                        </button>
                                                    </>
                                                )}
                                                {task.status === 'accepted' && (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleStatusChange(task.id, 'in_progress'); }}
                                                        className="flex-1 py-3 bg-purple-600 text-white rounded-xl font-black text-xs uppercase shadow-lg"
                                                    >
                                                        START WORK
                                                    </button>
                                                )}
                                                {task.status === 'in_progress' && (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleStatusChange(task.id, 'completed'); }}
                                                        className="flex-1 py-3 bg-green-600 text-white rounded-xl font-black text-xs uppercase shadow-lg"
                                                    >
                                                        MARK COMPLETED
                                                    </button>
                                                )}
                                            </div>
                                        )}

                                        {/* Verify Button (for team tasks) */}
                                        {activeTab === 'team_tasks' && task.status === 'completed' && (
                                            <div className="flex gap-2 pt-4">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleStatusChange(task.id, 'verified'); }}
                                                    className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-black text-xs uppercase shadow-lg"
                                                >
                                                    VERIFY & APPROVE
                                                </button>
                                            </div>
                                        )}
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
