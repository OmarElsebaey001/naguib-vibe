"use client";

import {
  ChevronUp,
  ChevronDown,
  Trash2,
  Moon,
  Sun,
  Layers,
  Wand2,
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
  onVibeCode: (sectionType: string, sectionId: string) => void;
}

export function SectionList({
  sections,
  onToggleMode,
  onRemove,
  onMoveUp,
  onMoveDown,
  onSwapVariant,
  onVibeCode,
}: SectionListProps) {
  if (sections.length === 0) return null;

  return (
    <div className="space-y-1.5">
      {sections.map((section, idx) => {
        const variants = getVariantsForType(section.type);
        return (
          <div
            key={section.id}
            className="group rounded-lg bg-zinc-900/50 hover:bg-zinc-800/80 transition-colors px-3 py-2.5"
          >
            {/* Row 1: icon + name + vibe code */}
            <div className="flex items-center gap-2 mb-1">
              <Layers className="w-4 h-4 text-zinc-500 flex-shrink-0" />
              <span className="text-sm font-medium text-zinc-300 flex-1">
                {TYPE_LABELS[section.type] || section.type}
              </span>
              <button
                onClick={() => onVibeCode(section.type, section.id)}
                title="Vibe code this section"
                className="flex items-center gap-1 px-1.5 py-0.5 rounded-md text-violet-400 hover:text-violet-300 hover:bg-violet-500/10 transition-colors"
              >
                <Wand2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Row 2: variant selector + action buttons */}
            <div className="flex items-center gap-1 pl-6">
              <div className="flex-1 min-w-0">
                {variants.length > 1 ? (
                  <select
                    value={section.variant}
                    onChange={(e) =>
                      onSwapVariant(section.id, e.target.value)
                    }
                    className="text-[11px] text-zinc-500 bg-transparent border-none p-0 outline-none cursor-pointer w-full truncate"
                  >
                    {variants.map((v) => (
                      <option key={v.metadata.variant} value={v.metadata.variant}>
                        {v.metadata.variant}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="text-[11px] text-zinc-500 truncate">
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
                    <Moon className="w-3.5 h-3.5" />
                  ) : (
                    <Sun className="w-3.5 h-3.5" />
                  )}
                </button>
                <button
                  onClick={() => onMoveUp(section.id)}
                  disabled={idx === 0}
                  className="p-1 rounded text-zinc-500 hover:text-zinc-300 disabled:opacity-20"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onMoveDown(section.id)}
                  disabled={idx === sections.length - 1}
                  className="p-1 rounded text-zinc-500 hover:text-zinc-300 disabled:opacity-20"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onRemove(section.id)}
                  className="p-1 rounded text-zinc-500 hover:text-red-400"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
