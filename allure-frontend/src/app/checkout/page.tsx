"use client";

import { useState } from "react";
import { useCartStore } from "@/store/useCartStore";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ChevronLeft, CreditCard, Banknote, Smartphone, Package, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function CheckoutPage() {
    const { items, getTotalPrice, clearCart } = useCartStore();
    const [step, setStep] = useState(1); // 1: Info, 2: Payment Instructions

    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        city: "Addis Ababa",
    });

    if (items.length === 0 && step === 1) {
        return (
            <div className="container mx-auto px-4 py-24 text-center">
                <h1 className="text-2xl font-bold">Nothing to checkout</h1>
                <Link href="/catalog"><Button className="mt-4">Back to Catalog</Button></Link>
            </div>
        );
    }

    const handleNext = (e: React.FormEvent) => {
        e.preventDefault();
        setStep(2);
    };

    const handleFinish = () => {
        clearCart();
        // In real app, send data to backend here
    };

    if (step === 2) {
        return (
            <div className="container mx-auto max-w-2xl px-4 py-16">
                <div className="flex flex-col gap-8 text-center">
                    <div className="flex justify-center">
                        <div className="bg-primary/30 p-8 rounded-full shadow-lg shadow-primary/20">
                            <CheckCircle2 className="h-16 w-16 text-accent" />
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <h1 className="font-display text-5xl font-bold text-dark">Order Received!</h1>
                        <p className="text-dark/60 text-lg">Thank you {formData.name}, your order has been registered.</p>
                        <p className="text-accent font-bold">Order #: ORD-{Math.floor(Math.random() * 9000) + 1000}</p>
                    </div>

                    <div className="rounded-4xl bg-white p-8 text-left flex flex-col gap-8 shadow-2xl shadow-secondary/10 border border-secondary/10">
                        <div className="flex flex-col gap-3">
                            <h3 className="font-bold text-2xl text-dark">How to Pay</h3>
                            <p className="text-sm text-dark/70 leading-relaxed">
                                To confirm your order, please complete the manual payment below.
                                <span className="block mt-2 font-bold text-accent">IMPORTANT: Send a screenshot of your payment to +251 911 223 344 (Telegram/WhatsApp) to avoid order cancellation.</span>
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            <div className="flex items-center gap-5 p-5 rounded-3xl border-2 border-primary/20 bg-primary/5 hover:border-accent/40 transition-all cursor-pointer">
                                <div className="h-14 w-14 bg-white rounded-2xl flex items-center justify-center text-accent shadow-sm"><Smartphone className="h-7 w-7" /></div>
                                <div>
                                    <p className="font-bold text-lg text-dark">Telebirr</p>
                                    <p className="text-sm text-dark/60 font-medium">0911 223 344 (Allure Online / Abebe K.)</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-5 p-5 rounded-3xl border-2 border-primary/20 bg-primary/5 hover:border-accent/40 transition-all cursor-pointer">
                                <div className="h-14 w-14 bg-white rounded-2xl flex items-center justify-center text-accent shadow-sm"><CreditCard className="h-7 w-7" /></div>
                                <div>
                                    <p className="font-bold text-lg text-dark">CBE (Commercial Bank)</p>
                                    <p className="text-sm text-dark/60 font-medium">1000123456789 (Allure Online / Abebe K.)</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-accent/5 p-6 rounded-3xl border border-accent/10">
                            <p className="text-xs font-black text-accent uppercase tracking-[0.2em] mb-2">Summary</p>
                            <div className="flex justify-between items-center">
                                <p className="text-dark/70">Total to pay:</p>
                                <p className="text-2xl font-black text-accent">{getTotalPrice().toLocaleString()} ETB</p>
                            </div>
                            <p className="text-sm text-dark/60 mt-1">Delivery to: {formData.city}</p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        <Link href="/" onClick={handleFinish}>
                            <Button variant="primary" size="lg" className="w-full h-14 rounded-2xl">Confirm & Return Home</Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto max-w-2xl px-4 py-16">
            <Link href="/cart" className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-dark/60 hover:text-accent">
                <ChevronLeft className="h-4 w-4" /> Back to Cart
            </Link>

            <h1 className="font-display text-4xl font-bold text-dark mb-4">Checkout</h1>
            <p className="text-dark/60 mb-12">Please provide your information to complete the order.</p>

            <form onSubmit={handleNext} className="flex flex-col gap-8">
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-dark/80">Full Name</label>
                        <input
                            required
                            type="text"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Enter your name"
                            className="h-14 rounded-2xl border border-secondary/20 bg-white px-6 text-dark focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-dark/80">Phone Number</label>
                        <input
                            required
                            type="tel"
                            value={formData.phone}
                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="09..."
                            className="h-14 rounded-2xl border border-secondary/20 bg-white px-6 text-dark focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-dark/80">City</label>
                        <select
                            value={formData.city}
                            onChange={e => setFormData({ ...formData, city: e.target.value })}
                            className="h-14 rounded-2xl border border-secondary/20 bg-white px-6 text-dark focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent appearance-none bg-no-repeat bg-right"
                        >
                            <option>Addis Ababa</option>
                            <option>Other (Negotiated Delivery)</option>
                        </select>
                    </div>
                </div>

                <div className="rounded-3xl bg-secondary/5 p-8 flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                        <span className="text-dark font-medium">Order Total</span>
                        <span className="text-2xl font-bold text-accent">{getTotalPrice().toLocaleString()} ETB</span>
                    </div>
                    <Button type="submit" variant="primary" size="lg" className="w-full h-14 rounded-2xl gap-2 text-lg">
                        Register Order <ArrowRight className="h-5 w-5" />
                    </Button>
                </div>
            </form>
        </div>
    );
}
