"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { HiArrowLeft, HiLocationMarker, HiPhone, HiClock, HiCurrencyRupee } from "react-icons/hi";
import { getTaskById } from "@/lib/services/tasks";
import { TaskAssignment } from "@/lib/types";

export default function ViewTaskClient({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const { id } = resolvedParams;
    const router = useRouter();
    const [task, setTask] = useState<TaskAssignment | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchTask() {
            if (id === 'current') {
                setLoading(false);
                return;
            }
            try {
                const data = await getTaskById(id);
                setTask(data);
            } catch (error) {
                console.error("Error fetching task", error);
            } finally {
                setLoading(false);
            }
        }
        fetchTask();
    }, [id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!task && id !== 'current') {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-black text-slate-800">Task Not Found</h2>
                <button
                    onClick={() => router.back()}
                    className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold"
                >
                    Go Back
                </button>
            </div>
        );
    }

    if (id === 'current' && !task) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-black text-slate-800">No Task Selected</h2>
                <button
                    onClick={() => router.back()}
                    className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold"
                >
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-12">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => router.back()}
                    className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition-colors"
                >
                    <HiArrowLeft className="text-xl" />
                </button>
                <div>
                    <h2 className="text-2xl font-black text-slate-800">Task Details</h2>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mt-1">
                        View comprehensive task information
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-[2rem] p-6 text-slate-700 shadow-sm border border-slate-100 space-y-8">
                <div>
                    <div className="flex flex-wrap gap-2 mb-4">
                        <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-black uppercase">
                            STATUS: {task?.status.replace("_", " ")}
                        </span>
                        <span className="px-3 py-1 bg-red-50 text-red-700 rounded-full text-xs font-black uppercase">
                            PRIORITY: {task?.priority}
                        </span>
                        {task?.category && (
                            <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-black uppercase">
                                CAT: {task.category}
                            </span>
                        )}
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 mb-2">{task?.title}</h1>
                    <p className="text-slate-600 text-base">{task?.description || "No description provided."}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-2xl">
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">ASSIGNED TO</p>
                        <p className="font-bold text-slate-800 flex items-center gap-2">
                             {(task?.assigned_to_worker as any)?.name || 'Unknown User'}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">ASSIGNED BY</p>
                        <p className="font-bold text-slate-800 flex items-center gap-2">
                             {(task?.assigned_by_worker as any)?.name || 'Unknown Admin'}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {task?.service_address && (
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center shrink-0">
                                <HiLocationMarker className="text-2xl text-blue-500" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">SERVICE ADDRESS</p>
                                <p className="font-bold text-slate-800 mb-1">{task.service_address}</p>
                                <a 
                                    href={task.google_maps_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(task.service_address)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-[10px] font-black text-blue-600 hover:text-blue-800 uppercase tracking-widest bg-blue-50 px-2 py-1 rounded-md"
                                >
                                    <HiLocationMarker /> Open in Map
                                </a>
                            </div>
                        </div>
                    )}
                    {task?.customer_phone && (
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center shrink-0">
                                <HiPhone className="text-2xl text-green-500" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">CUSTOMER CONTACT</p>
                                <p className="font-bold text-slate-800">{task.customer_name} — {task.customer_phone}</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-slate-100">
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                            <HiClock /> DEADLINE
                        </p>
                        <p className="font-bold text-slate-800">
                            {task?.deadline ? new Date(task.deadline).toLocaleDateString('en-IN') : '--'}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                            <HiClock /> EST. HOURS
                        </p>
                        <p className="font-bold text-slate-800">{task?.estimated_hours ? `${task.estimated_hours}h` : '--'}</p>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                            <HiCurrencyRupee /> EST. COST
                        </p>
                        <p className="font-bold text-slate-800">{task?.estimated_cost ? `₹${task.estimated_cost.toLocaleString()}` : '--'}</p>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                            <HiClock /> CREATED
                        </p>
                        <p className="font-bold text-slate-800">
                            {task?.created_at ? new Date(task.created_at).toLocaleDateString('en-IN') : '--'}
                        </p>
                    </div>
                </div>

                <div className="flex gap-4 pt-6 border-t border-slate-100">
                    <button
                        onClick={() => router.push(`/dashboard/tasks/${task?.id}/edit`)}
                        className="px-8 py-3 bg-blue-100 text-blue-700 rounded-2xl font-black text-sm hover:bg-blue-200 transition-colors shadow-sm"
                    >
                        EDIT TASK
                    </button>
                    <button
                        onClick={async () => {
                            if (task && confirm("Are you sure you want to delete this task? This action cannot be undone.")) {
                                const { deleteTask } = await import("@/lib/services/tasks");
                                const success = await deleteTask(task.id);
                                if (success) {
                                    router.push("/dashboard/tasks");
                                    router.refresh();
                                } else {
                                    alert("Failed to delete task");
                                }
                            }
                        }}
                        className="px-8 py-3 bg-red-50 text-red-600 rounded-2xl font-black text-sm hover:bg-red-100 transition-colors shadow-sm ms-auto"
                    >
                        DELETE
                    </button>
                </div>
            </div>
        </div>
    );
}
