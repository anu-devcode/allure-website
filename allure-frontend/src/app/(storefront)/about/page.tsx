"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, Star, Shield, Zap } from "lucide-react";
import { useStorefrontCms } from "@/components/providers/storefront-cms-provider";

const VALUE_ICONS = {
    Shield,
    Star,
    Heart,
    Zap,
};

export default function AboutPage() {
    const { content } = useStorefrontCms();
    const about = content.about;

    return (
        <div className="flex flex-col gap-0 overflow-x-hidden">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-cream px-4 py-12 md:py-20">
                <div className="container relative z-10 mx-auto text-center">
                    <div className="animate-slide-up-fade flex flex-col items-center gap-4">
                        <div className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-accent border border-primary/20">
                            {about.heroEyebrow}
                        </div>
                        <h1 className="font-display text-4xl font-bold text-dark md:text-6xl lg:text-7xl tracking-tight leading-[1.1]">
                            {about.heroTitle} <span className="italic text-primary">{about.heroAccent}</span>.
                        </h1>
                        <p className="max-w-lg text-sm text-dark/50 md:text-base lg:text-lg leading-relaxed">
                            {about.heroDescription}
                        </p>
                    </div>
                </div>
                {/* Background Ornaments */}
                <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl md:h-[400px] md:w-[400px]" />
                <div className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-secondary/5 blur-3xl md:h-[400px] md:w-[400px]" />
            </section>

            {/* Our Story Section */}
            <section className="container mx-auto px-4 py-10 md:py-16">
                <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
                    <div className="animate-slide-up-fade relative aspect-[4/5] w-full overflow-hidden rounded-[1.5rem] shadow-lg md:aspect-video lg:aspect-[4/5]">
                        <Image
                            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop"
                            alt="Fashion boutique"
                            fill
                            className="animate-slow-zoom object-cover"
                        />
                    </div>
                    <div className="animate-slide-up-fade flex flex-col gap-5">
                        <h2 className="font-display text-3xl font-bold text-dark md:text-4xl">{about.storyTitle}</h2>
                        <div className="flex flex-col gap-4 text-sm text-dark/60 leading-relaxed md:text-base lg:text-lg">
                            <p>
                                {about.storyParagraphOne}
                            </p>
                            <p>
                                {about.storyParagraphTwo}
                            </p>
                            <div className="h-px w-12 bg-primary/40 mt-1" />
                            <p className="font-display text-lg italic text-accent md:text-xl lg:text-2xl">
                                {about.quote}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Core Values Section */}
            <section className="bg-secondary/10 py-12 md:py-20">
                <div className="container mx-auto px-4">
                    <div className="mb-12 text-center md:mb-16">
                        <h2 className="font-display text-3xl font-bold text-dark md:text-4xl">{about.valuesTitle} <span className="text-primary italic">{about.valuesAccent}</span></h2>
                        <p className="mt-2 text-dark/60 text-sm md:text-base">{about.valuesSubtitle}</p>
                    </div>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {about.values.map((value) => {
                            const Icon = VALUE_ICONS[value.icon] ?? Shield;
                            return (
                            <div key={value.id} className="group flex flex-col gap-4 rounded-3xl bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20 text-accent transition-colors group-hover:bg-primary group-hover:text-white">
                                    <Icon size={20} />
                                </div>
                                <h3 className="font-display text-lg font-bold text-dark">
                                    {value.title}
                                </h3>
                                <p className="text-xs text-dark/60 leading-relaxed md:text-sm">
                                    {value.description}
                                </p>
                            </div>
                        )})}
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section className="container mx-auto px-4 py-12 md:py-20">
                <div className="mb-12 text-center md:text-left md:max-w-2xl">
                    <h2 className="font-display text-3xl font-bold text-dark md:text-4xl">{about.teamTitle} <span className="text-primary italic">{about.teamAccent}</span></h2>
                    <p className="mt-2 text-dark/60 text-sm md:text-base">
                        {about.teamSubtitle}
                    </p>
                </div>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 md:gap-10">
                    {about.team.map((member) => (
                        <div key={member.id} className="group flex items-center gap-5 md:flex-col md:items-start md:gap-5">
                            <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-full shadow-md transition-all duration-500 group-hover:shadow-lg md:h-auto md:w-full md:aspect-square md:rounded-[1.5rem]">
                                <Image
                                    src={member.image}
                                    alt={member.name}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                            </div>
                            <div className="flex flex-col gap-0.5">
                                <h4 className="font-display text-base font-bold text-dark md:text-xl lg:text-2xl">{member.name}</h4>
                                <p className="text-[10px] font-bold text-accent uppercase tracking-widest md:text-xs">{member.role}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-dark py-16 md:py-24 text-center text-white">
                <div className="container mx-auto px-4 max-w-2xl">
                    <h2 className="font-display text-3xl font-bold md:text-4xl lg:text-5xl mb-5">{about.ctaTitle}</h2>
                    <p className="text-white/60 text-base md:text-lg mb-8">
                        {about.ctaSubtitle}
                    </p>
                    <div className="flex justify-center">
                        <Link href="/catalog" className="inline-block rounded-full bg-primary px-8 py-3.5 text-sm font-bold text-dark transition-all hover:bg-primary/90 hover:scale-105 active:scale-95">
                            {about.ctaButtonText}
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
