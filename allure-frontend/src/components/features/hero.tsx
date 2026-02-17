"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const SLIDES = [
    {
        id: 1,
        tag: "Premium Fashion & Lifestyle",
        title: "Clean, Elegant, ",
        titleAccent: "Alluring",
        description: "Discover a curated collection of beautiful products designed for the modern social-media active buyer. Experience fast and friendly shopping.",
        image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop",
        ctaText: "Shop Now",
        ctaLink: "/catalog",
        secondaryCtaText: "Custom Request",
        secondaryCtaLink: "/custom-preorder"
    },
    {
        id: 2,
        tag: "New Arrivals",
        title: "Modern, Chic, ",
        titleAccent: "Timeless",
        description: "Explore our latest arrivals that blend contemporary style with timeless elegance. Perfect for any occasion.",
        image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=2020&auto=format&fit=crop",
        ctaText: "View Collection",
        ctaLink: "/catalog?category=new",
        secondaryCtaText: "Learn More",
        secondaryCtaLink: "/about"
    },
    {
        id: 3,
        tag: "Exclusive Offers",
        title: "Bold, Unique, ",
        titleAccent: "You",
        description: "Stand out from the crowd with our exclusive limited-time offers. Fashion that expresses your true self.",
        image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=2073&auto=format&fit=crop",
        ctaText: "Shop Sale",
        ctaLink: "/catalog?category=sale",
        secondaryCtaText: "Contact Us",
        secondaryCtaLink: "/contact"
    }
];

export function Hero() {
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
    };

    const slide = SLIDES[currentSlide];

    return (
        <section className="relative overflow-hidden bg-cream px-0 py-0 pb-16 md:px-4 md:py-24 transition-colors duration-500">
            <div className="container mx-auto grid grid-cols-1 items-center gap-0 md:gap-12 lg:grid-cols-2">

                {/* Image Content - First on mobile */}
                <div className="relative order-first aspect-[4/5] w-full md:order-last md:aspect-square md:rounded-3xl lg:aspect-auto lg:h-[600px] group overflow-hidden">
                    {/* Image Container with Slider Effect */}
                    <div className="relative h-full w-full overflow-hidden md:rounded-3xl md:shadow-xl">
                        {SLIDES.map((s, index) => (
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
                        {SLIDES.map((_, index) => (
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
                    <div className="inline-block w-fit self-center rounded-full bg-primary/20 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-accent md:text-sm lg:self-start">
                        {slide.tag}
                    </div>
                    <h1 className="font-display text-4xl font-bold tracking-tight text-dark md:text-6xl lg:text-7xl">
                        {slide.title}<span className="text-primary italic">{slide.titleAccent}</span>.
                    </h1>
                    <p className="max-w-lg self-center text-base text-dark/60 md:text-lg lg:self-start">
                        {slide.description}
                    </p>
                    <div className="mt-2 flex flex-col items-center gap-4 sm:flex-row lg:justify-start">
                        <Link href={slide.ctaLink} className="w-full sm:w-auto">
                            <Button size="lg" className="w-full px-10 rounded-full h-14 text-base">
                                {slide.ctaText}
                            </Button>
                        </Link>
                        <Link href={slide.secondaryCtaLink} className="w-full sm:w-auto">
                            <Button variant="outline" size="lg" className="w-full px-10 rounded-full border-accent text-accent hover:bg-accent hover:text-white h-14 text-base">
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
