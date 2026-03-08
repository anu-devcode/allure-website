"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAdminAuth } from "@/store/useAdminAuth";
import { ADMIN_CUSTOMER_AUTH_EXPIRED_ERROR, AdminCustomer, adminCustomerService } from "@/services/adminCustomerService";
import { Edit2, Mail, MapPin, Phone, Plus, RefreshCw, Save, Search, ShoppingBag, Trash2, UserPlus, X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminCustomersPage() {
    const token = useAdminAuth((state) => state.token);
    const logout = useAdminAuth((state) => state.logout);
    const router = useRouter();
    const [customers, setCustomers] = useState<AdminCustomer[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [query, setQuery] = useState("");
    const [cityFilter, setCityFilter] = useState("All Cities");
    const [activityFilter, setActivityFilter] = useState<"All" | "With Orders" | "No Orders" | "High Value">("All");
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    const [createForm, setCreateForm] = useState({
        name: "",
        email: "",
        phone: "",
        city: "",
        password: "",
    });

    const [editingId, setEditingId] = useState<string | null>(null);
    const [editing, setEditing] = useState({ name: "", email: "", phone: "", city: "", password: "" });

    const loadCustomers = useCallback(async (showRefreshing = false) => {
        if (!token) {
            setLoading(false);
            return;
        }

        if (showRefreshing) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }

        try {
            setError(null);
            const data = await adminCustomerService.getCustomers(token);
            setCustomers(data);
        } catch (error) {
            if (error instanceof Error && error.message === ADMIN_CUSTOMER_AUTH_EXPIRED_ERROR) {
                logout();
                router.push("/admin/login");
                return;
            }

            setCustomers([]);
            setError("Could not load customers right now.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [logout, router, token]);

    useEffect(() => {
        void loadCustomers();
    }, [loadCustomers]);

    const filtered = useMemo(() => {
        const q = query.toLowerCase().trim();
        return customers.filter((customer) => {
            const matchesQuery = !q ||
                (customer.name ?? "").toLowerCase().includes(q) ||
                customer.email.toLowerCase().includes(q) ||
                (customer.phone ?? "").toLowerCase().includes(q) ||
                (customer.city ?? "").toLowerCase().includes(q) ||
                (customer.lastOrderNumber ?? "").toLowerCase().includes(q);

            const matchesCity = cityFilter === "All Cities" || (customer.city ?? "Unknown") === cityFilter;
            const matchesActivity = activityFilter === "All"
                || (activityFilter === "With Orders" && customer.orderCount > 0)
                || (activityFilter === "No Orders" && customer.orderCount === 0)
                || (activityFilter === "High Value" && customer.totalSpent >= 10000);

            return matchesQuery && matchesCity && matchesActivity;
        });
    }, [activityFilter, cityFilter, customers, query]);

    const stats = useMemo(() => ({
        total: customers.length,
        withOrders: customers.filter((customer) => customer.orderCount > 0).length,
        highValue: customers.filter((customer) => customer.totalSpent >= 10000).length,
        totalRevenue: customers.reduce((sum, customer) => sum + customer.totalSpent, 0),
    }), [customers]);

    const uniqueCities = useMemo(
        () => ["All Cities", ...Array.from(new Set(customers.map((customer) => customer.city ?? "Unknown"))).sort((a, b) => a.localeCompare(b))],
        [customers]
    );

    const handleCreate = async () => {
        if (!token || !createForm.name || !createForm.email || !createForm.phone || !createForm.password) {
            setError("Name, email, phone, and temporary password are required.");
            return;
        }

        try {
            setSaving(true);
            setError(null);
            const created = await adminCustomerService.createCustomer(token, createForm);
            setCustomers((current) => [created, ...current]);
            setCreateForm({ name: "", email: "", phone: "", city: "", password: "" });
        } catch (error) {
            if (error instanceof Error && error.message === ADMIN_CUSTOMER_AUTH_EXPIRED_ERROR) {
                logout();
                router.push("/admin/login");
                return;
            }

            setError("Could not create this customer right now.");
            return;
        } finally {
            setSaving(false);
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
            setSaving(true);
            setError(null);
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
        } catch (error) {
            if (error instanceof Error && error.message === ADMIN_CUSTOMER_AUTH_EXPIRED_ERROR) {
                logout();
                router.push("/admin/login");
                return;
            }

            setError("Could not update this customer right now.");
            return;
        } finally {
            setSaving(false);
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
        } catch (error) {
            if (error instanceof Error && error.message === ADMIN_CUSTOMER_AUTH_EXPIRED_ERROR) {
                logout();
                router.push("/admin/login");
                return;
            }

            setError("Could not delete this customer right now.");
            return;
        }
    };

    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="font-display text-3xl font-bold text-dark">Customers</h1>
                <p className="text-dark/60">Manage customer accounts, order activity, and account health.</p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-3xl border border-secondary/10 bg-white p-5 shadow-sm"><p className="text-xs font-bold uppercase tracking-widest text-dark/40">Customers</p><p className="mt-2 font-display text-3xl font-bold text-dark">{stats.total}</p></div>
                <div className="rounded-3xl border border-secondary/10 bg-white p-5 shadow-sm"><p className="text-xs font-bold uppercase tracking-widest text-dark/40">With Orders</p><p className="mt-2 font-display text-3xl font-bold text-dark">{stats.withOrders}</p></div>
                <div className="rounded-3xl border border-secondary/10 bg-white p-5 shadow-sm"><p className="text-xs font-bold uppercase tracking-widest text-dark/40">High Value</p><p className="mt-2 font-display text-3xl font-bold text-dark">{stats.highValue}</p></div>
                <div className="rounded-3xl border border-secondary/10 bg-white p-5 shadow-sm"><p className="text-xs font-bold uppercase tracking-widest text-dark/40">Tracked Revenue</p><p className="mt-2 font-display text-3xl font-bold text-dark">{stats.totalRevenue.toLocaleString()} ETB</p></div>
            </div>

            <div className="rounded-3xl border border-secondary/10 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center gap-2 text-dark">
                    <UserPlus className="h-5 w-5 text-accent" />
                    <h2 className="font-display text-xl font-bold">Add Customer</h2>
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
                    <input value={createForm.name} onChange={(e) => setCreateForm((c) => ({ ...c, name: e.target.value }))} placeholder="Name" className="h-11 rounded-xl border border-secondary/20 px-3 text-sm outline-none" />
                    <input value={createForm.email} onChange={(e) => setCreateForm((c) => ({ ...c, email: e.target.value }))} placeholder="Email" className="h-11 rounded-xl border border-secondary/20 px-3 text-sm outline-none" />
                    <input value={createForm.phone} onChange={(e) => setCreateForm((c) => ({ ...c, phone: e.target.value }))} placeholder="Phone" className="h-11 rounded-xl border border-secondary/20 px-3 text-sm outline-none" />
                    <input value={createForm.city} onChange={(e) => setCreateForm((c) => ({ ...c, city: e.target.value }))} placeholder="City" className="h-11 rounded-xl border border-secondary/20 px-3 text-sm outline-none" />
                    <input value={createForm.password} onChange={(e) => setCreateForm((c) => ({ ...c, password: e.target.value }))} placeholder="Temp password" type="password" className="h-11 rounded-xl border border-secondary/20 px-3 text-sm outline-none" />
                </div>
                <div className="mt-3 flex justify-end">
                    <Button variant="primary" className="h-11 rounded-2xl gap-2" onClick={handleCreate} disabled={saving}>
                        <Plus className="h-4 w-4" /> Add Customer
                    </Button>
                </div>
            </div>

            <div className="rounded-3xl border border-secondary/10 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                    <div className="relative w-full xl:max-w-md">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-dark/40" />
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search by name, email, phone, city, order"
                            className="h-11 w-full rounded-xl border border-secondary/20 px-10 text-sm outline-none focus:ring-2 focus:ring-accent/20"
                        />
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <select value={cityFilter} onChange={(event) => setCityFilter(event.target.value)} className="h-11 rounded-xl border border-secondary/20 px-4 text-sm outline-none focus:ring-2 focus:ring-accent/20">
                            {uniqueCities.map((city) => <option key={city} value={city}>{city}</option>)}
                        </select>
                        <select value={activityFilter} onChange={(event) => setActivityFilter(event.target.value as typeof activityFilter)} className="h-11 rounded-xl border border-secondary/20 px-4 text-sm outline-none focus:ring-2 focus:ring-accent/20">
                            <option>All</option>
                            <option>With Orders</option>
                            <option>No Orders</option>
                            <option>High Value</option>
                        </select>
                        <Button variant="outline" className="h-11 rounded-xl gap-2" onClick={() => void loadCustomers(true)} disabled={loading || refreshing}>
                            <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} /> Refresh
                        </Button>
                    </div>
                </div>
                {error ? <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{error}</div> : null}
            </div>

            <div className="grid grid-cols-1 gap-4">
                {loading ? (
                    <div className="rounded-3xl border border-secondary/10 bg-white p-8 text-center text-sm text-dark/40">Loading customers...</div>
                ) : filtered.length === 0 ? (
                    <div className="rounded-3xl border border-secondary/10 bg-white p-8 text-center text-sm text-dark/40">No customers found.</div>
                ) : filtered.map((customer) => (
                    <div key={customer.id} className="rounded-3xl border border-secondary/10 bg-white p-6 shadow-sm">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                            <div className="flex-1 space-y-4">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                        {editingId === customer.id ? (
                                            <input value={editing.name} onChange={(e) => setEditing((c) => ({ ...c, name: e.target.value }))} className="h-11 w-full max-w-sm rounded-xl border border-secondary/20 px-4 text-sm font-bold outline-none" />
                                        ) : (
                                            <h3 className="font-display text-2xl font-bold text-dark">{customer.name ?? "Unnamed Customer"}</h3>
                                        )}
                                        <p className="mt-1 text-xs text-dark/40">Joined {new Date(customer.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <span className="rounded-full bg-secondary/5 px-3 py-1 text-xs font-semibold text-dark/60">{customer.orderCount} orders</span>
                                        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-accent">{customer.totalSpent.toLocaleString()} ETB spent</span>
                                        {customer.pendingOrderCount > 0 ? <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">{customer.pendingOrderCount} active</span> : null}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                                    <div className="rounded-2xl bg-secondary/5 p-4">
                                        <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-dark/40"><Mail className="h-3.5 w-3.5" /> Email</p>
                                        {editingId === customer.id ? (
                                            <input value={editing.email} onChange={(e) => setEditing((c) => ({ ...c, email: e.target.value }))} className="h-10 w-full rounded-lg border border-secondary/20 px-3 text-sm" />
                                        ) : <p className="text-sm font-medium text-dark">{customer.email}</p>}
                                    </div>
                                    <div className="rounded-2xl bg-secondary/5 p-4">
                                        <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-dark/40"><Phone className="h-3.5 w-3.5" /> Phone</p>
                                        {editingId === customer.id ? (
                                            <input value={editing.phone} onChange={(e) => setEditing((c) => ({ ...c, phone: e.target.value }))} className="h-10 w-full rounded-lg border border-secondary/20 px-3 text-sm" />
                                        ) : <p className="text-sm font-medium text-dark">{customer.phone ?? "-"}</p>}
                                    </div>
                                    <div className="rounded-2xl bg-secondary/5 p-4">
                                        <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-dark/40"><MapPin className="h-3.5 w-3.5" /> City</p>
                                        {editingId === customer.id ? (
                                            <input value={editing.city} onChange={(e) => setEditing((c) => ({ ...c, city: e.target.value }))} className="h-10 w-full rounded-lg border border-secondary/20 px-3 text-sm" />
                                        ) : <p className="text-sm font-medium text-dark">{customer.city ?? "Unknown"}</p>}
                                    </div>
                                    <div className="rounded-2xl bg-secondary/5 p-4">
                                        <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-dark/40"><ShoppingBag className="h-3.5 w-3.5" /> Last Order</p>
                                        <p className="text-sm font-medium text-dark">{customer.lastOrderNumber ?? "No orders yet"}</p>
                                        {customer.lastOrderAt ? <p className="mt-1 text-xs text-dark/40">{new Date(customer.lastOrderAt).toLocaleDateString()}</p> : null}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                                    <div className="rounded-2xl border border-secondary/10 p-4"><p className="text-xs font-bold uppercase tracking-widest text-dark/40">Delivered Orders</p><p className="mt-2 font-display text-2xl font-bold text-dark">{customer.deliveredOrderCount}</p></div>
                                    <div className="rounded-2xl border border-secondary/10 p-4"><p className="text-xs font-bold uppercase tracking-widest text-dark/40">Active Orders</p><p className="mt-2 font-display text-2xl font-bold text-dark">{customer.pendingOrderCount}</p></div>
                                    <div className="rounded-2xl border border-secondary/10 p-4"><p className="text-xs font-bold uppercase tracking-widest text-dark/40">Lifetime Spend</p><p className="mt-2 font-display text-2xl font-bold text-dark">{customer.totalSpent.toLocaleString()} ETB</p></div>
                                </div>

                                {editingId === customer.id ? (
                                    <div className="rounded-2xl border border-secondary/10 bg-secondary/5 p-4">
                                        <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-dark/40">Reset Password</label>
                                        <input value={editing.password} onChange={(e) => setEditing((c) => ({ ...c, password: e.target.value }))} placeholder="New password (optional)" type="password" className="h-10 w-full rounded-lg border border-secondary/20 px-3 text-sm" />
                                    </div>
                                ) : null}
                            </div>

                            <div className="flex items-center gap-2 lg:pl-4">
                                {editingId === customer.id ? (
                                    <>
                                        <Button variant="outline" className="rounded-xl" onClick={() => void handleSaveEdit(customer.id)} disabled={saving}><Save className="mr-2 h-4 w-4" /> Save</Button>
                                        <Button variant="ghost" className="rounded-xl" onClick={() => { setEditingId(null); setEditing({ name: "", email: "", phone: "", city: "", password: "" }); }}><X className="mr-2 h-4 w-4" /> Cancel</Button>
                                    </>
                                ) : (
                                    <>
                                        <Button variant="outline" className="rounded-xl" onClick={() => beginEdit(customer)}><Edit2 className="mr-2 h-4 w-4" /> Edit</Button>
                                        <Button variant="ghost" className="rounded-xl text-red-500" onClick={() => void handleDelete(customer.id)}><Trash2 className="mr-2 h-4 w-4" /> Delete</Button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
