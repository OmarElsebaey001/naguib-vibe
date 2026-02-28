"use client";

import { useState, useRef, useEffect } from "react";
import { FileCode2, Check, ChevronDown } from "lucide-react";
import { type ToolCallState } from "@/lib/agent/use-agent";

interface OperationsBlockProps {
  toolCall: ToolCallState;
}

function deriveOperationsSummary(jsonStr: string): string {
  try {
    const parsed = JSON.parse(jsonStr);
    const ops: { type: string; [key: string]: unknown }[] =
      parsed.operations || [];
    if (ops.length === 0) return "No changes";

    const parts: string[] = [];

    const replaceAll = ops.find((o) => o.type === "replace_all");
    if (replaceAll) {
      const config = replaceAll.config as { sections?: unknown[] } | undefined;
      const count = config?.sections?.length ?? 0;
      parts.push(
        `Page created with ${count} section${count !== 1 ? "s" : ""}`,
      );
    }

    const counts: Record<string, number> = {};
    for (const op of ops) {
      if (op.type === "replace_all") continue;
      counts[op.type] = (counts[op.type] || 0) + 1;
    }

    const LABELS: Record<string, string> = {
      add_section: "section added",
      remove_section: "section removed",
      update_content: "content updated",
      swap_variant: "variant swapped",
      set_theme: "theme updated",
      reorder_sections: "sections reordered",
      move_section: "section moved",
      set_mode: "mode changed",
    };

    for (const [type, count] of Object.entries(counts)) {
      const label = LABELS[type] || type;
      parts.push(count > 1 ? `${count}x ${label}` : label);
    }

    return parts.join(" · ");
  } catch {
    return "Changes applied";
  }
}

/** Count how many lines the buffer has so far */
function lineCount(str: string): number {
  if (!str) return 0;
  let count = 1;
  for (let i = 0; i < str.length; i++) {
    if (str[i] === "\n") count++;
  }
  return count;
}

export function OperationsBlock({ toolCall }: OperationsBlockProps) {
  const [collapsed, setCollapsed] = useState(false);
  const codeRef = useRef<HTMLPreElement>(null);

  // Auto-scroll code block while streaming
  useEffect(() => {
    if (!collapsed && !toolCall.isComplete && codeRef.current) {
      codeRef.current.scrollTop = codeRef.current.scrollHeight;
    }
  }, [collapsed, toolCall.buffer, toolCall.isComplete]);

  const isStreaming = !toolCall.isComplete;
  const summary = toolCall.isComplete
    ? deriveOperationsSummary(toolCall.buffer)
    : null;
  const lines = lineCount(toolCall.buffer);

  return (
    <div className="mt-3 mb-1">
      {/* Card */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/80 overflow-hidden">
        {/* Header */}
        <button
          onClick={() => setCollapsed((v) => !v)}
          className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-zinc-800/50 transition-colors"
        >
          {/* Icon */}
          <div
            className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 ${
              isStreaming
                ? "bg-violet-500/15 text-violet-400"
                : "bg-emerald-500/15 text-emerald-400"
            }`}
          >
            {isStreaming ? (
              <FileCode2 className="w-3.5 h-3.5" />
            ) : (
              <Check className="w-3.5 h-3.5" />
            )}
          </div>

          {/* Label */}
          <div className="flex-1 text-left min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-zinc-200">
                {isStreaming ? "Building page config" : "Page config"}
              </span>
              {isStreaming && (
                <span className="flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-violet-400 animate-pulse" />
                  <span className="w-1 h-1 rounded-full bg-violet-400 animate-pulse [animation-delay:150ms]" />
                  <span className="w-1 h-1 rounded-full bg-violet-400 animate-pulse [animation-delay:300ms]" />
                </span>
              )}
            </div>
            <p className="text-[11px] text-zinc-500 truncate">
              {isStreaming
                ? `${lines} line${lines !== 1 ? "s" : ""} written...`
                : summary}
            </p>
          </div>

          {/* Chevron */}
          <ChevronDown
            className={`w-3.5 h-3.5 text-zinc-500 flex-shrink-0 transition-transform duration-200 ${
              collapsed ? "-rotate-90" : ""
            }`}
          />
        </button>

        {/* Code preview */}
        <div
          className="grid transition-[grid-template-rows] duration-200 ease-out"
          style={{ gridTemplateRows: collapsed ? "0fr" : "1fr" }}
        >
          <div className="overflow-hidden">
            <div className="border-t border-zinc-800">
              <pre
                ref={codeRef}
                className="px-3 py-2.5 font-mono text-[11px] leading-relaxed text-zinc-400 whitespace-pre overflow-x-auto max-h-[200px] overflow-y-auto"
              >
                {toolCall.buffer || " "}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
