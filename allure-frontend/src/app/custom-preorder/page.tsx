"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Send, Link as LinkIcon, Image as ImageIcon, CheckCircle2, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { submitCustomRequest } from "@/services/customRequestService";

export default function CustomPreorderPage() {
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        customerName: "",
        customerPhone: "",
        itemLink: "",
        description: ""
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await submitCustomRequest(formData);
            setSubmitted(true);
        } catch (err) {
            setError("Failed to send request. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="container mx-auto max-w-2xl px-4 py-24 text-center">
                <div className="flex justify-center mb-8">
                    <div className="bg-primary/30 p-8 rounded-full shadow-lg shadow-primary/20">
                        <CheckCircle2 className="h-16 w-16 text-accent" />
                    </div>
                </div>
                <h1 className="font-display text-5xl font-bold text-dark mb-4">Request Sent!</h1>
                <p className="text-dark/60 text-lg mb-12">
                    We've received your request. Our team will check the availability and price,
                    then contact you on your phone with a quote.
                </p>
                <div className="flex flex-col gap-4">
                    <Link href="/catalog">
                        <Button variant="primary" size="lg" className="w-full h-14 rounded-2xl">Browse More</Button>
                    </Link>
                    <Link href="/">
                        <Button variant="outline" size="lg" className="w-full h-14 rounded-2xl">Return Home</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto max-w-4xl px-4 py-16 sm:py-24">
            <Link href="/catalog" className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-dark/60 hover:text-accent">
                <ChevronLeft className="h-4 w-4" /> Back to Catalog
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                <div className="flex flex-col gap-8">
                    <div>
                        <h1 className="font-display text-5xl font-bold text-dark mb-6 leading-tight">
                            Found something on <span className="text-accent underline decoration-primary/30">SHEIN</span> or elsewhere?
                        </h1>
                        <p className="text-dark/60 text-lg leading-relaxed">
                            We special-order items for you! Just send us the link or a photo, and we'll handle the sourcing, shipping, and delivery to your doorstep in Addis.
                        </p>
                    </div>

                    <div className="flex flex-col gap-6">
                        <div className="flex gap-4 items-center">
                            <div className="h-12 w-12 bg-primary/20 rounded-2xl flex items-center justify-center text-accent shrink-0">
                                <LinkIcon className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-dark">Send the Link</h3>
                                <p className="text-sm text-dark/60">Paste the product URL from SHEIN, Turkey sites, etc.</p>
                            </div>
                        </div>
                        <div className="flex gap-4 items-center">
                            <div className="h-12 w-12 bg-primary/20 rounded-2xl flex items-center justify-center text-accent shrink-0">
                                <ImageIcon className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-dark">Upload a Photo</h3>
                                <p className="text-sm text-dark/60">Found it on Instagram? Send us the screenshot.</p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-3xl bg-secondary/5 p-8 border border-secondary/10">
                        <h4 className="font-bold text-dark mb-2 italic">"How it works?"</h4>
                        <p className="text-sm text-dark/60">
                            1. Submit request → 2. We send you the price → 3. Pay deposit → 4. Get it in 7-14 days.
                        </p>
                    </div>
                </div>

                <div className="rounded-4xl bg-white p-8 shadow-2xl shadow-secondary/5 border border-secondary/10">
                    <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-medium border border-red-100 italic">
                                {error}
                            </div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold text-dark/80">Full Name</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.customerName}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, customerName: e.target.value })}
                                    placeholder="Your Name"
                                    className="h-14 rounded-2xl border border-secondary/20 bg-white px-6 text-dark focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold text-dark/80">Phone Number</label>
                                <input
                                    required
                                    type="tel"
                                    value={formData.customerPhone}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, customerPhone: e.target.value })}
                                    placeholder="09..."
                                    className="h-14 rounded-2xl border border-secondary/20 bg-white px-6 text-dark focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-bold text-dark/80">Product Link (Optional)</label>
                            <input
                                type="url"
                                value={formData.itemLink}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, itemLink: e.target.value })}
                                placeholder="https://m.shein.com/..."
                                className="h-14 rounded-2xl border border-secondary/20 bg-white px-6 text-dark focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-bold text-dark/80">Details (Color, Size, etc.)</label>
                            <textarea
                                required
                                rows={4}
                                value={formData.description}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Tell us more about what you want..."
                                className="rounded-2xl border border-secondary/20 bg-white p-6 text-dark focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent resize-none"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-bold text-dark/80">Photos (Coming Soon)</label>
                            <div className="h-32 rounded-2xl border-2 border-dashed border-secondary/20 flex flex-col items-center justify-center gap-2 text-dark/30 bg-secondary/5">
                                <ImageIcon className="h-8 w-8" />
                                <span className="text-xs font-medium uppercase tracking-widest">Select files</span>
                            </div>
                        </div>

                        <Button
                            variant="primary"
                            size="lg"
                            className="h-14 rounded-2xl gap-2 text-lg mt-2"
                            disabled={loading}
                        >
                            {loading ? "Sending..." : "Submit Request"} <Send className="h-4 w-4" />
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
