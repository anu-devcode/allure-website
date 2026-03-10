"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAdminAuth } from "@/store/useAdminAuth";
import { adminContactService, ContactMessage } from "@/services/adminContactService";
import { CalendarClock, CheckCircle2, ClipboardCopy, Mail, MessageCircle, Phone, RefreshCw, Trash2 } from "lucide-react";

type MessageStatusFilter = "ALL" | "NEW" | "IN_PROGRESS" | "FOLLOW_UP" | "RESOLVED";
type SenderFilter = "ALL" | "REGISTERED" | "GUEST";
type SortOption = "NEWEST" | "OLDEST";

const STATUS_OPTIONS: Array<{ label: string; value: MessageStatusFilter }> = [
    { label: "All", value: "ALL" },
    { label: "New", value: "NEW" },
    { label: "In Progress", value: "IN_PROGRESS" },
    { label: "Follow Up", value: "FOLLOW_UP" },
    { label: "Resolved", value: "RESOLVED" },
];

const EDITABLE_STATUS_OPTIONS: Array<{ label: string; value: ContactMessage["status"] }> = [
    { label: "New", value: "NEW" },
    { label: "In Progress", value: "IN_PROGRESS" },
    { label: "Follow Up", value: "FOLLOW_UP" },
    { label: "Resolved", value: "RESOLVED" },
];

const formatDate = (value: string | null) => (value ? new Date(value).toLocaleString() : "-");

const getReplyChannel = (contact: string): "PHONE" | "WHATSAPP" | "EMAIL" | "OTHER" => {
    if (contact.includes("@")) {
        return "EMAIL";
    }

    const digits = contact.replace(/\D/g, "");
    if (digits.length >= 9) {
        return "WHATSAPP";
    }

    return "OTHER";
};

const getQuickLink = (contact: string) => {
    if (contact.includes("@")) {
        return `mailto:${contact}`;
    }

    const digits = contact.replace(/\D/g, "");
    if (digits.length >= 9) {
        return `https://wa.me/${digits}`;
    }

    return `tel:${contact}`;
};

