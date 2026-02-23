"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAdminAuth } from "@/store/useAdminAuth";
import { AdminCustomer, adminCustomerService } from "@/services/adminCustomerService";
import { Edit2, Plus, Save, Trash2, X } from "lucide-react";

export default function AdminCustomersPage() {
    const token = useAdminAuth((state) => state.token);
    const [customers, setCustomers] = useState<AdminCustomer[]>([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState("");

    const [createForm, setCreateForm] = useState({
        name: "",
        email: "",
        phone: "",
        city: "",
        password: "",
    });

    const [editingId, setEditingId] = useState<string | null>(null);
    const [editing, setEditing] = useState({ name: "", email: "", phone: "", city: "", password: "" });

    useEffect(() => {
        const loadCustomers = async () => {
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const data = await adminCustomerService.getCustomers(token);
                setCustomers(data);
            } catch {
                setCustomers([]);
            } finally {
                setLoading(false);
            }
        };

        void loadCustomers();
    }, [token]);

    const filtered = useMemo(() => {
        const q = query.toLowerCase().trim();
        if (!q) return customers;
        return customers.filter((customer) =>
            (customer.name ?? "").toLowerCase().includes(q) ||
            customer.email.toLowerCase().includes(q) ||
            (customer.phone ?? "").toLowerCase().includes(q)
        );
    }, [customers, query]);

    const handleCreate = async () => {
        if (!token || !createForm.name || !createForm.email || !createForm.phone || !createForm.password) {
            return;
        }

        try {
            const created = await adminCustomerService.createCustomer(token, createForm);
            setCustomers((current) => [created, ...current]);
            setCreateForm({ name: "", email: "", phone: "", city: "", password: "" });
        } catch {
            return;
        }
    };

    const beginEdit = (customer: AdminCustomer) => {
        setEditingId(customer.id);
        setEditing({
            name: customer.name ?? "",
            email: customer.email,
            phone: customer.phone ?? "",
            city: customer.city ?? "",
            password: "",
        });
    };

    const handleSaveEdit = async (id: string) => {
        if (!token) {
            return;
        }

        try {
            const updated = await adminCustomerService.updateCustomer(token, id, {
                name: editing.name,
                email: editing.email,
                phone: editing.phone,
                city: editing.city,
                ...(editing.password ? { password: editing.password } : {}),
            });
            setCustomers((current) => current.map((customer) => (customer.id === id ? { ...customer, ...updated } : customer)));
            setEditingId(null);
            setEditing({ name: "", email: "", phone: "", city: "", password: "" });
        } catch {
            return;
        }
    };

    const handleDelete = async (id: string) => {
        if (!token) {
            return;
        }

        if (!confirm("Delete this customer account?")) {
            return;
        }

        try {
            await adminCustomerService.deleteCustomer(token, id);
            setCustomers((current) => current.filter((customer) => customer.id !== id));
        } catch {
            return;
        }
    };

    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="font-display text-3xl font-bold text-dark">Customers</h1>
                <p className="text-dark/60">Manage customer accounts and profile data.</p>
            </div>

            <div className="rounded-3xl border border-secondary/10 bg-white p-5 shadow-sm">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
                    <input value={createForm.name} onChange={(e) => setCreateForm((c) => ({ ...c, name: e.target.value }))} placeholder="Name" className="h-11 rounded-xl border border-secondary/20 px-3 text-sm outline-none" />
                    <input value={createForm.email} onChange={(e) => setCreateForm((c) => ({ ...c, email: e.target.value }))} placeholder="Email" className="h-11 rounded-xl border border-secondary/20 px-3 text-sm outline-none" />
                    <input value={createForm.phone} onChange={(e) => setCreateForm((c) => ({ ...c, phone: e.target.value }))} placeholder="Phone" className="h-11 rounded-xl border border-secondary/20 px-3 text-sm outline-none" />
                    <input value={createForm.city} onChange={(e) => setCreateForm((c) => ({ ...c, city: e.target.value }))} placeholder="City" className="h-11 rounded-xl border border-secondary/20 px-3 text-sm outline-none" />
                    <input value={createForm.password} onChange={(e) => setCreateForm((c) => ({ ...c, password: e.target.value }))} placeholder="Temp password" type="password" className="h-11 rounded-xl border border-secondary/20 px-3 text-sm outline-none" />
                </div>
                <div className="mt-3 flex justify-end">
                    <Button variant="primary" className="h-11 rounded-2xl gap-2" onClick={handleCreate}>
                        <Plus className="h-4 w-4" /> Add Customer
                    </Button>
                </div>
            </div>

            <div className="rounded-3xl border border-secondary/10 bg-white p-4 shadow-sm">
                <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search customers by name, email, phone"
                    className="h-11 w-full rounded-xl border border-secondary/20 px-4 text-sm outline-none focus:ring-2 focus:ring-accent/20"
                />
            </div>

            <div className="overflow-hidden rounded-3xl border border-secondary/10 bg-white shadow-sm">
                <table className="w-full border-collapse text-left">
                    <thead>
                        <tr className="border-b border-secondary/10 bg-secondary/5">
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-dark/40">Customer</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-dark/40">Contact</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-dark/40">City</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-dark/40">Orders</th>
                            <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-widest text-dark/40">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-secondary/10">
                        {loading ? (
                            <tr><td colSpan={5} className="px-6 py-8 text-center text-sm text-dark/40">Loading customers...</td></tr>
                        ) : filtered.length === 0 ? (
                            <tr><td colSpan={5} className="px-6 py-8 text-center text-sm text-dark/40">No customers found.</td></tr>
                        ) : filtered.map((customer) => (
                            <tr key={customer.id} className="hover:bg-secondary/5">
                                <td className="px-6 py-4 text-sm font-bold text-dark">
                                    {editingId === customer.id ? (
                                        <input value={editing.name} onChange={(e) => setEditing((c) => ({ ...c, name: e.target.value }))} className="h-9 w-full rounded-lg border border-secondary/20 px-3 text-sm" />
                                    ) : (customer.name ?? "-")}
                                </td>
                                <td className="px-6 py-4 text-sm text-dark/60">
                                    {editingId === customer.id ? (
                                        <div className="flex flex-col gap-1">
                                            <input value={editing.email} onChange={(e) => setEditing((c) => ({ ...c, email: e.target.value }))} className="h-9 rounded-lg border border-secondary/20 px-3 text-sm" />
                                            <input value={editing.phone} onChange={(e) => setEditing((c) => ({ ...c, phone: e.target.value }))} className="h-9 rounded-lg border border-secondary/20 px-3 text-sm" />
                                            <input value={editing.password} onChange={(e) => setEditing((c) => ({ ...c, password: e.target.value }))} placeholder="New password (optional)" type="password" className="h-9 rounded-lg border border-secondary/20 px-3 text-sm" />
                                        </div>
                                    ) : (
                                        <div>
                                            <p>{customer.email}</p>
                                            <p className="text-xs text-dark/40">{customer.phone ?? "-"}</p>
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-sm text-dark/60">
                                    {editingId === customer.id ? (
                                        <input value={editing.city} onChange={(e) => setEditing((c) => ({ ...c, city: e.target.value }))} className="h-9 w-full rounded-lg border border-secondary/20 px-3 text-sm" />
                                    ) : (customer.city ?? "-")}
                                </td>
                                <td className="px-6 py-4 text-sm text-dark/60">{customer._count?.orders ?? 0}</td>
                                <td className="px-6 py-4">
                                    <div className="flex justify-end gap-2">
                                        {editingId === customer.id ? (
                                            <>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-green-600" onClick={() => void handleSaveEdit(customer.id)}><Save className="h-4 w-4" /></Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-dark/50" onClick={() => setEditingId(null)}><X className="h-4 w-4" /></Button>
                                            </>
                                        ) : (
                                            <>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-dark/50" onClick={() => beginEdit(customer)}><Edit2 className="h-4 w-4" /></Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-red-500" onClick={() => void handleDelete(customer.id)}><Trash2 className="h-4 w-4" /></Button>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
