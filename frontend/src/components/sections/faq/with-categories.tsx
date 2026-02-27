"use client";

import { useState, useMemo } from "react";
import { type FaqContent } from "./schema";

export const metadata = {
  type: "faq" as const,
  variant: "with-categories",
  description: "FAQ grouped by category with tab-like filtering. Great for large FAQ sets.",
  tags: ["faq", "categories", "tabbed"],
  supportedModes: ["light", "dark"] as const,
};

export function FaqWithCategories({
  content,
}: {
  content: FaqContent;
  mode: "light" | "dark";
}) {
  const categories = useMemo(() => {
    const cats = new Set<string>();
    for (const item of content.items) {
      cats.add(item.category || "General");
    }
    return Array.from(cats);
  }, [content.items]);

  const [active, setActive] = useState(categories[0] || "General");

  const filtered = content.items.filter(
    (item) => (item.category || "General") === active
  );

  return (
    <section className="bg-background text-foreground py-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
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
        {categories.length > 1 && (
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActive(cat)}
                className={`px-4 py-2 text-sm rounded-[var(--radius)] transition-colors ${
                  active === cat
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
        <div className="space-y-6">
          {filtered.map((item, i) => (
            <div key={i} className="rounded-[var(--radius)] border border-border p-6">
              <h3 className="font-semibold" style={{ fontFamily: "var(--font-heading)" }}>
                {item.question}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {item.answer}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
