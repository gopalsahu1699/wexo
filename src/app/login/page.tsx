"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { HiMail, HiLockClosed, HiArrowRight } from "react-icons/hi";
import { createClient } from "@/lib/supabase";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const supabase = createClient();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (authError) throw authError;

            router.push("/dashboard");
        } catch (err: any) {
            setError(err.message || "Invalid login credentials");
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
                    <Link href="/" className="inline-flex items-center gap-2 mb-6">
                        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                            <span className="text-white font-bold text-2xl">W</span>
                        </div>
                    </Link>
                    <h1 className="text-3xl font-black text-slate-900">Welcome Back</h1>
                    <p className="text-slate-500 font-medium">Log in to manage your workforce</p>
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
                            <label className="block text-sm font-black text-slate-700 mb-2">Email Address</label>
                            <div className="relative">
                                <HiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    placeholder="name@company.com"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-black text-slate-700 mb-2">Password</label>
                            <div className="relative">
                                <HiLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center gap-2 font-bold text-slate-600 cursor-pointer">
                                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600" />
                                Remember Me
                            </label>
                            <Link href="/forgot-password" virtual-path="/forgot-password" id="forgot-password" className="text-blue-600 font-bold hover:underline">Forgot Password?</Link>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full btn-3d bg-blue-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 text-lg shadow-xl shadow-blue-200 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Signing in...
                                </div>
                            ) : (
                                <>Sign In <HiArrowRight /></>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-8 border-t border-slate-100 text-center">
                        <p className="text-slate-500 font-medium">
                            Don't have an account?{" "}
                            <Link href="/signup" className="text-blue-600 font-black hover:underline">Create Account</Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