export default function AdminContactPage() {
    const token = useAdminAuth((state) => state.token);
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<MessageStatusFilter>("ALL");
    const [senderFilter, setSenderFilter] = useState<SenderFilter>("ALL");
    const [sortOption, setSortOption] = useState<SortOption>("NEWEST");
    const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
    const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
    const [followUpDrafts, setFollowUpDrafts] = useState<Record<string, { at: string; note: string }>>({});
    const [busyId, setBusyId] = useState<string | null>(null);

    const loadMessages = async (showRefreshing = false) => {
        if (!token) {
            setLoading(false);
            return;
        }

        if (showRefreshing) {
            setRefreshing(true);
        }

        try {
            const data = await adminContactService.getMessages(token);
            setMessages(data);
            setSelectedMessageId((current) => {
                if (current && data.some((message) => message.id === current)) {
                    return current;
                }
                return data[0]?.id ?? null;
            });
            setReplyDrafts((current) => {
                const next = { ...current };
                for (const message of data) {
                    if (typeof next[message.id] === "undefined") {
                        next[message.id] = message.lastReplySummary ?? "";
                    }
                }
                return next;
            });
            setFollowUpDrafts((current) => {
                const next = { ...current };
                for (const message of data) {
                    if (typeof next[message.id] === "undefined") {
                        next[message.id] = {
                            at: message.followUpAt ? message.followUpAt.slice(0, 16) : "",
                            note: message.followUpNote ?? "",
                        };
                    }
                }
                return next;
            });
        } catch {
            setMessages([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        void loadMessages();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    const unresolvedCount = useMemo(
        () => messages.filter((message) => message.status !== "RESOLVED").length,
        [messages]
    );

    const visibleMessages = useMemo(() => {
        const query = search.trim().toLowerCase();
        const filtered = messages.filter((message) => {
            if (statusFilter !== "ALL" && message.status !== statusFilter) {
                return false;
            }

            if (senderFilter !== "ALL" && message.senderType !== senderFilter) {
                return false;
            }

            if (!query) {
                return true;
            }

            const bag = [message.name, message.contact, message.message, message.customer?.email ?? "", message.customer?.phone ?? ""].join(" ").toLowerCase();
            return bag.includes(query);
        });

        return filtered.sort((a, b) => {
            const byDate = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            if (sortOption === "OLDEST") {
                return -byDate;
            }
            return byDate;
        });
    }, [messages, search, senderFilter, sortOption, statusFilter]);

    const selectedMessage = useMemo(
        () => visibleMessages.find((message) => message.id === selectedMessageId) ?? visibleMessages[0] ?? null,
        [selectedMessageId, visibleMessages]
    );

    useEffect(() => {
        if (!selectedMessage && selectedMessageId) {
            setSelectedMessageId(null);
            return;
        }

        if (selectedMessage && selectedMessageId !== selectedMessage.id) {
            setSelectedMessageId(selectedMessage.id);
        }
    }, [selectedMessage, selectedMessageId]);

    const updateMessageState = async (id: string, updater: Parameters<typeof adminContactService.updateMessage>[2]) => {
        if (!token) return;

        setBusyId(id);
        try {
            const updated = await adminContactService.updateMessage(token, id, updater);
            setMessages((current) => current.map((message) => (message.id === id ? updated : message)));
            setReplyDrafts((current) => ({ ...current, [id]: updated.lastReplySummary ?? current[id] ?? "" }));
            setFollowUpDrafts((current) => ({
                ...current,
                [id]: {
                    at: updated.followUpAt ? updated.followUpAt.slice(0, 16) : current[id]?.at ?? "",
                    note: updated.followUpNote ?? current[id]?.note ?? "",
                },
            }));
        } catch {
            return;
        } finally {
            setBusyId(null);
        }
    };

    const handleDelete = async (id: string) => {
        if (!token || !confirm("Delete this message?")) return;

        setBusyId(id);
        try {
            await adminContactService.deleteMessage(token, id);
            setMessages((current) => current.filter((message) => message.id !== id));
            setSelectedMessageId((current) => (current === id ? null : current));
        } catch {
            return;
        } finally {
            setBusyId(null);
        }
    };

    const setReplyDraft = (id: string, value: string) => {
        setReplyDrafts((current) => ({ ...current, [id]: value }));
    };

    const setFollowUpDraft = (id: string, value: Partial<{ at: string; note: string }>) => {
        setFollowUpDrafts((current) => ({
            ...current,
            [id]: {
                at: value.at ?? current[id]?.at ?? "",
                note: value.note ?? current[id]?.note ?? "",
            },
        }));
    };

    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="font-display text-3xl font-bold text-dark">Contact</h1>
                <p className="text-dark/60">Reply and schedule follow-ups for guest and registered customer messages.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-3xl border border-secondary/10 bg-white p-5 shadow-sm text-sm text-dark/60">
                    Open messages: <span className="font-bold text-dark">{unresolvedCount}</span>
                </div>
                <div className="rounded-3xl border border-secondary/10 bg-white p-5 shadow-sm text-sm text-dark/60">
                    Registered senders: <span className="font-bold text-dark">{messages.filter((message) => message.senderType === "REGISTERED").length}</span>
                </div>
                <div className="rounded-3xl border border-secondary/10 bg-white p-5 shadow-sm text-sm text-dark/60">
                    Guest senders: <span className="font-bold text-dark">{messages.filter((message) => message.senderType === "GUEST").length}</span>
                </div>
            </div>

            <div className="rounded-3xl border border-secondary/10 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-3 md:flex-row md:items-center">
                    <input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search by name, contact, message, email..."
                        className="h-11 w-full rounded-xl border border-secondary/20 px-4 text-sm text-dark outline-none focus:border-accent md:flex-1"
                    />
                    <select
                        value={statusFilter}
                        onChange={(event) => setStatusFilter(event.target.value as MessageStatusFilter)}
                        className="h-11 rounded-xl border border-secondary/20 px-3 text-sm text-dark outline-none focus:border-accent"
                    >
                        {STATUS_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                    </select>
                    <select
                        value={senderFilter}
                        onChange={(event) => setSenderFilter(event.target.value as SenderFilter)}
                        className="h-11 rounded-xl border border-secondary/20 px-3 text-sm text-dark outline-none focus:border-accent"
                    >
                        <option value="ALL">All Senders</option>
                        <option value="REGISTERED">Registered Users</option>
                        <option value="GUEST">Guest Users</option>
                    </select>
                    <select
                        value={sortOption}
                        onChange={(event) => setSortOption(event.target.value as SortOption)}
                        className="h-11 rounded-xl border border-secondary/20 px-3 text-sm text-dark outline-none focus:border-accent"
                    >
                        <option value="NEWEST">Newest First</option>
                        <option value="OLDEST">Oldest First</option>
                    </select>
                    <Button variant="outline" className="h-11 rounded-xl gap-2" onClick={() => void loadMessages(true)} disabled={refreshing}>
                        <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} /> Refresh
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 xl:grid-cols-[360px_1fr]">
                <div className="rounded-3xl border border-secondary/10 bg-white p-4 shadow-sm xl:max-h-[70vh] xl:overflow-y-auto">
                    {loading ? (
                        <div className="rounded-2xl border border-secondary/10 bg-secondary/5 p-6 text-center text-sm text-dark/40">Loading messages...</div>
                    ) : visibleMessages.length === 0 ? (
                        <div className="rounded-2xl border border-secondary/10 bg-secondary/5 p-6 text-center text-sm text-dark/40">No contact messages.</div>
                    ) : (
                        <div className="grid gap-2">
                            {visibleMessages.map((message) => (
                                <button
                                    key={message.id}
                                    type="button"
                                    onClick={() => setSelectedMessageId(message.id)}
                                    className={`w-full rounded-2xl border p-4 text-left transition ${selectedMessage?.id === message.id ? "border-accent bg-accent/5 shadow-sm" : "border-secondary/10 hover:border-secondary/30"}`}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="text-sm font-bold text-dark">{message.name}</p>
                                            <p className="text-xs text-dark/55">{message.contact}</p>
                                        </div>
                                        <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${message.status === "RESOLVED" ? "bg-green-100 text-green-700" : message.status === "FOLLOW_UP" ? "bg-orange-100 text-orange-700" : message.status === "IN_PROGRESS" ? "bg-blue-100 text-blue-700" : "bg-yellow-100 text-yellow-700"}`}>
                                            {message.status.replace("_", " ")}
                                        </span>
                                    </div>
                                    <p className="mt-2 line-clamp-2 text-xs text-dark/60">{message.message}</p>
                                    <p className="mt-2 text-[11px] text-dark/40">{new Date(message.createdAt).toLocaleString()}</p>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="rounded-3xl border border-secondary/10 bg-white p-6 shadow-sm">
                    {!selectedMessage ? (
                        <div className="rounded-2xl border border-secondary/10 bg-secondary/5 p-10 text-center text-sm text-dark/40">
                            Select a message to view and edit details.
                        </div>
                    ) : (
                        <>
                            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                <div>
                                    <h3 className="text-xl font-bold text-dark">{selectedMessage.name}</h3>
                                    <p className="text-sm text-dark/60">{selectedMessage.contact}</p>
                                    {selectedMessage.customer ? (
                                        <p className="mt-1 text-xs text-dark/45">
                                            Linked user: {selectedMessage.customer.name ?? "Customer"} ({selectedMessage.customer.email})
                                        </p>
                                    ) : null}
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${selectedMessage.senderType === "REGISTERED" ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-700"}`}>
                                        {selectedMessage.senderType === "REGISTERED" ? "Registered" : "Guest"}
                                    </span>
                                    <select
                                        value={selectedMessage.status}
                                        onChange={(event) => void updateMessageState(selectedMessage.id, { status: event.target.value as ContactMessage["status"] })}
                                        className="h-9 rounded-lg border border-secondary/20 px-2 text-xs font-semibold text-dark outline-none focus:border-accent"
                                        disabled={busyId === selectedMessage.id}
                                    >
                                        {EDITABLE_STATUS_OPTIONS.map((option) => (
                                            <option key={option.value} value={option.value}>{option.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-secondary/10 bg-secondary/5 p-4">
                                <p className="text-sm leading-relaxed text-dark/75">{selectedMessage.message}</p>
                                <p className="mt-2 text-xs text-dark/45">Received: {new Date(selectedMessage.createdAt).toLocaleString()}</p>
                            </div>

                            <div className="mt-4 grid gap-3 rounded-2xl border border-secondary/10 bg-secondary/5 p-4">
                                <label className="text-[11px] font-bold uppercase tracking-wider text-dark/50">Reply Note</label>
                                <textarea
                                    value={replyDrafts[selectedMessage.id] ?? ""}
                                    onChange={(event) => setReplyDraft(selectedMessage.id, event.target.value)}
                                    placeholder="Write a quick summary of what you replied..."
                                    className="min-h-24 rounded-xl border border-secondary/20 bg-white p-3 text-sm text-dark outline-none focus:border-accent"
                                />
                                <div className="flex flex-wrap items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="rounded-xl gap-1"
                                        onClick={() => void navigator.clipboard.writeText(replyDrafts[selectedMessage.id] ?? "")}
                                    >
                                        <ClipboardCopy className="h-4 w-4" /> Copy Reply
                                    </Button>
                                    <a href={getQuickLink(selectedMessage.contact)} target="_blank" rel="noreferrer">
                                        <Button variant="ghost" size="sm" className="rounded-xl gap-1" type="button">
                                            {selectedMessage.contact.includes("@") ? <Mail className="h-4 w-4" /> : selectedMessage.contact.replace(/\D/g, "").length >= 9 ? <MessageCircle className="h-4 w-4" /> : <Phone className="h-4 w-4" />} Quick Open
                                        </Button>
                                    </a>
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        className="rounded-xl gap-1"
                                        disabled={busyId === selectedMessage.id || !(replyDrafts[selectedMessage.id] ?? "").trim()}
                                        onClick={() => void updateMessageState(selectedMessage.id, {
                                            status: "IN_PROGRESS",
                                            lastReplyAt: new Date().toISOString(),
                                            lastReplyChannel: getReplyChannel(selectedMessage.contact),
                                            lastReplySummary: (replyDrafts[selectedMessage.id] ?? "").trim(),
                                        })}
                                    >
                                        <CheckCircle2 className="h-4 w-4" /> Save Reply
                                    </Button>
                                </div>
                                <p className="text-xs text-dark/40">
                                    Last reply: {formatDate(selectedMessage.lastReplyAt)} {selectedMessage.lastReplyChannel ? `(${selectedMessage.lastReplyChannel})` : ""}
                                </p>
                            </div>

                            <div className="mt-4 grid gap-3 rounded-2xl border border-secondary/10 bg-secondary/5 p-4">
                                <label className="text-[11px] font-bold uppercase tracking-wider text-dark/50">Follow Up</label>
                                <div className="grid gap-3 md:grid-cols-2">
                                    <input
                                        type="datetime-local"
                                        value={followUpDrafts[selectedMessage.id]?.at ?? ""}
                                        onChange={(event) => setFollowUpDraft(selectedMessage.id, { at: event.target.value })}
                                        className="h-11 rounded-xl border border-secondary/20 bg-white px-3 text-sm text-dark outline-none focus:border-accent"
                                    />
                                    <input
                                        value={followUpDrafts[selectedMessage.id]?.note ?? ""}
                                        onChange={(event) => setFollowUpDraft(selectedMessage.id, { note: event.target.value })}
                                        placeholder="Reminder note"
                                        className="h-11 rounded-xl border border-secondary/20 bg-white px-3 text-sm text-dark outline-none focus:border-accent"
                                    />
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="rounded-xl gap-1"
                                        disabled={busyId === selectedMessage.id || !(followUpDrafts[selectedMessage.id]?.at ?? "")}
                                        onClick={() => void updateMessageState(selectedMessage.id, {
                                            status: "FOLLOW_UP",
                                            followUpAt: followUpDrafts[selectedMessage.id]?.at ? new Date(followUpDrafts[selectedMessage.id].at).toISOString() : null,
                                            followUpNote: (followUpDrafts[selectedMessage.id]?.note ?? "").trim() || null,
                                        })}
                                    >
                                        <CalendarClock className="h-4 w-4" /> Save Follow Up
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="rounded-xl"
                                        disabled={busyId === selectedMessage.id}
                                        onClick={() => void updateMessageState(selectedMessage.id, { status: "RESOLVED" })}
                                    >
                                        Mark Resolved
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="rounded-xl"
                                        disabled={busyId === selectedMessage.id}
                                        onClick={() => void updateMessageState(selectedMessage.id, { status: "NEW" })}
                                    >
                                        Reopen
                                    </Button>
                                </div>
                                <p className="text-xs text-dark/40">
                                    Follow up: {formatDate(selectedMessage.followUpAt)} {selectedMessage.followUpNote ? `- ${selectedMessage.followUpNote}` : ""}
                                </p>
                            </div>

                            <div className="mt-4 flex items-center justify-end gap-2">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9 rounded-xl text-red-500"
                                    onClick={() => void handleDelete(selectedMessage.id)}
                                    disabled={busyId === selectedMessage.id}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
