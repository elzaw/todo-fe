"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
    createTask,
    deleteTask,
    getTasks,
    updateTask,
    type Task,
    type TaskStatus,
} from "@/app/lib/api";
import { STATUS_OPTIONS, prettyStatus, getStatusStyles } from "@/app/lib/status";
import Input from "@/app/components/ui/Input";
import Textarea from "@/app/components/ui/Textarea";
import Select from "@/app/components/ui/Select";
import Button from "@/app/components/ui/Button";
import Modal from "@/app/components/ui/Modal";
import { useToast } from "@/app/components/providers/ToastProvider";

type FormState = {
    title: string;
    description: string;
    status: TaskStatus;
};

function validate(form: FormState) {
    const errors: Partial<Record<keyof FormState, string>> = {};
    if (!form.title.trim()) errors.title = "Title is required";
    else if (form.title.trim().length < 2) errors.title = "Title must be at least 2 characters";
    if (form.description && form.description.length > 500) errors.description = "Max 500 characters";
    return errors;
}

export default function TasksPageInlineEdit() {
    const { showToast } = useToast();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);

    // create form
    const [createForm, setCreateForm] = useState<FormState>({
        title: "",
        description: "",
        status: "TODO",
    });
    const [createErrors, setCreateErrors] = useState<Partial<Record<keyof FormState, string>>>({});
    const [savingCreate, setSavingCreate] = useState(false);

    // inline edit
    const [editId, setEditId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<FormState>({
        title: "",
        description: "",
        status: "TODO",
    });
    const [editErrors, setEditErrors] = useState<Partial<Record<keyof FormState, string>>>({});
    const [savingEdit, setSavingEdit] = useState(false);

    // filtering
    const [filter, setFilter] = useState<TaskStatus | "ALL">("ALL");

    // pagination
    const [page, setPage] = useState(1);
    const PAGE_SIZE = 5;

    const filteredTasks = useMemo(() => {
        if (!Array.isArray(tasks)) return [];
        if (filter === "ALL") return tasks;
        return tasks.filter((t) => t.status === filter);
    }, [tasks, filter]);

    const paginatedTasks = useMemo(() => {
        const start = (page - 1) * PAGE_SIZE;
        return filteredTasks.slice(start, start + PAGE_SIZE);
    }, [filteredTasks, page]);

    const totalPages = Math.ceil(filteredTasks.length / PAGE_SIZE);

    useEffect(() => {
        setPage(1);
    }, [filter]);

    async function load() {
        setLoading(true);
        try {
            const data = await getTasks();
            console.log(data);
            setTasks(data);
        } catch (e: any) {
            showToast(e?.message ?? "Failed to load tasks", "error");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
    }, []);

    const counts = useMemo(() => {
        const c = { TODO: 0, IN_PROGRESS: 0, DONE: 0 } as Record<TaskStatus, number>;
        if (Array.isArray(tasks)) {
            for (const t of tasks) {
                if (c[t.status] !== undefined) c[t.status]++;
            }
        }
        return c;
    }, [tasks]);

    async function onCreate() {
        const errs = validate(createForm);
        setCreateErrors(errs);
        if (Object.keys(errs).length) return;

        setSavingCreate(true);
        try {
            await createTask({
                title: createForm.title.trim(),
                description: createForm.description.trim() || "",
                status: createForm.status,
            } as any);
            setCreateForm({ title: "", description: "", status: "TODO" });
            showToast("Task created successfully", "success");
            await load();
        } catch (e: any) {
            showToast(e?.message ?? "Create failed", "error");
        } finally {
            setSavingCreate(false);
        }
    }

    function startEdit(task: Task) {
        setEditId(task.id);
        setEditForm({
            title: task.title,
            description: task.description ?? "",
            status: task.status,
        });
        setEditErrors({});
    }

    async function onSaveEdit() {
        if (!editId) return;
        const errs = validate(editForm);
        setEditErrors(errs);
        if (Object.keys(errs).length) return;

        setSavingEdit(true);
        try {
            await updateTask(editId, {
                title: editForm.title.trim(),
                description: editForm.description.trim() || "",
                status: editForm.status,
            });
            setEditId(null);
            showToast("Task updated successfully", "success");
            await load();
        } catch (e: any) {
            showToast(e?.message ?? "Update failed", "error");
        } finally {
            setSavingEdit(false);
        }
    }

    async function onDelete(id: string) {
        showToast("Are you sure you want to delete this task?", "error", {
            onConfirm: async () => {
                try {
                    await deleteTask(id);
                    setTasks((prev) => prev.filter((t) => t.id !== id));
                    showToast("Task deleted", "success");
                } catch (e: any) {
                    showToast(e?.message ?? "Delete failed", "error");
                }
            }
        });
    }

    return (
        <div className="min-h-screen bg-[#f7f7f8]">
            <div className="mx-auto max-w-5xl px-4 py-8">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Tasks</h1>
                        <p className="text-sm text-black/60">Simple task manager (NestJS + Prisma + Postgres)</p>
                    </div>

                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl border border-black/10 bg-white p-4">
                        <div className="text-sm text-black/60">Todo</div>
                        <div className="mt-1 text-2xl font-semibold">{counts.TODO}</div>
                    </div>
                    <div className="rounded-2xl border border-black/10 bg-white p-4">
                        <div className="text-sm text-black/60">In Progress</div>
                        <div className="mt-1 text-2xl font-semibold">{counts.IN_PROGRESS}</div>
                    </div>
                    <div className="rounded-2xl border border-black/10 bg-white p-4">
                        <div className="text-sm text-black/60">Done</div>
                        <div className="mt-1 text-2xl font-semibold">{counts.DONE}</div>
                    </div>
                </div>

                <div className="mt-6 grid gap-6 lg:grid-cols-[360px_1fr]">
                    {/* Create */}
                    <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
                        <h2 className="text-base font-semibold">Create task</h2>
                        <div className="mt-4 space-y-3">
                            <Input
                                label="Title"
                                value={createForm.title}
                                onChange={(e) => setCreateForm((p) => ({ ...p, title: e.target.value }))}
                                error={createErrors.title}
                                placeholder="e.g. Finish README"
                            />
                            <Textarea
                                label="Description"
                                value={createForm.description}
                                onChange={(e) => setCreateForm((p) => ({ ...p, description: e.target.value }))}
                                error={createErrors.description}
                                placeholder="Optional details..."
                                rows={4}
                            />
                            <Select
                                label="Status"
                                value={createForm.status}
                                onChange={(e) =>
                                    setCreateForm((p) => ({ ...p, status: e.target.value as TaskStatus }))
                                }
                            >
                                {STATUS_OPTIONS.map((o) => (
                                    <option key={o.value} value={o.value}>
                                        {o.label}
                                    </option>
                                ))}
                            </Select>

                            <Button onClick={onCreate} disabled={savingCreate}>
                                {savingCreate ? "Creating..." : "Create"}
                            </Button>
                        </div>
                    </div>

                    {/* List */}
                    <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-base font-semibold">
                                    {filter === "ALL" ? "All tasks" : `${prettyStatus(filter)} tasks`}
                                </h2>
                                <Button variant="secondary" onClick={load} disabled={loading}>
                                    Refresh
                                </Button>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => setFilter("ALL")}
                                    className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${filter === "ALL"
                                        ? "bg-black text-white"
                                        : "bg-black/5 text-black/60 hover:bg-black/10"
                                        }`}
                                >
                                    All
                                </button>
                                {STATUS_OPTIONS.map((opt) => (
                                    <button
                                        key={opt.value}
                                        onClick={() => setFilter(opt.value)}
                                        className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${filter === opt.value
                                            ? `${opt.bgClass} ${opt.textClass} border`
                                            : "bg-black/5 text-black/60 hover:bg-black/10"
                                            }`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {loading ? (
                            <div className="mt-6 text-sm text-black/60">Loading…</div>
                        ) : filteredTasks.length === 0 ? (
                            <div className="mt-6 text-sm text-black/60">
                                {filter === "ALL" ? "No tasks yet. Create one 👈" : `No tasks marked as ${prettyStatus(filter)}.`}
                            </div>
                        ) : (
                            <>
                                <div className="mt-4 divide-y divide-black/5">
                                    {paginatedTasks.map((t) => (
                                        <div key={t.id} className="py-4">
                                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="text-sm font-semibold">{t.title}</div>
                                                        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getStatusStyles(t.status).bg} ${getStatusStyles(t.status).text}`}>
                                                            {prettyStatus(t.status)}
                                                        </span>
                                                    </div>
                                                    {t.description ? (
                                                        <div className="mt-1 text-sm text-black/60">{t.description}</div>
                                                    ) : null}
                                                    <div className="mt-2 text-xs text-black/40">
                                                        {new Date(t.createdAt).toLocaleString()}
                                                    </div>
                                                </div>

                                                <div className="flex gap-2">
                                                    <Button variant="secondary" onClick={() => startEdit(t)}>
                                                        Edit
                                                    </Button>
                                                    <Button variant="danger" onClick={() => onDelete(t.id)}>
                                                        Delete
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {totalPages > 1 && (
                                    <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-black/5 pt-6 sm:flex-row">
                                        <div className="text-xs text-black/40">
                                            Showing <span className="font-medium text-black">{(page - 1) * PAGE_SIZE + 1}</span> to{" "}
                                            <span className="font-medium text-black">
                                                {Math.min(page * PAGE_SIZE, filteredTasks.length)}
                                            </span>{" "}
                                            of <span className="font-medium text-black">{filteredTasks.length}</span> results
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="secondary"
                                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                                disabled={page === 1}
                                            >
                                                Previous
                                            </Button>
                                            <div className="flex items-center gap-1 mx-2">
                                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                                    <button
                                                        key={p}
                                                        onClick={() => setPage(p)}
                                                        className={`h-8 w-8 rounded-full text-xs font-medium transition-all ${page === p
                                                            ? "bg-black text-white shadow-md scale-110"
                                                            : "text-black/40 hover:bg-black/5 hover:text-black"
                                                            }`}
                                                    >
                                                        {p}
                                                    </button>
                                                ))}
                                            </div>
                                            <Button
                                                variant="secondary"
                                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                                disabled={page === totalPages}
                                            >
                                                Next
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>


            </div>

            <Modal
                isOpen={!!editId}
                onClose={() => setEditId(null)}
                title="Edit Task"
            >
                <div className="grid gap-5">
                    <Input
                        label="Title"
                        value={editForm.title}
                        onChange={(e) => setEditForm((p) => ({ ...p, title: e.target.value }))}
                        error={editErrors.title}
                        placeholder="e.g. Finish README"
                    />
                    <Textarea
                        label="Description"
                        value={editForm.description}
                        onChange={(e) =>
                            setEditForm((p) => ({ ...p, description: e.target.value }))
                        }
                        error={editErrors.description}
                        placeholder="Optional details..."
                        rows={4}
                    />
                    <Select
                        label="Status"
                        value={editForm.status}
                        onChange={(e) =>
                            setEditForm((p) => ({ ...p, status: e.target.value as TaskStatus }))
                        }
                    >
                        {STATUS_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>
                                {o.label}
                            </option>
                        ))}
                    </Select>

                    <div className="mt-2 flex gap-3">
                        <Button onClick={onSaveEdit} disabled={savingEdit}>
                            {savingEdit ? "Saving..." : "Save changes"}
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={() => setEditId(null)}
                            disabled={savingEdit}
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
