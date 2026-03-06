"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAdminAuth } from "@/store/useAdminAuth";
import {
    ADMIN_AUTH_EXPIRED_ERROR,
    CustomRequest,
    getCustomRequests,
    updateCustomRequestStatus,
} from "@/services/customRequestService";
import { cn } from "@/lib/utils";

type RequestStatus = CustomRequest["status"];

const statusOptions: RequestStatus[] = ["PENDING", "QUOTED", "CONVERTED", "REJECTED"];

export default function AdminCustomRequestsPage() {
    const token = useAdminAuth((state) => state.token);
    const logout = useAdminAuth((state) => state.logout);
    const router = useRouter();
    const [requests, setRequests] = useState<CustomRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState("");
    const [error, setError] = useState<string | null>(null);

    const [statusDrafts, setStatusDrafts] = useState<Record<string, RequestStatus>>({});
    const [notesDrafts, setNotesDrafts] = useState<Record<string, string>>({});
    const [savingId, setSavingId] = useState<string | null>(null);

    useEffect(() => {
        const load = async () => {
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                setError(null);
                const data = await getCustomRequests(token);
                setRequests(data);
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
            }
        };

        void load();
    }, [logout, router, token]);

    const pendingCount = useMemo(
        () => requests.filter((request) => request.status === "PENDING").length,
        [requests]
    );

    const filteredRequests = useMemo(() => {
        const normalized = query.trim().toLowerCase();
        if (!normalized) {
            return requests;
        }

        return requests.filter((request) =>
            request.customerName.toLowerCase().includes(normalized) ||
            request.customerPhone.toLowerCase().includes(normalized) ||
            request.description.toLowerCase().includes(normalized) ||
            request.status.toLowerCase().includes(normalized)
        );
    }, [requests, query]);

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

    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="font-display text-3xl font-bold text-dark">Custom Requests</h1>
                <p className="text-dark/60">Review custom-preorder submissions and update their lifecycle.</p>
            </div>

            <div className="rounded-3xl border border-secondary/10 bg-white p-5 shadow-sm text-sm text-dark/60">
                Pending requests: <span className="font-bold text-dark">{pendingCount}</span>
            </div>

            <div className="rounded-3xl border border-secondary/10 bg-white p-4 shadow-sm">
                <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search by customer, phone, description, status"
                    className="h-11 w-full rounded-xl border border-secondary/20 px-4 text-sm outline-none focus:ring-2 focus:ring-accent/20"
                />
            </div>

            {error && (
                <div className="rounded-3xl border border-red-100 bg-red-50 p-4 text-sm font-medium text-red-600">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 gap-4">
                {loading ? (
                    <div className="rounded-3xl border border-secondary/10 bg-white p-8 text-center text-sm text-dark/40">Loading custom requests...</div>
                ) : filteredRequests.length === 0 ? (
                    <div className="rounded-3xl border border-secondary/10 bg-white p-8 text-center text-sm text-dark/40">No custom requests found.</div>
                ) : filteredRequests.map((request) => (
                    <div key={request.id} className="rounded-3xl border border-secondary/10 bg-white p-6 shadow-sm">
                        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <h3 className="font-bold text-dark">{request.customerName}</h3>
                                <p className="text-xs text-dark/50">{request.customerPhone}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={cn("rounded-full px-2 py-1 text-[10px] font-bold uppercase", getStatusColor(request.status))}>
                                    {request.status}
                                </span>
                                <span className="text-xs text-dark/40">{new Date(request.createdAt).toLocaleString()}</span>
                            </div>
                        </div>

                        <p className="text-sm text-dark/70">{request.description}</p>

                        {request.itemLink ? (
                            <a
                                href={request.itemLink}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-2 inline-block text-xs font-semibold text-accent hover:underline"
                            >
                                Open item link
                            </a>
                        ) : null}

                        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-[180px_1fr_auto] md:items-start">
                            <select
                                value={getDraftStatus(request)}
                                onChange={(event) => {
                                    const value = event.target.value as RequestStatus;
                                    setStatusDrafts((current) => ({ ...current, [request.id]: value }));
                                }}
                                className="h-10 rounded-xl border border-secondary/20 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-accent/20"
                            >
                                {statusOptions.map((status) => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </select>

                            <input
                                value={getDraftNotes(request)}
                                onChange={(event) => setNotesDrafts((current) => ({ ...current, [request.id]: event.target.value }))}
                                placeholder="Admin note (optional)"
                                className="h-10 rounded-xl border border-secondary/20 px-3 text-sm outline-none focus:ring-2 focus:ring-accent/20"
                            />

                            <Button
                                variant="primary"
                                className="h-10 rounded-xl"
                                onClick={() => void handleSave(request)}
                                disabled={!hasChanges(request) || savingId === request.id}
                            >
                                {savingId === request.id ? "Saving..." : "Save"}
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
