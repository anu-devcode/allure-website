"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, ShieldCheck, Sparkles, Truck } from "lucide-react";
import { useStorefrontCms } from "@/components/providers/storefront-cms-provider";

export function Hero() {
    const { content } = useStorefrontCms();
    const slides = content.homeHeroSlides;
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [slides.length]);

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    };

    const slide = slides[currentSlide] ?? slides[0];

    return (
        <section className="relative overflow-hidden bg-cream px-0 py-0 pb-16 md:px-4 md:py-24 transition-colors duration-500">
            <div className="container mx-auto grid grid-cols-1 items-center gap-0 md:gap-12 lg:grid-cols-2">

                {/* Image Content - First on mobile */}
                <div className="relative order-first aspect-[4/5] w-full md:order-last md:aspect-square md:rounded-3xl lg:aspect-auto lg:h-[600px] group overflow-hidden">
                    {/* Image Container with Slider Effect */}
                    <div className="relative h-full w-full overflow-hidden md:rounded-3xl md:shadow-xl">
                        {slides.map((s, index) => (
                            <div
                                key={s.id}
                                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
                                    }`}
                            >
                                <Image
                                    src={s.image}
                                    alt={s.title + s.titleAccent}
                                    fill
                                    className="object-cover animate-slow-zoom"
                                    priority={index === 0}
                                />
                                {/* Gradient Overlay for better contrast on mobile bottom */}
                                <div className="absolute inset-0 bg-gradient-to-t from-dark/40 via-transparent to-transparent md:hidden" />
                            </div>
                        ))}

                        {/* Navigation Arrows - Only on desktop/hover */}
                        <div className="hidden md:flex absolute inset-0 items-center justify-between p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                            <Button
                                variant="secondary"
                                size="icon"
                                className="h-10 w-10 rounded-full bg-white/80 hover:bg-white text-dark shadow-md"
                                onClick={prevSlide}
                            >
                                <ChevronLeft className="h-6 w-6" />
                            </Button>
                            <Button
                                variant="secondary"
                                size="icon"
                                className="h-10 w-10 rounded-full bg-white/80 hover:bg-white text-dark shadow-md"
                                onClick={nextSlide}
                            >
                                <ChevronRight className="h-6 w-6" />
                            </Button>
                        </div>
                    </div>

                    {/* Navigation Dots - Repositioned for mobile overlap */}
                    <div className="absolute bottom-12 left-1/2 flex -translate-x-1/2 gap-2 z-20 md:bottom-[-2rem]">
                        {slides.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentSlide(index)}
                                className={`h-1.5 rounded-full transition-all duration-300 ${index === currentSlide ? "w-6 bg-white md:bg-accent" : "w-1.5 bg-white/50 md:bg-accent/30 hover:bg-accent/50"
                                    }`}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>
                </div>

                {/* Text Content - Floating card on mobile */}
                <div
                    key={currentSlide}
                    className="animate-slide-up-fade relative z-30 -mt-20 mx-4 flex flex-col gap-5 rounded-[2.5rem] bg-white/95 backdrop-blur-md p-8 shadow-2xl md:static md:mt-0 md:mx-0 md:bg-transparent md:p-0 md:shadow-none md:backdrop-blur-none text-center lg:text-left"
                >
                    <div className="inline-flex w-fit items-center gap-2 self-center rounded-full border border-accent/15 bg-gradient-to-r from-primary/25 via-secondary/25 to-primary/25 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-accent shadow-sm md:text-sm lg:self-start">
                        <Sparkles className="h-3.5 w-3.5 animate-pulse-slow" />
                        {slide.tag}
                    </div>
                    <h1 className="font-display text-4xl font-bold leading-[1.04] tracking-tight text-dark md:text-6xl lg:text-7xl">
                        <span className="block">{slide.title}</span>
                        <span className="bg-gradient-to-r from-accent via-dark to-accent bg-clip-text text-transparent">{slide.titleAccent}</span>
                        <span className="text-accent/50">.</span>
                    </h1>
                    <p className="max-w-xl self-center text-base leading-relaxed text-dark/65 md:text-lg lg:self-start">
                        {slide.description}
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-2.5 lg:justify-start">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-secondary/30 bg-white/85 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-dark/70 shadow-sm transition-transform duration-300 hover:-translate-y-0.5">
                            <Truck className="h-3.5 w-3.5 text-accent" /> {slide.badges[0]}
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-secondary/30 bg-white/85 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-dark/70 shadow-sm transition-transform duration-300 hover:-translate-y-0.5">
                            <Sparkles className="h-3.5 w-3.5 text-accent" /> {slide.badges[1]}
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-secondary/30 bg-white/85 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-dark/70 shadow-sm transition-transform duration-300 hover:-translate-y-0.5">
                            <ShieldCheck className="h-3.5 w-3.5 text-accent" /> {slide.badges[2]}
                        </span>
                    </div>
                    <div className="mt-2 flex flex-col items-center gap-4 sm:flex-row lg:justify-start">
                        <Link href={slide.ctaLink} className="w-full sm:w-auto">
                            <Button size="lg" className="w-full px-10 rounded-full h-14 text-base shadow-md shadow-accent/20 transition-transform duration-300 hover:-translate-y-0.5">
                                {slide.ctaText}
                            </Button>
                        </Link>
                        <Link href={slide.secondaryCtaLink} className="w-full sm:w-auto">
                            <Button variant="outline" size="lg" className="w-full px-10 rounded-full border-accent text-accent hover:bg-accent hover:text-white h-14 text-base transition-transform duration-300 hover:-translate-y-0.5">
                                {slide.secondaryCtaText}
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Background Ornaments - Visible on desktop for extra flair */}
            <div className="hidden md:block absolute left-0 top-0 -z-10 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl" />
            <div className="hidden md:block absolute bottom-0 right-0 -z-10 h-80 w-80 translate-x-1/3 -translate-y-1/3 rounded-full bg-secondary/20 blur-3xl" />
        </section>
    );
}
