"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { HiCurrencyRupee, HiTrendingUp, HiTrendingDown, HiPlus, HiArrowCircleDown, HiArrowCircleUp, HiCash, HiCalendar, HiDocumentDownload } from "react-icons/hi";
import { getFinanceStats } from "@/lib/services/stats";
import { getWorkers } from "@/lib/services/workers";
import { getPayments, addPayment, Payment } from "@/lib/services/payments";
import { Worker } from "@/lib/types";

export default function FinancePage() {
    const [stats, setStats] = useState({ 
        totalRevenue: 0, 
        totalPayroll: 0, 
        pendingPayments: 0, 
        totalExpenses: 0, 
        netProfit: 0, 
        growth: 0,
        paymentIn: 0,
        paymentOut: 0
    });
    
    // Filter states
    const [filterPeriod, setFilterPeriod] = useState<'month' | 'year' | 'all'>('month');
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    const [workers, setWorkers] = useState<Worker[]>([]);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentType, setPaymentType] = useState<'payment_in' | 'payment_out'>('payment_in');
    const [newPayment, setNewPayment] = useState({ amount: "", notes: "", mode: "cash" as any });

    useEffect(() => {
        const controller = new AbortController();
        loadFinanceData();
        return () => controller.abort();
    }, [filterPeriod, selectedMonth, selectedYear]);

    async function loadFinanceData() {
        setLoading(true);
        try {
            let startDate: string | undefined, endDate: string | undefined;
            
            if (filterPeriod === 'month') {
                startDate = new Date(selectedYear, selectedMonth, 1).toISOString().split('T')[0];
                endDate = new Date(selectedYear, selectedMonth + 1, 0).toISOString().split('T')[0];
            } else if (filterPeriod === 'year') {
                startDate = `${selectedYear}-01-01`;
                endDate = `${selectedYear}-12-31`;
            }

            const [financeData, workersData, paymentsData] = await Promise.all([
                getFinanceStats(startDate, endDate),
                getWorkers(),
                getPayments()
            ]);
            
            setStats(financeData as any);
            setWorkers(workersData);
            
            // Filter payments locally for display simplicity in the list
            const filteredPayments = paymentsData.filter(p => {
                if (!startDate || !endDate) return true;
                return p.payment_date >= startDate && p.payment_date <= endDate;
            });
            setPayments(filteredPayments);
            
        } catch (err) {
            console.error("Error loading finance data:", err);
        } finally {
            setLoading(false);
        }
    }

    async function handleAddPayment() {
        if (!newPayment.amount) return;
        try {
            await addPayment({
                amount: Number(newPayment.amount),
                type: paymentType,
                payment_mode: newPayment.mode,
                notes: newPayment.notes,
                payment_date: new Date().toISOString().split('T')[0],
                payment_number: `PAY-${Date.now()}`
            });
            setShowPaymentModal(false);
            setNewPayment({ amount: "", notes: "", mode: "cash" });
            loadFinanceData();
        } catch (err) {
            console.error("Error adding payment:", err);
            alert("Failed to add payment");
        }
    }

    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

    const getPeriodText = () => {
        if (filterPeriod === 'month') return `${months[selectedMonth]} ${selectedYear}`;
        if (filterPeriod === 'year') return `Year ${selectedYear}`;
        return "All Time";
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 md:space-y-10 pb-10">
            {/* Header & Main Filters */}
            <div className="flex flex-col gap-6 xl:flex-row xl:items-center justify-between no-print">
                <div className="text-center md:text-left">
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-2">My Business Money</h1>
                    <p className="text-slate-500 font-bold italic flex items-center justify-center md:justify-start gap-2 text-sm md:text-base">
                        <HiCalendar className="text-blue-600 shrink-0" /> <span className="truncate">Report for: <span className="text-blue-600">{getPeriodText()}</span></span>
                    </p>
                </div>

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 bg-white p-2 md:p-3 rounded-2xl md:rounded-[2rem] shadow-sm border border-slate-100 w-full xl:w-auto">
                    <div className="flex gap-2 w-full md:w-auto">
                        <select 
                            value={filterPeriod} 
                            onChange={(e) => setFilterPeriod(e.target.value as any)}
                            className="flex-1 md:flex-none bg-slate-50 border-none rounded-xl px-3 py-2 font-black text-slate-600 text-xs md:text-sm focus:ring-0"
                        >
                            <option value="month">Monthly</option>
                            <option value="year">Yearly</option>
                            <option value="all">Overall</option>
                        </select>

                        {filterPeriod === 'month' && (
                            <select 
                                value={selectedMonth} 
                                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                                className="flex-1 md:flex-none bg-slate-50 border-none rounded-xl px-3 py-2 font-black text-slate-600 text-xs md:text-sm focus:ring-0"
                            >
                                {months.map((m, i) => <option key={m} value={i}>{m}</option>)}
                            </select>
                        )}
                    </div>

                    <div className="flex gap-2 w-full md:w-auto">
                        {(filterPeriod === 'month' || filterPeriod === 'year') && (
                            <select 
                                value={selectedYear} 
                                onChange={(e) => setSelectedYear(Number(e.target.value))}
                                className="flex-1 md:flex-none bg-slate-50 border-none rounded-xl px-3 py-2 font-black text-slate-600 text-xs md:text-sm focus:ring-0"
                            >
                                {years.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                        )}

                        <button 
                            onClick={() => window.print()}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 md:px-6 md:py-3 rounded-xl font-black shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all text-[10px] md:text-sm uppercase"
                        >
                            <HiDocumentDownload className="text-base md:text-xl" />
                            <span>PDF</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Quick Actions (Income/Expense) */}
            <div className="flex flex-col md:flex-row gap-4 no-print">
                <button 
                    onClick={() => { setPaymentType('payment_in'); setShowPaymentModal(true); }}
                    className="flex-1 flex items-center justify-center gap-3 bg-green-600 text-white py-5 rounded-2xl font-black shadow-lg shadow-green-100 hover:scale-[1.02] transition-all uppercase tracking-wider"
                >
                    <HiArrowCircleDown className="text-2xl" />
                    <span>Add Income (Money In)</span>
                </button>
                <button 
                    onClick={() => { setPaymentType('payment_out'); setShowPaymentModal(true); }}
                    className="flex-1 flex items-center justify-center gap-3 bg-red-600 text-white py-5 rounded-2xl font-black shadow-lg shadow-red-100 hover:scale-[1.02] transition-all uppercase tracking-wider"
                >
                    <HiArrowCircleUp className="text-2xl" />
                    <span>Add Expense (Money Out)</span>
                </button>
            </div>

            {/* Print Only Header (Enhanced with selected period) */}
            <div className="print-only mb-10 border-b-4 border-slate-900 pb-12">
                <div className="flex justify-between items-end">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center">
                                <span className="text-white font-black text-2xl">W</span>
                            </div>
                            <h1 className="text-4xl font-black text-slate-900 tracking-tight">WEXO BUSINESS REPORT</h1>
                        </div>
                        <p className="text-slate-500 font-black text-lg uppercase tracking-widest">
                            Report Period: <span className="text-slate-900">{getPeriodText()}</span>
                        </p>
                        <p className="text-slate-400 font-bold mt-1 italic">Generated on {new Date().toLocaleString('en-IN')}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-slate-400 font-black text-xs uppercase tracking-widest mb-1">Final Balance</p>
                        <p className={`text-5xl font-black ${stats.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            ₹{stats.netProfit.toLocaleString()}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-4 gap-6 mt-12">
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                        <p className="text-slate-400 font-black text-[10px] uppercase mb-1">Billed Revenue</p>
                        <p className="text-xl font-black text-slate-900">₹{stats.totalRevenue.toLocaleString()}</p>
                    </div>
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                        <p className="text-slate-400 font-black text-[10px] uppercase mb-1">Other Income</p>
                        <p className="text-xl font-black text-green-600">₹{stats.paymentIn.toLocaleString()}</p>
                    </div>
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                        <p className="text-slate-400 font-black text-[10px] uppercase mb-1">Total Expenses</p>
                        <p className="text-xl font-black text-red-600">₹{stats.totalExpenses.toLocaleString()}</p>
                    </div>
                    <div className="bg-slate-900 p-6 rounded-2xl shadow-xl">
                        <p className="text-slate-400 font-black text-[10px] uppercase mb-1">Net Profit %</p>
                        <p className="text-xl font-black text-white">{stats.growth}%</p>
                    </div>
                </div>
            </div>

            {/* Dashboard Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass rounded-[2rem] p-8 bg-white border-2 border-slate-50 shadow-sm">
                    <p className="text-slate-400 font-black text-xs uppercase tracking-widest mb-1">Invoice Sales</p>
                    <h3 className="text-3xl font-black text-slate-900">₹{stats.totalRevenue.toLocaleString()}</h3>
                    <div className="mt-4 flex items-center gap-2 text-blue-600 font-black text-[10px] uppercase tracking-wider">
                        <HiCash className="text-base" /> Total Billed
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="glass rounded-[2rem] p-8 bg-white border-2 border-green-50 shadow-sm border-l-green-500 border-l-4">
                    <p className="text-slate-400 font-black text-xs uppercase tracking-widest mb-1 text-green-600">Extra Income</p>
                    <h3 className="text-3xl font-black text-slate-900">₹{stats.paymentIn.toLocaleString()}</h3>
                    <div className="mt-4 flex items-center gap-2 text-green-600 font-black text-[10px] uppercase tracking-wider">
                        <HiArrowCircleDown className="text-base" /> Cash/UPI Received
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="glass rounded-[2rem] p-8 bg-white border-2 border-red-50 shadow-sm border-l-red-500 border-l-4">
                    <p className="text-slate-400 font-black text-xs uppercase tracking-widest mb-1 text-red-600">Total Spending</p>
                    <h3 className="text-3xl font-black text-slate-900">₹{(stats.totalExpenses).toLocaleString()}</h3>
                    <div className="mt-4 flex items-center gap-2 text-red-600 font-black text-[10px] uppercase tracking-wider">
                        <HiArrowCircleUp className="text-base" /> All Handled Costs
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className={`glass rounded-[2rem] p-8 border-2 shadow-xl relative overflow-hidden group ${stats.netProfit >= 0 ? 'bg-blue-600 border-blue-500 text-white' : 'bg-red-600 border-red-500 text-white'}`}>
                    <p className="font-black text-xs uppercase tracking-widest mb-1 relative opacity-80">Actual Profit/Loss</p>
                    <h3 className="text-3xl font-black relative">₹{stats.netProfit.toLocaleString()}</h3>
                    <div className="mt-4 flex items-center gap-2 font-bold text-[10px] uppercase tracking-wider relative">
                        {stats.growth >= 0 ? <HiTrendingUp /> : <HiTrendingDown />}
                        {stats.growth}% Margin ({filterPeriod})
                    </div>
                </motion.div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Payroll Section */}
                <div className="bg-white rounded-[2.5rem] p-10 border-2 border-slate-50 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-2xl font-black text-slate-800">Staff Payroll</h3>
                            <p className="text-slate-400 font-bold text-sm uppercase tracking-wider italic">Monthly Liability</p>
                        </div>
                        <div className="bg-blue-50 px-6 py-3 rounded-2xl border border-blue-100">
                             <p className="text-blue-600 font-black text-xl">₹{stats.totalPayroll.toLocaleString()}</p>
                        </div>
                    </div>
                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                        {workers.map((worker) => (
                            <div key={worker.id} className="flex items-center justify-between p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center font-black text-blue-600 shadow-sm border border-slate-100 text-xl">
                                        {worker.name[0]}
                                    </div>
                                    <div>
                                        <p className="font-black text-slate-800 text-lg">{worker.name}</p>
                                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{worker.role || 'Staff'}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xl font-black text-slate-900">₹{(worker.salary || 0).toLocaleString()}</p>
                                    <p className="text-blue-500 text-[10px] font-black uppercase tracking-wider">{worker.pay_basis === 'daily' ? 'DAILY WAGE' : 'MONTHLY'}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Performance Analytics (Printable List) */}
                <div className="bg-white rounded-[2.5rem] p-10 border-2 border-slate-50 shadow-sm">
                    <h3 className="text-2xl font-black text-slate-800 mb-1">Period Transactions</h3>
                    <p className="text-slate-400 font-bold text-sm uppercase tracking-wider mb-8 italic">Review all cash flow for this period</p>
                    
                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                        {payments.length === 0 ? (
                            <div className="text-center py-20 text-slate-300 font-black italic">No records for this {filterPeriod}.</div>
                        ) : (
                            payments.map((p) => (
                                <div key={p.id} className="flex items-center justify-between p-6 bg-white rounded-3xl border border-slate-100 hover:bg-slate-50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${p.type === 'payment_in' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                            {p.type === 'payment_in' ? <HiArrowCircleDown /> : <HiArrowCircleUp />}
                                        </div>
                                        <div>
                                            <p className="font-black text-slate-800">{p.notes || (p.type === 'payment_in' ? 'Income' : 'Expense')}</p>
                                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{p.payment_date} • {p.payment_mode}</p>
                                        </div>
                                    </div>
                                    <div className={`text-xl font-black ${p.type === 'payment_in' ? 'text-green-600' : 'text-red-600'}`}>
                                        {p.type === 'payment_in' ? '+' : '-'}₹{p.amount.toLocaleString()}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Modal remains the same but with improved UI for literacy */}
            {showPaymentModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-[3rem] p-10 w-full max-w-xl shadow-2xl">
                        <h2 className="text-3xl font-black text-slate-900 mb-2">{paymentType === 'payment_in' ? 'RECEIVE MONEY' : 'PAY MONEY'}</h2>
                        <p className="text-slate-500 font-bold mb-8 italic">Enter the amount below</p>
                        
                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">AMOUNT (₹)</label>
                                <input 
                                    type="number" 
                                    value={newPayment.amount}
                                    onChange={(e) => setNewPayment(p => ({ ...p, amount: e.target.value }))}
                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-black text-2xl text-slate-800 focus:outline-none focus:border-blue-500"
                                    placeholder="0"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">MODE</label>
                                    <select 
                                        value={newPayment.mode}
                                        onChange={(e) => setNewPayment(p => ({ ...p, mode: e.target.value }))}
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-black text-slate-800 text-sm appearance-none"
                                    >
                                        <option value="cash">CASH</option>
                                        <option value="bank">BANK</option>
                                        <option value="upi">UPI/G-PAY</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">DESCRIPTION</label>
                                    <input 
                                        type="text" 
                                        value={newPayment.notes}
                                        onChange={(e) => setNewPayment(p => ({ ...p, notes: e.target.value }))}
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-black text-slate-800 text-sm"
                                        placeholder="What is this for?"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-4 pt-6">
                                <button onClick={() => setShowPaymentModal(false)} className="flex-1 py-5 rounded-2xl font-black text-slate-400 uppercase">Cancel</button>
                                <button onClick={handleAddPayment} disabled={!newPayment.amount} className={`flex-1 py-5 rounded-2xl font-black text-white shadow-xl uppercase ${paymentType === 'payment_in' ? 'bg-green-600' : 'bg-red-600'}`}>Save Reciept</button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
