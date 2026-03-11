"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { HiArrowLeft, HiCalendar, HiClock, HiSave } from "react-icons/hi";
import { getWorkers } from "@/lib/services/workers";
import { getAttendance, markAttendance } from "@/lib/services/attendance";
import { Worker, AttendanceRecord } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";

export default function AttendancePage() {
    const router = useRouter();
    const [workers, setWorkers] = useState<Worker[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [attendanceMap, setAttendanceMap] = useState<Record<string, AttendanceRecord['status']>>({});
    const [overtimeMap, setOvertimeMap] = useState<Record<string, number>>({});

    useEffect(() => {
        loadData();
    }, [date]);

    async function loadData() {
        setLoading(true);
        try {
            const [workersData, attendanceData] = await Promise.all([
                getWorkers(),
                getAttendance(date, date)
            ]);

            setWorkers(workersData.filter(w => w.status === 'active'));
            
            const attMap: Record<string, AttendanceRecord['status']> = {};
            const otMap: Record<string, number> = {};
            
            workersData.forEach(w => {
                 if(w.status === 'active') {
                    attMap[w.id] = 'present';
                    otMap[w.id] = 0;
                 }
            });
            
            attendanceData.forEach(record => {
                attMap[record.staff_id] = record.status;
                otMap[record.staff_id] = record.overtime_hours || 0;
            });
            
            setAttendanceMap(attMap);
            setOvertimeMap(otMap);
        } catch (err) {
            console.error("Error loading attendance data:", err);
        } finally {
            setLoading(false);
        }
    }

    async function handleSave() {
        setSaving(true);
        try {
            await Promise.all(
                Object.entries(attendanceMap).map(([staffId, status]) => 
                    markAttendance(staffId, date, status, overtimeMap[staffId] || 0)
                )
            );
            alert("Attendance saved successfully!");
        } catch (err: any) {
            console.error("Error saving attendance:", err);
            alert(err?.message || "Failed to save attendance");
        } finally {
            setSaving(false);
        }
    }

    const getStatusColor = (status: AttendanceRecord['status']) => {
        switch (status) {
            case 'present': return 'bg-green-100 text-green-700 border-green-200';
            case 'absent': return 'bg-red-100 text-red-700 border-red-200';
            case 'half_day': return 'bg-orange-100 text-orange-700 border-orange-200';
            case 'leave': return 'bg-blue-100 text-blue-700 border-blue-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 md:space-y-8 max-w-5xl mx-auto pb-10">
            {/* Responsive Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2 md:px-0">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.push('/dashboard/workers')}
                        className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-xl md:rounded-2xl flex items-center justify-center text-slate-500 hover:text-blue-600 transition-colors shadow-sm border border-slate-100 shrink-0"
                    >
                        <HiArrowLeft className="text-xl" />
                    </button>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Daily Attendance</h1>
                        <p className="text-slate-500 font-bold text-sm md:text-base">Mark presence for your field team</p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-4 bg-white p-2 rounded-2xl md:rounded-[1.5rem] shadow-sm border border-slate-100">
                    <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-xl font-black flex-1 sm:flex-none">
                        <HiCalendar className="text-xl shrink-0" />
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="bg-transparent focus:outline-none cursor-pointer w-full text-sm md:text-base"
                        />
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all disabled:opacity-50 text-sm md:text-base"
                    >
                        <HiSave className="text-xl" />
                        {saving ? "Saving..." : "Save All Records"}
                    </button>
                </div>
            </div>

            {/* Main Content: Table for Desktop, Cards for Mobile */}
            <div className="bg-white md:rounded-[2.5rem] overflow-hidden shadow-sm border-y md:border border-slate-100">
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest">Worker</th>
                                <th className="px-4 py-6 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                                <th className="px-4 py-6 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Overtime</th>
                                <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest">Mark Attendance</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {workers.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-8 py-20 text-center text-slate-400 font-bold">No active workers found.</td>
                                </tr>
                            ) : (
                                workers.map((worker) => (
                                    <tr key={worker.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 font-black">
                                                    {worker.name[0]}
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-800">{worker.name}</p>
                                                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-wider">{worker.role}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-6">
                                            <div className="flex justify-center">
                                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border shrink-0 ${getStatusColor(attendanceMap[worker.id])}`}>
                                                    {attendanceMap[worker.id].replace('_', ' ')}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-6 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <input
                                                    type="number"
                                                    value={overtimeMap[worker.id] || 0}
                                                    onChange={(e) => setOvertimeMap(prev => ({ ...prev, [worker.id]: Number(e.target.value) }))}
                                                    className="w-16 bg-slate-50 border border-slate-200 rounded-lg px-2 py-2 text-center font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                                                    min="0"
                                                    max="24"
                                                />
                                                <span className="text-[10px] font-black text-slate-400 uppercase">Hrs</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                {['present', 'absent', 'half_day', 'leave'].map((status) => (
                                                    <button
                                                        key={status}
                                                        onClick={() => setAttendanceMap(prev => ({ ...prev, [worker.id]: status as any }))}
                                                        className={`px-4 py-2 rounded-xl font-black text-[10px] transition-all whitespace-nowrap ${attendanceMap[worker.id] === status ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-100 text-slate-400 hover:bg-blue-50 hover:text-blue-600'}`}
                                                    >
                                                        {status === 'half_day' ? 'HALF DAY' : status === 'present' ? 'FULL DAY' : status.toUpperCase()}
                                                    </button>
                                                ))}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile View: Cards */}
                <div className="md:hidden divide-y divide-slate-100">
                    {workers.length === 0 ? (
                        <div className="p-20 text-center text-slate-400 font-bold">No active workers found.</div>
                    ) : (
                        workers.map((worker) => (
                            <div key={worker.id} className="p-4 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 font-black">
                                            {worker.name[0]}
                                        </div>
                                        <div>
                                            <p className="font-black text-slate-800 text-sm">{worker.name}</p>
                                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-wider leading-none">{worker.role}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Overtime</p>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="number"
                                                value={overtimeMap[worker.id] || 0}
                                                onChange={(e) => setOvertimeMap(prev => ({ ...prev, [worker.id]: Number(e.target.value) }))}
                                                className="w-14 bg-slate-50 border border-slate-200 rounded-lg py-1 text-center font-bold text-slate-800 focus:outline-none"
                                            />
                                            <span className="text-[10px] font-black text-slate-400 uppercase font-xs">Hrs</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => setAttendanceMap(prev => ({ ...prev, [worker.id]: 'present' }))}
                                        className={`py-3 rounded-xl font-black text-[10px] transition-all ${attendanceMap[worker.id] === 'present' ? 'bg-green-600 text-white shadow-lg' : 'bg-slate-50 text-slate-400'}`}
                                    >
                                        FULL DAY
                                    </button>
                                    <button
                                        onClick={() => setAttendanceMap(prev => ({ ...prev, [worker.id]: 'half_day' }))}
                                        className={`py-3 rounded-xl font-black text-[10px] transition-all ${attendanceMap[worker.id] === 'half_day' ? 'bg-orange-500 text-white shadow-lg' : 'bg-slate-50 text-slate-400'}`}
                                    >
                                        HALF DAY
                                    </button>
                                    <button
                                        onClick={() => setAttendanceMap(prev => ({ ...prev, [worker.id]: 'absent' }))}
                                        className={`py-3 rounded-xl font-black text-[10px] transition-all ${attendanceMap[worker.id] === 'absent' ? 'bg-red-600 text-white shadow-lg' : 'bg-slate-50 text-slate-400'}`}
                                    >
                                        ABSENT
                                    </button>
                                    <button
                                        onClick={() => setAttendanceMap(prev => ({ ...prev, [worker.id]: 'leave' }))}
                                        className={`py-3 rounded-xl font-black text-[10px] transition-all ${attendanceMap[worker.id] === 'leave' ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-50 text-slate-400'}`}
                                    >
                                        LEAVE
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
            
            <div className="mx-2 md:mx-0 bg-blue-50 rounded-2xl md:rounded-[2rem] p-6 md:p-8 border border-blue-100">
                <p className="text-blue-900 font-bold text-xs md:text-sm leading-relaxed">
                    Tip: Marking attendance helps in automatic monthly payroll calculation on the Finance page. 
                    Default status is set to 'Present' for all active workers.
                </p>
            </div>
        </div>
    );
}
