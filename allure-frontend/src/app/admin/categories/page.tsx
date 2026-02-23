"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { adminProductService, AdminCategory } from "@/services/adminProductService";
import { useAdminAuth } from "@/store/useAdminAuth";
import { Edit2, Plus, Save, Trash2, X } from "lucide-react";

const slugify = (value: string) =>
    value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");

export default function AdminCategoriesPage() {
    const token = useAdminAuth((s) => s.token);
    const [categories, setCategories] = useState<AdminCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [name, setName] = useState("");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingName, setEditingName] = useState("");

    useEffect(() => {
        const load = async () => {
            try {
                const data = await adminProductService.getCategories();
                setCategories(data);
            } catch {
                setCategories([]);
            } finally {
                setLoading(false);
            }
        };

        void load();
    }, []);

    const sortedCategories = useMemo(
        () => [...categories].sort((a, b) => a.name.localeCompare(b.name)),
        [categories]
    );

    const handleCreate = async () => {
        if (!token || !name.trim()) {
            return;
        }

        try {
            const created = await adminProductService.createCategory(token, {
                name: name.trim(),
                slug: slugify(name),
            });
            setCategories((current) => [...current, created]);
            setName("");
        } catch {
            return;
        }
    };

    const handleSaveEdit = async (id: string) => {
        if (!token || !editingName.trim()) {
            return;
        }

        try {
            const updated = await adminProductService.updateCategory(token, id, {
                name: editingName.trim(),
                slug: slugify(editingName),
            });

            setCategories((current) => current.map((category) => (category.id === id ? { ...category, ...updated } : category)));
            setEditingId(null);
            setEditingName("");
        } catch {
            return;
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
        } catch {
            return;
        }
    };

    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="font-display text-3xl font-bold text-dark">Categories</h1>
                <p className="text-dark/60">Create and manage product categories.</p>
            </div>

            <div className="rounded-3xl border border-secondary/10 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row">
                    <input
                        type="text"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        placeholder="New category name"
                        className="h-12 flex-1 rounded-xl border border-secondary/20 px-4 text-sm outline-none focus:ring-2 focus:ring-accent/20"
                    />
                    <Button onClick={handleCreate} variant="primary" className="h-12 rounded-2xl gap-2">
                        <Plus className="h-4 w-4" /> Add Category
                    </Button>
                </div>
            </div>

            <div className="overflow-hidden rounded-3xl border border-secondary/10 bg-white shadow-sm">
                <table className="w-full border-collapse text-left">
                    <thead>
                        <tr className="border-b border-secondary/10 bg-secondary/5">
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-dark/40">Name</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-dark/40">Slug</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-dark/40">Products</th>
                            <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-widest text-dark/40">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-secondary/10">
                        {loading ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-8 text-center text-sm text-dark/40">Loading categories...</td>
                            </tr>
                        ) : sortedCategories.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-8 text-center text-sm text-dark/40">No categories yet.</td>
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
