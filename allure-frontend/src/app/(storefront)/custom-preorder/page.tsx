"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Send, Link as LinkIcon, Image as ImageIcon, CheckCircle2, ChevronLeft, X, Sparkles, Phone, User, Globe } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { submitCustomRequest } from "@/services/customRequestService";
import { usePersistentDraft } from "@/hooks/usePersistentDraft";
import { AutosaveIndicator } from "@/components/ui/autosave-indicator";

export default function CustomPreorderPage() {
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [previews, setPreviews] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const previewsRef = useRef<string[]>([]);

    const [formData, setFormData] = useState({
        customerName: "",
        customerPhone: "",
        itemLink: "",
        description: ""
    });

    const handleRestore = useCallback((draft: typeof formData) => {
        setFormData((prev) => ({ ...prev, ...draft }));
    }, []);

    const { saveState, restored, clearDraft } = usePersistentDraft({
        storageKey: "allure-custom-request-draft-v1",
        value: formData,
        onRestore: handleRestore,
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const filesArray = Array.from(e.target.files);
            const newPreviews = filesArray.map(file => URL.createObjectURL(file));
            setPreviews(prev => [...prev, ...newPreviews]);
        }
    };

    const removePreview = (index: number) => {
        setPreviews(prev => {
            const updated = [...prev];
            URL.revokeObjectURL(updated[index]);
            updated.splice(index, 1);
            return updated;
        });
    };

    useEffect(() => {
        previewsRef.current = previews;
    }, [previews]);

    // Clean up object URLs on unmount
    useEffect(() => {
        return () => {
            previewsRef.current.forEach((url) => URL.revokeObjectURL(url));
        };
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await submitCustomRequest(formData);
            setSubmitted(true);
            clearDraft();
            window.scrollTo({ top: 0, behavior: "smooth" });
        } catch {
            setError("Failed to send request. Please check your connection and try again.");
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="container mx-auto max-w-2xl px-4 py-24 text-center">
                <div className="flex flex-col items-center gap-10 animate-slide-up-fade">
                    <div className="relative">
                        <div className="bg-primary/30 p-10 rounded-full shadow-2xl shadow-primary/20 relative">
                            <CheckCircle2 className="h-20 w-20 text-accent" />
                            <div className="absolute -top-2 -right-2 h-10 w-10 rounded-full bg-white flex items-center justify-center text-xl shadow-lg">✨</div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-3">
                        <h1 className="font-display text-5xl font-bold text-dark tracking-tight">We Got Your Order!</h1>
                        <p className="text-dark/60 text-lg max-w-md mx-auto italic">"Your style, delivered to your door."</p>
                    </div>

                    <div className="rounded-[3rem] bg-white p-10 text-left flex flex-col gap-8 shadow-2xl shadow-secondary/10 border border-secondary/10 w-full">
                        <div className="flex flex-col gap-2 text-center">
                            <h3 className="font-display font-bold text-2xl text-dark">What Happens Next?</h3>
                            <p className="text-sm text-dark/70 leading-relaxed px-4">
                                Our team will reach out to you on <span className="font-bold text-accent">Phone, Telegram, or your preferred social media</span> to confirm your order, share the price, and give you a delivery date.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Link href="/catalog" className="w-full">
                                <Button variant="outline" size="lg" className="w-full h-16 rounded-2xl font-bold border-2 border-secondary/20 transition-all hover:bg-secondary/5">
                                    Browse Catalog
                                </Button>
                            </Link>
                            <Link href="/" className="w-full">
                                <Button variant="primary" size="lg" className="w-full h-16 rounded-2xl font-bold shadow-lg shadow-primary/10 transition-all hover:scale-[1.02]">
                                    Return Home
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-cream px-4 py-12 md:py-20">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary/10 to-transparent hidden lg:block" />
                <div className="container mx-auto px-4 relative z-10">
                    <Link href="/catalog" className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-dark/60 hover:text-accent transition-colors">
                        <ChevronLeft className="h-4 w-4" /> Back to Catalog
                    </Link>

                    <div className="max-w-3xl animate-slide-up-fade">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-secondary/20 shadow-sm mb-6">
                            <Sparkles className="h-4 w-4 text-accent" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-dark/70">Order Any Item You Want</span>
                        </div>
                        <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-dark mb-8 leading-[1.1] tracking-tight">
                            Custom Preorder <br />
                            <span className="text-accent italic">Request</span>
                        </h1>
                        <p className="max-w-xl text-base text-dark/60 md:text-lg lg:text-xl leading-relaxed">
                            Want something from <span className="text-dark font-bold underline decoration-accent/30">SHEIN</span>, an online store, or a <span className="text-dark font-bold underline decoration-accent/30">local shop</span>? Just tell us what you need and we'll get it for you.
                        </p>
                    </div>
                </div>
            </section>

            <div className="container mx-auto px-4 py-10 md:py-16">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
                    {/* Instructions & Features */}
                    <div className="lg:col-span-12 xl:col-span-5 flex flex-col gap-12">
                        <div className="flex flex-col gap-10">
                            <div>
                                <h2 className="font-display text-3xl font-bold text-dark mb-4 tracking-tight md:text-4xl">How It Works</h2>
                                <p className="text-sm text-dark/60 md:text-base">Simple steps to get what you want.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-1 gap-6">
                                <div className="group p-8 rounded-[2.5rem] bg-white border border-secondary/20 shadow-sm hover:shadow-xl transition-all duration-500">
                                    <div className="flex items-center gap-6">
                                        <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition-all duration-500">
                                            <LinkIcon className="h-8 w-8" />
                                        </div>
                                        <div>
                                            <h3 className="font-display text-lg font-bold text-dark">Send Us Your Order</h3>
                                            <p className="text-xs text-dark/60 leading-relaxed md:text-sm mt-1">Share a link or upload a photo of the item you want.</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="group p-8 rounded-[2.5rem] bg-white border border-secondary/20 shadow-sm hover:shadow-xl transition-all duration-500">
                                    <div className="flex items-center gap-6">
                                        <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition-all duration-500">
                                            <Globe className="h-8 w-8" />
                                        </div>
                                        <div>
                                            <h3 className="font-display text-lg font-bold text-dark">We Check & Quote</h3>
                                            <p className="text-xs text-dark/60 leading-relaxed md:text-sm mt-1">We find your item, check the price, and message you back.</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="group p-8 rounded-[2.5rem] bg-white border border-secondary/20 shadow-sm hover:shadow-xl transition-all duration-500">
                                    <div className="flex items-center gap-6">
                                        <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition-all duration-500">
                                            <Truck className="h-8 w-8" />
                                        </div>
                                        <div>
                                            <h3 className="font-display text-lg font-bold text-dark">Pay & Receive</h3>
                                            <p className="text-xs text-dark/60 leading-relaxed md:text-sm mt-1">Pay a small deposit and get your item in 7–14 days.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-[2.5rem] bg-dark p-10 text-white shadow-2xl relative overflow-hidden group">
                            <div className="absolute -right-4 -top-4 text-white/5 rotate-12 transition-transform group-hover:rotate-6">
                                <Sparkles className="h-32 w-32" />
                            </div>
                            <h4 className="font-display font-bold text-xl md:text-2xl mb-4 relative z-10">Our Promise</h4>
                            <p className="text-white/60 text-xs md:text-sm leading-relaxed relative z-10">
                                We take care of everything — finding, ordering, and delivering. If we can't get your exact item or it arrives damaged, you get a full refund.
                            </p>
                        </div>
                    </div>

                    {/* Request Form */}
                    <div className="lg:col-span-12 xl:col-span-7">
                        <div className="rounded-[3rem] bg-white p-8 md:p-12 shadow-2xl shadow-secondary/10 border border-secondary/10 animate-slide-up-fade [animation-delay:200ms]">
                            <form className="flex flex-col gap-10" onSubmit={handleSubmit}>
                                <AutosaveIndicator saveState={saveState} restored={restored} />
                                {error && (
                                    <div className="p-5 bg-red-50 text-red-600 rounded-2xl text-sm font-medium border border-red-100 italic animate-shake">
                                        {error}
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="flex flex-col gap-3">
                                        <label className="text-xs font-black uppercase tracking-[0.2em] text-dark/40 ml-1">Your Name</label>
                                        <div className="relative group">
                                            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-dark/20 group-focus-within:text-accent transition-colors">
                                                <User className="h-5 w-5" />
                                            </div>
                                            <input
                                                required
                                                type="text"
                                                value={formData.customerName}
                                                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                                                placeholder="e.g. Abebe Kebede"
                                                className="h-16 w-full rounded-2xl border-2 border-secondary/10 bg-white pl-16 pr-6 text-sm text-dark focus:border-accent focus:outline-none transition-all shadow-sm"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-3">
                                        <label className="text-xs font-black uppercase tracking-[0.2em] text-dark/40 ml-1">Phone / Telegram</label>
                                        <div className="relative group">
                                            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-dark/20 group-focus-within:text-accent transition-colors">
                                                <Phone className="h-5 w-5" />
                                            </div>
                                            <input
                                                required
                                                type="tel"
                                                value={formData.customerPhone}
                                                onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                                                placeholder="e.g. 0911 223 344"
                                                className="h-16 w-full rounded-2xl border-2 border-secondary/10 bg-white pl-16 pr-6 text-sm text-dark focus:border-accent focus:outline-none transition-all shadow-sm"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3">
                                    <label className="text-xs font-black uppercase tracking-[0.2em] text-dark/40 ml-1">Item Link (If you have one)</label>
                                    <div className="relative group">
                                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-dark/20 group-focus-within:text-accent transition-colors">
                                            <LinkIcon className="h-5 w-5" />
                                        </div>
                                        <input
                                            type="url"
                                            value={formData.itemLink}
                                            onChange={(e) => setFormData({ ...formData, itemLink: e.target.value })}
                                            placeholder="e.g. https://shein.com/item-link"
                                            className="h-16 w-full rounded-2xl border-2 border-secondary/10 bg-white pl-16 pr-6 text-sm text-dark focus:border-accent focus:outline-none transition-all shadow-sm"
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3">
                                    <label className="text-xs font-black uppercase tracking-[0.2em] text-dark/40 ml-1">What Do You Want?</label>
                                    <textarea
                                        required
                                        rows={4}
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Tell us what you need — size, color, brand, how many..."
                                        className="rounded-3xl border-2 border-secondary/10 bg-white p-6 text-sm text-dark focus:border-accent focus:outline-none transition-all shadow-sm resize-none"
                                    />
                                </div>

                                <div className="flex flex-col gap-3">
                                    <label className="text-xs font-black uppercase tracking-[0.2em] text-dark/40 ml-1">Add Photos (Optional)</label>
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="group cursor-pointer min-h-[160px] rounded-3xl border-2 border-dashed border-secondary/20 flex flex-col items-center justify-center gap-4 text-dark/30 bg-secondary/5 hover:bg-secondary/10 hover:border-accent transition-all animate-pulse-slow"
                                    >
                                        <input
                                            type="file"
                                            multiple
                                            className="hidden"
                                            ref={fileInputRef}
                                            onChange={handleFileChange}
                                            accept="image/*"
                                        />
                                        <div className="h-16 w-16 rounded-full bg-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                                            <ImageIcon className="h-8 w-8 text-accent/40 group-hover:text-accent transition-colors" />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sm font-bold text-dark/60">Tap here to add photos</p>
                                            <p className="text-[10px] font-medium uppercase tracking-widest mt-1">Max 5MB per photo</p>
                                        </div>
                                    </div>

                                    {/* Image Previews */}
                                    {previews.length > 0 && (
                                        <div className="flex flex-wrap gap-4 mt-2">
                                            {previews.map((url, index) => (
                                                <div key={url} className="relative h-24 w-24 rounded-2xl overflow-hidden shadow-md group animate-in zoom-in-75">
                                                    <Image src={url} alt={`Preview ${index}`} fill className="object-cover" />
                                                    <button
                                                        type="button"
                                                        onClick={(e) => { e.stopPropagation(); removePreview(index); }}
                                                        className="absolute top-1 right-1 h-6 w-6 bg-black/50 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <Button
                                    variant="primary"
                                    size="lg"
                                    className="h-16 rounded-2xl gap-3 text-lg font-bold shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] mt-4"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <div className="flex items-center gap-3">
                                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                            <span>Sending...</span>
                                        </div>
                                    ) : (
                                        <>
                                            Send My Order <Send className="h-5 w-5" />
                                        </>
                                    )}
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const Truck = ({ className }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 17h4V5H2v12h3" /><path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L17 7h-3v10" /><circle cx="7.5" cy="17.5" r="2.5" /><circle cx="17.5" cy="17.5" r="2.5" /></svg>
)
