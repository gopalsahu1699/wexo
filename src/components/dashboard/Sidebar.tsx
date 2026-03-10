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
    HiUserGroup
} from "react-icons/hi";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { createClient } from "@/lib/supabase";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const navItems = [
    { name: "Overview", href: "/dashboard", icon: HiChartPie },
    { name: "Workers", href: "/dashboard/workers", icon: HiUsers },
    { name: "Jobs", href: "/dashboard/jobs", icon: HiClipboardList },
    { name: "Inventory", href: "/dashboard/inventory", icon: HiCube },
    { name: "Customers", href: "/dashboard/customers", icon: HiUserGroup },
    { name: "Finance", href: "/dashboard/finance", icon: HiCurrencyRupee },
    { name: "Settings", href: "/dashboard/settings", icon: HiCog },
];

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();

    async function handleLogout() {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push("/login");
    }

    return (
        <div className="w-72 h-screen bg-white border-r border-slate-100 flex flex-col p-6 fixed left-0 top-0">
            <div className="flex items-center gap-2 mb-12 px-2">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-xl">W</span>
                </div>
                <span className="text-2xl font-black text-slate-800 tracking-tight">WEXO</span>
            </div>

            <nav className="flex-1 space-y-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
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
    );
}
