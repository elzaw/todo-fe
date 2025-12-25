"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";

type ToastType = "success" | "error" | "info";

interface Toast {
    id: string;
    message: string;
    type: ToastType;
    onConfirm?: () => void;
    onCancel?: () => void;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType, options?: { onConfirm?: () => void; onCancel?: () => void }) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const showToast = useCallback((message: string, type: ToastType = "info", options?: { onConfirm?: () => void; onCancel?: () => void }) => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, message, type, ...options }]);

        // Don't auto-remove if it's a confirmation toast
        if (!options?.onConfirm) {
            setTimeout(() => removeToast(id), 3000);
        }
    }, [removeToast]);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {/* Toast Container */}
            <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-3 pointer-events-none">
                {toasts.map((toast) => (
                    <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) throw new Error("useToast must be used within a ToastProvider");
    return context;
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
    const isConfirm = !!toast.onConfirm;

    const baseStyles = "pointer-events-auto flex min-w-[320px] max-w-sm flex-col gap-3 rounded-2xl border p-4 shadow-xl transition-all animate-in slide-in-from-right-full duration-300";

    const typeStyles = {
        success: "bg-emerald-50 border-emerald-200 text-emerald-800",
        error: "bg-red-50 border-red-200 text-red-800",
        info: "bg-blue-50 border-blue-200 text-blue-800",
    }[toast.type];

    const icon = {
        success: (
            <svg className="h-5 w-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
        ),
        error: (
            <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
        ),
        info: (
            <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
    }[toast.type];

    return (
        <div className={`${baseStyles} ${typeStyles}`}>
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                    {icon}
                    <span className="text-sm font-medium leading-tight">{toast.message}</span>
                </div>
                {!isConfirm && (
                    <button onClick={onClose} className="opacity-50 hover:opacity-100 transition-opacity">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}
            </div>

            {isConfirm && (
                <div className="flex gap-2 self-end">
                    <button
                        onClick={() => {
                            toast.onCancel?.();
                            onClose();
                        }}
                        className="rounded-lg px-3 py-1.5 text-xs font-semibold hover:bg-black/5 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            toast.onConfirm?.();
                            onClose();
                        }}
                        className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-red-700 transition-colors"
                    >
                        Delete
                    </button>
                </div>
            )}
        </div>
    );
}
