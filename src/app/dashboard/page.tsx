"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { HiUsers, HiClipboardCheck, HiCurrencyRupee, HiTrendingUp } from "react-icons/hi";
import { getDashboardStats } from "@/lib/services/stats";
import { getJobs } from "@/lib/services/jobs";
import { Job } from "@/lib/types";

export default function DashboardPage() {
    const [stats, setStats] = useState([
        { name: "Total Jobs", value: "0", icon: HiClipboardCheck, color: "text-blue-600", bg: "bg-blue-50" },
        { name: "Active Workers", value: "0", icon: HiUsers, color: "text-orange-600", bg: "bg-orange-50" },
        { name: "Daily Revenue", value: "₹0", icon: HiCurrencyRupee, color: "text-green-600", bg: "bg-green-50" },
        { name: "Growth", value: "+0%", icon: HiTrendingUp, color: "text-purple-600", bg: "bg-purple-50" },
    ]);
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            setLoading(true);
            try {
                const [statsData, jobsData] = await Promise.all([
                    getDashboardStats(),
                    getJobs()
                ]);

                if (statsData) {
                    setStats([
                        { name: "Total Jobs", value: statsData.jobs.toString(), icon: HiClipboardCheck, color: "text-blue-600", bg: "bg-blue-50" },
                        { name: "Active Workers", value: statsData.workers.toString(), icon: HiUsers, color: "text-orange-600", bg: "bg-orange-50" },
                        { name: "Daily Revenue", value: `₹${statsData.revenue.toLocaleString()}`, icon: HiCurrencyRupee, color: "text-green-600", bg: "bg-green-50" },
                        { name: "Growth", value: `+${statsData.growth}%`, icon: HiTrendingUp, color: "text-purple-600", bg: "bg-purple-50" },
                    ]);
                }
                setJobs(jobsData.slice(0, 5));
            } catch (err) {
                console.error('Error loading dashboard:', err);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-10">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <motion.div
                        key={stat.name}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="glass rounded-[2rem] p-8 card-3d"
                    >
                        <div className={`p-4 ${stat.bg} rounded-2xl w-fit mb-6`}>
                            <stat.icon className={`text-2xl ${stat.color}`} />
                        </div>
                        <p className="text-slate-500 font-bold mb-1">{stat.name}</p>
                        <h3 className="text-3xl font-black text-slate-900">{stat.value}</h3>
                    </motion.div>
                ))}
            </div>

            {/* Recent Jobs & Notifications */}
            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 glass rounded-[2.5rem] p-10">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-2xl font-black text-slate-800">Recent Jobs</h3>
                        <button className="text-blue-600 font-bold hover:underline">View All</button>
                    </div>

                    <div className="space-y-4">
                        {jobs.length === 0 ? (
                            <div className="text-center py-20 text-slate-400 font-bold border-2 border-dashed border-slate-100 rounded-3xl">
                                No jobs found. Create your first job!
                            </div>
                        ) : (
                            jobs.map((job) => (
                                <div key={job.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 md:p-6 bg-slate-50 rounded-[1.5rem] border border-slate-100 hover:border-blue-200 transition-all gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0">
                                            <HiClipboardCheck className="text-blue-600 text-xl" />
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="font-black text-slate-800 truncate mb-0.5">{job.job_title} #{job.job_number}</h4>
                                            <p className="text-slate-500 text-xs md:text-sm font-medium truncate italic">{job.service_address || 'No address'}</p>
                                        </div>
                                    </div>
                                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center">
                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${job.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                job.status === 'assigned' ? 'bg-blue-100 text-blue-700' :
                                                    job.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                                                        'bg-slate-100 text-slate-700'
                                            }`}>
                                            {job.status}
                                        </span>
                                        <p className="text-slate-400 text-[10px] md:text-xs font-bold sm:mt-2">
                                            {new Date(job.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="glass rounded-[2.5rem] p-10">
                    <h3 className="text-2xl font-black text-slate-800 mb-8">Low Stock Alerts</h3>
                    <div className="space-y-4">
                        <div className="p-8 text-center bg-slate-50 border border-slate-100 rounded-2xl">
                            <p className="text-slate-400 font-bold text-sm">All items are in stock!</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
