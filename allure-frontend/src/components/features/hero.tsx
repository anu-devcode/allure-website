import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

export function Hero() {
    return (
        <section className="relative overflow-hidden bg-cream px-4 py-16 md:py-24">
            <div className="container mx-auto grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
                {/* Text Content */}
                <div className="flex flex-col gap-6 text-center lg:text-left">
                    <div className="inline-block w-fit self-center rounded-full bg-primary/20 px-4 py-1.5 text-sm font-bold text-accent lg:self-start">
                        Premium Fashion & Lifestyle
                    </div>
                    <h1 className="font-display text-4xl font-bold tracking-tight text-dark md:text-6xl lg:text-7xl">
                        Clean, Elegant, <span className="text-accent italic">Aluring</span>.
                    </h1>
                    <p className="max-w-lg self-center text-lg text-dark/60 lg:self-start">
                        Discover a curated collection of beautiful products designed for the modern social-media active buyer. Experience fast and friendly shopping.
                    </p>
                    <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row lg:justify-start">
                        <Link href="/catalog">
                            <Button size="lg" className="px-10 rounded-full">
                                Shop Now
                            </Button>
                        </Link>
                        <Link href="/custom-preorder">
                            <Button variant="outline" size="lg" className="px-10 rounded-full border-accent text-accent hover:bg-accent hover:text-white">
                                Custom Request
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Decorative / Image Content */}
                <div className="relative aspect-square w-full rounded-3xl bg-secondary/30 lg:aspect-auto lg:h-[600px]">
                    {/* Using a placeholder aesthetic div since I don't have images yet */}
                    <div className="absolute inset-0 flex items-center justify-center p-8">
                        <div className="relative h-full w-full overflow-hidden rounded-2xl bg-white/40 backdrop-blur-sm">
                            <div className="absolute -left-12 -top-12 h-64 w-64 rounded-full bg-primary/20 mix-blend-multiply transition-transform hover:scale-110" />
                            <div className="absolute -bottom-12 -right-12 h-64 w-64 rounded-full bg-secondary/20 mix-blend-multiply transition-transform hover:scale-110" />
                            <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
                                <div className="h-40 w-40 rounded-3xl bg-primary/40 shadow-xl rotate-12 flex items-center justify-center text-accent text-6xl">✨</div>
                                <p className="font-display text-2xl font-bold text-accent">Beautifully Curated</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Background Ornaments */}
            <div className="absolute left-0 top-0 -z-10 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute bottom-0 right-0 -z-10 h-80 w-80 translate-x-1/3 translate-y-1/3 rounded-full bg-secondary/20 blur-3xl" />
        </section>
    );
}
