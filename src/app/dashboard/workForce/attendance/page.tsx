"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { HiArrowLeft, HiCalendar, HiClock, HiSave, HiCheckCircle, HiXCircle } from "react-icons/hi";
import { getWorkers } from "@/lib/services/workers";
import { getAttendance, getMyAttendance, markAttendance } from "@/lib/services/attendance";
import { getCurrentUser, UserType } from "@/lib/services/auth-role";
import { Worker, AttendanceRecord } from "@/lib/types";
import { motion } from "framer-motion";

export default function AttendancePage() {
    const router = useRouter();
    const [userType, setUserType] = useState<UserType>({ type: "none" });
    const [workers, setWorkers] = useState<Worker[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [attendanceMap, setAttendanceMap] = useState<Record<string, AttendanceRecord['status']>>({});
    const [overtimeMap, setOvertimeMap] = useState<Record<string, number>>({});

    // For staff "My Attendance" view
    const [myAttendance, setMyAttendance] = useState<AttendanceRecord[]>([]);
    const [viewMonth, setViewMonth] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    });

    useEffect(() => {
        async function init() {
            const user = await getCurrentUser();
            setUserType(user);

            if (user.type === "admin" || (user.type === "staff" && user.session.role === "manager")) {
                loadAdminData();
            } else if (user.type === "staff") {
                loadMyAttendance(user.session.staffId);
            }
        }
        init();
    }, []);

    useEffect(() => {
        if (userType.type === "admin" || (userType.type === "staff" && userType.session.role === "manager")) {
            loadAdminData();
        }
    }, [date]);

    useEffect(() => {
        if (userType.type === "staff" && userType.session.role === "team_member") {
            loadMyAttendance(userType.session.staffId);
        }
    }, [viewMonth]);

    async function loadAdminData() {
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
                    // Start as empty to avoid sync confusion
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

    async function loadMyAttendance(staffId: string) {
        setLoading(true);
        try {
            const [year, month] = viewMonth.split('-').map(Number);
            const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
            const lastDay = new Date(year, month, 0).getDate();
            const endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;
            
            const data = await getMyAttendance(startDate, endDate);
            setMyAttendance(data);
        } catch (err) {
            console.error("Error loading my attendance:", err);
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

    const getStatusIcon = (status: AttendanceRecord['status']) => {
        switch (status) {
            case 'present': return <HiCheckCircle className="text-green-500 text-lg" />;
            case 'absent': return <HiXCircle className="text-red-500 text-lg" />;
            case 'half_day': return <HiClock className="text-orange-500 text-lg" />;
            case 'leave': return <HiCalendar className="text-blue-500 text-lg" />;
            default: return null;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    // ═══════════════════════════════════════════════════════════
    // TEAM MEMBER VIEW: Read-only "My Attendance"
    // ═══════════════════════════════════════════════════════════
    if (userType.type === "staff" && userType.session.role === "team_member") {
        const presentDays = myAttendance.filter(a => a.status === 'present').length;
        const halfDays = myAttendance.filter(a => a.status === 'half_day').length;
        const absentDays = myAttendance.filter(a => a.status === 'absent').length;
        const leaveDays = myAttendance.filter(a => a.status === 'leave').length;
        const totalOT = myAttendance.reduce((sum, a) => sum + (a.overtime_hours || 0), 0);

        return (
            <div className="max-w-lg mx-auto space-y-6 pb-20">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.push('/dashboard/member')}
                        className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors shadow-sm border border-slate-100"
                    >
                        <HiArrowLeft className="text-xl" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">My Attendance</h1>
                        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-0.5">Monthly Record</p>
                    </div>
                </div>

                {/* Month Picker */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center gap-3">
                    <HiCalendar className="text-xl text-blue-500" />
                    <input
                        type="month"
                        value={viewMonth}
                        onChange={(e) => setViewMonth(e.target.value)}
                        className="bg-transparent font-black text-slate-800 focus:outline-none flex-1"
                    />
                </div>

                {/* Stats Summary */}
                <div className="grid grid-cols-2 gap-3">
                    {[
                        { label: 'Present', value: presentDays, color: 'bg-green-50 text-green-600 border-green-100' },
                        { label: 'Half Day', value: halfDays, color: 'bg-orange-50 text-orange-600 border-orange-100' },
                        { label: 'Absent', value: absentDays, color: 'bg-red-50 text-red-600 border-red-100' },
                        { label: 'Leave', value: leaveDays, color: 'bg-blue-50 text-blue-600 border-blue-100' },
                    ].map(stat => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`p-5 rounded-2xl border ${stat.color}`}
                        >
                            <p className="text-3xl font-black">{stat.value}</p>
                            <p className="text-[10px] font-black uppercase tracking-widest mt-1 opacity-70">{stat.label}</p>
                        </motion.div>
                    ))}
                </div>

                {totalOT > 0 && (
                    <div className="bg-purple-50 p-5 rounded-2xl border border-purple-100 flex items-center justify-between">
                        <span className="text-[10px] font-black text-purple-600 uppercase tracking-widest">Total Overtime</span>
                        <span className="text-2xl font-black text-purple-700">{totalOT} hrs</span>
                    </div>
                )}

                {/* Day-by-day list */}
                <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm">
                    <p className="px-6 pt-6 pb-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Daily Log</p>
                    <div className="divide-y divide-slate-50">
                        {myAttendance.length === 0 ? (
                            <div className="p-10 text-center text-slate-400 font-bold text-sm">No attendance records for this month</div>
                        ) : (
                            myAttendance.map((record) => (
                                <div key={record.id} className="px-6 py-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        {getStatusIcon(record.status)}
                                        <div>
                                            <p className="font-black text-slate-800 text-sm">
                                                {new Date(record.date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short' })}
                                            </p>
                                            {record.overtime_hours > 0 && (
                                                <p className="text-[10px] font-bold text-purple-500 uppercase">+{record.overtime_hours}h overtime</p>
                                            )}
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusColor(record.status)}`}>
                                        {record.status.replace('_', ' ')}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // ═══════════════════════════════════════════════════════════
    // ADMIN & MANAGER VIEW: Mark attendance for team
    // ═══════════════════════════════════════════════════════════
    return (
        <div className="space-y-6 md:space-y-8 max-w-5xl mx-auto pb-10">
            {/* Responsive Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2 md:px-0">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.push('/dashboard/workForce')}
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
                                                    {attendanceMap[worker.id]?.replace('_', ' ') || 'present'}
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
                                            <span className="text-[10px] font-black text-slate-400 uppercase">Hrs</span>
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
                    Default status is set to &apos;Present&apos; for all active workers.
                </p>
            </div>
        </div>
    );
}
