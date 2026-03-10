"use client";

import { CheckCircle2, Loader2, RefreshCcw, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DraftSaveState } from "@/hooks/usePersistentDraft";

type AutosaveIndicatorProps = {
    saveState: DraftSaveState;
    restored: boolean;
    className?: string;
};

export function AutosaveIndicator({ saveState, restored, className }: AutosaveIndicatorProps) {
    if (saveState === "idle" && !restored) {
        return null;
    }

    let icon = <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
    let label = "Draft saved";

    if (restored) {
        icon = <RefreshCcw className="h-4 w-4 text-accent" />;
        label = "Draft restored";
    }

    if (saveState === "saving") {
        icon = <Loader2 className="h-4 w-4 animate-spin text-dark/60" />;
        label = "Saving draft...";
    }

    if (saveState === "error") {
        icon = <TriangleAlert className="h-4 w-4 text-red-600" />;
        label = "Could not save draft";
    }

    return (
        <div className={cn("inline-flex items-center gap-2 rounded-full border border-secondary/20 bg-white/90 px-3 py-1 text-xs font-semibold text-dark/70", className)}>
            {icon}
            <span>{label}</span>
        </div>
    );
}
