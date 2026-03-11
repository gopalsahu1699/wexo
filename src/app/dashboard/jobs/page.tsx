"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
    HiPlus,
    HiSearch,
    HiFilter,
    HiCalendar,
    HiUserCircle,
    HiDotsVertical,
    HiClock
} from "react-icons/hi";
import { FaWrench } from "react-icons/fa";
import { getJobs } from "@/lib/services/jobs";
import { getWorkers } from "@/lib/services/workers";
import { Job, Worker } from "@/lib/types";

const getStatusStyle = (status: string) => {
    switch (status) {
        case "in_progress": return "bg-blue-100 text-blue-700 border-blue-200";
        case "completed": return "bg-green-100 text-green-700 border-green-200";
        case "assigned": return "bg-orange-100 text-orange-700 border-orange-200";
        case "cancelled": return "bg-red-100 text-red-700 border-red-200";
        default: return "bg-slate-100 text-slate-700 border-slate-200";
    }
};

const getPriorityStyle = (priority: string) => {
    switch (priority) {
        case "high":
        case "urgent": return "bg-red-50 text-red-600 border-red-100";
        case "medium": return "bg-blue-50 text-blue-600 border-blue-100";
        default: return "bg-slate-50 text-slate-600 border-slate-100";
    }
};

export default function JobsPage() {
    const router = useRouter();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [workers, setWorkers] = useState<Worker[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        setLoading(true);
        try {
            const [jobsData, workersData] = await Promise.all([
                getJobs(),
                getWorkers()
            ]);
            setJobs(jobsData);
            setWorkers(workersData);
        } catch (err) {
            console.error("Error loading jobs:", err);
        } finally {
            setLoading(false);
        }
    }

    const filteredJobs = jobs.filter(j =>
        j.job_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        j.job_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        j.service_address?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex flex-1 gap-4 max-w-2xl">
                    <div className="relative flex-1">
                        <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
                        <input
                            type="text"
                            placeholder="Search jobs, customers, or technicians..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white border border-slate-100 rounded-2xl py-4 pl-12 pr-4 font-medium focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                        />
                    </div>
                    <button className="glass px-6 py-4 rounded-2xl flex items-center gap-2 font-bold text-slate-600">
                        <HiFilter className="text-xl" /> Filter
                    </button>
                </div>

                <button
                    onClick={() => router.push("/dashboard/jobs/new")}
                    className="btn-3d bg-blue-600 text-white font-bold px-8 py-4 rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-blue-200 hover:bg-blue-700 transition-colors"
                >
                    <HiPlus className="text-xl" /> Create New Job
                </button>
            </div>

            <div className="grid gap-6">
                {filteredJobs.length === 0 ? (
                    <div className="glass rounded-[2.5rem] p-20 text-center border-2 border-dashed border-slate-100">
                        <FaWrench className="text-5xl text-slate-300 mx-auto mb-6" />
                        <h3 className="text-xl font-black text-slate-400 mb-2">No Jobs Found</h3>
                        <p className="text-slate-400 font-bold">Create your first job to get started!</p>
                    </div>
                ) : (
                    filteredJobs.map((job, i) => (
                        <motion.div
                            key={job.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            onClick={() => router.push(`/dashboard/jobs/${job.id}`)}
                            className="glass p-8 rounded-[2.5rem] flex flex-col lg:flex-row lg:items-center gap-8 card-3d border border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors"
                        >
                            <div className="flex items-center gap-6 flex-1">
                                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-3xl shadow-inner border border-slate-100">
                                    <FaWrench className="text-slate-400" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="text-xl font-black text-slate-900">{job.job_title}</h3>
                                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{job.job_number}</span>
                                    </div>
                                    <div className="flex items-center gap-4 text-slate-500 font-bold text-sm">
                                        {job.service_address && (
                                            <span className="flex items-center gap-1"><HiUserCircle className="text-lg" /> {job.service_address}</span>
                                        )}
                                        <span className="flex items-center gap-1">
                                            <HiCalendar className="text-lg" />
                                            {new Date(job.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-6">
                                {job.assigned_to && (
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                                            <HiUserCircle className="text-xl" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-slate-400 uppercase tracking-wider leading-none mb-1">Assigned</p>
                                            <p className="font-bold text-slate-800 leading-none text-sm">
                                                {workers.find(w => w.id === job.assigned_to)?.name || 'Unknown'}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <div className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(job.status)}`}>
                                    {job.status.replace('_', ' ')}
                                </div>

                                <div className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border ${getPriorityStyle(job.priority)}`}>
                                    {job.priority} Priority
                                </div>

                                <button className="p-3 bg-white rounded-xl text-slate-400 hover:text-blue-600 transition-colors shadow-sm">
                                    <HiDotsVertical className="text-xl" />
                                </button>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
}
