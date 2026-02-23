"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAdminAuth } from "@/store/useAdminAuth";
import { adminContactService, ContactMessage } from "@/services/adminContactService";
import { CheckCircle2, Trash2 } from "lucide-react";

export default function AdminContactPage() {
    const token = useAdminAuth((state) => state.token);
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const data = await adminContactService.getMessages(token);
                setMessages(data);
            } catch {
                setMessages([]);
            } finally {
                setLoading(false);
            }
        };

        void load();
    }, [token]);

    const unresolvedCount = useMemo(
        () => messages.filter((message) => message.status === "NEW").length,
        [messages]
    );

    const markResolved = async (id: string) => {
        if (!token) return;
        try {
            const updated = await adminContactService.updateMessageStatus(token, id, "RESOLVED");
            setMessages((current) => current.map((message) => (message.id === id ? updated : message)));
        } catch {
            return;
        }
    };

    const handleDelete = async (id: string) => {
        if (!token || !confirm("Delete this message?")) return;
        try {
            await adminContactService.deleteMessage(token, id);
            setMessages((current) => current.filter((message) => message.id !== id));
        } catch {
            return;
        }
    };

    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="font-display text-3xl font-bold text-dark">Contact</h1>
                <p className="text-dark/60">Review and respond to inbound contact messages.</p>
            </div>

            <div className="rounded-3xl border border-secondary/10 bg-white p-5 shadow-sm text-sm text-dark/60">
                Unresolved messages: <span className="font-bold text-dark">{unresolvedCount}</span>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {loading ? (
                    <div className="rounded-3xl border border-secondary/10 bg-white p-8 text-center text-sm text-dark/40">Loading messages...</div>
                ) : messages.length === 0 ? (
                    <div className="rounded-3xl border border-secondary/10 bg-white p-8 text-center text-sm text-dark/40">No contact messages.</div>
                ) : messages.map((message) => (
                    <div key={message.id} className="rounded-3xl border border-secondary/10 bg-white p-6 shadow-sm">
                        <div className="mb-3 flex items-center justify-between gap-4">
                            <div>
                                <h3 className="font-bold text-dark">{message.name}</h3>
                                <p className="text-xs text-dark/50">{message.contact}</p>
                            </div>
                            <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${message.status === "RESOLVED" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                                {message.status}
                            </span>
                        </div>
                        <p className="text-sm text-dark/70">{message.message}</p>
                        <p className="mt-2 text-xs text-dark/40">{new Date(message.createdAt).toLocaleString()}</p>
                        <div className="mt-4 flex items-center gap-2">
                            {message.status !== "RESOLVED" ? (
                                <Button variant="outline" size="sm" className="rounded-xl" onClick={() => void markResolved(message.id)}>
                                    <CheckCircle2 className="mr-1 h-4 w-4" /> Mark Resolved
                                </Button>
                            ) : null}
                            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-red-500" onClick={() => void handleDelete(message.id)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
