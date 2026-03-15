"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/dashboard/Sidebar";
import { HiMenuAlt2, HiX } from "react-icons/hi";
import { createClient } from "@/lib/supabase";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [userData, setUserData] = useState<{ name: string; initials: string; role: string } | null>(null);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        async function loadUser() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push("/login");
                return;
            }

            // Fetch profile
            const { data: profile } = await supabase
                .from('profiles')
                .select('full_name, company_name, designation')
                .eq('id', user.id)
                .single();

            // Redirect if setup incomplete
            if (!user.user_metadata?.business_name && !profile?.company_name) {
                router.push("/finish-setup");
                return;
            }

            const name = profile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || "User";
            const initials = name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
            
            setUserData({
                name,
                initials,
                role: profile?.designation || "Owner"
            });
        }
        loadUser();
    }, [router, supabase]);

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
            {/* Mobile Header */}
            <header className="md:hidden bg-white border-b border-slate-100 p-4 flex items-center justify-between sticky top-0 z-40 no-print">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-black text-lg">W</span>
                    </div>
                    <span className="text-xl font-black text-slate-800 tracking-tight">WEXO</span>
                </div>
                <button 
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="p-2 text-slate-600 bg-slate-50 rounded-xl"
                >
                    {isSidebarOpen ? <HiX className="text-2xl" /> : <HiMenuAlt2 className="text-2xl" />}
                </button>
            </header>

            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            
            <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'md:ml-72' : 'md:ml-72'} p-4 md:p-10 w-full overflow-x-hidden`}>
                <header className="hidden md:flex items-center justify-between mb-10 no-print">
                    <div>
                        <h2 className="text-3xl font-black text-slate-900">Dashboard</h2>
                        <p className="text-slate-500 font-medium">Welcome back to your command center</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="glass px-4 py-2 rounded-2xl flex items-center gap-3">
                            {userData ? (
                                <>
                                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold shrink-0">
                                        {userData.initials}
                                    </div>
                                    <div className="hidden md:block">
                                        <p className="text-sm font-black text-slate-800 line-clamp-1">{userData.name}</p>
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{userData.role}</p>
                                    </div>
                                </>
                            ) : (
                                <div className="flex items-center gap-3 animate-pulse">
                                    <div className="w-10 h-10 bg-slate-100 rounded-full" />
                                    <div className="space-y-2">
                                        <div className="h-4 w-20 bg-slate-100 rounded" />
                                        <div className="h-3 w-12 bg-slate-100 rounded" />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </header>
                {children}
            </main>
        </div>
    );
}

