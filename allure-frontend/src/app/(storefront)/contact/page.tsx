"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Phone, MessageSquare, MapPin, Send, User, Clock, CheckCircle2, Sparkles } from "lucide-react";
import { adminContactService } from "@/services/adminContactService";
import { usePersistentDraft } from "@/hooks/usePersistentDraft";
import { AutosaveIndicator } from "@/components/ui/autosave-indicator";
import { useCustomerAuth } from "@/store/useCustomerAuth";
import { useStorefrontCms } from "@/components/providers/storefront-cms-provider";

export default function ContactPage() {
    const token = useCustomerAuth((state) => state.token);
    const { content } = useStorefrontCms();
    const contactContent = content.contact;
    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState("");
    const [contact, setContact] = useState("");
    const [message, setMessage] = useState("");
    const [submitError, setSubmitError] = useState<string | null>(null);

    const handleRestore = useCallback((draft: { name: string; contact: string; message: string }) => {
        setName(draft.name ?? "");
        setContact(draft.contact ?? "");
        setMessage(draft.message ?? "");
    }, []);

    const { saveState, restored, clearDraft } = usePersistentDraft({
        storageKey: "allure-contact-draft-v1",
        value: { name, contact, message },
        onRestore: handleRestore,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setSubmitError(null);

        try {
            await adminContactService.submitMessage({
                name,
                contact,
                message,
            }, token);

            setSent(true);
            setName("");
            setContact("");
            setMessage("");
            clearDraft();
            setTimeout(() => setSent(false), 3000);
        } catch {
            setSubmitError("We could not send your message. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-0 overflow-x-hidden">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-cream px-4 py-12 md:py-20">
                <div className="container relative z-10 mx-auto text-center">
                    <div className="animate-slide-up-fade flex flex-col items-center gap-4">
                        <div className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-accent border border-primary/20">
                            {contactContent.heroEyebrow}
                        </div>
                        <h1 className="font-display text-4xl font-bold text-dark md:text-6xl lg:text-7xl tracking-tight leading-[1.1]">
                            {contactContent.heroTitle} <span className="italic text-primary">{contactContent.heroAccent}</span>
                        </h1>
                        <p className="max-w-lg text-sm text-dark/50 md:text-base lg:text-lg leading-relaxed">
                            {contactContent.heroDescription}
                        </p>
                    </div>
                </div>
                <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl md:h-[400px] md:w-[400px]" />
                <div className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-secondary/5 blur-3xl md:h-[400px] md:w-[400px]" />
            </section>

            {/* Main Content */}
            <section className="container mx-auto px-4 py-10 md:py-16">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
                    {/* Contact Info Column */}
                    <div className="flex flex-col gap-8 animate-slide-up-fade">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-5">
                            {/* Phone */}
                            <div className="group p-7 rounded-[2rem] bg-white border border-secondary/10 shadow-sm hover:shadow-xl transition-all duration-500">
                                <div className="flex items-center gap-5">
                                    <div className="h-14 w-14 bg-primary/10 rounded-2xl flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition-all duration-500 flex-shrink-0">
                                        <Phone className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-display text-base font-bold text-dark">{contactContent.phoneLabel}</h3>
                                        <p className="text-sm text-dark/60 mt-0.5">{contactContent.phoneNumber}</p>
                                        <p className="text-xs text-dark/40 mt-0.5">{contactContent.phoneHours}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Social Channels */}
                            <div className="group p-7 rounded-[2rem] bg-white border border-secondary/10 shadow-sm hover:shadow-xl transition-all duration-500">
                                <div className="flex items-center gap-5">
                                    <div className="h-14 w-14 bg-primary/10 rounded-2xl flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition-all duration-500 flex-shrink-0">
                                        <MessageSquare className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-display text-base font-bold text-dark">{contactContent.socialLabel}</h3>
                                        <p className="text-sm text-dark/60 mt-0.5">Telegram: {contactContent.telegramHandle}</p>
                                        <p className="text-sm text-dark/60">Instagram: {contactContent.instagramHandle}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Location */}
                            <div className="group p-7 rounded-[2rem] bg-white border border-secondary/10 shadow-sm hover:shadow-xl transition-all duration-500">
                                <div className="flex items-center gap-5">
                                    <div className="h-14 w-14 bg-primary/10 rounded-2xl flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition-all duration-500 flex-shrink-0">
                                        <MapPin className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-display text-base font-bold text-dark">{contactContent.locationLabel}</h3>
                                        <p className="text-sm text-dark/60 mt-0.5">{contactContent.locationLineOne}</p>
                                        <p className="text-sm text-dark/60">{contactContent.locationLineTwo}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Order Issues Callout */}
                        <div className="rounded-[2rem] bg-dark p-8 text-white shadow-2xl relative overflow-hidden group">
                            <div className="absolute -right-4 -top-4 text-white/5 rotate-12 transition-transform group-hover:rotate-6">
                                <Sparkles className="h-28 w-28" />
                            </div>
                            <div className="flex items-start gap-4 relative z-10">
                                <div className="h-10 w-10 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <Clock className="h-5 w-5 text-white/60" />
                                </div>
                                <div>
                                    <h4 className="font-display font-bold text-lg mb-1">{contactContent.orderHelpTitle}</h4>
                                    <p className="text-white/50 text-sm leading-relaxed">
                                        {contactContent.orderHelpText}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form Column */}
                    <div className="animate-slide-up-fade [animation-delay:200ms]">
                        <div className="rounded-[2.5rem] bg-white p-8 md:p-10 shadow-2xl shadow-secondary/10 border border-secondary/10">
                            <div className="mb-8">
                                <h2 className="font-display text-2xl font-bold text-dark tracking-tight md:text-3xl">{contactContent.formTitle}</h2>
                                <p className="text-sm text-dark/50 mt-1">{contactContent.formSubtitle}</p>
                            </div>

                            <form className="flex flex-col gap-7" onSubmit={handleSubmit}>
                                <AutosaveIndicator saveState={saveState} restored={restored} />
                                {submitError && (
                                    <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                                        {submitError}
                                    </div>
                                )}
                                <div className="flex flex-col gap-3">
                                    <label className="text-xs font-black uppercase tracking-[0.2em] text-dark/40 ml-1">Your Name</label>
                                    <div className="relative group">
                                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-dark/20 group-focus-within:text-accent transition-colors">
                                            <User className="h-5 w-5" />
                                        </div>
                                        <input
                                            required
                                            type="text"
                                            value={name}
                                            onChange={(event) => setName(event.target.value)}
                                            placeholder="e.g. Abebe Kebede"
                                            className="h-14 w-full rounded-2xl border-2 border-secondary/10 bg-white pl-14 pr-6 text-sm text-dark focus:border-accent focus:outline-none transition-all shadow-sm"
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3">
                                    <label className="text-xs font-black uppercase tracking-[0.2em] text-dark/40 ml-1">Phone or Email</label>
                                    <div className="relative group">
                                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-dark/20 group-focus-within:text-accent transition-colors">
                                            <Phone className="h-5 w-5" />
                                        </div>
                                        <input
                                            required
                                            type="text"
                                            value={contact}
                                            onChange={(event) => setContact(event.target.value)}
                                            placeholder="e.g. 0911 223 344"
                                            className="h-14 w-full rounded-2xl border-2 border-secondary/10 bg-white pl-14 pr-6 text-sm text-dark focus:border-accent focus:outline-none transition-all shadow-sm"
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3">
                                    <label className="text-xs font-black uppercase tracking-[0.2em] text-dark/40 ml-1">Message</label>
                                    <textarea
                                        required
                                        rows={4}
                                        value={message}
                                        onChange={(event) => setMessage(event.target.value)}
                                        placeholder="How can we help you?"
                                        className="rounded-2xl border-2 border-secondary/10 bg-white p-5 text-sm text-dark focus:border-accent focus:outline-none transition-all shadow-sm resize-none"
                                    />
                                </div>

                                <Button
                                    variant="primary"
                                    size="lg"
                                    className="h-14 rounded-2xl gap-3 text-base font-bold shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] mt-2"
                                    disabled={sent || loading}
                                >
                                    {loading ? (
                                        <div className="flex items-center gap-2">
                                            <div className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                                            <span>Sending...</span>
                                        </div>
                                    ) : sent ? (
                                        <div className="flex items-center gap-2">
                                            <CheckCircle2 className="h-5 w-5" />
                                            <span>Message Sent!</span>
                                        </div>
                                    ) : (
                                        <>
                                            Send Message <Send className="h-4 w-4" />
                                        </>
                                    )}
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
