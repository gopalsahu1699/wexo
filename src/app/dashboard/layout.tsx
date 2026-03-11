"use client";

import { useState } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import { HiMenuAlt2, HiX } from "react-icons/hi";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
                            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold">
                                JS
                            </div>
                            <div className="hidden md:block">
                                <p className="text-sm font-black text-slate-800">John Smith</p>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Owner</p>
                            </div>
                        </div>
                    </div>
                </header>
                {children}
            </main>
        </div>
    );
}

