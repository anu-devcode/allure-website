"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";

const TESTIMONIALS = [
    {
        id: 1,
        name: "Sarah Jenkins",
        role: "Fashion Blogger",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=2070&auto=format&fit=crop",
        rating: 5,
        text: "Allure has completely transformed my wardrobe. The quality of the fabrics is unmatched, and the delivery was incredibly fast. I'm obsessed with the urban blazer!"
    },
    {
        id: 2,
        name: "Michael Chen",
        role: "Creative Director",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=2070&auto=format&fit=crop",
        rating: 5,
        text: "Finding a brand that balances modern aesthetics with comfort is rare. Allure does it perfectly. The accessories are the perfect finishing touch to any outfit."
    },
    {
        id: 3,
        name: "Emma Thompson",
        role: "Verified Buyer",
        avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1888&auto=format&fit=crop",
        rating: 4,
        text: "I was skeptical about ordering online, but the customer service team was so helpful with sizing. The silk dress fits like a dream. Highly recommend!"
    },
    {
        id: 4,
        name: "David Wilson",
        role: "Entrepreneur",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1887&auto=format&fit=crop",
        rating: 5,
        text: "Sleek, professional, and high-quality. I bought a few pieces for my work wardrobe and I've received so many compliments. Will definitely be back for more."
    }
];

export function Testimonials() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    useEffect(() => {
        if (!isAutoPlaying) return;

        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % TESTIMONIALS.length);
        }, 6000);

        return () => clearInterval(timer);
    }, [isAutoPlaying]);

    const nextTestimonial = () => {
        setCurrentIndex((prev) => (prev + 1) % TESTIMONIALS.length);
        setIsAutoPlaying(false);
    };

    const prevTestimonial = () => {
        setCurrentIndex((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
        setIsAutoPlaying(false);
    };

    const testimonial = TESTIMONIALS[currentIndex];

    return (
        <section className="bg-gradient-to-b from-cream to-white py-24">
            <div className="container mx-auto px-4">
                <div className="mb-16 text-center">
                    <h2 className="font-display text-4xl font-bold text-dark">What Our Community Says</h2>
                    <p className="mt-4 text-dark/60">Join thousands of satisfied customers who have found their style.</p>
                </div>

                <div className="relative mx-auto max-w-5xl">
                    {/* Decorative Elements */}
                    <div className="absolute -top-16 -left-16 opacity-5 text-primary hidden lg:block">
                        <Quote size={200} />
                    </div>
                    <div className="absolute -bottom-16 -right-16 opacity-5 text-secondary rotate-180 hidden lg:block">
                        <Quote size={200} />
                    </div>

                    {/* Card */}
                    <div className="relative overflow-hidden rounded-[2rem] bg-white shadow-2xl ring-1 ring-black/5 mx-auto">
                        <div className="flex flex-col md:flex-row min-h-[500px]">
                            {/* Image Section */}
                            <div className="relative h-72 w-full md:h-auto md:w-2/5 lg:w-1/3">
                                <Image
                                    src={testimonial.avatar}
                                    alt={testimonial.name}
                                    fill
                                    className="object-cover transition-transform duration-700 hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-dark/50 to-transparent md:hidden" />
                            </div>

                            {/* Content Section */}
                            <div className="flex flex-col justify-center p-8 md:p-14 md:w-3/5 lg:w-2/3">
                                <div className="mb-6 flex gap-1 animate-slide-up-fade">
                                    {[...Array(5)].map((_, i) => (
                                        <span key={i} className={`text-2xl ${i < testimonial.rating ? "text-yellow-400" : "text-gray-200"}`}>★</span>
                                    ))}
                                </div>

                                <blockquote className="mb-10 flex-grow animate-slide-up-fade animation-delay-200">
                                    <p className="font-display text-2xl md:text-3xl italic leading-relaxed text-dark/90">
                                        "{testimonial.text}"
                                    </p>
                                </blockquote>

                                <div className="animate-slide-up-fade animation-delay-400">
                                    <cite className="not-italic">
                                        <div className="font-bold text-dark text-xl">{testimonial.name}</div>
                                        <div className="text-base text-dark/60 tracking-wide uppercase">{testimonial.role}</div>
                                    </cite>
                                </div>
                            </div>
                        </div>

                        {/* Navigation Overlay */}
                        <div className="absolute inset-x-0 top-1/2 flex -translate-y-1/2 justify-between px-2 md:-left-8 md:-right-8 md:w-[calc(100%+4rem)] pointer-events-none">
                            <Button
                                variant="secondary"
                                size="icon"
                                className="h-14 w-14 rounded-full shadow-xl pointer-events-auto bg-white hover:bg-cream text-dark border-none transition-transform hover:scale-110 active:scale-95"
                                onClick={prevTestimonial}
                                aria-label="Previous testimonial"
                            >
                                <ChevronLeft className="h-7 w-7" />
                            </Button>
                            <Button
                                variant="secondary"
                                size="icon"
                                className="h-14 w-14 rounded-full shadow-xl pointer-events-auto bg-white hover:bg-cream text-dark border-none transition-transform hover:scale-110 active:scale-95"
                                onClick={nextTestimonial}
                                aria-label="Next testimonial"
                            >
                                <ChevronRight className="h-7 w-7" />
                            </Button>
                        </div>
                    </div>

                    {/* Dots */}
                    <div className="mt-8 flex justify-center gap-2">
                        {TESTIMONIALS.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => {
                                    setCurrentIndex(index);
                                    setIsAutoPlaying(false);
                                }}
                                className={`h-2 rounded-full transition-all duration-300 ${index === currentIndex ? "w-8 bg-primary" : "w-2 bg-primary/20 hover:bg-primary/40"
                                    }`}
                                aria-label={`Go to testimonial ${index + 1}`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
