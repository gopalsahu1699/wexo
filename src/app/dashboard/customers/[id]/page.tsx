"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { HiArrowLeft, HiTrash, HiSave } from "react-icons/hi";
import { getCustomer, addCustomer, updateCustomer, deleteCustomer } from "@/lib/services/customers";
import { getStaffSession } from "@/lib/services/auth-role";
import { use } from "react";

export default function CustomerDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const { id } = resolvedParams;
    const isNew = id === 'new';

    const router = useRouter();

    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);
    const [customer, setCustomer] = useState({
        name: "",
        phone: "",
        email: "",
        billing_address: "",
        type: "customer" as "customer" | "supplier" | "both",
    });
    const [role, setRole] = useState<string | null>(null);

    useEffect(() => {
        const session = getStaffSession();
        if (session) setRole(session.role);
        if (!isNew) {
            loadCustomer();
        }
    }, [isNew, id]);

    async function loadCustomer() {
        setLoading(true);
        try {
            const data = await getCustomer(id);
            if (data) {
                setCustomer({
                    name: data.name || "",
                    phone: data.phone || "",
                    email: data.email || "",
                    billing_address: data.billing_address || "",
                    type: data.type as "customer" | "supplier" | "both",
                });
            } else {
                router.push("/dashboard/customers");
            }
        } catch (err) {
            console.error("Error loading customer:", err);
            router.push("/dashboard/customers");
        } finally {
            setLoading(false);
        }
    }

    async function handleSave() {
        if (!customer.name.trim()) return;
        setSaving(true);
        try {
            if (isNew) {
                await addCustomer(customer);
            } else {
                await updateCustomer(id, customer);
            }
            router.push('/dashboard/customers');
        } catch (err) {
            console.error("Error saving customer:", err);
            alert("Failed to save customer. Please try again.");
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete() {
        if (confirm("Are you sure you want to delete this customer?")) {
            setSaving(true);
            try {
                await deleteCustomer(id);
                router.push('/dashboard/customers');
            } catch (err) {
                console.error("Error deleting customer:", err);
                alert("Failed to delete customer.");
                setSaving(false);
            }
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-3xl mx-auto">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => router.push('/dashboard/customers')}
                    className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors shadow-sm"
                >
                    <HiArrowLeft className="text-xl" />
                </button>
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                        {isNew ? 'Add New Customer' : 'Edit Customer'}
                    </h1>
                    <p className="text-slate-500 font-bold">
                        {isNew ? 'Register a new customer or supplier' : 'Update details'}
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-[2rem] p-8 shadow-sm border-2 border-slate-100">
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-black text-slate-600 mb-2">Name *</label>
                        <input
                            type="text"
                            value={customer.name}
                            onChange={(e) => setCustomer(p => ({ ...p, name: e.target.value }))}
                            placeholder="e.g. Rajesh Kumar"
                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 font-bold text-slate-800 focus:outline-none focus:border-blue-500 transition-all"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-black text-slate-600 mb-2">Phone</label>
                            <input
                                type="text"
                                value={customer.phone}
                                onChange={(e) => setCustomer(p => ({ ...p, phone: e.target.value }))}
                                placeholder="+91 98765 43210"
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 font-bold text-slate-800 focus:outline-none focus:border-blue-500 transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-black text-slate-600 mb-2">Email</label>
                            <input
                                type="email"
                                value={customer.email}
                                onChange={(e) => setCustomer(p => ({ ...p, email: e.target.value }))}
                                placeholder="email@example.com"
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 font-bold text-slate-800 focus:outline-none focus:border-blue-500 transition-all"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-black text-slate-600 mb-2">Billing Address</label>
                        <textarea
                            value={customer.billing_address}
                            onChange={(e) => setCustomer(p => ({ ...p, billing_address: e.target.value }))}
                            placeholder="Full address..."
                            rows={2}
                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 font-bold text-slate-800 focus:outline-none focus:border-blue-500 transition-all resize-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-black text-slate-600 mb-2">Type</label>
                        <select
                            value={customer.type}
                            onChange={(e) => setCustomer(p => ({ ...p, type: e.target.value as any }))}
                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 font-bold text-slate-800 focus:outline-none focus:border-blue-500 transition-all appearance-none"
                        >
                            <option value="customer">Customer</option>
                            <option value="supplier">Supplier</option>
                            <option value="both">Both</option>
                        </select>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4 mt-10 pt-8 border-t border-slate-100">
                    {role !== 'team_member' && (
                        <button
                            onClick={handleSave}
                            disabled={saving || !customer.name.trim()}
                            className="flex-1 px-6 py-4 bg-blue-600 text-white rounded-xl font-black shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            <HiSave className="text-xl" />
                            {saving ? "Saving..." : "Save Customer"}
                        </button>
                    )}
                    {!isNew && !role && (
                        <button
                            onClick={handleDelete}
                            disabled={saving}
                            className="md:w-auto px-6 py-4 bg-red-50 text-red-600 rounded-xl font-black hover:bg-red-100 transition-all flex items-center justify-center gap-2"
                        >
                            <HiTrash className="text-xl" />
                            Delete
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
