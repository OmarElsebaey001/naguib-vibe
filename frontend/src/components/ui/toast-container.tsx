"use client";

import { useToasts } from "@/lib/hooks/use-toast";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
};

const styles = {
  success: "border-emerald-800/50 bg-emerald-950/80 text-emerald-200",
  error: "border-red-800/50 bg-red-950/80 text-red-200",
  info: "border-zinc-700/50 bg-zinc-900/80 text-zinc-200",
};

export function ToastContainer() {
  const { toasts, dismiss } = useToasts();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
      {toasts.map((t) => {
        const Icon = icons[t.type];
        return (
          <div
            key={t.id}
            className={`flex items-start gap-2.5 px-4 py-3 rounded-lg border backdrop-blur-sm shadow-lg animate-in slide-in-from-right-5 ${styles[t.type]}`}
          >
            <Icon className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p className="text-sm flex-1">{t.message}</p>
            <button onClick={() => dismiss(t.id)} className="opacity-60 hover:opacity-100 transition-opacity">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
