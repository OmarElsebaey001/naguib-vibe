"use client";

import { useState, useRef, useEffect } from "react";
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

export function OperationsBlock({ toolCall }: OperationsBlockProps) {
  const [expanded, setExpanded] = useState(false);
  const codeRef = useRef<HTMLPreElement>(null);
  const wasStreamingRef = useRef(!toolCall.isComplete);

  // Auto-scroll code block while streaming
  useEffect(() => {
    if (expanded && !toolCall.isComplete && codeRef.current) {
      codeRef.current.scrollTop = codeRef.current.scrollHeight;
    }
  }, [expanded, toolCall.buffer, toolCall.isComplete]);

  // Stop tracking streaming once complete
  useEffect(() => {
    if (toolCall.isComplete) {
      wasStreamingRef.current = false;
    }
  }, [toolCall.isComplete]);

  const summary = toolCall.isComplete
    ? deriveOperationsSummary(toolCall.buffer)
    : "Applying changes...";

  const chevron = expanded ? "\u25BE" : "\u25B8";

  return (
    <div className="mt-2">
      {/* Pill */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] bg-zinc-800/60 text-zinc-400 hover:bg-zinc-700/60 cursor-pointer transition-colors"
      >
        {!toolCall.isComplete && (
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
        )}
        <span>{chevron}</span>
        <span>{summary}</span>
      </button>

      {/* Expandable code block */}
      <div
        className="grid transition-[grid-template-rows] duration-200 ease-out"
        style={{ gridTemplateRows: expanded ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <pre
            ref={codeRef}
            className="mt-2 rounded-lg bg-zinc-900 border border-zinc-800 p-3 font-mono text-xs text-zinc-300 whitespace-pre overflow-x-auto max-h-[300px] overflow-y-auto"
          >
            {toolCall.buffer || " "}
          </pre>
        </div>
      </div>
    </div>
  );
}
