"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { HiMail, HiKey, HiArrowRight, HiUserGroup } from "react-icons/hi";
import { staffLogin, getStaffSession } from "@/lib/services/auth-role";

export default function StaffLoginPage() {
    const [email, setEmail] = useState("");
    const [pin, setPin] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        // If already logged in as staff, redirect
        const session = getStaffSession();
        if (session) {
            if (session.role === "manager") {
                router.push("/dashboard/manager");
            } else {
                router.push("/dashboard/member");
            }
        }
    }, [router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const session = await staffLogin(email, pin);
            if (!session) {
                setError("Invalid email or PIN. Contact your Admin for credentials.");
                return;
            }

            if (session.role === "manager") {
                router.push("/dashboard/manager");
            } else {
                router.push("/dashboard/member");
            }
        } catch (err: any) {
            setError(err.message || "Login failed. Please try again.");
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
                        <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                            <HiUserGroup className="text-white text-2xl" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-black text-slate-900">Staff Login</h1>
                    <p className="text-slate-500 font-medium mt-2">For Managers & Team Members</p>
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
                            <label className="block text-sm font-black text-slate-700 mb-2">Your Email</label>
                            <div className="relative">
                                <HiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 font-medium focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                                    placeholder="your.email@company.com"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-black text-slate-700 mb-2">PIN Code</label>
                            <div className="relative">
                                <HiKey className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
                                <input
                                    type="password"
                                    value={pin}
                                    onChange={(e) => setPin(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 font-medium text-2xl tracking-[0.5em] focus:ring-2 focus:ring-orange-500 outline-none transition-all text-center"
                                    placeholder="• • • •"
                                    maxLength={6}
                                    required
                                />
                            </div>
                            <p className="text-slate-400 text-xs font-bold mt-2 italic">Ask your Admin for your PIN</p>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full bg-orange-500 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 text-lg shadow-xl shadow-orange-200 hover:bg-orange-600 transition-all ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Logging in...
                                </div>
                            ) : (
                                <>Go to My Dashboard <HiArrowRight /></>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-8 border-t border-slate-100 text-center">
                        <p className="text-slate-500 font-medium">
                            Are you the business owner?{" "}
                            <Link href="/login" className="text-blue-600 font-black hover:underline">Admin Login</Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
