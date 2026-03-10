"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    HiOfficeBuilding,
    HiGlobeAlt,
    HiColorSwatch,
    HiDatabase,
    HiBell,
    HiShieldCheck,
    HiCheckCircle,
    HiLogout
} from "react-icons/hi";
import { createClient } from "@/lib/supabase";

export default function SettingsPage() {
    const router = useRouter();
    const supabase = createClient();

    const [companyName, setCompanyName] = useState("");
    const [industryType, setIndustryType] = useState("Electric & Hardware");
    const [serviceAddress, setServiceAddress] = useState("");
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [userEmail, setUserEmail] = useState("");
    const [notifications, setNotifications] = useState([
        { label: "Instant WhatsApp Alert on Job Assignment", enabled: true },
        { label: "Low Inventory Email Notifications", enabled: true },
        { label: "Worker Punch-in/Out Push Alerts", enabled: true },
        { label: "Daily Revenue Summary (9 PM)", enabled: false },
    ]);

    useEffect(() => {
        async function loadUser() {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserEmail(user.email || "");
                // Load settings from user_metadata if available
                const meta = user.user_metadata || {};
                if (meta.company_name) setCompanyName(meta.company_name);
                if (meta.industry_type) setIndustryType(meta.industry_type);
                if (meta.service_address) setServiceAddress(meta.service_address);
            }
        }
        loadUser();
    }, []);

    async function handleSaveSettings() {
        setSaving(true);
        try {
            const { error } = await supabase.auth.updateUser({
                data: {
                    company_name: companyName,
                    industry_type: industryType,
                    service_address: serviceAddress,
                }
            });
            if (error) throw error;
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            console.error("Error saving settings:", err);
            alert("Failed to save settings.");
        } finally {
            setSaving(false);
        }
    }

    function handleDiscard() {
        setCompanyName("");
        setIndustryType("Electric & Hardware");
        setServiceAddress("");
    }

    function toggleNotification(index: number) {
        setNotifications(prev => prev.map((n, i) => i === index ? { ...n, enabled: !n.enabled } : n));
    }

    async function handleLogout() {
        await supabase.auth.signOut();
        router.push("/login");
    }

    return (
        <div className="max-w-4xl space-y-10 pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-black text-slate-900">Settings</h2>
                    <p className="text-slate-500 font-medium">Configure your WEXO enterprise profile</p>
                </div>
                {userEmail && (
                    <div className="text-right">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Logged in as</p>
                        <p className="text-sm font-black text-slate-700">{userEmail}</p>
                    </div>
                )}
            </div>

            <div className="space-y-8">
                {/* Success Notification */}
                {saved && (
                    <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-2xl text-green-700 font-bold animate-fade-in">
                        <HiCheckCircle className="text-xl" />
                        Settings saved successfully!
                    </div>
                )}

                {/* Company Profile */}
                <section className="glass p-10 rounded-[2.5rem]">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
                            <HiOfficeBuilding className="text-2xl" />
                        </div>
                        <h3 className="text-xl font-black text-slate-800">Business Profile</h3>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div>
                            <label className="block text-sm font-black text-slate-700 mb-2">Company Name</label>
                            <input
                                type="text"
                                value={companyName}
                                onChange={(e) => setCompanyName(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="Your company name"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-black text-slate-700 mb-2">Industry Type</label>
                            <select
                                value={industryType}
                                onChange={(e) => setIndustryType(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 font-medium focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                            >
                                <option>Electric & Hardware</option>
                                <option>CCTV & Security</option>
                                <option>Plumbing & Sanitary</option>
                                <option>AC & HVAC</option>
                                <option>General Services</option>
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-black text-slate-700 mb-2">Service Address</label>
                            <textarea
                                value={serviceAddress}
                                onChange={(e) => setServiceAddress(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 font-medium focus:ring-2 focus:ring-blue-500 outline-none h-32 resize-none"
                                placeholder="Main Street, Business Hub, Sector 44..."
                            />
                        </div>
                    </div>
                </section>

                {/* Database & Integration */}
                <section className="glass p-10 rounded-[2.5rem]">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600">
                            <HiDatabase className="text-2xl" />
                        </div>
                        <h3 className="text-xl font-black text-slate-800">Database & BillMensor Sync</h3>
                    </div>
                    <div className="p-6 bg-slate-900 rounded-3xl relative overflow-hidden">
                        <div className="flex items-center justify-between relative z-10">
                            <div>
                                <p className="text-blue-400 font-black uppercase tracking-widest text-xs mb-1">Status: Connected</p>
                                <h4 className="text-white font-black text-xl mb-4">Shared PostgreSQL DB</h4>
                                <p className="text-slate-400 font-medium text-sm">WEXO syncs with BillMensor for Customers and Inventory.</p>
                            </div>
                            <HiShieldCheck className="text-6xl text-green-500 opacity-20" />
                        </div>
                    </div>
                </section>

                {/* Branding */}
                <section className="glass p-10 rounded-[2.5rem]">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600">
                            <HiColorSwatch className="text-2xl" />
                        </div>
                        <h3 className="text-xl font-black text-slate-800">Custom Branding</h3>
                    </div>
                    <div className="flex flex-wrap gap-10 items-center">
                        <div>
                            <p className="text-sm font-black text-slate-700 mb-4">Primary Brand Color</p>
                            <div className="flex gap-4">
                                <div className="w-12 h-12 bg-blue-600 rounded-full cursor-pointer ring-4 ring-blue-100 ring-offset-2"></div>
                                <div className="w-12 h-12 bg-orange-500 rounded-full cursor-pointer border-4 border-white shadow-sm"></div>
                                <div className="w-12 h-12 bg-emerald-500 rounded-full cursor-pointer border-4 border-white shadow-sm"></div>
                                <div className="w-12 h-12 bg-purple-600 rounded-full cursor-pointer border-4 border-white shadow-sm"></div>
                            </div>
                        </div>
                        <div className="flex-1 min-w-[300px]">
                            <p className="text-sm font-black text-slate-700 mb-4">Company Logo</p>
                            <div className="border-2 border-dashed border-slate-200 rounded-3xl p-8 text-center hover:border-blue-300 transition-colors cursor-pointer">
                                <HiGlobeAlt className="text-3xl text-slate-300 mx-auto mb-2" />
                                <p className="text-slate-400 font-bold">Click to upload brand logo</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Notification Settings */}
                <section className="glass p-10 rounded-[2.5rem]">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 bg-yellow-100 rounded-2xl flex items-center justify-center text-yellow-600">
                            <HiBell className="text-2xl" />
                        </div>
                        <h3 className="text-xl font-black text-slate-800">Notifications</h3>
                    </div>
                    <div className="space-y-4">
                        {notifications.map((note, i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                                <span className="font-bold text-slate-700">{note.label}</span>
                                <button
                                    onClick={() => toggleNotification(i)}
                                    className={`w-12 h-6 rounded-full relative cursor-pointer shadow-inner transition-colors ${note.enabled ? 'bg-blue-600' : 'bg-slate-300'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${note.enabled ? 'right-1' : 'left-1'}`}></div>
                                </button>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Action Buttons */}
                <div className="pt-10 border-t border-slate-200 flex flex-col sm:flex-row justify-between gap-4">
                    <button
                        onClick={handleLogout}
                        className="flex items-center justify-center gap-2 bg-red-50 text-red-600 font-black px-8 py-4 rounded-2xl border border-red-100 hover:bg-red-100 transition-all"
                    >
                        <HiLogout className="text-xl" />
                        Sign Out
                    </button>
                    <div className="flex gap-4">
                        <button
                            onClick={handleDiscard}
                            className="btn-3d bg-white text-slate-600 font-black px-10 py-4 rounded-2xl border border-slate-200 hover:bg-slate-50 transition-all"
                        >
                            Discard Changes
                        </button>
                        <button
                            onClick={handleSaveSettings}
                            disabled={saving}
                            className="btn-3d bg-blue-600 text-white font-black px-12 py-4 rounded-2xl shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all disabled:opacity-50"
                        >
                            {saving ? "Saving..." : "Save All Settings"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
