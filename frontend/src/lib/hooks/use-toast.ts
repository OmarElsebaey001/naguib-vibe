"use client";

import { useCallback, useSyncExternalStore } from "react";

export interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

let toasts: Toast[] = [];
let listeners: (() => void)[] = [];

function emit() {
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

function getSnapshot(): Toast[] {
  return toasts;
}

export function showToast(message: string, type: Toast["type"] = "info") {
  const id = `toast-${Date.now()}-${Math.random()}`;
  toasts = [...toasts, { id, message, type }];
  emit();

  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id);
    emit();
  }, 4000);
}

export function useToasts() {
  const items = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const dismiss = useCallback((id: string) => {
    toasts = toasts.filter((t) => t.id !== id);
    emit();
  }, []);

  return { toasts: items, dismiss };
}
