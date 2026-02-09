"use client";

import { MOCK_PRODUCTS } from "@/data/mock-products";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Search, MoreVertical, Edit2, Trash2, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function AdminProductsPage() {
    return (
        <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="font-display text-3xl font-bold text-dark">Products</h1>
                    <p className="text-dark/60">Manage your store inventory and availability.</p>
                </div>
                <Link href="/admin/products/new">
                    <Button variant="primary" className="rounded-2xl gap-2 h-12 px-6">
                        <Plus className="h-5 w-5" /> Add Product
                    </Button>
                </Link>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between bg-white p-4 rounded-3xl shadow-sm">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-dark/40" />
                    <input
                        type="text"
                        placeholder="Search products..."
                        className="w-full rounded-xl border border-secondary/10 bg-secondary/5 py-2 pl-10 pr-4 text-sm focus:bg-white focus:outline-none focus:ring-1 focus:ring-accent transition-all"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <select className="text-sm bg-secondary/5 border-none rounded-xl px-4 py-2 focus:ring-1 focus:ring-accent outline-none">
                        <option>All Categories</option>
                        <option>Dresses</option>
                        <option>Tops</option>
                    </select>
                    <select className="text-sm bg-secondary/5 border-none rounded-xl px-4 py-2 focus:ring-1 focus:ring-accent outline-none">
                        <option>All Status</option>
                        <option>In-Store</option>
                        <option>Pre-Order</option>
                    </select>
                </div>
            </div>

            {/* Products Table */}
            <div className="overflow-hidden rounded-3xl bg-white shadow-sm border border-secondary/10">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-secondary/5 border-b border-secondary/10">
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-dark/40">Product</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-dark/40">Category</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-dark/40">Price</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-dark/40">Status</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-dark/40 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-secondary/10">
                        {MOCK_PRODUCTS.map((product) => (
                            <tr key={product.id} className="hover:bg-secondary/5 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-10 rounded-lg bg-secondary/10 flex items-center justify-center text-xl">👗</div>
                                        <div>
                                            <p className="font-bold text-dark text-sm">{product.name}</p>
                                            <p className="text-xs text-dark/40">ID: {product.id}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-dark/60">{product.category}</td>
                                <td className="px-6 py-4 font-bold text-dark text-sm">{product.price.toLocaleString()} ETB</td>
                                <td className="px-6 py-4">
                                    <Badge variant={product.availability === "Sold Out" ? "destructive" : "secondary"} className="rounded-lg text-[10px]">
                                        {product.availability}
                                    </Badge>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Link href={`/product/${product.id}`} target="_blank">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-dark/40 hover:text-accent">
                                                <ExternalLink className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                        <Link href={`/admin/products/${product.id}/edit`}>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-dark/40 hover:text-accent">
                                                <Edit2 className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-dark/40 hover:text-red-500">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
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
