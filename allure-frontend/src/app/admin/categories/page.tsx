"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ADMIN_PRODUCT_AUTH_EXPIRED_ERROR, adminProductService, AdminCategory } from "@/services/adminProductService";
import { useAdminAuth } from "@/store/useAdminAuth";
import { Edit2, Plus, RefreshCw, Save, Search, Trash2, X } from "lucide-react";
import { PRODUCT_TYPE_OPTIONS } from "@/lib/product-type";
import { cn } from "@/lib/utils";

const slugify = (value: string) =>
    value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");

export default function AdminCategoriesPage() {
    const token = useAdminAuth((s) => s.token);
    const logout = useAdminAuth((s) => s.logout);
    const router = useRouter();
    const [categories, setCategories] = useState<AdminCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [name, setName] = useState("");
    const [productType, setProductType] = useState<(typeof PRODUCT_TYPE_OPTIONS)[number]>("Clothing");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingName, setEditingName] = useState("");
    const [editingProductType, setEditingProductType] = useState<(typeof PRODUCT_TYPE_OPTIONS)[number]>("Clothing");
    const [query, setQuery] = useState("");
    const [typeFilter, setTypeFilter] = useState<string>("All");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const load = async (showRefreshing = false) => {
        if (showRefreshing) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }

        try {
            setError(null);
            const data = await adminProductService.getCategories();
            setCategories(data);
        } catch {
            setCategories([]);
            setError("Could not load categories right now.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        void load();
    }, []);

    const sortedCategories = useMemo(
        () => [...categories]
            .filter((category) => {
                const normalized = query.trim().toLowerCase();
                const matchesQuery = !normalized || category.name.toLowerCase().includes(normalized) || category.slug.toLowerCase().includes(normalized);
                const matchesType = typeFilter === "All" || category.productType === typeFilter;
                return matchesQuery && matchesType;
            })
            .sort((a, b) => a.name.localeCompare(b.name)),
        [categories, query, typeFilter]
    );

    const stats = useMemo(() => ({
        total: categories.length,
        products: categories.reduce((sum, category) => sum + (category.productCount ?? 0), 0),
        activeTypes: new Set(categories.map((category) => category.productType)).size,
        empty: categories.filter((category) => (category.productCount ?? 0) === 0).length,
    }), [categories]);

    const handleCreate = async () => {
        if (!token || !name.trim()) {
            setError("Category name is required.");
            return;
        }

        try {
            setSaving(true);
            setError(null);
            const created = await adminProductService.createCategory(token, {
                name: name.trim(),
                slug: slugify(name),
                productType,
            });
            setCategories((current) => [...current, created]);
            setName("");
            setProductType("Clothing");
        } catch (error) {
            if (error instanceof Error && error.message === ADMIN_PRODUCT_AUTH_EXPIRED_ERROR) {
                logout();
                router.push("/admin/login");
                return;
            }

            setError("Could not create this category right now.");
            return;
        } finally {
            setSaving(false);
        }
    };

    const handleSaveEdit = async (id: string) => {
        if (!token || !editingName.trim()) {
            setError("Category name is required.");
            return;
        }

        try {
            setSaving(true);
            setError(null);
            const updated = await adminProductService.updateCategory(token, id, {
                name: editingName.trim(),
                slug: slugify(editingName),
                productType: editingProductType,
            });

            setCategories((current) => current.map((category) => (category.id === id ? { ...category, ...updated } : category)));
            setEditingId(null);
            setEditingName("");
            setEditingProductType("Clothing");
        } catch (error) {
            if (error instanceof Error && error.message === ADMIN_PRODUCT_AUTH_EXPIRED_ERROR) {
                logout();
                router.push("/admin/login");
                return;
            }

            setError("Could not update this category right now.");
            return;
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!token) {
            return;
        }

        if (!confirm("Delete this category?")) {
            return;
        }

        try {
            await adminProductService.deleteCategory(token, id);
            setCategories((current) => current.filter((category) => category.id !== id));
        } catch (error) {
            if (error instanceof Error && error.message === ADMIN_PRODUCT_AUTH_EXPIRED_ERROR) {
                logout();
                router.push("/admin/login");
                return;
            }

            setError("Could not delete this category right now.");
            return;
        }
    };

    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="font-display text-3xl font-bold text-dark">Categories</h1>
                <p className="text-dark/60">Create and manage product categories.</p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-3xl border border-secondary/10 bg-white p-5 shadow-sm"><p className="text-xs font-bold uppercase tracking-widest text-dark/40">Categories</p><p className="mt-2 font-display text-3xl font-bold text-dark">{stats.total}</p></div>
                <div className="rounded-3xl border border-secondary/10 bg-white p-5 shadow-sm"><p className="text-xs font-bold uppercase tracking-widest text-dark/40">Products Tagged</p><p className="mt-2 font-display text-3xl font-bold text-dark">{stats.products}</p></div>
                <div className="rounded-3xl border border-secondary/10 bg-white p-5 shadow-sm"><p className="text-xs font-bold uppercase tracking-widest text-dark/40">Product Types</p><p className="mt-2 font-display text-3xl font-bold text-dark">{stats.activeTypes}</p></div>
                <div className="rounded-3xl border border-secondary/10 bg-white p-5 shadow-sm"><p className="text-xs font-bold uppercase tracking-widest text-dark/40">Empty Categories</p><p className="mt-2 font-display text-3xl font-bold text-dark">{stats.empty}</p></div>
            </div>

            <div className="rounded-3xl border border-secondary/10 bg-white p-5 shadow-sm">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_220px_auto]">
                    <input
                        type="text"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        placeholder="New category name"
                        className="h-12 flex-1 rounded-xl border border-secondary/20 px-4 text-sm outline-none focus:ring-2 focus:ring-accent/20"
                    />
                    <select
                        value={productType}
                        onChange={(event) => setProductType(event.target.value as (typeof PRODUCT_TYPE_OPTIONS)[number])}
                        className="h-12 rounded-xl border border-secondary/20 px-4 text-sm outline-none focus:ring-2 focus:ring-accent/20"
                    >
                        {PRODUCT_TYPE_OPTIONS.map((option) => (
                            <option key={option} value={option}>{option}</option>
                        ))}
                    </select>
                    <Button onClick={handleCreate} variant="primary" className="h-12 rounded-2xl gap-2">
                        <Plus className="h-4 w-4" /> Add Category
                    </Button>
                </div>
            </div>

            <div className="rounded-3xl border border-secondary/10 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="relative w-full lg:max-w-md">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-dark/40" />
                        <input
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Search by category name or slug"
                            className="h-11 w-full rounded-xl border border-secondary/20 px-10 text-sm outline-none focus:ring-2 focus:ring-accent/20"
                        />
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} className="h-11 rounded-xl border border-secondary/20 px-4 text-sm outline-none focus:ring-2 focus:ring-accent/20">
                            <option value="All">All Types</option>
                            {PRODUCT_TYPE_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
                        </select>
                        <Button variant="outline" className="h-11 rounded-xl gap-2" onClick={() => void load(true)} disabled={loading || refreshing}>
                            <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} /> Refresh
                        </Button>
                    </div>
                </div>
                {error ? <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{error}</div> : null}
            </div>

            <div className="overflow-hidden rounded-3xl border border-secondary/10 bg-white shadow-sm">
                <table className="w-full border-collapse text-left">
                    <thead>
                        <tr className="border-b border-secondary/10 bg-secondary/5">
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-dark/40">Name</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-dark/40">Product Type</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-dark/40">Slug</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-dark/40">Products</th>
                            <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-widest text-dark/40">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-secondary/10">
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-sm text-dark/40">Loading categories...</td>
                            </tr>
                        ) : sortedCategories.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-sm text-dark/40">No categories yet.</td>
                            </tr>
                        ) : (
                            sortedCategories.map((category) => (
                                <tr key={category.id} className="hover:bg-secondary/5">
                                    <td className="px-6 py-4 text-sm font-bold text-dark">
                                        {editingId === category.id ? (
                                            <input
                                                value={editingName}
                                                onChange={(event) => setEditingName(event.target.value)}
                                                className="h-10 w-full rounded-lg border border-secondary/20 px-3 text-sm outline-none"
                                            />
                                        ) : (
                                            category.name
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-dark/60">
                                        {editingId === category.id ? (
                                            <select
                                                value={editingProductType}
                                                onChange={(event) => setEditingProductType(event.target.value as (typeof PRODUCT_TYPE_OPTIONS)[number])}
                                                className="h-10 rounded-lg border border-secondary/20 px-3 text-sm outline-none"
                                            >
                                                {PRODUCT_TYPE_OPTIONS.map((option) => (
                                                    <option key={option} value={option}>{option}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            category.productType
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-dark/50">{editingId === category.id ? slugify(editingName) : category.slug}</td>
                                    <td className="px-6 py-4 text-sm text-dark/60">{category.productCount ?? 0}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-end gap-2">
                                            {editingId === category.id ? (
                                                <>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 rounded-lg text-green-600"
                                                        disabled={saving}
                                                        onClick={() => void handleSaveEdit(category.id)}
                                                    >
                                                        <Save className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 rounded-lg text-dark/50"
                                                        onClick={() => {
                                                            setEditingId(null);
                                                            setEditingName("");
                                                            setEditingProductType("Clothing");
                                                        }}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </>
                                            ) : (
                                                <>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 rounded-lg text-dark/50"
                                                        onClick={() => {
                                                            setEditingId(category.id);
                                                            setEditingName(category.name);
                                                            setEditingProductType(category.productType as (typeof PRODUCT_TYPE_OPTIONS)[number]);
                                                        }}
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 rounded-lg text-red-500"
                                                        onClick={() => void handleDelete(category.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
