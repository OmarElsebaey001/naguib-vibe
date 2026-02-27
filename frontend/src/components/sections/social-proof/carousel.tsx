"use client";

import { useState } from "react";
import { type SocialProofContent } from "./schema";

export const metadata = {
  type: "social-proof" as const,
  variant: "carousel",
  description: "Sliding testimonial carousel with navigation arrows. One testimonial at a time.",
  tags: ["testimonials", "carousel", "interactive"],
  supportedModes: ["light", "dark"] as const,
};

export function SocialProofCarousel({
  content,
}: {
  content: SocialProofContent;
  mode: "light" | "dark";
}) {
  const [current, setCurrent] = useState(0);
  const testimonials = content.testimonials;

  function next() {
    setCurrent((c) => (c + 1) % testimonials.length);
  }
  function prev() {
    setCurrent((c) => (c - 1 + testimonials.length) % testimonials.length);
  }

  const t = testimonials[current];

  return (
    <section className="bg-background text-foreground py-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          {content.tagline && (
            <p className="text-sm font-medium text-primary mb-2">{content.tagline}</p>
          )}
          {content.headline && (
            <h2
              className="text-3xl sm:text-4xl font-bold tracking-tight"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {content.headline}
            </h2>
          )}
        </div>
        <div className="text-center">
          <blockquote className="text-xl sm:text-2xl font-medium leading-relaxed">
            &ldquo;{t.quote}&rdquo;
          </blockquote>
          <div className="mt-8 flex items-center justify-center gap-3">
            {t.avatar && (
              <img src={t.avatar} alt={t.author} className="h-12 w-12 rounded-full object-cover" />
            )}
            <div className="text-left">
              <p className="font-semibold">{t.author}</p>
              {(t.role || t.company) && (
                <p className="text-sm text-muted-foreground">
                  {[t.role, t.company].filter(Boolean).join(", ")}
                </p>
              )}
            </div>
          </div>
          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              onClick={prev}
              className="h-10 w-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
              aria-label="Previous testimonial"
            >
              ←
            </button>
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`h-2 w-2 rounded-full transition-colors ${
                    i === current ? "bg-primary" : "bg-border"
                  }`}
                  aria-label={`Go to testimonial ${i + 1}`}
                />
              ))}
            </div>
            <button
              onClick={next}
              className="h-10 w-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
              aria-label="Next testimonial"
            >
              →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
