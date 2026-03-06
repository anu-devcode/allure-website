"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { User, LogOut, ShoppingBag, LayoutDashboard, Package, Sparkles, Search, LogIn, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCustomerAuth } from "@/store/useCustomerAuth";
import { useRouter } from "next/navigation";

export function AccountDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const user = useCustomerAuth((s) => s.user);
    const isAuthenticated = useCustomerAuth((s) => s.isAuthenticated);
    const logout = useCustomerAuth((s) => s.logout);
    const router = useRouter();

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = () => {
        logout();
        setIsOpen(false);
        router.push("/");
    };

    if (!mounted) {
        return (
            <button className="flex h-9 w-9 items-center justify-center rounded-full text-dark/70 hover:bg-secondary/10 hover:text-accent transition-all">
                <User className="h-5 w-5" />
            </button>
        );
    }

    return (
        <div ref={dropdownRef} className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full transition-all duration-200",
                    isOpen
                        ? "bg-accent text-white shadow-md"
                        : isAuthenticated
                            ? "bg-accent/10 text-accent hover:bg-accent hover:text-white"
                            : "text-dark/70 hover:bg-secondary/10 hover:text-accent"
                )}
                aria-label="Account"
            >
                {isAuthenticated && user ? (
                    <span className="text-xs font-bold">{user.name.charAt(0).toUpperCase()}</span>
                ) : (
                    <User className="h-5 w-5" />
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl bg-white border border-secondary/10 shadow-2xl shadow-dark/10 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    {isAuthenticated && user ? (
                        <>
                            {/* User Info */}
                            <div className="p-4 border-b border-secondary/10 bg-secondary/5">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                                        <span className="font-display text-sm font-bold text-accent">
                                            {user.name.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-dark truncate">{user.name}</p>
                                        <p className="text-xs text-dark/40 truncate">{user.email}</p>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Menu Items */}
                            <div className="p-2">
                                <Link
                                    href="/account"
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center gap-3 w-full p-2.5 rounded-xl hover:bg-secondary/5 transition-colors text-left group"
                                >
                                    <div className="h-8 w-8 rounded-lg bg-accent/5 flex items-center justify-center group-hover:bg-accent/10 transition-colors flex-shrink-0">
                                        <LayoutDashboard className="h-4 w-4 text-accent/50" />
                                    </div>
                                    <span className="text-sm font-medium text-dark">My Account</span>
                                </Link>

                                <Link
                                    href="/account/orders"
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center gap-3 w-full p-2.5 rounded-xl hover:bg-secondary/5 transition-colors text-left group"
                                >
                                    <div className="h-8 w-8 rounded-lg bg-accent/5 flex items-center justify-center group-hover:bg-accent/10 transition-colors flex-shrink-0">
                                        <Search className="h-4 w-4 text-accent/50" />
                                    </div>
                                    <span className="text-sm font-medium text-dark">Track Orders</span>
                                </Link>

                                <Link
                                    href="/account/orders"
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center gap-3 w-full p-2.5 rounded-xl hover:bg-secondary/5 transition-colors text-left group"
                                >
                                    <div className="h-8 w-8 rounded-lg bg-accent/5 flex items-center justify-center group-hover:bg-accent/10 transition-colors flex-shrink-0">
                                        <Package className="h-4 w-4 text-accent/50" />
                                    </div>
                                    <span className="text-sm font-medium text-dark">My Orders</span>
                                </Link>

                                <Link
                                    href="/cart"
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center gap-3 w-full p-2.5 rounded-xl hover:bg-secondary/5 transition-colors text-left group"
                                >
                                    <div className="h-8 w-8 rounded-lg bg-accent/5 flex items-center justify-center group-hover:bg-accent/10 transition-colors flex-shrink-0">
                                        <ShoppingBag className="h-4 w-4 text-accent/50" />
                                    </div>
                                    <span className="text-sm font-medium text-dark">My Cart</span>
                                </Link>

                                <Link
                                    href="/custom-preorder"
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center gap-3 w-full p-2.5 rounded-xl hover:bg-secondary/5 transition-colors text-left group"
                                >
                                    <div className="h-8 w-8 rounded-lg bg-accent/5 flex items-center justify-center group-hover:bg-accent/10 transition-colors flex-shrink-0">
                                        <Sparkles className="h-4 w-4 text-accent/50" />
                                    </div>
                                    <span className="text-sm font-medium text-dark">Custom Order</span>
                                </Link>
                            </div>

                            {/* Logout */}
                            <div className="p-2 border-t border-secondary/10">
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-3 w-full p-2.5 rounded-xl hover:bg-red-50 transition-colors text-left group"
                                >
                                    <div className="h-8 w-8 rounded-lg bg-red-50 flex items-center justify-center group-hover:bg-red-100 transition-colors flex-shrink-0">
                                        <LogOut className="h-4 w-4 text-red-400" />
                                    </div>
                                    <span className="text-sm font-medium text-red-500">Sign Out</span>
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="p-4 border-b border-secondary/10 bg-secondary/5">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                                        <User className="h-5 w-5 text-accent" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-dark truncate">Welcome</p>
                                        <p className="text-xs text-dark/40 truncate">Sign in, create an account, or track an order</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-2">
                                <Link
                                    href="/track-order"
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center gap-3 w-full p-2.5 rounded-xl hover:bg-secondary/5 transition-colors text-left group"
                                >
                                    <div className="h-8 w-8 rounded-lg bg-accent/5 flex items-center justify-center group-hover:bg-accent/10 transition-colors flex-shrink-0">
                                        <Search className="h-4 w-4 text-accent/50" />
                                    </div>
                                    <span className="text-sm font-medium text-dark">Track Order</span>
                                </Link>

                                <Link
                                    href="/auth"
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center gap-3 w-full p-2.5 rounded-xl hover:bg-secondary/5 transition-colors text-left group"
                                >
                                    <div className="h-8 w-8 rounded-lg bg-accent/5 flex items-center justify-center group-hover:bg-accent/10 transition-colors flex-shrink-0">
                                        <LogIn className="h-4 w-4 text-accent/50" />
                                    </div>
                                    <span className="text-sm font-medium text-dark">Sign In</span>
                                </Link>

                                <Link
                                    href="/auth"
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center gap-3 w-full p-2.5 rounded-xl hover:bg-secondary/5 transition-colors text-left group"
                                >
                                    <div className="h-8 w-8 rounded-lg bg-accent/5 flex items-center justify-center group-hover:bg-accent/10 transition-colors flex-shrink-0">
                                        <UserPlus className="h-4 w-4 text-accent/50" />
                                    </div>
                                    <span className="text-sm font-medium text-dark">Create Account</span>
                                </Link>

                                <Link
                                    href="/cart"
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center gap-3 w-full p-2.5 rounded-xl hover:bg-secondary/5 transition-colors text-left group"
                                >
                                    <div className="h-8 w-8 rounded-lg bg-accent/5 flex items-center justify-center group-hover:bg-accent/10 transition-colors flex-shrink-0">
                                        <ShoppingBag className="h-4 w-4 text-accent/50" />
                                    </div>
                                    <span className="text-sm font-medium text-dark">My Cart</span>
                                </Link>

                                <Link
                                    href="/custom-preorder"
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center gap-3 w-full p-2.5 rounded-xl hover:bg-secondary/5 transition-colors text-left group"
                                >
                                    <div className="h-8 w-8 rounded-lg bg-accent/5 flex items-center justify-center group-hover:bg-accent/10 transition-colors flex-shrink-0">
                                        <Sparkles className="h-4 w-4 text-accent/50" />
                                    </div>
                                    <span className="text-sm font-medium text-dark">Custom Order</span>
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
