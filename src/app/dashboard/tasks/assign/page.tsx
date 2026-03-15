"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { HiArrowLeft } from "react-icons/hi";
import { createTask } from "@/lib/services/tasks";
import { getWorkers } from "@/lib/services/workers";
import { getStaffSession } from "@/lib/services/auth-role";
import { Worker, TaskPriority } from "@/lib/types";
import dynamic from 'next/dynamic';

const LocationPicker = dynamic(() => import('@/components/dashboard/LocationPicker'), { 
    ssr: false,
    loading: () => <div className="h-[300px] w-full bg-slate-50 animate-pulse rounded-2xl flex items-center justify-center font-bold text-slate-400">Loading Map...</div>
});

export default function AssignTaskPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [workers, setWorkers] = useState<Worker[]>([]);
    const [submitting, setSubmitting] = useState(false);

    const [form, setForm] = useState({
        title: "", description: "", assigned_to: "", priority: "medium" as TaskPriority,
        category: "", service_address: "", customer_name: "", customer_phone: "",
        deadline: "", estimated_hours: "", estimated_cost: "", google_maps_url: ""
    });

    useEffect(() => {
        loadWorkers();
    }, []);

    async function loadWorkers() {
        try {
            const workersData = await getWorkers();
            setWorkers(workersData.filter(w => w.status === 'active'));
        } catch (err) {
            console.error("Error loading workers:", err);
        } finally {
            setLoading(false);
        }
    }

    async function handleAssignTask() {
        if (!form.title || !form.assigned_to) {
            alert("Please enter a task title and select a person");
            return;
        }

        setSubmitting(true);
        
        // 1. Identify who is assigning (from Staff Session or Workers list)
        let creatorId = "";
        const staff = getStaffSession();
        if (staff) {
            creatorId = staff.staffId;
        } else {
            // Fallback for Admin (search for first admin in workers)
            const adminStaff = workers.find(w => w.hierarchy_role === 'admin') || workers[0];
            if (!adminStaff) {
                alert("No staff members found. Add yourself as an admin staff member first.");
                setSubmitting(false);
                return;
            }
            creatorId = adminStaff.id;
        }

        const result = await createTask({
            assigned_by: creatorId,
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
            google_maps_url: form.google_maps_url || undefined,
        });

        setSubmitting(false);
        if (result) {
            router.push("/dashboard/tasks");
            router.refresh();
        } else {
            alert("Failed to create task. Please try again.");
        }
    }

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
        <div className="max-w-3xl mx-auto space-y-6 pb-12">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => router.back()}
                    className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition-colors"
                >
                    <HiArrowLeft className="text-xl" />
                </button>
                <div>
                    <h2 className="text-2xl font-black text-slate-800">Assign New Task</h2>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mt-1">
                        Create & assign work to your team
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-[2rem] p-6 md:p-10 shadow-sm border border-slate-100 space-y-6">
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

                <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">DESCRIPTION (DETAILS)</label>
                    <textarea
                        value={form.description}
                        onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 font-bold text-slate-800 focus:outline-none focus:border-blue-500 resize-none"
                        rows={4}
                        placeholder="Describe the work to be done..."
                    />
                </div>

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

                <div className="space-y-3">
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">PINPOINT LOCATION ON MAP</label>
                    <LocationPicker 
                        onLocationSelect={(lat, lng, addr) => {
                            setForm(f => ({ 
                                ...f, 
                                service_address: addr || f.service_address,
                                google_maps_url: `https://www.google.com/maps?q=${lat},${lng}`
                            }));
                        }} 
                    />
                    {form.google_maps_url && (
                        <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                             <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">SELECTED COORDINATES LINK</p>
                             <p className="text-xs text-blue-600 font-bold truncate">{form.google_maps_url}</p>
                        </div>
                    )}
                </div>

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

                <div className="pt-6">
                    <button
                        onClick={handleAssignTask}
                        disabled={submitting || !form.title || !form.assigned_to}
                        className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase tracking-wider text-sm shadow-xl shadow-blue-200 disabled:opacity-50 transition-colors"
                    >
                        {submitting ? 'ASSIGNING...' : 'ASSIGN TASK'}
                    </button>
                </div>
            </div>
        </div>
    );
}
