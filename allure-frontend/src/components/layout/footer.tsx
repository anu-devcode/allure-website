"use client";

import Link from "next/link";
import { Facebook, Instagram, Twitter } from "lucide-react";
import { useStorefrontCms } from "@/components/providers/storefront-cms-provider";

export function Footer() {
    const { content } = useStorefrontCms();
    const footer = content.footer;

    return (
        <footer className="w-full border-t border-secondary/20 bg-white">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
                    {/* Brand Info */}
                    <div className="flex flex-col gap-4">
                        <h3 className="font-display text-xl font-bold text-accent">Allure</h3>
                        <p className="text-sm text-dark/60">
                            {footer.brandDescription}
                        </p>
                        <div className="flex gap-4">
                            <Link href={footer.instagramUrl || "#"} className="text-dark/40 hover:text-accent">
                                <Instagram className="h-5 w-5" />
                            </Link>
                            <Link href={footer.facebookUrl || "#"} className="text-dark/40 hover:text-accent">
                                <Facebook className="h-5 w-5" />
                            </Link>
                            <Link href={footer.twitterUrl || "#"} className="text-dark/40 hover:text-accent">
                                <Twitter className="h-5 w-5" />
                            </Link>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-dark/80">
                            Shopping
                        </h4>
                        <ul className="flex flex-col gap-2 text-sm text-dark/60">
                            <li><Link href="/catalog" className="hover:text-accent">New Arrivals</Link></li>
                            <li><Link href="/catalog" className="hover:text-accent">Best Sellers</Link></li>
                            <li><Link href="/catalog" className="hover:text-accent">Featured</Link></li>
                            <li><Link href="/catalog" className="hover:text-accent">Pre-Order</Link></li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-dark/80">
                            Support
                        </h4>
                        <ul className="flex flex-col gap-2 text-sm text-dark/60">
                            <li><Link href="/contact" className="hover:text-accent">Contact Us</Link></li>
                            <li><Link href="/track-order" className="hover:text-accent">Track Order</Link></li>
                            <li><Link href="/rules" className="hover:text-accent">Delivery Rules</Link></li>
                            <li><Link href="/terms" className="hover:text-accent">Terms & Conditions</Link></li>
                            <li><Link href="/about" className="hover:text-accent">About Us</Link></li>
                        </ul>
                    </div>

                    {/* Contact Details */}
                    <div>
                        <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-dark/80">
                            Find Us
                        </h4>
                        <address className="not-italic text-sm text-dark/60">
                            <p>{footer.addressLineOne}</p>
                            <p className="mt-2">Phone: {footer.phone}</p>
                            <p className="mt-1">Email: {footer.email}</p>
                        </address>
                    </div>
                </div>

                <div className="mt-12 border-t border-secondary/10 pt-8 text-center text-xs text-dark/40">
                    <p>© {new Date().getFullYear()} Allure Online Shopping. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
