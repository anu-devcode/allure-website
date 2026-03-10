"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CalendarClock, ExternalLink, Image as ImageIcon, MessageCircle, Phone, RefreshCw, UserRound } from "lucide-react";
import { useAdminAuth } from "@/store/useAdminAuth";
import {
    ADMIN_AUTH_EXPIRED_ERROR,
    CustomRequest,
    getCustomRequests,
    updateCustomRequestStatus,
} from "@/services/customRequestService";
import { cn } from "@/lib/utils";

type RequestStatus = CustomRequest["status"];
type SortBy = "NEWEST" | "OLDEST";

const statusOptions: RequestStatus[] = ["PENDING", "QUOTED", "CONVERTED", "REJECTED"];
const statusFilterOptions: Array<{ value: "ALL" | RequestStatus; label: string }> = [
    { value: "ALL", label: "All Statuses" },
    { value: "PENDING", label: "Pending" },
    { value: "QUOTED", label: "Quoted" },
    { value: "CONVERTED", label: "Converted" },
    { value: "REJECTED", label: "Rejected" },
];

const buildWhatsappLink = (phone: string) => {
    const digits = phone.replace(/\D/g, "");
    return digits.length >= 9 ? `https://wa.me/${digits}` : null;
};

const buildCallLink = (phone: string) => {
    const trimmed = phone.trim();
    return trimmed ? `tel:${trimmed}` : null;
};

const buildCustomerMessage = (request: CustomRequest) => {
    const statusLabel = request.status.replace("_", " ");
    const intro = `Hi ${request.customerName}, this is Allure support regarding your custom request.`;
    const details = `Request status: ${statusLabel}.`;
    const ref = `Reference submitted on ${new Date(request.createdAt).toLocaleDateString()}.`;
    return `${intro}\n${details}\n${ref}`;
};

