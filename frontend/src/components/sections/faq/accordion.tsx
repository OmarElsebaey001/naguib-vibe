"use client";

import { useState } from "react";
import { type FaqContent } from "./schema";

export const metadata = {
  type: "faq" as const,
  variant: "accordion",
  description: "Expandable accordion FAQ. Click to reveal answers. Classic and space-efficient.",
  tags: ["faq", "accordion", "interactive"],
  supportedModes: ["light", "dark"] as const,
};

export function FaqAccordion({
  content,
}: {
  content: FaqContent;
  mode: "light" | "dark";
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="bg-background text-foreground py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          {content.tagline && (
            <p className="text-sm font-medium text-primary mb-2">{content.tagline}</p>
          )}
          <h2
            className="text-3xl sm:text-4xl font-bold tracking-tight"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {content.headline}
          </h2>
          {content.description && (
            <p className="mt-4 text-lg text-muted-foreground">{content.description}</p>
          )}
        </div>
        <div className="divide-y divide-border">
          {content.items.map((item, i) => (
            <div key={i}>
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="flex w-full items-center justify-between py-5 text-left"
              >
                <span className="font-medium">{item.question}</span>
                <span className="ml-4 text-muted-foreground text-xl">
                  {openIndex === i ? "−" : "+"}
                </span>
              </button>
              {openIndex === i && (
                <div className="pb-5 text-muted-foreground text-sm leading-relaxed">
                  {item.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
