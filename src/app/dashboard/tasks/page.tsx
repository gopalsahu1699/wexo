"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    HiPlus, HiClipboardCheck, HiClock, HiCheckCircle,
    HiExclamation, HiUserGroup, HiChevronDown, HiChevronUp,
    HiPhone, HiLocationMarker, HiFilter, HiX
} from "react-icons/hi";
import { getAllTasks, createTask, updateTaskStatus, getTaskStats, TaskStats } from "@/lib/services/tasks";
import { getWorkers } from "@/lib/services/workers";
import { TaskAssignment, Worker, TaskStatus, TaskPriority } from "@/lib/types";

export default function TasksPage() {
    const [tasks, setTasks] = useState<TaskAssignment[]>([]);
    const [workers, setWorkers] = useState<Worker[]>([]);
    const [stats, setStats] = useState<TaskStats>({ total: 0, pending: 0, accepted: 0, in_progress: 0, completed: 0, verified: 0, rejected: 0, overdue: 0 });
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [expandedTask, setExpandedTask] = useState<string | null>(null);
    const [filterStatus, setFilterStatus] = useState<string>('all');

    // Create form state
    const [form, setForm] = useState({
        title: "", description: "", assigned_to: "", priority: "medium" as TaskPriority,
        category: "", service_address: "", customer_name: "", customer_phone: "",
        deadline: "", estimated_hours: "", estimated_cost: ""
    });

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

    async function handleCreateTask() {
        if (!form.title || !form.assigned_to) {
            alert("Please enter a task title and select a person");
            return;
        }

        // Find an admin staff member or use the first worker as "assigned_by"
        // In production, admin creates a staff_member for themselves
        const adminStaff = workers.find(w => w.hierarchy_role === 'admin') || workers[0];
        if (!adminStaff) {
            alert("No staff members found. Add yourself as an admin staff member first.");
            return;
        }

        const result = await createTask({
            assigned_by: adminStaff.id,
            assigned_to: form.assigned_to,
            title: form.title,
            description: form.description || undefined,
            priority: form.priority,
            category: form.category || undefined,
            service_address: form.service_address || undefined,
            customer_name: form.customer_name || undefined,
            customer_phone: form.customer_phone || undefined,
            deadline: form.deadline || undefined,
            estimated_hours: form.estimated_hours ? Number(form.estimated_hours) : undefined,
            estimated_cost: form.estimated_cost ? Number(form.estimated_cost) : undefined,
        });

        if (result) {
            setShowCreateModal(false);
            setForm({ title: "", description: "", assigned_to: "", priority: "medium", category: "", service_address: "", customer_name: "", customer_phone: "", deadline: "", estimated_hours: "", estimated_cost: "" });
            loadData();
        } else {
            alert("Failed to create task. Please try again.");
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

    // Group managers and team members for the dropdown
    const managers = workers.filter(w => w.hierarchy_role === 'manager');
    const teamMembers = workers.filter(w => w.hierarchy_role === 'team_member');
    const unassigned = workers.filter(w => !w.hierarchy_role || w.hierarchy_role === 'team_member');

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
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-blue-600 text-white font-black px-8 py-4 rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-blue-200 hover:bg-blue-700 transition-colors text-sm"
                >
                    <HiPlus className="text-xl" /> ASSIGN NEW TASK
                </button>
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
                                                <HiLocationMarker className="text-blue-500 shrink-0" />
                                                <span className="text-slate-600 font-bold">{task.service_address}</span>
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
                                </div>
                            )}
                        </motion.div>
                    ))
                )}
            </div>

            {/* Create Task Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-start md:items-center justify-center p-4 overflow-y-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-[2rem] p-6 md:p-10 w-full max-w-2xl shadow-2xl my-8"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-2xl font-black text-slate-900">ASSIGN NEW TASK</h2>
                                <p className="text-slate-400 font-bold text-sm italic mt-1">Create & assign work to your team</p>
                            </div>
                            <button onClick={() => setShowCreateModal(false)} className="p-2 text-slate-400 hover:text-slate-600">
                                <HiX className="text-2xl" />
                            </button>
                        </div>

                        <div className="space-y-5">
                            {/* Assign To */}
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">ASSIGN TO (WHO WILL DO THIS?)</label>
                                <select
                                    value={form.assigned_to}
                                    onChange={(e) => setForm(f => ({ ...f, assigned_to: e.target.value }))}
                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                                >
                                    <option value="">-- Select Person --</option>
                                    {managers.length > 0 && (
                                        <optgroup label="📋 MANAGERS (Supervisors)">
                                            {managers.map(w => <option key={w.id} value={w.id}>{w.name} — {w.role || 'Manager'}</option>)}
                                        </optgroup>
                                    )}
                                    {teamMembers.length > 0 && (
                                        <optgroup label="🔧 TEAM MEMBERS (Workers)">
                                            {teamMembers.map(w => <option key={w.id} value={w.id}>{w.name} — {w.role || 'Worker'}</option>)}
                                        </optgroup>
                                    )}
                                    {unassigned.length > 0 && managers.length === 0 && teamMembers.length === 0 && (
                                        <optgroup label="👷 ALL WORKERS">
                                            {workers.map(w => <option key={w.id} value={w.id}>{w.name} — {w.role || 'Staff'}</option>)}
                                        </optgroup>
                                    )}
                                </select>
                            </div>

                            {/* Task Title */}
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">TASK TITLE (WHAT WORK?)</label>
                                <input
                                    type="text"
                                    value={form.title}
                                    onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                                    placeholder="e.g., AC Service at Sharma House"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">DESCRIPTION (DETAILS)</label>
                                <textarea
                                    value={form.description}
                                    onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 font-bold text-slate-800 focus:outline-none focus:border-blue-500 resize-none"
                                    rows={3}
                                    placeholder="Describe the work to be done..."
                                />
                            </div>

                            {/* Priority + Category */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">URGENCY</label>
                                    <select
                                        value={form.priority}
                                        onChange={(e) => setForm(f => ({ ...f, priority: e.target.value as TaskPriority }))}
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                        <option value="urgent">🔴 Urgent</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">CATEGORY</label>
                                    <select
                                        value={form.category}
                                        onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))}
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                                    >
                                        <option value="">Select</option>
                                        <option value="electrical">Electrical</option>
                                        <option value="plumbing">Plumbing</option>
                                        <option value="ac_repair">AC Repair</option>
                                        <option value="painting">Painting</option>
                                        <option value="construction">Construction</option>
                                        <option value="cleaning">Cleaning</option>
                                        <option value="carpentry">Carpentry</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>

                            {/* Customer Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">CUSTOMER NAME</label>
                                    <input
                                        type="text"
                                        value={form.customer_name}
                                        onChange={(e) => setForm(f => ({ ...f, customer_name: e.target.value }))}
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                                        placeholder="Customer name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">CUSTOMER PHONE</label>
                                    <input
                                        type="tel"
                                        value={form.customer_phone}
                                        onChange={(e) => setForm(f => ({ ...f, customer_phone: e.target.value }))}
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                                        placeholder="Phone number"
                                    />
                                </div>
                            </div>

                            {/* Location */}
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">SERVICE ADDRESS</label>
                                <input
                                    type="text"
                                    value={form.service_address}
                                    onChange={(e) => setForm(f => ({ ...f, service_address: e.target.value }))}
                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                                    placeholder="Full address where work needs to be done"
                                />
                            </div>

                            {/* Deadline + Estimates */}
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">DEADLINE</label>
                                    <input
                                        type="date"
                                        value={form.deadline}
                                        onChange={(e) => setForm(f => ({ ...f, deadline: e.target.value }))}
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">EST. HOURS</label>
                                    <input
                                        type="number"
                                        value={form.estimated_hours}
                                        onChange={(e) => setForm(f => ({ ...f, estimated_hours: e.target.value }))}
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                                        placeholder="0"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">EST. COST (₹)</label>
                                    <input
                                        type="number"
                                        value={form.estimated_cost}
                                        onChange={(e) => setForm(f => ({ ...f, estimated_cost: e.target.value }))}
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                                        placeholder="0"
                                    />
                                </div>
                            </div>

                            {/* Submit */}
                            <div className="flex gap-4 pt-4">
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 py-4 rounded-2xl font-black text-slate-400 uppercase text-sm"
                                >
                                    CANCEL
                                </button>
                                <button
                                    onClick={handleCreateTask}
                                    disabled={!form.title || !form.assigned_to}
                                    className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-sm shadow-xl shadow-blue-200 disabled:opacity-40"
                                >
                                    ASSIGN TASK
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
