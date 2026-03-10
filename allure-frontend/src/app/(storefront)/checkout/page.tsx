"use client";

import { useCallback, useState } from "react";
import { useCartStore } from "@/store/useCartStore";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ChevronLeft, CreditCard, Smartphone, Package, ArrowRight, MapPin, Phone, User } from "lucide-react";
import Link from "next/link";
import { orderService } from "@/services/orderService";
import { useCustomerAuth } from "@/store/useCustomerAuth";
import { usePersistentDraft } from "@/hooks/usePersistentDraft";
import { AutosaveIndicator } from "@/components/ui/autosave-indicator";
import { useStorefrontCms } from "@/components/providers/storefront-cms-provider";

export default function CheckoutPage() {
    const { content } = useStorefrontCms();
    const checkoutContent = content.checkout;
    const { items, getTotalPrice, clearCart } = useCartStore();
    const token = useCustomerAuth((s) => s.token);
    const [step, setStep] = useState(1); // 1: Info, 2: Payment, 3: Success
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [submittingOrder, setSubmittingOrder] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        city: "Addis Ababa",
    });

    const [orderId, setOrderId] = useState("");

    const handleRestore = useCallback((draft: typeof formData) => {
        setFormData((prev) => ({ ...prev, ...draft }));
    }, []);

    const { saveState, restored, clearDraft } = usePersistentDraft({
        storageKey: "allure-checkout-draft-v1",
        value: formData,
        onRestore: handleRestore,
    });

    const steps = [
        { id: 1, label: "Information", icon: User },
        { id: 2, label: "Payment", icon: CreditCard },
        { id: 3, label: "Confirmation", icon: CheckCircle2 },
    ];

    const StepVisualizer = () => (
        <div className="mb-12">
            <div className="flex items-center justify-between relative max-w-md mx-auto">
                {/* Progress Line Background */}
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-secondary/10 -translate-y-1/2 z-0" />

                {/* Active Progress Line */}
                <div
                    className="absolute top-1/2 left-0 h-0.5 bg-accent -translate-y-1/2 z-0 transition-all duration-500 ease-out"
                    style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
                />

                {steps.map((s) => {
                    const Icon = s.icon;
                    const isActive = step >= s.id;
                    const isCurrent = step === s.id;

                    return (
                        <div key={s.id} className="relative z-10 flex flex-col items-center gap-3">
                            <div
                                className={`h-12 w-12 rounded-full flex items-center justify-center transition-all duration-500 ${isActive
                                        ? "bg-accent text-white shadow-lg shadow-accent/20 scale-110"
                                        : "bg-white text-dark/30 border-2 border-secondary/10"
                                    }`}
                            >
                                <Icon className={`h-5 w-5 ${isCurrent ? "animate-pulse" : ""}`} />
                            </div>
                            <span className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors duration-500 ${isActive ? "text-dark" : "text-dark/20"
                                }`}>
                                {s.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );

    if (items.length === 0 && step < 3) {
        return (
            <div className="container mx-auto px-4 py-24 text-center">
                <div className="flex flex-col items-center gap-6 animate-slide-up-fade">
                    <div className="bg-secondary/10 p-8 rounded-full">
                        <Package className="h-16 w-16 text-accent/40" />
                    </div>
                    <h1 className="font-display text-3xl font-bold text-dark">{checkoutContent.emptyStateTitle}</h1>
                    <Link href="/catalog">
                        <Button className="mt-4 rounded-full px-10 h-14">Return to Catalog</Button>
                    </Link>
                </div>
            </div>
        );
    }

    const handleNext = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitError(null);
        setStep(2);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleConfirm = async () => {
        setSubmittingOrder(true);
        setSubmitError(null);

        try {
            const order = await orderService.createOrder(
                {
                    customerName: formData.name,
                    phone: formData.phone,
                    city: formData.city,
                    items: items.map((item) => ({
                        productId: item.id,
                        quantity: item.quantity,
                        variantSelection: item.selectedOptions,
                    })),
                },
                token
            );

            setOrderId(order.orderNumber);
            setStep(3);
            clearCart();
            clearDraft();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch {
            setSubmitError("Could not submit your order. Please try again.");
        } finally {
            setSubmittingOrder(false);
        }
    };

    if (step === 3) {
        return (
            <div className="container mx-auto max-w-2xl px-4 py-16 md:py-24">
                <StepVisualizer />
                <div className="flex flex-col gap-10 text-center animate-slide-up-fade">
                    <div className="flex justify-center">
                        <div className="bg-primary/30 p-10 rounded-full shadow-2xl shadow-primary/20 relative">
                            <CheckCircle2 className="h-20 w-20 text-accent" />
                            <div className="absolute -top-2 -right-2 h-10 w-10 rounded-full bg-white flex items-center justify-center text-xl shadow-lg">✨</div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-3">
                        <h1 className="font-display text-5xl font-bold text-dark tracking-tight">{checkoutContent.successTitle}</h1>
                        <p className="text-dark/60 text-lg max-w-md mx-auto">{checkoutContent.successMessageTemplate.replace("{{name}}", formData.name)}</p>
                        <div className="inline-block self-center rounded-full bg-accent/10 px-6 py-2 text-sm font-black text-accent uppercase tracking-widest border border-accent/20">
                            ID: {orderId}
                        </div>
                    </div>

                    <div className="rounded-[3rem] bg-white p-10 text-left flex flex-col gap-8 shadow-2xl shadow-secondary/10 border border-secondary/10">
                        <div className="flex flex-col gap-2">
                            <h3 className="font-display font-bold text-2xl text-dark">{checkoutContent.finalStepTitle}</h3>
                            <p className="text-sm text-dark/70 leading-relaxed">
                                {checkoutContent.finalStepText}
                            </p>
                            {!token && (
                                <p className="text-sm text-dark/60 leading-relaxed">
                                    {checkoutContent.guestTrackText}
                                </p>
                            )}
                        </div>

                        <div className="bg-accent p-8 rounded-[2rem] text-white shadow-xl shadow-accent/20">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 opacity-80">{checkoutContent.paymentContactLabel}</p>
                            <div className="flex items-center gap-4 text-xl font-bold">
                                <Smartphone className="h-6 w-6" />
                                <span>{checkoutContent.paymentContactValue}</span>
                            </div>
                            <p className="text-xs mt-2 opacity-70">{checkoutContent.paymentContactHint}</p>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                            <Link
                                href={token ? "/account/orders" : `/track-order?orderNumber=${encodeURIComponent(orderId)}&phone=${encodeURIComponent(formData.phone)}`}
                                className="w-full"
                            >
                                <Button variant="secondary" size="lg" className="w-full h-16 rounded-2xl font-bold shadow-sm">
                                    {token ? "View My Orders" : "Track This Order"}
                                </Button>
                            </Link>
                            <Link href="/" className="w-full">
                                <Button variant="primary" size="lg" className="w-full h-16 rounded-2xl font-bold shadow-lg transition-all hover:scale-[1.02]">
                                    Return to Store
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (step === 2) {
        return (
            <div className="container mx-auto max-w-2xl px-4 py-16">
                <StepVisualizer />
                <button onClick={() => setStep(1)} className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-dark/60 hover:text-accent transition-colors">
                    <ChevronLeft className="h-4 w-4" /> Back to Information
                </button>

                <h1 className="font-display text-4xl font-bold text-dark mb-4 tracking-tight">{checkoutContent.paymentTitle}</h1>
                <p className="text-dark/60 mb-10">{checkoutContent.paymentSubtitle}</p>

                <div className="flex flex-col gap-8 animate-slide-up-fade">
                    {submitError && (
                        <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-medium text-red-600">
                            {submitError}
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-6">
                        <div className="group flex items-center gap-5 p-6 rounded-[2rem] border-2 border-primary/20 bg-white hover:border-accent transition-all cursor-pointer shadow-sm hover:shadow-md">
                            <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center text-accent group-hover:bg-primary group-hover:text-white transition-colors">
                                <Smartphone className="h-8 w-8" />
                            </div>
                            <div>
                                <p className="font-bold text-xl text-dark">{checkoutContent.telebirrTitle}</p>
                                <p className="text-base text-dark/60 font-medium">{checkoutContent.telebirrAccount}</p>
                            </div>
                        </div>
                        <div className="group flex items-center gap-5 p-6 rounded-[2rem] border-2 border-primary/20 bg-white hover:border-accent transition-all cursor-pointer shadow-sm hover:shadow-md">
                            <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center text-accent group-hover:bg-primary group-hover:text-white transition-colors">
                                <CreditCard className="h-8 w-8" />
                            </div>
                            <div>
                                <p className="font-bold text-xl text-dark">{checkoutContent.cbeTitle}</p>
                                <p className="text-base text-dark/60 font-medium">{checkoutContent.cbeAccount}</p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-[2.5rem] bg-secondary/5 p-10 flex flex-col gap-6 border border-secondary/10">
                        <div className="flex justify-between items-end border-b border-secondary/10 pb-6">
                            <span className="text-dark/60 font-medium">Total Payable</span>
                            <span className="text-4xl font-black text-accent">{getTotalPrice().toLocaleString()} ETB</span>
                        </div>
                        <div className="flex flex-col gap-4">
                            <div className="flex items-start gap-3">
                                <div className="h-2 w-2 rounded-full bg-accent mt-1.5" />
                                <p className="text-sm text-dark/70">{checkoutContent.paymentStepOne}</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="h-2 w-2 rounded-full bg-accent mt-1.5" />
                                <p className="text-sm text-dark/70">{checkoutContent.paymentStepTwo}</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="h-2 w-2 rounded-full bg-accent mt-1.5" />
                                <p className="text-sm text-dark/70 font-bold">{checkoutContent.paymentStepThree}</p>
                            </div>
                        </div>
                        <Button onClick={handleConfirm} variant="primary" size="lg" className="w-full h-16 rounded-2xl font-bold gap-3 mt-4" disabled={submittingOrder}>
                            {submittingOrder ? "Submitting..." : <>Submit Order <ArrowRight className="h-5 w-5" /></>}
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto max-w-2xl px-4 py-16">
            <StepVisualizer />
            <Link href="/cart" className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-dark/60 hover:text-accent transition-colors">
                <ChevronLeft className="h-4 w-4" /> Back to Cart
            </Link>

            <h1 className="font-display text-4xl font-bold text-dark mb-4 tracking-tight">{checkoutContent.orderInfoTitle}</h1>
            <p className="text-dark/60 mb-12">{checkoutContent.orderInfoSubtitle}</p>
            <AutosaveIndicator saveState={saveState} restored={restored} className="mb-8" />

            <form onSubmit={handleNext} className="flex flex-col gap-10 animate-slide-up-fade">
                <div className="flex flex-col gap-8">
                    <div className="flex flex-col gap-3">
                        <label className="text-xs font-black uppercase tracking-[0.2em] text-dark/40 ml-1">Full Name</label>
                        <div className="relative group">
                            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-dark/20 group-focus-within:text-accent transition-colors">
                                <User className="h-5 w-5" />
                            </div>
                            <input
                                required
                                type="text"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Abebe Kebede"
                                className="h-16 w-full rounded-2xl border-2 border-secondary/10 bg-white pl-16 pr-6 text-dark focus:border-accent focus:outline-none transition-all shadow-sm"
                            />
                        </div>
                    </div>
                    <div className="flex flex-col gap-3">
                        <label className="text-xs font-black uppercase tracking-[0.2em] text-dark/40 ml-1">Phone Number</label>
                        <div className="relative group">
                            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-dark/20 group-focus-within:text-accent transition-colors">
                                <Phone className="h-5 w-5" />
                            </div>
                            <input
                                required
                                type="tel"
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="09..."
                                className="h-16 w-full rounded-2xl border-2 border-secondary/10 bg-white pl-16 pr-6 text-dark focus:border-accent focus:outline-none transition-all shadow-sm"
                            />
                        </div>
                    </div>
                    <div className="flex flex-col gap-3">
                        <label className="text-xs font-black uppercase tracking-[0.2em] text-dark/40 ml-1">Delivery City</label>
                        <div className="relative group">
                            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-dark/20 group-focus-within:text-accent transition-colors">
                                <MapPin className="h-5 w-5" />
                            </div>
                            <select
                                value={formData.city}
                                onChange={e => setFormData({ ...formData, city: e.target.value })}
                                className="h-16 w-full rounded-2xl border-2 border-secondary/10 bg-white pl-16 pr-6 text-dark focus:border-accent focus:outline-none transition-all shadow-sm appearance-none"
                            >
                                <option>Addis Ababa</option>
                                <option>Other Cities (Negotiated)</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="rounded-[2.5rem] bg-dark p-10 flex flex-col gap-6 text-white shadow-2xl">
                    <div className="flex justify-between items-center">
                        <span className="text-white/60 font-medium">Order Total</span>
                        <span className="text-3xl font-black text-primary">{getTotalPrice().toLocaleString()} ETB</span>
                    </div>
                    <Button type="submit" variant="primary" size="lg" className="w-full h-16 rounded-2xl gap-3 text-lg font-bold">
                        Continue to Payment <ArrowRight className="h-5 w-5" />
                    </Button>
                </div>
            </form>
        </div>
    );
}
