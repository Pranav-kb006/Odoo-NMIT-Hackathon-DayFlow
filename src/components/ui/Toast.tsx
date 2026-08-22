"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info";

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type: ToastType;
}

let toastListeners: Array<(toast: ToastMessage) => void> = [];

export function showToast(title: string, description?: string, type: ToastType = "success") {
  const toast: ToastMessage = {
    id: Math.random().toString(36).substring(2, 9),
    title,
    description,
    type,
  };
  toastListeners.forEach((listener) => listener(toast));
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const addToast = (toast: ToastMessage) => {
      setToasts((prev) => [...prev, toast]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id));
      }, 4000);
    };

    toastListeners.push(addToast);
    return () => {
      toastListeners = toastListeners.filter((l) => l !== addToast);
    };
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === "success";
        const isError = toast.type === "error";

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 rounded-xl border p-4 shadow-lg backdrop-blur-sm transition-all animate-in slide-in-from-bottom-2 ${
              isSuccess
                ? "bg-emerald-50/95 border-emerald-200 text-emerald-900"
                : isError
                ? "bg-red-50/95 border-red-200 text-red-900"
                : "bg-blue-50/95 border-blue-200 text-blue-900"
            }`}
          >
            {isSuccess ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : isError ? (
              <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
            ) : (
              <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
            )}

            <div className="flex-1">
              <h4 className="text-sm font-semibold">{toast.title}</h4>
              {toast.description && (
                <p className="text-xs opacity-90 mt-0.5">{toast.description}</p>
              )}
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