export default function AdminCustomRequestsPage() {
    const token = useAdminAuth((state) => state.token);
    const logout = useAdminAuth((state) => state.logout);
    const router = useRouter();
    const [requests, setRequests] = useState<CustomRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [query, setQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<"ALL" | RequestStatus>("ALL");
    const [sortBy, setSortBy] = useState<SortBy>("NEWEST");
    const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [actionMessage, setActionMessage] = useState<string | null>(null);

    const [statusDrafts, setStatusDrafts] = useState<Record<string, RequestStatus>>({});
    const [notesDrafts, setNotesDrafts] = useState<Record<string, string>>({});
    const [savingId, setSavingId] = useState<string | null>(null);

    const loadRequests = async (showRefreshing = false) => {
        if (!token) {
            setLoading(false);
            return;
        }

        if (showRefreshing) {
            setRefreshing(true);
        }

        try {
            setError(null);
            const data = await getCustomRequests(token);
            setRequests(data);
            setSelectedRequestId((current) => {
                if (current && data.some((item) => item.id === current)) {
                    return current;
                }
                return data[0]?.id ?? null;
            });
        } catch (error) {
            if (error instanceof Error && error.message === ADMIN_AUTH_EXPIRED_ERROR) {
                logout();
                router.push("/admin/login");
                return;
            }

            setRequests([]);
            setError("Could not load custom requests right now.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        void loadRequests();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token, logout, router]);

    const pendingCount = useMemo(
        () => requests.filter((request) => request.status === "PENDING").length,
        [requests]
    );

    const quotedCount = useMemo(
        () => requests.filter((request) => request.status === "QUOTED").length,
        [requests]
    );

    const convertedCount = useMemo(
        () => requests.filter((request) => request.status === "CONVERTED").length,
        [requests]
    );

    const filteredRequests = useMemo(() => {
        const normalized = query.trim().toLowerCase();
        const filtered = requests.filter((request) => {
            if (statusFilter !== "ALL" && request.status !== statusFilter) {
                return false;
            }

            if (!normalized) {
                return true;
            }

            return (
                request.customerName.toLowerCase().includes(normalized) ||
                request.customerPhone.toLowerCase().includes(normalized) ||
                request.description.toLowerCase().includes(normalized) ||
                request.status.toLowerCase().includes(normalized)
            );
        });

        return filtered.sort((a, b) => {
            const delta = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            return sortBy === "NEWEST" ? delta : -delta;
        });
    }, [requests, query, statusFilter, sortBy]);

    const selectedRequest = useMemo(
        () => filteredRequests.find((request) => request.id === selectedRequestId) ?? filteredRequests[0] ?? null,
        [filteredRequests, selectedRequestId]
    );

    const getStatusColor = (status: RequestStatus) => {
        switch (status) {
            case "PENDING":
                return "bg-yellow-100 text-yellow-700";
            case "QUOTED":
                return "bg-blue-100 text-blue-700";
            case "CONVERTED":
                return "bg-green-100 text-green-700";
            case "REJECTED":
                return "bg-red-100 text-red-700";
            default:
                return "bg-secondary/20 text-dark";
        }
    };

    const getDraftStatus = (request: CustomRequest): RequestStatus =>
        statusDrafts[request.id] ?? request.status;

    const getDraftNotes = (request: CustomRequest): string =>
        notesDrafts[request.id] ?? request.adminNotes ?? "";

    const hasChanges = (request: CustomRequest) =>
        getDraftStatus(request) !== request.status || getDraftNotes(request) !== (request.adminNotes ?? "");

    const handleSave = async (request: CustomRequest) => {
        if (!token) {
            return;
        }

        const nextStatus = getDraftStatus(request);
        const nextNotes = getDraftNotes(request);

        setSavingId(request.id);
        try {
            const updated = await updateCustomRequestStatus(request.id, nextStatus, nextNotes, token);
            setRequests((current) => current.map((item) => (item.id === request.id ? updated : item)));
            setError(null);
            setActionMessage(`Saved changes for ${request.customerName}.`);
        } catch (error) {
            if (error instanceof Error && error.message === ADMIN_AUTH_EXPIRED_ERROR) {
                logout();
                router.push("/admin/login");
                return;
            }

            setError("Could not save this request right now.");
            return;
        } finally {
            setSavingId(null);
        }
    };

    const handleCopyMessage = async (request: CustomRequest) => {
        const message = buildCustomerMessage(request);
        try {
            await navigator.clipboard.writeText(message);
            setActionMessage("Customer message copied to clipboard.");
        } catch {
            setActionMessage("Unable to copy message. Please try again.");
        }
    };

    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="font-display text-3xl font-bold text-dark">Custom Requests</h1>
                <p className="text-dark/60">Review storefront custom order submissions, update status, and communicate with customers quickly.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-3xl border border-secondary/10 bg-white p-5 shadow-sm text-sm text-dark/60">
                    Pending: <span className="font-bold text-dark">{pendingCount}</span>
                </div>
                <div className="rounded-3xl border border-secondary/10 bg-white p-5 shadow-sm text-sm text-dark/60">
                    Quoted: <span className="font-bold text-dark">{quotedCount}</span>
                </div>
                <div className="rounded-3xl border border-secondary/10 bg-white p-5 shadow-sm text-sm text-dark/60">
                    Converted: <span className="font-bold text-dark">{convertedCount}</span>
                </div>
            </div>

            <div className="rounded-3xl border border-secondary/10 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-3 md:flex-row md:items-center">
                    <input
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Search by customer, phone, item details, status"
                        className="h-11 w-full rounded-xl border border-secondary/20 px-4 text-sm outline-none focus:ring-2 focus:ring-accent/20 md:flex-1"
                    />
                    <select
                        value={statusFilter}
                        onChange={(event) => setStatusFilter(event.target.value as "ALL" | RequestStatus)}
                        className="h-11 rounded-xl border border-secondary/20 px-3 text-sm text-dark outline-none focus:ring-2 focus:ring-accent/20"
                    >
                        {statusFilterOptions.map((option) => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                    </select>
                    <select
                        value={sortBy}
                        onChange={(event) => setSortBy(event.target.value as SortBy)}
                        className="h-11 rounded-xl border border-secondary/20 px-3 text-sm text-dark outline-none focus:ring-2 focus:ring-accent/20"
                    >
                        <option value="NEWEST">Newest First</option>
                        <option value="OLDEST">Oldest First</option>
                    </select>
                    <Button variant="outline" className="h-11 rounded-xl gap-2" onClick={() => void loadRequests(true)} disabled={refreshing}>
                        <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} /> Refresh
                    </Button>
                </div>
            </div>

            {error && (
                <div className="rounded-3xl border border-red-100 bg-red-50 p-4 text-sm font-medium text-red-600">
                    {error}
                </div>
            )}

            {actionMessage ? (
                <div className="rounded-3xl border border-secondary/10 bg-white p-4 text-sm text-dark/60 shadow-sm">
                    {actionMessage}
                </div>
            ) : null}

            <div className="grid gap-4 xl:grid-cols-[360px_1fr]">
                {loading ? (
                    <div className="rounded-3xl border border-secondary/10 bg-white p-8 text-center text-sm text-dark/40">Loading custom requests...</div>
                ) : null}

                {!loading ? (
                    <div className="rounded-3xl border border-secondary/10 bg-white p-4 shadow-sm xl:max-h-[70vh] xl:overflow-y-auto">
                        {filteredRequests.length === 0 ? (
                    <div className="rounded-3xl border border-secondary/10 bg-white p-8 text-center text-sm text-dark/40">No custom requests found.</div>
                        ) : (
                            <div className="grid gap-2">
                                {filteredRequests.map((request) => (
                                    <button
                                        key={request.id}
                                        type="button"
                                        onClick={() => setSelectedRequestId(request.id)}
                                        className={cn(
                                            "w-full rounded-2xl border p-4 text-left transition",
                                            selectedRequest?.id === request.id
                                                ? "border-accent bg-accent/5 shadow-sm"
                                                : "border-secondary/10 hover:border-secondary/30"
                                        )}
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-bold text-dark">{request.customerName}</p>
                                                <p className="truncate text-xs text-dark/50">{request.customerPhone}</p>
                                            </div>
                                            <span className={cn("rounded-full px-2 py-1 text-[10px] font-bold uppercase", getStatusColor(request.status))}>
                                                {request.status}
                                            </span>
                                        </div>
                                        <p className="mt-2 line-clamp-2 text-xs text-dark/60">{request.description}</p>
                                        <p className="mt-2 text-[11px] text-dark/35">{new Date(request.createdAt).toLocaleString()}</p>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                ) : null}

                {!loading ? (
                    <div className="rounded-3xl border border-secondary/10 bg-white p-6 shadow-sm">
                        {!selectedRequest ? (
                            <div className="rounded-2xl border border-secondary/10 bg-secondary/5 p-8 text-center text-sm text-dark/40">
                                Select a request to review details and communicate.
                            </div>
                        ) : (
                            <>
                                <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                    <div>
                                        <h3 className="font-display text-2xl font-bold text-dark">{selectedRequest.customerName}</h3>
                                        <p className="text-sm text-dark/55">{selectedRequest.customerPhone}</p>
                                        <p className="mt-1 text-xs text-dark/40">Submitted: {new Date(selectedRequest.createdAt).toLocaleString()}</p>
                                    </div>
                                    <span className={cn("rounded-full px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em]", getStatusColor(selectedRequest.status))}>
                                        {selectedRequest.status}
                                    </span>
                                </div>

                                <div className="grid gap-4 md:grid-cols-3">
                                    <a
                                        href={buildCallLink(selectedRequest.customerPhone) ?? "#"}
                                        className="rounded-2xl border border-secondary/10 bg-secondary/5 p-4 text-sm text-dark/70 transition hover:border-accent/40"
                                    >
                                        <div className="mb-2 flex items-center gap-2 font-semibold text-dark"><Phone className="h-4 w-4 text-accent" /> Call Customer</div>
                                        Quick dial from desktop/mobile
                                    </a>
                                    <a
                                        href={buildWhatsappLink(selectedRequest.customerPhone) ?? "#"}
                                        target="_blank"
                                        rel="noreferrer"
                                        className={cn(
                                            "rounded-2xl border border-secondary/10 bg-secondary/5 p-4 text-sm text-dark/70 transition hover:border-accent/40",
                                            !buildWhatsappLink(selectedRequest.customerPhone) && "pointer-events-none opacity-50"
                                        )}
                                    >
                                        <div className="mb-2 flex items-center gap-2 font-semibold text-dark"><MessageCircle className="h-4 w-4 text-accent" /> Open WhatsApp</div>
                                        Start conversation instantly
                                    </a>
                                    <button
                                        type="button"
                                        onClick={() => void handleCopyMessage(selectedRequest)}
                                        className="rounded-2xl border border-secondary/10 bg-secondary/5 p-4 text-left text-sm text-dark/70 transition hover:border-accent/40"
                                    >
                                        <div className="mb-2 flex items-center gap-2 font-semibold text-dark"><UserRound className="h-4 w-4 text-accent" /> Copy Message</div>
                                        Copy a ready customer update text
                                    </button>
                                </div>

                                <div className="mt-5 rounded-2xl border border-secondary/10 bg-secondary/5 p-4">
                                    <p className="mb-2 text-xs font-black uppercase tracking-[0.2em] text-dark/40">Request Details</p>
                                    <p className="text-sm leading-relaxed text-dark/70">{selectedRequest.description}</p>

                                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                                        <div className="rounded-xl border border-secondary/10 bg-white p-3 text-sm text-dark/60">
                                            <p className="mb-1 text-xs font-bold uppercase tracking-wider text-dark/45">Item Link</p>
                                            {selectedRequest.itemLink ? (
                                                <a
                                                    href={selectedRequest.itemLink}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex items-center gap-1 font-semibold text-accent hover:underline"
                                                >
                                                    Open Submitted Link <ExternalLink className="h-3.5 w-3.5" />
                                                </a>
                                            ) : (
                                                <span>No item link provided.</span>
                                            )}
                                        </div>

                                        <div className="rounded-xl border border-secondary/10 bg-white p-3 text-sm text-dark/60">
                                            <p className="mb-1 text-xs font-bold uppercase tracking-wider text-dark/45">Attached Images</p>
                                            {selectedRequest.imageUrls.length > 0 ? (
                                                <div className="flex flex-wrap gap-2">
                                                    {selectedRequest.imageUrls.map((url, idx) => (
                                                        <a key={`${url}-${idx}`} href={url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-full border border-secondary/20 px-3 py-1 text-xs font-semibold text-accent hover:bg-secondary/10">
                                                            <ImageIcon className="h-3.5 w-3.5" /> Image {idx + 1}
                                                        </a>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span>No images attached.</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-5 rounded-2xl border border-secondary/10 bg-secondary/5 p-4">
                                    <p className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-dark/40">Workflow Update</p>
                                    <div className="grid grid-cols-1 gap-3 md:grid-cols-[220px_1fr_auto]">
                                        <select
                                            value={getDraftStatus(selectedRequest)}
                                            onChange={(event) => {
                                                const value = event.target.value as RequestStatus;
                                                setStatusDrafts((current) => ({ ...current, [selectedRequest.id]: value }));
                                            }}
                                            className="h-11 rounded-xl border border-secondary/20 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-accent/20"
                                        >
                                            {statusOptions.map((status) => (
                                                <option key={status} value={status}>{status}</option>
                                            ))}
                                        </select>

                                        <input
                                            value={getDraftNotes(selectedRequest)}
                                            onChange={(event) => setNotesDrafts((current) => ({ ...current, [selectedRequest.id]: event.target.value }))}
                                            placeholder="Admin note for quote, follow-up, or outcome"
                                            className="h-11 rounded-xl border border-secondary/20 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-accent/20"
                                        />

                                        <Button
                                            variant="primary"
                                            className="h-11 rounded-xl"
                                            onClick={() => void handleSave(selectedRequest)}
                                            disabled={!hasChanges(selectedRequest) || savingId === selectedRequest.id}
                                        >
                                            {savingId === selectedRequest.id ? "Saving..." : "Save"}
                                        </Button>
                                    </div>

                                    <p className="mt-3 inline-flex items-center gap-1 text-xs text-dark/45">
                                        <CalendarClock className="h-3.5 w-3.5" />
                                        Last updated: {new Date(selectedRequest.updatedAt).toLocaleString()}
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                ) : null}
            </div>
        </div>
    );
}
