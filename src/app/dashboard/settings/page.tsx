"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    HiOfficeBuilding,
    HiColorSwatch,
    HiDatabase,
    HiBell,
    HiShieldCheck,
    HiCheckCircle,
    HiLogout,
    HiUser,
    HiCreditCard,
    HiSupport,
    HiChevronRight,
    HiPhone,
    HiMail
} from "react-icons/hi";
import { createClient } from "@/lib/supabase";
import { getCurrentUser, UserType, staffLogout } from "@/lib/services/auth-role";

export default function SettingsPage() {
    const router = useRouter();
    const supabase = createClient();
    const [userType, setUserType] = useState<UserType>({ type: "none" });
    const [loading, setLoading] = useState(true);

    // Common State
    const [notifications, setNotifications] = useState([
        { label: "Job Assignment Alerts", enabled: true, role: ['admin', 'manager', 'team_member'] },
        { label: "Team Status Updates", enabled: true, role: ['admin', 'manager'] },
        { label: "Low Inventory Alerts", enabled: true, role: ['admin'] },
        { label: "Daily Summary", enabled: false, role: ['admin', 'manager'] },
        { label: "Payment Credits", enabled: true, role: ['team_member'] },
    ]);

    // Admin State
    const [companyName, setCompanyName] = useState("");
    const [industryType, setIndustryType] = useState("Electric & Hardware");
    const [serviceAddress, setServiceAddress] = useState("");

    // Profile State (Staff)
    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");
    
    // UI State
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        async function loadSettings() {
            const user = await getCurrentUser();
            setUserType(user);
            
            if (user.type === "admin") {
                const { data: { user: authUser } } = await supabase.auth.getUser();
                if (authUser) {
                    const meta = authUser.user_metadata || {};
                    setCompanyName(meta.company_name || "");
                    setIndustryType(meta.industry_type || "Electric & Hardware");
                    setServiceAddress(meta.service_address || "");
                    setFullName(meta.full_name || "");
                }
            } else if (user.type === "staff") {
                setFullName(user.session.staffName);
                // In a real app, we'd fetch staff-specific settings here
            }
            setLoading(false);
        }
        loadSettings();
    }, []);

    async function handleSave() {
        setSaving(true);
        try {
            if (userType.type === "admin") {
                const { error } = await supabase.auth.updateUser({
                    data: {
                        company_name: companyName,
                        industry_type: industryType,
                        service_address: serviceAddress,
                        full_name: fullName
                    }
                });
                if (error) throw error;
            } else {
                // Mock staff update
                await new Promise(r => setTimeout(r, 800));
            }
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            console.error("Error saving:", err);
            alert("Failed to save changes.");
        } finally {
            setSaving(false);
        }
    }

    async function handleLogout() {
        if (userType.type === "admin") {
            await supabase.auth.signOut();
            router.push("/login");
        } else {
            staffLogout();
            router.push("/staff-login");
        }
    }

    if (loading) return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    // ─────────────────────────────────────────────────────────────
    // RIDER / TEAM MEMBER VIEW
    // ─────────────────────────────────────────────────────────────
    if (userType.type === "staff" && userType.session.role === "team_member") {
        return (
            <div className="max-w-md mx-auto space-y-8 pb-32">
                <div className="text-center pt-6">
                    <div className="w-24 h-24 bg-slate-900 rounded-[2rem] mx-auto flex items-center justify-center text-white text-4xl font-black mb-4 shadow-xl">
                        {fullName[0]}
                    </div>
                    <h2 className="text-2xl font-black text-slate-900">{fullName}</h2>
                    <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mt-1">Verified Rider Team</p>
                </div>

                <div className="space-y-4">
                    <section className="bg-white rounded-[2rem] border border-slate-100 p-6 space-y-6 shadow-sm">
                        <div className="flex items-center gap-4 text-slate-400">
                            <HiUser className="text-2xl" />
                            <div className="flex-1">
                                <p className="text-[10px] uppercase font-black tracking-widest">Full Name</p>
                                <p className="text-sm font-bold text-slate-800">{fullName}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 text-slate-400">
                            <HiMail className="text-2xl" />
                            <div className="flex-1">
                                <p className="text-[10px] uppercase font-black tracking-widest">Email Address</p>
                                <p className="text-sm font-bold text-slate-800">{userType.session.loginEmail}</p>
                            </div>
                        </div>
                    </section>

                    <section className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm">
                        <p className="px-6 pt-6 pb-2 text-[10px] uppercase font-black text-slate-400 tracking-widest">Preferences</p>
                        <div className="divide-y divide-slate-50">
                            <button className="w-full px-6 py-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                <span className="flex items-center gap-3 font-bold text-slate-700 text-sm">
                                    <HiBell className="text-xl text-blue-500" /> Notifications
                                </span>
                                <HiChevronRight className="text-slate-300" />
                            </button>
                            <button className="w-full px-6 py-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                <span className="flex items-center gap-3 font-bold text-slate-700 text-sm">
                                    <HiCreditCard className="text-xl text-emerald-500" /> Payment Info
                                </span>
                                <HiChevronRight className="text-slate-300" />
                            </button>
                            <button className="w-full px-6 py-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                <span className="flex items-center gap-3 font-bold text-slate-700 text-sm">
                                    <HiSupport className="text-xl text-purple-500" /> Help Support
                                </span>
                                <HiChevronRight className="text-slate-300" />
                            </button>
                        </div>
                    </section>

                    <button 
                        onClick={handleLogout}
                        className="w-full py-5 bg-red-50 text-red-600 rounded-3xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2"
                    >
                        <HiLogout className="text-lg" /> Sign Out from Device
                    </button>
                </div>
            </div>
        );
    }

    // ─────────────────────────────────────────────────────────────
    // ADMIN / MANAGER VIEW
    // ─────────────────────────────────────────────────────────────
    const isAdmin = userType.type === "admin";
    
    return (
        <div className="max-w-5xl space-y-12 pb-20">
            <header className="flex items-center justify-between">
                <div className="space-y-1">
                    <h2 className="text-4xl font-black text-slate-900 tracking-tight">System Settings</h2>
                    <p className="text-slate-500 font-bold text-sm uppercase tracking-widest opacity-60">
                        {isAdmin ? "Enterprise Administration" : "Operations Management"}
                    </p>
                </div>
                <button 
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-100 rounded-2xl text-slate-400 font-black text-xs uppercase tracking-widest hover:text-red-500 hover:border-red-100 transition-all active:scale-95"
                >
                    <HiLogout className="text-lg" /> Exit
                </button>
            </header>

            <div className="grid lg:grid-cols-3 gap-10">
                {/* Left Column: Forms */}
                <div className="lg:col-span-2 space-y-8">
                    {isAdmin && (
                        <section className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/50">
                            <div className="flex items-center gap-4 mb-10">
                                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 border border-blue-100/50">
                                    <HiOfficeBuilding className="text-2xl" />
                                </div>
                                <h3 className="text-xl font-black text-slate-900 tracking-tight">Business Identity</h3>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">Organization Name</label>
                                    <input
                                        type="text"
                                        value={companyName}
                                        onChange={(e) => setCompanyName(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 font-black text-slate-800 focus:ring-4 focus:ring-blue-500/10 outline-none transition-shadow"
                                        placeholder="e.g. WEXO Solutions"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">Vertical</label>
                                    <select
                                        value={industryType}
                                        onChange={(e) => setIndustryType(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 font-black text-slate-800 focus:ring-4 focus:ring-blue-500/10 outline-none appearance-none"
                                    >
                                        <option>Electric & Hardware</option>
                                        <option>CCTV & Security</option>
                                        <option>Plumbing & Sanitary</option>
                                    </select>
                                </div>
                            </div>
                        </section>
                    )}

                    <section className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/50">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 border border-amber-100/50">
                                <HiBell className="text-2xl" />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 tracking-tight">Broadcast & Alerts</h3>
                        </div>

                        <div className="space-y-3">
                            {notifications.filter(n => n.role.includes(userType.type === 'admin' ? 'admin' : 'manager')).map((n, i) => (
                                <div key={i} className="flex items-center justify-between p-5 bg-slate-50 rounded-3xl border border-slate-100/50 group hover:bg-white transition-colors">
                                    <span className="font-black text-slate-700 text-xs uppercase tracking-wide">{n.label}</span>
                                    <div className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${n.enabled ? 'bg-slate-900' : 'bg-slate-200'}`}>
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${n.enabled ? 'right-1' : 'left-1'}`} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Right Column: Actions & Info */}
                <div className="space-y-8">
                    <section className="bg-slate-950 p-8 rounded-[3rem] text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 blur-3xl rounded-full translate-x-16 -translate-y-16" />
                        <div className="relative z-10">
                            <HiDatabase className="text-4xl text-blue-500 mb-6 group-hover:scale-110 transition-transform duration-500" />
                            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">System Infrastructure</p>
                            <h4 className="text-2xl font-black mb-4">Instance Health</h4>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                                    <span className="text-xs font-bold text-slate-400">Database Connected</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <HiShieldCheck className="text-emerald-500" />
                                    <span className="text-xs font-bold text-slate-400">Security Policies Active</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 space-y-4">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="w-full py-5 bg-blue-600 text-white rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-blue-600/20 hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50"
                        >
                            {saving ? "Syncing..." : "Update Settings"}
                        </button>
                        {saved && (
                            <div className="flex items-center justify-center gap-2 text-emerald-600 font-black text-[10px] uppercase tracking-widest animate-bounce">
                                <HiCheckCircle /> Applied Successfully
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
