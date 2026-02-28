"use client";

import {
  ChevronUp,
  ChevronDown,
  Trash2,
  Moon,
  Sun,
  Layers,
} from "lucide-react";
import { type Section } from "@/lib/schemas/page-config";
import { getVariantsForType } from "@/lib/registry";

const TYPE_LABELS: Record<string, string> = {
  header: "Header",
  hero: "Hero",
  logos: "Logos",
  features: "Features",
  "social-proof": "Testimonials",
  stats: "Stats",
  pricing: "Pricing",
  faq: "FAQ",
  cta: "CTA",
  footer: "Footer",
};

interface SectionListProps {
  sections: Section[];
  onToggleMode: (id: string) => void;
  onRemove: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  onSwapVariant: (id: string, variant: string) => void;
}

export function SectionList({
  sections,
  onToggleMode,
  onRemove,
  onMoveUp,
  onMoveDown,
  onSwapVariant,
}: SectionListProps) {
  if (sections.length === 0) return null;

  return (
    <div className="space-y-1">
      {sections.map((section, idx) => {
        const variants = getVariantsForType(section.type);
        return (
          <div
            key={section.id}
            className="group flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-900/50 hover:bg-zinc-800/80 transition-colors"
          >
            <Layers className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-zinc-300 truncate">
                {TYPE_LABELS[section.type] || section.type}
              </div>
              {variants.length > 1 ? (
                <select
                  value={section.variant}
                  onChange={(e) =>
                    onSwapVariant(section.id, e.target.value)
                  }
                  className="text-[10px] text-zinc-500 bg-transparent border-none p-0 outline-none cursor-pointer w-full truncate"
                >
                  {variants.map((v) => (
                    <option key={v.metadata.variant} value={v.metadata.variant}>
                      {v.metadata.variant}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="text-[10px] text-zinc-500 truncate">
                  {section.variant}
                </div>
              )}
            </div>
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => onToggleMode(section.id)}
                title={section.mode === "light" ? "Switch to dark" : "Switch to light"}
                className="p-1 rounded text-zinc-500 hover:text-zinc-300"
              >
                {section.mode === "light" ? (
                  <Moon className="w-3 h-3" />
                ) : (
                  <Sun className="w-3 h-3" />
                )}
              </button>
              <button
                onClick={() => onMoveUp(section.id)}
                disabled={idx === 0}
                className="p-1 rounded text-zinc-500 hover:text-zinc-300 disabled:opacity-20"
              >
                <ChevronUp className="w-3 h-3" />
              </button>
              <button
                onClick={() => onMoveDown(section.id)}
                disabled={idx === sections.length - 1}
                className="p-1 rounded text-zinc-500 hover:text-zinc-300 disabled:opacity-20"
              >
                <ChevronDown className="w-3 h-3" />
              </button>
              <button
                onClick={() => onRemove(section.id)}
                className="p-1 rounded text-zinc-500 hover:text-red-400"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
