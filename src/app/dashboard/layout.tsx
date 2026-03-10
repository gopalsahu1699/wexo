import Sidebar from "@/components/dashboard/Sidebar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-slate-50 flex">
            <Sidebar />
            <main className="flex-1 ml-72 p-10">
                <header className="flex items-center justify-between mb-10">
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
