"use client";

import { useState } from "react";
import { Monitor, Tablet, Smartphone } from "lucide-react";
import { PageRenderer } from "@/lib/renderer/page-renderer";
import { type PageConfig } from "@/lib/schemas/page-config";
import { ensureRegistered } from "@/components/sections/register";

ensureRegistered();

type Viewport = "desktop" | "tablet" | "mobile";

const VIEWPORT_WIDTHS: Record<Viewport, string> = {
  desktop: "100%",
  tablet: "768px",
  mobile: "375px",
};

interface PreviewPanelProps {
  config: PageConfig | null;
}

export function PreviewPanel({ config }: PreviewPanelProps) {
  const [viewport, setViewport] = useState<Viewport>("desktop");

  return (
    <div className="flex flex-col h-full bg-zinc-100">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-zinc-200">
        <span className="text-xs text-zinc-500 font-medium">
          {config?.name || "Preview"}
        </span>
        <div className="flex items-center gap-1 bg-zinc-100 rounded-lg p-0.5">
          {([
            { key: "desktop", Icon: Monitor, label: "Desktop" },
            { key: "tablet", Icon: Tablet, label: "Tablet" },
            { key: "mobile", Icon: Smartphone, label: "Mobile" },
          ] as const).map(({ key, Icon, label }) => (
            <button
              key={key}
              onClick={() => setViewport(key)}
              title={label}
              className={`p-1.5 rounded-md transition-colors ${
                viewport === key
                  ? "bg-white text-zinc-900 shadow-sm"
                  : "text-zinc-400 hover:text-zinc-600"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
            </button>
          ))}
        </div>
      </div>

      {/* Preview area */}
      <div className="flex-1 overflow-auto flex justify-center p-4">
        <div
          className="bg-white shadow-lg transition-[width] duration-300 overflow-auto"
          style={{
            width: VIEWPORT_WIDTHS[viewport],
            maxWidth: "100%",
            minHeight: "100%",
          }}
        >
          {config ? (
            <PageRenderer config={config} />
          ) : (
            <div className="flex items-center justify-center min-h-[60vh] text-zinc-400">
              <div className="text-center">
                <p className="text-base font-medium">No page yet</p>
                <p className="text-sm mt-1">
                  Send a message to generate your landing page
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
