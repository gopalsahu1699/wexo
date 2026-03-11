"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { HiArrowLeft, HiTrash, HiSave } from "react-icons/hi";
import { getJob, createJob, updateJob, deleteJob } from "@/lib/services/jobs";
import { getWorkers } from "@/lib/services/workers";
import { Job, Worker } from "@/lib/types";
import { use } from "react";

export default function JobDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const { id } = resolvedParams;
    const isNew = id === 'new';

    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [workers, setWorkers] = useState<Worker[]>([]);
    const [job, setJob] = useState({
        job_title: "",
        job_description: "",
        priority: "medium",
        service_address: "",
        assigned_to: "",
        status: "pending" as Job['status'],
    });

    useEffect(() => {
        loadData();
    }, [isNew, id]);

    async function loadData() {
        setLoading(true);
        try {
            const workersData = await getWorkers();
            setWorkers(workersData);

            if (!isNew) {
                const data = await getJob(id);
                if (data) {
                    setJob({
                        job_title: data.job_title || "",
                        job_description: data.job_description || "",
                        priority: data.priority || "medium",
                        service_address: data.service_address || "",
                        assigned_to: data.assigned_to || "",
                        status: data.status || "pending",
                    });
                } else {
                    router.push("/dashboard/jobs");
                }
            }
        } catch (err) {
            console.error("Error loading job:", err);
            router.push("/dashboard/jobs");
        } finally {
            setLoading(false);
        }
    }

    async function handleSave() {
        if (!job.job_title.trim()) return;
        setSaving(true);
        try {
            const payload = {
                ...job,
                assigned_to: job.assigned_to || null,
                status: job.assigned_to && job.status === 'pending' ? 'assigned' as const : job.status,
            };

            if (isNew) {
                const jobNumber = `W-${Date.now().toString().slice(-4)}`;
                await createJob({ ...payload, job_number: jobNumber } as Partial<Job>);
            } else {
                await updateJob(id, payload as Partial<Job>);
            }
            router.push('/dashboard/jobs');
        } catch (err) {
            console.error("Error saving job:", err);
            alert("Failed to save job. Please try again.");
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete() {
        if (confirm("Are you sure you want to delete this job?")) {
            setSaving(true);
            try {
                await deleteJob(id);
                router.push('/dashboard/jobs');
            } catch (err) {
                console.error("Error deleting job:", err);
                alert("Failed to delete job.");
                setSaving(false);
            }
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-3xl mx-auto">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => router.push('/dashboard/jobs')}
                    className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors shadow-sm"
                >
                    <HiArrowLeft className="text-xl" />
                </button>
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                        {isNew ? 'Create New Job' : 'Edit Job'}
                    </h1>
                    <p className="text-slate-500 font-bold">
                        {isNew ? 'Setup a new service request' : 'Update the service request details'}
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-[2rem] p-8 shadow-sm border-2 border-slate-100">
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-black text-slate-600 mb-2">Job Title *</label>
                        <input
                            type="text"
                            value={job.job_title}
                            onChange={(e) => setJob(p => ({ ...p, job_title: e.target.value }))}
                            placeholder="e.g. AC Installation"
                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 font-bold text-slate-800 focus:outline-none focus:border-blue-500 transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-black text-slate-600 mb-2">Description</label>
                        <textarea
                            value={job.job_description}
                            onChange={(e) => setJob(p => ({ ...p, job_description: e.target.value }))}
                            placeholder="Describe the job..."
                            rows={3}
                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 font-bold text-slate-800 focus:outline-none focus:border-blue-500 transition-all resize-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-black text-slate-600 mb-2">Service Address</label>
                        <input
                            type="text"
                            value={job.service_address}
                            onChange={(e) => setJob(p => ({ ...p, service_address: e.target.value }))}
                            placeholder="e.g. 45, MG Road, Delhi"
                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 font-bold text-slate-800 focus:outline-none focus:border-blue-500 transition-all"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-black text-slate-600 mb-2">Priority</label>
                            <select
                                value={job.priority}
                                onChange={(e) => setJob(p => ({ ...p, priority: e.target.value }))}
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 font-bold text-slate-800 focus:outline-none focus:border-blue-500 transition-all appearance-none"
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="urgent">Urgent</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-black text-slate-600 mb-2">Assign Worker</label>
                            <select
                                value={job.assigned_to}
                                onChange={(e) => setJob(p => ({ ...p, assigned_to: e.target.value }))}
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 font-bold text-slate-800 focus:outline-none focus:border-blue-500 transition-all appearance-none"
                            >
                                <option value="">Unassigned</option>
                                {workers.map(w => (
                                    <option key={w.id} value={w.id}>{w.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {!isNew && (
                        <div>
                            <label className="block text-sm font-black text-slate-600 mb-2">Status</label>
                            <select
                                value={job.status}
                                onChange={(e) => setJob(p => ({ ...p, status: e.target.value as Job['status'] }))}
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 font-bold text-slate-800 focus:outline-none focus:border-blue-500 transition-all appearance-none"
                            >
                                <option value="pending">Pending</option>
                                <option value="assigned">Assigned</option>
                                <option value="in_progress">In Progress</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                    )}
                </div>

                <div className="flex flex-col md:flex-row gap-4 mt-10 pt-8 border-t border-slate-100">
                    <button
                        onClick={handleSave}
                        disabled={saving || !job.job_title.trim()}
                        className="flex-1 px-6 py-4 bg-blue-600 text-white rounded-xl font-black shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        <HiSave className="text-xl" />
                        {saving ? "Saving..." : "Save Job"}
                    </button>
                    {!isNew && (
                        <button
                            onClick={handleDelete}
                            disabled={saving}
                            className="md:w-auto px-6 py-4 bg-red-50 text-red-600 rounded-xl font-black hover:bg-red-100 transition-all flex items-center justify-center gap-2"
                        >
                            <HiTrash className="text-xl" />
                            Delete
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
