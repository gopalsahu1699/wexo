"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { HiCurrencyRupee, HiTrendingUp, HiTrendingDown, HiExclamationCircle, HiPrinter, HiDownload } from "react-icons/hi";
import { getFinanceStats } from "@/lib/services/stats";
import { getWorkers } from "@/lib/services/workers";
import { Worker } from "@/lib/types";

export default function FinancePage() {
    const [stats, setStats] = useState({ totalRevenue: 0, totalPayroll: 0, pendingPayments: 0, totalExpenses: 0, netProfit: 0, growth: 0 });
    const [workers, setWorkers] = useState<Worker[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadFinanceData() {
            setLoading(true);
            try {
                const [financeData, workersData] = await Promise.all([
                    getFinanceStats(),
                    getWorkers()
                ]);
                setStats(financeData as any);
                setWorkers(workersData);
            } catch (err) {
                console.error("Error loading finance data:", err);
            } finally {
                setLoading(false);
            }
        }
        loadFinanceData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    const { totalRevenue, totalPayroll, pendingPayments, totalExpenses, netProfit, growth } = stats;

    return (
        <div className="space-y-10 pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Finance Overview</h1>
                    <p className="text-slate-500 font-bold">Track revenue, payroll, and profits</p>
                </div>
                <div className="flex gap-4">
                    <button className="flex items-center gap-2 bg-white text-slate-700 px-6 py-4 rounded-xl font-bold shadow-sm border border-slate-100 hover:bg-slate-50 transition-all leading-none">
                        <HiPrinter />
                        <span>Print Report</span>
                    </button>
                    <button className="flex items-center gap-2 bg-blue-600 text-white px-6 py-4 rounded-xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all leading-none">
                        <HiDownload />
                        <span>Export CSV</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-[2rem] p-10 bg-gradient-to-br from-blue-600 to-blue-700 text-white">
                    <HiCurrencyRupee className="text-4xl mb-6 opacity-80" />
                    <p className="text-blue-100 font-bold mb-1">Total Revenue</p>
                    <h3 className="text-4xl font-black">₹{totalRevenue.toLocaleString()}</h3>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-[2rem] p-10 bg-white border border-slate-100">
                    <HiExclamationCircle className="text-4xl mb-6 text-orange-500" />
                    <p className="text-slate-500 font-bold mb-1">Pending Payments</p>
                    <h3 className="text-4xl font-black text-slate-900">₹{pendingPayments.toLocaleString()}</h3>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass rounded-[2rem] p-10 bg-white border border-slate-100">
                    <div className="flex items-center gap-3 mb-6">
                        {growth >= 0 ? (
                            <HiTrendingUp className="text-4xl text-green-500" />
                        ) : (
                            <HiTrendingDown className="text-4xl text-red-500" />
                        )}
                        <span className={`text-xs px-2 py-1 rounded-md font-black ${growth >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {growth > 0 ? '+' : ''}{growth}%
                        </span>
                    </div>
                    <p className="text-slate-500 font-bold mb-1">Profitability Ratio</p>
                    <h3 className="text-4xl font-black text-slate-900">₹{netProfit.toLocaleString()}</h3>
                </motion.div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Monthly Payroll */}
                <div className="glass rounded-[2.5rem] p-10">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-2xl font-black text-slate-800">Monthly Payroll</h3>
                        <p className="text-slate-500 font-bold">Total: ₹{totalPayroll.toLocaleString()}</p>
                    </div>
                    <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                        {workers.length === 0 ? (
                            <div className="text-center py-20 text-slate-400 font-bold">
                                No workers to show payroll.
                            </div>
                        ) : (
                            workers.map((worker) => (
                                <div key={worker.id} className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center font-black text-slate-400 shadow-sm">
                                            {worker.name.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div>
                                            <p className="font-black text-slate-800">{worker.name}</p>
                                            <p className="text-slate-400 text-sm font-bold uppercase tracking-wider">{worker.role}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-black text-slate-900">₹{(worker.salary || 0).toLocaleString()}</p>
                                        <p className="text-green-600 text-xs font-black uppercase tracking-wider">Payroll</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Profit Insights */}
                <div className="glass rounded-[2.5rem] p-10">
                    <h3 className="text-2xl font-black text-slate-800 mb-8">Profit & Loss Analysis</h3>
                    <div className="space-y-6">
                        <div className="relative h-4 bg-slate-100 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.max(0, Math.min(100, (netProfit / (totalRevenue || 1)) * 100))}%` }}
                                className="absolute h-full bg-blue-600"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-8">
                            <div>
                                <p className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-1">Direct Expenses</p>
                                <p className="text-2xl font-black text-slate-800">₹{totalExpenses.toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-1">Net Profit</p>
                                <p className={`text-2xl font-black ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    ₹{netProfit.toLocaleString()}
                                </p>
                            </div>
                        </div>
                        <div className={`p-8 rounded-3xl border ${netProfit >= 0 ? 'bg-blue-50 border-blue-100' : 'bg-red-50 border-red-100'}`}>
                            <p className={`${netProfit >= 0 ? 'text-blue-900' : 'text-red-900'} font-bold text-sm leading-relaxed`}>
                                {netProfit >= 0
                                    ? "Tip: Your net profit margin looks healthy. Keep optimizing material purchases to increase it further."
                                    : "Warning: Your expenses are currently higher than your revenue. Review your purchase and payroll costs."}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
