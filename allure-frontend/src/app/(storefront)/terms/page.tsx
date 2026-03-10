"use client";

import { useStorefrontCms } from "@/components/providers/storefront-cms-provider";

export default function TermsPage() {
    const { content } = useStorefrontCms();
    const terms = content.terms;

    return (
        <div className="container mx-auto max-w-3xl px-4 py-24">
            <h1 className="font-display text-4xl font-bold text-dark mb-8">{terms.pageTitle}</h1>

            <div className="prose prose-sm prose-slate max-w-none flex flex-col gap-8 text-dark/70 leading-relaxed">
                {terms.sections.map((section) => (
                    <section key={section.id} className="flex flex-col gap-4">
                        <h2 className="text-xl font-bold text-dark">{section.title}</h2>
                        <p>{section.body}</p>
                    </section>
                ))}
            </div>
        </div>
    );
}
