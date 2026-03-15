"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { HiMail, HiArrowLeft, HiArrowRight, HiCheckCircle } from "react-icons/hi";
import { createClient } from "@/lib/supabase";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [submitted, setSubmitted] = useState(false);
    const supabase = createClient();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
            });

            if (resetError) throw resetError;

            setSubmitted(true);
        } catch (err: any) {
            setError(err.message || "Failed to send reset link");
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-md text-center"
                >
                    <div className="glass p-10 rounded-[2.5rem] shadow-2xl space-y-6">
                        <div className="w-20 h-20 bg-green-100 rounded-3xl flex items-center justify-center mx-auto">
                            <HiCheckCircle className="text-5xl text-green-600" />
                        </div>
                        <h1 className="text-3xl font-black text-slate-900">Check your email</h1>
                        <p className="text-slate-500 font-medium">
                            We've sent a password reset link to <br />
                            <span className="text-slate-900 font-bold">{email}</span>
                        </p>
                        <div className="pt-4">
                            <Link 
                                href="/login" 
                                className="inline-flex items-center gap-2 text-blue-600 font-black hover:underline"
                            >
                                <HiArrowLeft /> Back to Login
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <div className="text-center mb-8">
                    <Link href="/login" className="inline-flex items-center gap-2 mb-6">
                        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                            <span className="text-white font-bold text-2xl">W</span>
                        </div>
                    </Link>
                    <h1 className="text-3xl font-black text-slate-900">Forgot Password</h1>
                    <p className="text-slate-500 font-medium">No worries, we'll send you reset instructions</p>
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

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full btn-3d bg-blue-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 text-lg shadow-xl shadow-blue-200 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Sending Link...
                                </div>
                            ) : (
                                <>Send Reset Link <HiArrowRight /></>
                            )}
                        </button>

                        <div className="text-center pt-2">
                            <Link 
                                href="/login" 
                                className="inline-flex items-center gap-2 text-slate-500 font-bold hover:text-blue-600 transition-colors"
                            >
                                <HiArrowLeft /> Back to Login
                            </Link>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
}
