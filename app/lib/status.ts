import type { TaskStatus } from "./api";

export const STATUS_OPTIONS: { value: TaskStatus; label: string; bgClass: string; textClass: string }[] = [
    {
        value: "TODO",
        label: "Todo",
        bgClass: "bg-blue-50 border-blue-200",
        textClass: "text-blue-700"
    },
    {
        value: "IN_PROGRESS",
        label: "In Progress",
        bgClass: "bg-amber-50 border-amber-200",
        textClass: "text-amber-700"
    },
    {
        value: "DONE",
        label: "Done",
        bgClass: "bg-emerald-50 border-emerald-200",
        textClass: "text-emerald-700"
    },
];

export function prettyStatus(s: TaskStatus) {
    return STATUS_OPTIONS.find((x) => x.value === s)?.label ?? s;
}

export function getStatusStyles(s: TaskStatus) {
    const opt = STATUS_OPTIONS.find((x) => x.value === s);
    return {
        bg: opt?.bgClass ?? "bg-black/5 border-black/10",
        text: opt?.textClass ?? "text-black/60"
    };
}
