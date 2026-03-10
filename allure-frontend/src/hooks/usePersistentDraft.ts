"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type DraftSaveState = "idle" | "saving" | "saved" | "error";

type UsePersistentDraftOptions<T> = {
    storageKey: string;
    value: T;
    onRestore: (value: T) => void;
    debounceMs?: number;
    disabled?: boolean;
};

export function usePersistentDraft<T>({
    storageKey,
    value,
    onRestore,
    debounceMs = 450,
    disabled = false,
}: UsePersistentDraftOptions<T>) {
    const [saveState, setSaveState] = useState<DraftSaveState>("idle");
    const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
    const [restored, setRestored] = useState(false);
    const [hydrated, setHydrated] = useState(false);
    const lastSerializedRef = useRef<string>("");

    useEffect(() => {
        if (disabled || typeof window === "undefined") {
            setHydrated(true);
            return;
        }

        try {
            const stored = window.localStorage.getItem(storageKey);
            if (stored) {
                const parsed = JSON.parse(stored) as T;
                onRestore(parsed);
                lastSerializedRef.current = stored;
                setRestored(true);
            }
        } catch {
            window.localStorage.removeItem(storageKey);
        } finally {
            setHydrated(true);
        }
    }, [disabled, onRestore, storageKey]);

    useEffect(() => {
        if (disabled || !hydrated || typeof window === "undefined") {
            return;
        }

        const serialized = JSON.stringify(value);
        if (serialized === lastSerializedRef.current) {
            return;
        }

        setSaveState("saving");
        const timer = window.setTimeout(() => {
            try {
                window.localStorage.setItem(storageKey, serialized);
                lastSerializedRef.current = serialized;
                setLastSavedAt(Date.now());
                setSaveState("saved");
            } catch {
                setSaveState("error");
            }
        }, debounceMs);

        return () => {
            window.clearTimeout(timer);
        };
    }, [debounceMs, disabled, hydrated, storageKey, value]);

    const clearDraft = useCallback(() => {
        if (typeof window === "undefined") {
            return;
        }

        window.localStorage.removeItem(storageKey);
        lastSerializedRef.current = "";
        setSaveState("idle");
        setLastSavedAt(null);
        setRestored(false);
    }, [storageKey]);

    return {
        saveState,
        lastSavedAt,
        restored,
        clearDraft,
    };
}
