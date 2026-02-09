import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: "default" | "secondary" | "outline" | "destructive";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
    const variants = {
        default: "bg-accent text-white hover:bg-accent/80",
        secondary: "bg-secondary text-dark hover:bg-secondary/80",
        outline: "border border-accent text-accent",
        destructive: "bg-red-500 text-white hover:bg-red-500/80",
    };

    return (
        <div
            className={cn(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-accent",
                variants[variant],
                className
            )}
            {...props}
        />
    );
}

export { Badge };
