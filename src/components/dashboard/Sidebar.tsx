"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    HiChartPie,
    HiUsers,
    HiClipboardList,
    HiCube,
    HiCurrencyRupee,
    HiCog,
    HiLogout,
    HiUserGroup,
    HiX
} from "react-icons/hi";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { createClient } from "@/lib/supabase";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const navItems = [
    { name: "Overview", href: "/dashboard", icon: HiChartPie },
    { name: "Work-Force", href: "/dashboard/workForce", icon: HiUsers },
    { name: "Tasks", href: "/dashboard/tasks", icon: HiClipboardList },
    { name: "Inventory", href: "/dashboard/inventory", icon: HiCube },
    { name: "Customers", href: "/dashboard/customers", icon: HiUserGroup },
    { name: "Finance", href: "/dashboard/finance", icon: HiCurrencyRupee },
    { name: "Billing (External)", href: "https://billmensor.vercel.app/dashboard", icon: HiClipboardList, external: true },
    { name: "Settings", href: "/dashboard/settings", icon: HiCog },
];

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();

    async function handleLogout() {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push("/login");
    }

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden"
                    onClick={onClose}
                />
            )}

            <div className={cn(
                "w-72 h-screen bg-white border-r border-slate-100 flex flex-col p-6 fixed left-0 top-0 no-print transition-transform duration-300 z-50",
                "md:translate-x-0", // Desktop always visible
                isOpen ? "translate-x-0" : "-translate-x-full" // Mobile toggle
            )}>
                <div className="flex items-center justify-between mb-12 px-2">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                            <span className="text-white font-bold text-xl">W</span>
                        </div>
                        <span className="text-2xl font-black text-slate-800 tracking-tight">WEXO</span>
                    </div>
                    <button 
                        onClick={onClose}
                        className="md:hidden p-2 text-slate-400 hover:text-slate-600"
                    >
                        <HiX className="text-xl" />
                    </button>
                </div>

                <nav className="flex-1 space-y-2 overflow-y-auto custom-scrollbar">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        if ('external' in item && item.external) {
                            return (
                                <a
                                    key={item.name}
                                    href={item.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={onClose}
                                    className={cn(
                                        "flex items-center gap-4 px-4 py-3 rounded-2xl font-bold transition-all duration-200 text-slate-500 hover:bg-orange-50 hover:text-orange-600"
                                    )}
                                >
                                    <item.icon className="text-xl" />
                                    {item.name}
                                </a>
                            );
                        }
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={onClose}
                                className={cn(
                                    "flex items-center gap-4 px-4 py-3 rounded-2xl font-bold transition-all duration-200",
                                    isActive
                                        ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                                        : "text-slate-500 hover:bg-slate-50 hover:text-blue-600"
                                )}
                            >
                                <item.icon className="text-xl" />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="mt-auto pt-6 border-t border-slate-100">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-4 px-4 py-3 rounded-2xl font-bold text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200 w-full text-left"
                    >
                        <HiLogout className="text-xl" />
                        Logout
                    </button>
                </div>
            </div>
        </>
    );
}
