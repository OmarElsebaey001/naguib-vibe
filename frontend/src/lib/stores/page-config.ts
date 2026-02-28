"use client";

import { create } from "zustand";
import { applyPatch, type Operation } from "fast-json-patch";
import { type PageConfig, type Theme } from "@/lib/schemas/page-config";
import { themePresets } from "@/lib/theme/presets";

const UNDO_STACK_LIMIT = 50;

interface PageConfigState {
  config: PageConfig | null;
  undoStack: PageConfig[];
  redoStack: PageConfig[];

  // Actions
  setConfig: (config: PageConfig) => void;
  replaceConfig: (config: PageConfig) => void;
  applyPatches: (patches: Operation[]) => void;
  setTheme: (theme: Theme) => void;
  applyThemePreset: (presetName: string) => void;
  toggleSectionMode: (sectionId: string) => void;
  removeSection: (sectionId: string) => void;
  moveSectionUp: (sectionId: string) => void;
  moveSectionDown: (sectionId: string) => void;
  swapVariant: (sectionId: string, variant: string) => void;
  undo: () => void;
  redo: () => void;
}

function pushUndo(state: PageConfigState, current: PageConfig): {
  undoStack: PageConfig[];
  redoStack: PageConfig[];
} {
  return {
    undoStack: [...state.undoStack.slice(-(UNDO_STACK_LIMIT - 1)), current],
    redoStack: [],
  };
}

export const usePageConfigStore = create<PageConfigState>((set, get) => ({
  config: null,
  undoStack: [],
  redoStack: [],

  setConfig: (config) => set({ config }),

  replaceConfig: (config) => {
    const current = get().config;
    set({
      config,
      ...(current ? pushUndo(get(), current) : {}),
    });
  },

  applyPatches: (patches) => {
    const current = get().config;
    if (!current) return;
    try {
      const patched = applyPatch(
        structuredClone(current),
        patches,
        false,
        false,
      );
      set({
        config: patched.newDocument as PageConfig,
        ...pushUndo(get(), current),
      });
    } catch (e) {
      console.error("Failed to apply patches:", e);
    }
  },

  setTheme: (theme) => {
    const current = get().config;
    if (!current) return;
    set({
      config: { ...current, theme },
      ...pushUndo(get(), current),
    });
  },

  applyThemePreset: (presetName) => {
    const preset = themePresets[presetName];
    if (!preset) return;
    const { description: _, ...theme } = preset;
    get().setTheme(theme as Theme);
  },

  toggleSectionMode: (sectionId) => {
    const current = get().config;
    if (!current) return;
    set({
      config: {
        ...current,
        sections: current.sections.map((s) =>
          s.id === sectionId
            ? { ...s, mode: s.mode === "light" ? "dark" : "light" }
            : s,
        ),
      },
      ...pushUndo(get(), current),
    });
  },

  removeSection: (sectionId) => {
    const current = get().config;
    if (!current) return;
    set({
      config: {
        ...current,
        sections: current.sections.filter((s) => s.id !== sectionId),
      },
      ...pushUndo(get(), current),
    });
  },

  moveSectionUp: (sectionId) => {
    const current = get().config;
    if (!current) return;
    const idx = current.sections.findIndex((s) => s.id === sectionId);
    if (idx <= 0) return;
    const sections = [...current.sections];
    [sections[idx - 1], sections[idx]] = [sections[idx], sections[idx - 1]];
    set({
      config: { ...current, sections },
      ...pushUndo(get(), current),
    });
  },

  moveSectionDown: (sectionId) => {
    const current = get().config;
    if (!current) return;
    const idx = current.sections.findIndex((s) => s.id === sectionId);
    if (idx < 0 || idx >= current.sections.length - 1) return;
    const sections = [...current.sections];
    [sections[idx], sections[idx + 1]] = [sections[idx + 1], sections[idx]];
    set({
      config: { ...current, sections },
      ...pushUndo(get(), current),
    });
  },

  swapVariant: (sectionId, variant) => {
    const current = get().config;
    if (!current) return;
    set({
      config: {
        ...current,
        sections: current.sections.map((s) =>
          s.id === sectionId ? { ...s, variant } : s,
        ),
      },
      ...pushUndo(get(), current),
    });
  },

  undo: () => {
    const { undoStack, config } = get();
    if (undoStack.length === 0 || !config) return;
    const prev = undoStack[undoStack.length - 1];
    set({
      config: prev,
      undoStack: undoStack.slice(0, -1),
      redoStack: [...get().redoStack, config],
    });
  },

  redo: () => {
    const { redoStack, config } = get();
    if (redoStack.length === 0 || !config) return;
    const next = redoStack[redoStack.length - 1];
    set({
      config: next,
      redoStack: redoStack.slice(0, -1),
      undoStack: [...get().undoStack, config],
    });
  },
}));
