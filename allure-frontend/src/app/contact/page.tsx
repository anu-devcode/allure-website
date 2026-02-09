"use client";

import { Button } from "@/components/ui/button";
import { Mail, Phone, MessageSquare, MapPin, Send } from "lucide-react";

export default function ContactPage() {
    return (
        <div className="container mx-auto max-w-4xl px-4 py-24">
            <div className="text-center mb-16">
                <h1 className="font-display text-5xl font-bold text-dark mb-4">Get in Touch</h1>
                <p className="text-dark/60 text-lg">Have questions about an order or a pre-order? We're here to help.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Contact Info */}
                <div className="flex flex-col gap-8">
                    <div className="flex flex-col gap-6">
                        <div className="flex gap-4 items-start">
                            <div className="bg-primary/20 p-4 rounded-2xl text-accent">
                                <Phone className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-dark">Phone</h3>
                                <p className="text-dark/60">0911 223 344</p>
                                <p className="text-dark/60">Available 9:00 AM - 8:00 PM</p>
                            </div>
                        </div>

                        <div className="flex gap-4 items-start">
                            <div className="bg-primary/20 p-4 rounded-2xl text-accent">
                                <MessageSquare className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-dark">Social Channels</h3>
                                <p className="text-dark/60">Telegram: @AllureOnline</p>
                                <p className="text-dark/60">Instagram: @allure_et</p>
                            </div>
                        </div>

                        <div className="flex gap-4 items-start">
                            <div className="bg-primary/20 p-4 rounded-2xl text-accent">
                                <MapPin className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-dark">Location</h3>
                                <p className="text-dark/60">Addis Ababa, Ethiopia</p>
                                <p className="text-dark/60">Bole, Medhanialem Area</p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-3xl bg-secondary/5 p-8 border border-secondary/10">
                        <h4 className="font-bold text-dark mb-2">Order Issues?</h4>
                        <p className="text-sm text-dark/60">If you're contacting us about a specific order, please have your order number ready (e.g. ORD-1001).</p>
                    </div>
                </div>

                {/* Contact Form */}
                <div className="rounded-4xl bg-white p-8 shadow-2xl shadow-secondary/5 border border-secondary/10">
                    <form className="flex flex-col gap-6" onSubmit={(e) => e.preventDefault()}>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-bold text-dark/80">Your Name</label>
                            <input
                                type="text"
                                placeholder="Abebe Kebede"
                                className="h-14 rounded-2xl border border-secondary/20 bg-white px-6 text-dark focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-bold text-dark/80">Phone or Email</label>
                            <input
                                type="text"
                                placeholder="09..."
                                className="h-14 rounded-2xl border border-secondary/20 bg-white px-6 text-dark focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-bold text-dark/80">Message</label>
                            <textarea
                                rows={4}
                                placeholder="How can we help you?"
                                className="rounded-2xl border border-secondary/20 bg-white p-6 text-dark focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent resize-none"
                            />
                        </div>
                        <Button variant="primary" size="lg" className="h-14 rounded-2xl gap-2 text-lg">
                            Send Message <Send className="h-4 w-4" />
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
