"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type RootErrorProps = {
    error: Error & { digest?: string };
    reset: () => void;
};

export default function RootError({ error, reset }: RootErrorProps) {
    useEffect(() => {
        console.error("Unhandled page error:", error);
    }, [error]);

    return (
        <div className="min-h-screen bg-cream px-4 py-20">
            <div className="container mx-auto max-w-2xl rounded-[2.5rem] border border-red-100 bg-white p-10 text-center shadow-2xl shadow-secondary/10">
                <p className="mb-3 text-[11px] font-black uppercase tracking-[0.2em] text-red-500">Something Went Wrong</p>
                <h1 className="mb-3 font-display text-4xl font-bold text-dark">We hit an unexpected issue.</h1>
                <p className="mb-8 text-sm text-dark/60">Please try again. If this keeps happening, return to the home page and retry your action.</p>
                <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                    <Button onClick={reset} variant="primary" className="rounded-xl px-8">Try Again</Button>
                    <Link href="/">
                        <Button variant="outline" className="rounded-xl px-8">Go Home</Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
