"use client";

import React from "react";
import { create } from "zustand";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

type ToastKind = "success" | "error";

interface ToastItem {
  id: number;
  message: string;
  kind: ToastKind;
}

interface ToastState {
  toasts: ToastItem[];
  push: (message: string, kind: ToastKind) => void;
  dismiss: (id: number) => void;
}

let nextId = 1;

const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  push: (message, kind) => {
    const id = nextId++;
    set((s) => ({ toasts: [...s.toasts, { id, message, kind }] }));
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, 3500);
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

/** Fire a toast from anywhere (client-side). */
export function toast(message: string, kind: ToastKind = "success") {
  useToastStore.getState().push(message, kind);
}

/** Render once, near the root. */
export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 items-end">
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className="flex items-center gap-2.5 bg-slate-900 text-white text-sm font-medium pl-3.5 pr-2 py-2.5 rounded-lg shadow-xl max-w-xs"
        >
          {t.kind === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          )}
          <span className="flex-1">{t.message}</span>
          <button
            onClick={() => dismiss(t.id)}
            className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
