"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { HiArrowLeft, HiTrash, HiSave, HiUser, HiIdentification, HiCash, HiPhone, HiMap, HiGlobeAlt } from "react-icons/hi";
import { getWorker, addWorker, updateWorker, deleteWorker } from "@/lib/services/workers";
import { use } from "react";

export default function WorkerDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const { id } = resolvedParams;
    const isNew = id === 'new';

    const router = useRouter();

    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'basic' | 'personal' | 'bank'>('basic');

    const [worker, setWorker] = useState({
        name: "",
        role: "",
        phone: "",
        whatsapp_phone: "",
        pay_basis: "monthly" as "monthly" | "daily",
        salary: 0,
        half_day_salary: 0,
        overtime_rate: 0,
        status: "active" as "active" | "inactive",
        aadhaar_number: "",
        pan_number: "",
        address: "",
        bank_name: "",
        bank_account_number: "",
        bank_ifsc_code: "",
        father_name: "",
        gender: "",
        dob: "",
        photo_url: "",
    });

    useEffect(() => {
        if (!isNew) {
            loadWorker();
        }
    }, [isNew, id]);

    async function loadWorker() {
        setLoading(true);
        try {
            const data = await getWorker(id);
            if (data) {
                setWorker({
                    name: data.name || "",
                    role: data.role || "",
                    phone: data.phone || "",
                    whatsapp_phone: (data as any).whatsapp_phone || "",
                    pay_basis: (data as any).pay_basis || "monthly",
                    salary: data.salary || 0,
                    half_day_salary: (data as any).half_day_salary || 0,
                    overtime_rate: (data as any).overtime_rate || 0,
                    status: data.status as "active" | "inactive",
                    aadhaar_number: (data as any).aadhaar_number || "",
                    pan_number: (data as any).pan_number || "",
                    address: (data as any).address || "",
                    bank_name: (data as any).bank_name || "",
                    bank_account_number: (data as any).bank_account_number || "",
                    bank_ifsc_code: (data as any).bank_ifsc_code || "",
                    father_name: data.father_name || "",
                    gender: data.gender || "",
                    dob: data.dob || "",
                    photo_url: data.photo_url || "",
                });
            } else {
                router.push("/dashboard/workers");
            }
        } catch (err) {
            console.error("Error loading worker:", err);
            router.push("/dashboard/workers");
        } finally {
            setLoading(false);
        }
    }

    async function handleSave() {
        if (!worker.name.trim()) return;
        setSaving(true);
        try {
            // Sanitize data: convert empty strings to null for optional fields
            const dataToSave = { ...worker };
            Object.keys(dataToSave).forEach(key => {
                const k = key as keyof typeof dataToSave;
                if (typeof dataToSave[k] === 'string' && (dataToSave[k] as string).trim() === '') {
                    (dataToSave as any)[k] = null;
                }
            });

            if (isNew) {
                await addWorker(dataToSave);
            } else {
                await updateWorker(id, dataToSave);
            }
            router.push('/dashboard/workers');
        } catch (err: any) {
            console.error("Error saving worker:", err);
            const errorMessage = err?.message || err?.details || "Failed to save worker. Please check if all fields match the database.";
            alert(errorMessage);
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete() {
        if (confirm("Are you sure you want to delete this worker?")) {
            setSaving(true);
            try {
                await deleteWorker(id);
                router.push('/dashboard/workers');
            } catch (err) {
                console.error("Error deleting worker:", err);
                alert("Failed to delete worker.");
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
        <div className="space-y-8 max-w-4xl mx-auto pb-10">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => router.push('/dashboard/workers')}
                    className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors shadow-sm border border-slate-100"
                >
                    <HiArrowLeft className="text-xl" />
                </button>
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                        {isNew ? 'Add New Worker' : 'Edit Worker'}
                    </h1>
                    <p className="text-slate-500 font-bold">
                        {isNew ? 'Register a new team member' : 'Update staff records'}
                    </p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-[1.5rem] w-fit shadow-inner">
                <button
                    onClick={() => setActiveTab('basic')}
                    className={`px-6 py-2.5 rounded-xl font-black text-sm transition-all flex items-center gap-2 ${activeTab === 'basic' ? 'bg-white text-blue-600 shadow-lg' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <HiUser /> Basic & Pay
                </button>
                <button
                    onClick={() => setActiveTab('personal')}
                    className={`px-6 py-2.5 rounded-xl font-black text-sm transition-all flex items-center gap-2 ${activeTab === 'personal' ? 'bg-white text-blue-600 shadow-lg' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <HiIdentification /> Personal
                </button>
                <button
                    onClick={() => setActiveTab('bank')}
                    className={`px-6 py-2.5 rounded-xl font-black text-sm transition-all flex items-center gap-2 ${activeTab === 'bank' ? 'bg-white text-blue-600 shadow-lg' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <HiCash /> Bank Details
                </button>
            </div>

            <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border-2 border-slate-50">
                {activeTab === 'basic' && (
                    <div className="space-y-8">
                        <div>
                            <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
                                <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-sm">1</span>
                                Primary Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Full Name *</label>
                                    <input
                                        type="text"
                                        value={worker.name}
                                        onChange={(e) => setWorker(p => ({ ...p, name: e.target.value }))}
                                        placeholder="Enter name"
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 font-bold text-slate-800 focus:outline-none focus:border-blue-500 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Role / Designation</label>
                                    <input
                                        type="text"
                                        value={worker.role}
                                        onChange={(e) => setWorker(p => ({ ...p, role: e.target.value }))}
                                        placeholder="e.g. Technician"
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 font-bold text-slate-800 focus:outline-none focus:border-blue-500 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Phone Number</label>
                                    <input
                                        type="text"
                                        value={worker.phone}
                                        onChange={(e) => setWorker(p => ({ ...p, phone: e.target.value }))}
                                        placeholder="Contact number"
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 font-bold text-slate-800 focus:outline-none focus:border-blue-500 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Photo URL</label>
                                    <input
                                        type="text"
                                        value={worker.photo_url}
                                        onChange={(e) => setWorker(p => ({ ...p, photo_url: e.target.value }))}
                                        placeholder="Image link (optional)"
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 font-bold text-slate-800 focus:outline-none focus:border-blue-500 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Status</label>
                                    <select
                                        value={worker.status}
                                        onChange={(e) => setWorker(p => ({ ...p, status: e.target.value as any }))}
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 font-bold text-slate-800 focus:outline-none focus:border-blue-500 transition-all appearance-none"
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="pt-8 border-t border-slate-50">
                            <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
                                <span className="w-8 h-8 bg-green-100 text-green-600 rounded-lg flex items-center justify-center text-sm">2</span>
                                Payroll & Rates
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Payment Basis</label>
                                    <div className="flex bg-slate-50 p-1 rounded-xl border-2 border-slate-100">
                                        <button
                                            onClick={() => setWorker(p => ({ ...p, pay_basis: 'monthly' }))}
                                            className={`flex-1 py-2 rounded-lg font-black text-sm transition-all ${worker.pay_basis === 'monthly' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}
                                        >
                                            Monthly
                                        </button>
                                        <button
                                            onClick={() => setWorker(p => ({ ...p, pay_basis: 'daily' }))}
                                            className={`flex-1 py-2 rounded-lg font-black text-sm transition-all ${worker.pay_basis === 'daily' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}
                                        >
                                            Daily
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Overtime Rate (per hr)</label>
                                    <input
                                        type="number"
                                        value={worker.overtime_rate}
                                        onChange={(e) => setWorker(p => ({ ...p, overtime_rate: Number(e.target.value) }))}
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 font-bold text-slate-800 focus:outline-none focus:border-blue-500 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                                        {worker.pay_basis === 'monthly' ? 'Monthly Salary' : 'Standard Daily Wage'}
                                    </label>
                                    <input
                                        type="number"
                                        value={worker.salary}
                                        onChange={(e) => setWorker(p => ({ ...p, salary: Number(e.target.value) }))}
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 font-bold text-slate-800 focus:outline-none focus:border-blue-500 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Half-Day Rate</label>
                                    <input
                                        type="number"
                                        value={worker.half_day_salary}
                                        onChange={(e) => setWorker(p => ({ ...p, half_day_salary: Number(e.target.value) }))}
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 font-bold text-slate-800 focus:outline-none focus:border-blue-500 transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'personal' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div>
                            <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
                                <HiIdentification className="text-blue-600" /> Identity Details
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Aadhaar Number</label>
                                    <input
                                        type="text"
                                        value={worker.aadhaar_number}
                                        onChange={(e) => setWorker(p => ({ ...p, aadhaar_number: e.target.value }))}
                                        placeholder="0000 0000 0000"
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 font-bold text-slate-800 focus:outline-none focus:border-blue-500 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">PAN Number</label>
                                    <input
                                        type="text"
                                        value={worker.pan_number}
                                        onChange={(e) => setWorker(p => ({ ...p, pan_number: e.target.value }))}
                                        placeholder="ABCDE1234F"
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 font-bold text-slate-800 focus:outline-none focus:border-blue-500 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Father's Name</label>
                                    <input
                                        type="text"
                                        value={worker.father_name}
                                        onChange={(e) => setWorker(p => ({ ...p, father_name: e.target.value }))}
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 font-bold text-slate-800 focus:outline-none focus:border-blue-500 transition-all"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Gender</label>
                                        <select
                                            value={worker.gender}
                                            onChange={(e) => setWorker(p => ({ ...p, gender: e.target.value }))}
                                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 font-bold text-slate-800 focus:outline-none focus:border-blue-500 transition-all appearance-none"
                                        >
                                            <option value="">Select</option>
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Date of Birth</label>
                                        <input
                                            type="date"
                                            value={worker.dob}
                                            onChange={(e) => setWorker(p => ({ ...p, dob: e.target.value }))}
                                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 font-bold text-slate-800 focus:outline-none focus:border-blue-500 transition-all"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-8 border-t border-slate-50">
                            <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
                                <HiMap className="text-orange-600" /> Address & Contact
                            </h3>
                            <div className="grid grid-cols-1 gap-6">
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Permanent Address</label>
                                    <textarea
                                        value={worker.address}
                                        onChange={(e) => setWorker(p => ({ ...p, address: e.target.value }))}
                                        rows={3}
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 font-bold text-slate-800 focus:outline-none focus:border-blue-500 transition-all"
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">WhatsApp Phone</label>
                                        <input
                                            type="text"
                                            value={worker.whatsapp_phone}
                                            onChange={(e) => setWorker(p => ({ ...p, whatsapp_phone: e.target.value }))}
                                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 font-bold text-slate-800 focus:outline-none focus:border-blue-500 transition-all"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'bank' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div>
                            <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
                                <HiCash className="text-green-600" /> Salary Payout Details
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Bank Name</label>
                                    <input
                                        type="text"
                                        value={worker.bank_name}
                                        onChange={(e) => setWorker(p => ({ ...p, bank_name: e.target.value }))}
                                        placeholder="e.g. State Bank of India"
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 font-bold text-slate-800 focus:outline-none focus:border-blue-500 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Account Number</label>
                                    <input
                                        type="text"
                                        value={worker.bank_account_number}
                                        onChange={(e) => setWorker(p => ({ ...p, bank_account_number: e.target.value }))}
                                        placeholder="Enter account number"
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 font-bold text-slate-800 focus:outline-none focus:border-blue-500 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">IFSC Code</label>
                                    <input
                                        type="text"
                                        value={worker.bank_ifsc_code}
                                        onChange={(e) => setWorker(p => ({ ...p, bank_ifsc_code: e.target.value }))}
                                        placeholder="SBIN0000123"
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 font-bold text-slate-800 focus:outline-none focus:border-blue-500 transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="bg-green-50 p-6 rounded-2xl border border-green-100">
                            <p className="text-green-800 font-bold text-sm">
                                Note: These details are used only for generating monthly payroll reports and bank transfer slips.
                            </p>
                        </div>
                    </div>
                )}

                <div className="flex flex-col md:flex-row gap-4 mt-10 pt-8 border-t border-slate-100">
                    <button
                        onClick={handleSave}
                        disabled={saving || !worker.name.trim()}
                        className="flex-1 px-6 py-4 bg-blue-600 text-white rounded-2xl font-black shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        <HiSave className="text-xl" />
                        {saving ? "Saving..." : isNew ? "Create Worker Profile" : "Update Profile"}
                    </button>
                    {!isNew && (
                        <button
                            onClick={handleDelete}
                            disabled={saving}
                            className="md:w-32 px-6 py-4 bg-red-50 text-red-600 rounded-2xl font-black hover:bg-red-100 transition-all flex items-center justify-center gap-2"
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
