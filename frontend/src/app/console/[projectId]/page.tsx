"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import { ProtectedRoute } from "@/lib/auth/protected";
import { useAgent } from "@/lib/agent/use-agent";
import { usePageConfigStore } from "@/lib/stores/page-config";
import { ChatPanel } from "@/components/console/chat-panel";
import { PreviewPanel } from "@/components/console/preview-panel";
import { SectionList } from "@/components/console/section-list";
import { themePresets } from "@/lib/theme/presets";
import { showToast } from "@/lib/hooks/use-toast";
import * as api from "@/lib/api/client";
import {
  Undo2,
  Redo2,
  Palette,
  PanelLeftClose,
  PanelLeft,
  Download,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

export default function ProjectConsolePage() {
  return (
    <ProtectedRoute>
      <ProjectConsoleContent />
    </ProtectedRoute>
  );
}

function ProjectConsoleContent() {
  const params = useParams();
  const projectId = params.projectId as string;

  const { messages, isLoading, error, currentStep, sendMessage, clearError, setInitialMessages, toolCalls, streamingContent, streamingMsgId } =
    useAgent();
  const config = usePageConfigStore((s) => s.config);
  const undo = usePageConfigStore((s) => s.undo);
  const redo = usePageConfigStore((s) => s.redo);
  const undoStack = usePageConfigStore((s) => s.undoStack);
  const redoStack = usePageConfigStore((s) => s.redoStack);
  const replaceConfig = usePageConfigStore((s) => s.replaceConfig);
  const toggleSectionMode = usePageConfigStore((s) => s.toggleSectionMode);
  const removeSection = usePageConfigStore((s) => s.removeSection);
  const moveSectionUp = usePageConfigStore((s) => s.moveSectionUp);
  const moveSectionDown = usePageConfigStore((s) => s.moveSectionDown);
  const swapVariant = usePageConfigStore((s) => s.swapVariant);
  const applyThemePreset = usePageConfigStore((s) => s.applyThemePreset);

  const [showSections, setShowSections] = useState(true);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [projectLoaded, setProjectLoaded] = useState(false);
  const [chatPrefill, setChatPrefill] = useState<string | null>(null);

  // Auto-save debounce ref
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedRef = useRef<string>("");

  const [loadError, setLoadError] = useState(false);

  // Load project on mount (or when projectId changes)
  useEffect(() => {
    let cancelled = false;

    // Reset state for the new project
    setProjectLoaded(false);
    setLoadError(false);
    setInitialMessages([]);
    replaceConfig(null as unknown as import("@/lib/schemas/page-config").PageConfig);
    lastSavedRef.current = "";

    (async () => {
      try {
        const project = await api.getProject(projectId);
        if (cancelled) return;
        if (project.config) {
          replaceConfig(project.config as import("@/lib/schemas/page-config").PageConfig);
        }
        if (project.conversation_history?.length > 0) {
          setInitialMessages(
            project.conversation_history.map((m: Record<string, unknown>) => ({
              id: (m.id as string) || `restored-${Math.random()}`,
              role: (m.role as "user" | "assistant") || "user",
              content: (m.content as string) || "",
            }))
          );
        }
        setProjectLoaded(true);
      } catch {
        if (!cancelled) {
          setLoadError(true);
          showToast("Failed to load project", "error");
        }
      }
    })();
    return () => { cancelled = true; };
  }, [projectId, replaceConfig, setInitialMessages]);

  // Auto-save: debounce config + messages changes
  const configRef = useRef(config);
  const messagesRef = useRef(messages);
  configRef.current = config;
  messagesRef.current = messages;

  const saveFailCountRef = useRef(0);

  const doSave = useCallback(async () => {
    const currentConfig = configRef.current;
    const currentMessages = messagesRef.current;
    const snapshot = JSON.stringify({ config: currentConfig, messages: currentMessages });
    if (snapshot === lastSavedRef.current) return;
    lastSavedRef.current = snapshot;

    const payload = {
      config: currentConfig as Record<string, unknown> | undefined,
      conversation_history: currentMessages.map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
      })),
      name: currentConfig?.name || undefined,
    };

    try {
      await api.updateProject(projectId, payload);
      saveFailCountRef.current = 0;
    } catch {
      saveFailCountRef.current += 1;
      // Only show toast on first failure to avoid spam
      if (saveFailCountRef.current === 1) {
        showToast("Auto-save failed. Your changes may not be saved.", "error");
      }
    }
  }, [projectId]);

  // Trigger save on config/messages changes (2s debounce)
  useEffect(() => {
    if (!projectLoaded) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(doSave, 1000);
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [config, messages, projectLoaded, doSave]);

  // Save on unmount and page unload (refresh/close)
  useEffect(() => {
    const handleBeforeUnload = () => {
      const currentConfig = configRef.current;
      const currentMessages = messagesRef.current;
      const snapshot = JSON.stringify({ config: currentConfig, messages: currentMessages });
      if (snapshot === lastSavedRef.current) return;

      // Use sendBeacon to ensure save survives page unload
      const token = localStorage.getItem("token");
      const payload = JSON.stringify({
        config: currentConfig,
        conversation_history: currentMessages.map((m) => ({
          id: m.id,
          role: m.role,
          content: m.content,
        })),
        name: currentConfig?.name || undefined,
      });
      const headers = { type: "application/json" };
      const blob = new Blob([payload], headers);
      const url = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8002"}/api/projects/${projectId}`;

      // sendBeacon doesn't support custom headers, so use fetch with keepalive
      fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: payload,
        keepalive: true,
      }).catch(() => {});
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      doSave();
    };
  }, [doSave, projectId]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        usePageConfigStore.getState().undo();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "z" && e.shiftKey) {
        e.preventDefault();
        usePageConfigStore.getState().redo();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleExport = async () => {
    if (!config || isExporting) return;
    setIsExporting(true);
    try {
      const res = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download =
        (config.name || "landing-page")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "") + ".zip";
      a.click();
      URL.revokeObjectURL(url);
      showToast("Project exported successfully!", "success");
    } catch (err) {
      console.error("Export error:", err);
      showToast("Export failed. Please try again.", "error");
    } finally {
      setIsExporting(false);
    }
  };

  if (loadError) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-zinc-950 text-zinc-400 gap-4">
        <p className="text-sm">Failed to load project.</p>
        <Link
          href="/dashboard"
          className="text-sm px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors"
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }

  if (!projectLoaded) {
    return (
      <div className="h-screen flex items-center justify-center bg-zinc-950 text-zinc-500">
        <Loader2 className="w-5 h-5 animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-zinc-950 text-zinc-100">
      {/* Top bar */}
      <div className="relative z-20 flex items-center justify-between px-4 py-2 border-b border-zinc-800 bg-zinc-950">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="p-1 rounded-md text-zinc-500 hover:text-zinc-300 transition-colors"
            title="Back to dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <span className="text-sm font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
            naguib
          </span>
          {config && (
            <span className="text-xs text-zinc-500 truncate max-w-[200px]">
              {config.name}
            </span>
          )}

          <div className="w-px h-4 bg-zinc-800 mx-1" />

          {/* Toggle section panel */}
          <button
            onClick={() => setShowSections(!showSections)}
            title={showSections ? "Hide sections" : "Show sections"}
            className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            {showSections ? (
              <PanelLeftClose className="w-4 h-4" />
            ) : (
              <PanelLeft className="w-4 h-4" />
            )}
          </button>

          {/* Theme picker */}
          <div className="relative">
            <button
              onClick={() => setShowThemePicker(!showThemePicker)}
              title="Theme"
              className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <Palette className="w-4 h-4" />
            </button>
            {showThemePicker && (
              <div className="absolute left-0 top-full mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl z-[100] p-2">
                <p className="text-[10px] text-zinc-500 uppercase font-medium px-2 py-1">
                  Theme Presets
                </p>
                {Object.entries(themePresets).map(([name, preset]) => (
                  <button
                    key={name}
                    onClick={() => {
                      applyThemePreset(name);
                      setShowThemePicker(false);
                    }}
                    className="w-full text-left px-2 py-1.5 rounded-md text-xs text-zinc-300 hover:bg-zinc-800 transition-colors flex items-center gap-2"
                  >
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{
                        backgroundColor: `hsl(${preset.primary})`,
                      }}
                    />
                    <span className="capitalize">{name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Undo/Redo */}
          <button
            onClick={undo}
            disabled={undoStack.length === 0}
            title="Undo (Cmd+Z)"
            className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-300 disabled:opacity-20 transition-colors"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={redo}
            disabled={redoStack.length === 0}
            title="Redo (Cmd+Shift+Z)"
            className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-300 disabled:opacity-20 transition-colors"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-1">
          {/* Export */}
          {config && config.sections.length > 0 && (
            <button
              onClick={handleExport}
              disabled={isExporting}
              title="Export as Vite project"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-violet-600 hover:bg-violet-500 text-white disabled:opacity-50 transition-colors"
            >
              {isExporting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              Export
            </button>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex min-h-0">
        {/* Chat panel */}
        <div className="w-[380px] flex-shrink-0 border-r border-zinc-800">
          <ChatPanel
            messages={messages}
            isLoading={isLoading}
            error={error}
            currentStep={currentStep}
            onSendMessage={sendMessage}
            onClearError={clearError}
            toolCalls={toolCalls}
            prefillInput={chatPrefill}
            onPrefillConsumed={() => setChatPrefill(null)}
            streamingContent={streamingContent}
            streamingMsgId={streamingMsgId}
          />
        </div>

        {/* Section panel — next to chat */}
        {showSections && config && config.sections.length > 0 && (
          <div className="w-[280px] flex-shrink-0 border-r border-zinc-800 bg-zinc-950 overflow-y-auto">
            <div className="p-3">
              <p className="text-[10px] text-zinc-500 uppercase font-medium mb-2">
                Sections ({config.sections.length})
              </p>
              <SectionList
                sections={config.sections}
                onToggleMode={toggleSectionMode}
                onRemove={removeSection}
                onMoveUp={moveSectionUp}
                onMoveDown={moveSectionDown}
                onSwapVariant={swapVariant}
                onVibeCode={(sectionType) => {
                  setChatPrefill(`In the ${sectionType} section, `);
                }}
              />
            </div>
          </div>
        )}

        {/* Preview */}
        <div className="flex-1 min-w-0">
          <PreviewPanel config={config} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
