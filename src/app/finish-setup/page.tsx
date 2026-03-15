"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { HiOfficeBuilding, HiPhone, HiArrowRight } from "react-icons/hi";
import { createClient } from "@/lib/supabase";

export default function FinishSetupPage() {
    const [businessName, setBusinessName] = useState("");
    const [phone, setPhone] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        async function checkProfile() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push("/login");
                return;
            }

            // Check if profile already has business name
            const { data: profile } = await supabase
                .from("profiles")
                .select("company_name")
                .eq("id", user.id)
                .single();

            if (profile?.company_name) {
                router.push("/dashboard");
            }
        }
        checkProfile();
    }, [router, supabase]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("No user found");

            // Update profile
            const { error: updateError } = await supabase
                .from("profiles")
                .update({
                    company_name: businessName,
                    phone: phone,
                    full_name: user.user_metadata.full_name || user.email?.split('@')[0],
                })
                .eq("id", user.id);

            if (updateError) throw updateError;

            // Also update auth metadata for consistency
            await supabase.auth.updateUser({
                data: {
                    business_name: businessName,
                    phone: phone,
                }
            });

            router.push("/dashboard");
        } catch (err: any) {
            setError(err.message || "Failed to save details");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 mb-6">
                        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                            <span className="text-white font-bold text-2xl">W</span>
                        </div>
                    </div>
                    <h1 className="text-3xl font-black text-slate-900">Finish Setup</h1>
                    <p className="text-slate-500 font-medium">Just a few more details to get you started</p>
                </div>

                <div className="glass p-8 rounded-[2.5rem] shadow-2xl">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-bold flex items-center gap-2">
                            <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-black text-slate-700 mb-2">Business Name</label>
                            <div className="relative">
                                <HiOfficeBuilding className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
                                <input
                                    type="text"
                                    value={businessName}
                                    onChange={(e) => setBusinessName(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    placeholder="e.g. WEXO Services"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-black text-slate-700 mb-2">Phone Number</label>
                            <div className="relative">
                                <HiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    placeholder="+91 98765 43210"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full btn-3d bg-blue-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 text-lg shadow-xl shadow-blue-200 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Saving...
                                </div>
                            ) : (
                                <>Get Started <HiArrowRight /></>
                            )}
                        </button>
                    </form>
                </div>
            </motion.div>
        </div>
    );
}
