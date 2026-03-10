"use client";

import { Truck, Clock, ShieldCheck, HelpCircle } from "lucide-react";
import { useStorefrontCms } from "@/components/providers/storefront-cms-provider";

export default function RulesPage() {
    const { content } = useStorefrontCms();
    const rules = content.rules;

    return (
        <div className="container mx-auto px-4 py-24">
            <div className="max-w-3xl mx-auto flex flex-col gap-12">
                <div className="text-center flex flex-col gap-4">
                    <h1 className="font-display text-5xl font-bold text-dark">{rules.pageTitle}</h1>
                    <p className="text-xl text-dark/60">{rules.pageSubtitle}</p>
                </div>

                <div className="grid grid-cols-1 gap-8">
                    <div className="flex gap-6 p-8 rounded-3xl border border-secondary/20 hover:border-accent/40 transition-colors">
                        <div className="h-12 w-12 bg-primary/20 rounded-2xl flex items-center justify-center text-accent shrink-0"><Truck className="h-6 w-6" /></div>
                        <div>
                            <h3 className="font-bold text-xl text-dark mb-2">{rules.deliveryTitle}</h3>
                            <p className="text-dark/60 leading-relaxed">
                                {rules.deliveryText}
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-6 p-8 rounded-3xl border border-secondary/20 hover:border-accent/40 transition-colors">
                        <div className="h-12 w-12 bg-primary/20 rounded-2xl flex items-center justify-center text-accent shrink-0"><Clock className="h-6 w-6" /></div>
                        <div>
                            <h3 className="font-bold text-xl text-dark mb-2">{rules.availabilityTitle}</h3>
                            <p className="text-dark/60 leading-relaxed">
                                {rules.availabilityText}
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-6 p-8 rounded-3xl border border-secondary/20 hover:border-accent/40 transition-colors">
                        <div className="h-12 w-12 bg-primary/20 rounded-2xl flex items-center justify-center text-accent shrink-0"><ShieldCheck className="h-6 w-6" /></div>
                        <div>
                            <h3 className="font-bold text-xl text-dark mb-2">{rules.paymentTitle}</h3>
                            <p className="text-dark/60 leading-relaxed">
                                {rules.paymentText}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
