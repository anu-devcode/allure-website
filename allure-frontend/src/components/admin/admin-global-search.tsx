"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Search, X, ArrowRight, ShoppingBag, Users, ClipboardList, Receipt } from "lucide-react";
import { cn } from "@/lib/utils";
import { adminOrderService } from "@/services/adminOrderService";
import { adminProductService } from "@/services/adminProductService";
import { adminCustomerService, AdminCustomer } from "@/services/adminCustomerService";
import { CustomRequest, getCustomRequests } from "@/services/customRequestService";
import { Order, Product } from "@/types";
import { useAdminAuth } from "@/store/useAdminAuth";

const MAX_RESULTS = 4;

export function AdminGlobalSearch() {
    const token = useAdminAuth((state) => state.token);
    const [query, setQuery] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loaded, setLoaded] = useState(false);

    const [orders, setOrders] = useState<Order[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [customers, setCustomers] = useState<AdminCustomer[]>([]);
    const [requests, setRequests] = useState<CustomRequest[]>([]);

    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (!isOpen || loaded) {
            return;
        }

        const loadData = async () => {
            setLoading(true);
            try {
                const [ordersResult, productsResult, customersResult, requestsResult] = await Promise.all([
                    token ? adminOrderService.getOrders(token) : Promise.resolve([]),
                    adminProductService.getProducts(),
                    token ? adminCustomerService.getCustomers(token) : Promise.resolve([]),
                    token ? getCustomRequests(token) : Promise.resolve([]),
                ]);

                setOrders(ordersResult);
                setProducts(productsResult);
                setCustomers(customersResult);
                setRequests(requestsResult);
                setLoaded(true);
            } catch {
                setOrders([]);
                setProducts([]);
                setCustomers([]);
                setRequests([]);
            } finally {
                setLoading(false);
            }
        };

        void loadData();
    }, [isOpen, loaded, token]);

    const normalizedQuery = query.trim().toLowerCase();

    const orderResults = useMemo(() => {
        if (!normalizedQuery) return [];
        return orders
            .filter((order) =>
                order.orderNumber.toLowerCase().includes(normalizedQuery) ||
                order.customerName.toLowerCase().includes(normalizedQuery) ||
                order.city.toLowerCase().includes(normalizedQuery)
            )
            .slice(0, MAX_RESULTS);
    }, [orders, normalizedQuery]);

    const productResults = useMemo(() => {
        if (!normalizedQuery) return [];
        return products
            .filter((product) =>
                product.name.toLowerCase().includes(normalizedQuery) ||
                product.category.toLowerCase().includes(normalizedQuery) ||
                product.origin?.toLowerCase().includes(normalizedQuery)
            )
            .slice(0, MAX_RESULTS);
    }, [products, normalizedQuery]);

    const customerResults = useMemo(() => {
        if (!normalizedQuery) return [];
        return customers
            .filter((customer) =>
                (customer.name ?? "").toLowerCase().includes(normalizedQuery) ||
                customer.email.toLowerCase().includes(normalizedQuery) ||
                (customer.phone ?? "").toLowerCase().includes(normalizedQuery)
            )
            .slice(0, MAX_RESULTS);
    }, [customers, normalizedQuery]);

    const requestResults = useMemo(() => {
        if (!normalizedQuery) return [];
        return requests
            .filter((request) =>
                request.customerName.toLowerCase().includes(normalizedQuery) ||
                request.customerPhone.toLowerCase().includes(normalizedQuery) ||
                request.description.toLowerCase().includes(normalizedQuery)
            )
            .slice(0, MAX_RESULTS);
    }, [requests, normalizedQuery]);

    const hasResults =
        orderResults.length > 0 ||
        productResults.length > 0 ||
        customerResults.length > 0 ||
        requestResults.length > 0;

    const handleFocus = () => {
        setIsOpen(true);
    };

    const handleClear = () => {
        setQuery("");
    };

    const handleClose = () => {
        setIsOpen(false);
        setQuery("");
    };

    return (
        <div ref={containerRef} className="relative w-full max-w-xl">
            <div className="relative">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-dark/30" />
                <input
                    type="text"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    onFocus={handleFocus}
                    placeholder="Search orders, customers, products, requests..."
                    className="h-11 w-full rounded-2xl border border-secondary/10 bg-secondary/5 pl-11 pr-10 text-sm text-dark placeholder:text-dark/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent/20"
                />
                {query.length > 0 ? (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-dark/30 hover:text-dark/60"
                        aria-label="Clear search"
                    >
                        <X className="h-4 w-4" />
                    </button>
                ) : null}
            </div>

            {isOpen ? (
                <div className="absolute left-0 right-0 top-full z-50 mt-2 rounded-2xl border border-secondary/10 bg-white shadow-2xl shadow-dark/10">
                    {loading ? (
                        <div className="p-6 text-sm text-dark/40">Loading search data...</div>
                    ) : query.trim().length === 0 ? (
                        <div className="p-5">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-dark/30">Quick Links</p>
                            <div className="mt-3 grid grid-cols-2 gap-2">
                                {[
                                    { label: "Orders", href: "/admin/orders" },
                                    { label: "Products", href: "/admin/products" },
                                    { label: "Customers", href: "/admin/customers" },
                                    { label: "Requests", href: "/admin/custom-requests" },
                                ].map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={handleClose}
                                        className="rounded-xl border border-secondary/10 px-3 py-2 text-xs font-bold text-dark/60 hover:bg-secondary/5"
                                    >
                                        {item.label}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ) : hasResults ? (
                        <div className="max-h-[70vh] overflow-y-auto">
                            {orderResults.length > 0 ? (
                                <div className="p-4">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-dark/30">Orders</p>
                                    <div className="mt-2 flex flex-col gap-1">
                                        {orderResults.map((order) => (
                                            <Link
                                                key={order.id}
                                                href={`/admin/orders/${order.id}`}
                                                onClick={handleClose}
                                                className="flex items-center gap-3 rounded-xl p-2 hover:bg-secondary/5"
                                            >
                                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
                                                    <Receipt className="h-4 w-4" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-bold text-dark">{order.orderNumber}</p>
                                                    <p className="text-xs text-dark/40">{order.customerName} • {order.total.toLocaleString()} ETB</p>
                                                </div>
                                                <ArrowRight className="h-4 w-4 text-dark/20" />
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            ) : null}

                            {productResults.length > 0 ? (
                                <div className={cn("p-4", orderResults.length > 0 ? "border-t border-secondary/10" : "") }>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-dark/30">Products</p>
                                    <div className="mt-2 flex flex-col gap-1">
                                        {productResults.map((product) => (
                                            <Link
                                                key={product.id}
                                                href={`/admin/products/${product.id}/edit`}
                                                onClick={handleClose}
                                                className="flex items-center gap-3 rounded-xl p-2 hover:bg-secondary/5"
                                            >
                                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/10 text-dark/40">
                                                    {product.image ? (
                                                        <img src={product.image} alt={product.name} className="h-full w-full rounded-xl object-cover" />
                                                    ) : (
                                                        <ShoppingBag className="h-4 w-4" />
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-bold text-dark">{product.name}</p>
                                                    <p className="text-xs text-dark/40">{product.category}</p>
                                                </div>
                                                <ArrowRight className="h-4 w-4 text-dark/20" />
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            ) : null}

                            {customerResults.length > 0 ? (
                                <div className={cn("p-4", orderResults.length > 0 || productResults.length > 0 ? "border-t border-secondary/10" : "") }>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-dark/30">Customers</p>
                                    <div className="mt-2 flex flex-col gap-1">
                                        {customerResults.map((customer) => (
                                            <Link
                                                key={customer.id}
                                                href="/admin/customers"
                                                onClick={handleClose}
                                                className="flex items-center gap-3 rounded-xl p-2 hover:bg-secondary/5"
                                            >
                                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
                                                    <Users className="h-4 w-4" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-bold text-dark">{customer.name || customer.email}</p>
                                                    <p className="text-xs text-dark/40">{customer.email}</p>
                                                </div>
                                                <ArrowRight className="h-4 w-4 text-dark/20" />
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            ) : null}

                            {requestResults.length > 0 ? (
                                <div className={cn("p-4", orderResults.length > 0 || productResults.length > 0 || customerResults.length > 0 ? "border-t border-secondary/10" : "") }>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-dark/30">Requests</p>
                                    <div className="mt-2 flex flex-col gap-1">
                                        {requestResults.map((request) => (
                                            <Link
                                                key={request.id}
                                                href="/admin/custom-requests"
                                                onClick={handleClose}
                                                className="flex items-center gap-3 rounded-xl p-2 hover:bg-secondary/5"
                                            >
                                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/10 text-dark/50">
                                                    <ClipboardList className="h-4 w-4" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-bold text-dark">{request.customerName}</p>
                                                    <p className="text-xs text-dark/40">{request.status} • {request.customerPhone}</p>
                                                </div>
                                                <ArrowRight className="h-4 w-4 text-dark/20" />
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    ) : (
                        <div className="p-6 text-center">
                            <p className="text-sm font-bold text-dark/40">No results found</p>
                            <p className="text-xs text-dark/30 mt-1">Try a different search term.</p>
                        </div>
                    )}
                </div>
            ) : null}
        </div>
    );
}
