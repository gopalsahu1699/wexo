"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
    HiX,
    HiHome,
    HiLightningBolt,
    HiStar,
    HiCreditCard,
    HiOutlineClipboardCheck
} from "react-icons/hi";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { createClient } from "@/lib/supabase";
import { getStaffSession, staffLogout } from "@/lib/services/auth-role";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export default function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const pathname = usePathname();
    const router = useRouter();
    const [role, setRole] = useState<'admin' | 'manager' | 'team_member'>('admin');

    useEffect(() => {
        const staff = getStaffSession();
        if (staff) {
            setRole(staff.role);
        } else {
            setRole('admin');
        }
    }, [pathname]);

    async function handleLogout() {
        if (role === 'admin') {
            const supabase = createClient();
            await supabase.auth.signOut();
            router.push("/login");
        } else {
            staffLogout();
            router.push("/staff-login");
        }
    }

    // Role-specific Navigation
    const navItems = {
        admin: [
            { name: "Overview", href: "/dashboard", icon: HiChartPie },
            { name: "Work-Force", href: "/dashboard/workForce", icon: HiUsers },
            { name: "Tasks", href: "/dashboard/tasks", icon: HiClipboardList },
            { name: "Inventory", href: "/dashboard/inventory", icon: HiCube },
            { name: "Customers", href: "/dashboard/customers", icon: HiUserGroup },
            { name: "Finance", href: "/dashboard/finance", icon: HiCurrencyRupee },
            { name: "Settings", href: "/dashboard/settings", icon: HiCog },
        ],
        manager: [
            { name: "Operations", href: "/dashboard/manager", icon: HiHome },
            { name: "Team Tasks", href: "/dashboard/tasks", icon: HiClipboardList },
            { name: "Staff Attendance", href: "/dashboard/workForce", icon: HiUsers },
            { name: "Inventory Check", href: "/dashboard/inventory", icon: HiCube },
            { name: "Customers List", href: "/dashboard/customers", icon: HiUserGroup },
            { name: "Settings", href: "/dashboard/settings", icon: HiCog },
        ],
        team_member: [
            { name: "Available Gigs", href: "/dashboard/member", icon: HiLightningBolt },
            { name: "My Wallet", href: "#", icon: HiCreditCard },
            { name: "Completed", href: "#", icon: HiOutlineClipboardCheck },
            { name: "Ratings", href: "#", icon: HiStar },
            { name: "Profile Settings", href: "/dashboard/settings", icon: HiCog },
        ]
    };

    const currentNav = navItems[role] || navItems.admin;
    const isRider = role === 'team_member';

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden transition-opacity"
                    onClick={onClose}
                />
            )}

            <div className={cn(
                "w-72 h-screen bg-white border-r border-slate-50 flex flex-col fixed left-0 top-0 no-print transition-all duration-300 z-50 shadow-xl md:shadow-none translate-x-0",
                !isOpen && "-translate-x-full md:translate-x-0"
            )}>
                {/* Profile/Logo Header */}
                <div className="p-8 mb-4 bg-white">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center font-black text-xl shadow-lg",
                                role === 'team_member' ? "bg-green-600 text-white" : 
                                role === 'manager' ? "bg-orange-500 text-white" : 
                                "bg-blue-600 text-white"
                            )}>
                                W
                            </div>
                            <span className="text-2xl font-black tracking-tight text-slate-800">WEXO</span>
                        </div>
                        <button onClick={onClose} className="md:hidden text-slate-400 hover:text-slate-600">
                            <HiX className="text-2xl" />
                        </button>
                    </div>

                    <div className="px-4 py-3 rounded-2xl flex items-center gap-3 bg-slate-50 border border-slate-100">
                        <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center font-bold text-[10px] uppercase shadow-sm",
                            role === 'team_member' ? "bg-green-100 text-green-600" : 
                            role === 'manager' ? "bg-orange-100 text-orange-600" : 
                            "bg-blue-100 text-blue-600"
                        )}>
                            {role[0]}
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-0.5">{role.replace('_', ' ')}</p>
                            <p className="text-xs font-black text-slate-700 truncate">Command Center</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto no-scrollbar">
                    {currentNav.map((item) => {
                        const isActive = pathname === item.href;
                        const activeColors = {
                            team_member: "bg-green-600 text-white shadow-lg shadow-green-100",
                            manager: "bg-orange-500 text-white shadow-lg shadow-orange-100",
                            admin: "bg-blue-600 text-white shadow-lg shadow-blue-100"
                        };
                        const hoverColors = {
                            team_member: "hover:bg-green-50 hover:text-green-600",
                            manager: "hover:bg-orange-50 hover:text-orange-600",
                            admin: "hover:bg-blue-50 hover:text-blue-600"
                        };

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={onClose}
                                className={cn(
                                    "flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all duration-200 group relative",
                                    isActive ? activeColors[role] : cn("text-slate-500", hoverColors[role])
                                )}
                            >
                                <item.icon className={cn(
                                    "text-xl transition-colors",
                                    isActive ? "text-white" : "group-hover:scale-110"
                                )} />
                                <span className="text-sm tracking-tight">{item.name}</span>
                                {isActive && (
                                    <motion.div 
                                        layoutId="sidebar-active"
                                        className="absolute right-4 w-1.5 h-1.5 rounded-full bg-white/50"
                                    />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Foot Action */}
                <div className="p-6 mt-auto border-t border-slate-50">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all duration-200 w-full text-left group text-slate-400 hover:bg-red-50 hover:text-red-500"
                    >
                        <HiLogout className="text-xl group-hover:rotate-12 transition-transform" />
                        <span className="text-sm">Log Out</span>
                    </button>
                </div>
            </div>
        </>
    );
}
