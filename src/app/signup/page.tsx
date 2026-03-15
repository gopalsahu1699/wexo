"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { HiUser, HiMail, HiLockClosed, HiPhone, HiOfficeBuilding, HiArrowRight } from "react-icons/hi";
import { FcGoogle } from "react-icons/fc";
import { createClient } from "@/lib/supabase";

export default function SignupPage() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        businessName: "",
        password: ""
    });
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const supabase = createClient();

    const handleGoogleLogin = async () => {
        setGoogleLoading(true);
        setError(null);
        try {
            const { error: authError } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                    queryParams: {
                        prompt: 'select_account',
                    },
                },
            });

            if (authError) throw authError;
        } catch (err: any) {
            setError(err.message || "Failed to sign up with Google");
            setGoogleLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error: signUpError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        full_name: formData.name,
                        phone: formData.phone,
                        business_name: formData.businessName,
                    }
                }
            });

            if (signUpError) throw signUpError;

            // Redirect to a "Verify Email" or Dashboard
            router.push("/dashboard");
        } catch (err: any) {
            setError(err.message || "An error occurred during sign up");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 py-20">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-2xl"
            >
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 mb-6">
                        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                            <span className="text-white font-bold text-2xl">W</span>
                        </div>
                    </Link>
                    <h1 className="text-4xl font-black text-slate-900">Start Your Enterprise</h1>
                    <p className="text-xl text-slate-500 font-medium">Join 10,000+ service businesses today</p>
                </div>

                <div className="glass p-10 rounded-[3rem] shadow-2xl">
                    {error && (
                        <div className="mb-8 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-bold flex items-center gap-2">
                            <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
                            {error}
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-black text-slate-700 mb-2">Full Name</label>
                                <div className="relative">
                                    <HiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        placeholder="John Doe"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-black text-slate-700 mb-2">Email Address</label>
                                <div className="relative">
                                    <HiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        placeholder="john@company.com"
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
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        placeholder="+91 98765 43210"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-black text-slate-700 mb-2">Business Name</label>
                                <div className="relative">
                                    <HiOfficeBuilding className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
                                    <input
                                        type="text"
                                        value={formData.businessName}
                                        onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        placeholder="WEXO Services"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-black text-slate-700 mb-2">Choose Password</label>
                                <div className="relative">
                                    <HiLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
                                    <input
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={loading || googleLoading}
                                    className={`w-full btn-3d bg-blue-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 text-lg shadow-xl shadow-blue-200 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                                >
                                    {loading ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Joining...
                                        </div>
                                    ) : (
                                        <>Create My Account <HiArrowRight /></>
                                    )}
                                </button>
                            </div>
                        </div>
                    </form>

                    <div className="mt-8">
                        <div className="relative flex items-center py-4">
                            <div className="flex-grow border-t border-slate-200"></div>
                            <span className="flex-shrink mx-4 text-slate-400 text-sm font-bold">OR</span>
                            <div className="flex-grow border-t border-slate-200"></div>
                        </div>

                        <button
                            onClick={handleGoogleLogin}
                            disabled={loading || googleLoading}
                            className={`w-full bg-white border border-slate-200 text-slate-700 font-bold py-4 rounded-2xl flex items-center justify-center gap-3 text-lg shadow-sm hover:bg-slate-50 transition-all ${googleLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {googleLoading ? (
                                <div className="w-5 h-5 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
                            ) : (
                                <FcGoogle className="text-2xl" />
                            )}
                            Sign up with Google
                        </button>
                    </div>

                    <div className="mt-10 pt-8 border-t border-slate-100 text-center">
                        <p className="text-slate-500 font-medium">
                            Already have an account?{" "}
                            <Link href="/login" className="text-blue-600 font-black hover:underline">Log In</Link>
                        </p>
                    </div>
                </div>

                <p className="mt-8 text-center text-slate-400 text-sm font-medium">
                    By signing up, you agree to our <Link href="/terms" className="underline">Terms of Service</Link> and <Link href="/privacy" className="underline">Privacy Policy</Link>.
                </p>
            </motion.div>
        </div>
    );
}
