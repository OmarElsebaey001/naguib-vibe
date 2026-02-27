import { type SocialProofContent } from "./schema";

export const metadata = {
  type: "social-proof" as const,
  variant: "cards-grid",
  description: "Grid of testimonial cards with quotes, author names, and optional avatars.",
  tags: ["testimonials", "trust", "cards"],
  supportedModes: ["light", "dark"] as const,
};

export function SocialProofCardsGrid({
  content,
}: {
  content: SocialProofContent;
  mode: "light" | "dark";
}) {
  return (
    <section className="bg-background text-foreground py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {content.testimonials.map((t, i) => (
            <div key={i} className="rounded-[var(--radius)] border border-border bg-background p-6">
              <p className="text-foreground italic">&ldquo;{t.quote}&rdquo;</p>
              <div className="mt-4 flex items-center gap-3">
                {t.avatar && (
                  <img src={t.avatar} alt={t.author} className="h-10 w-10 rounded-full object-cover" />
                )}
                <div>
                  <p className="font-medium text-sm">{t.author}</p>
                  {(t.role || t.company) && (
                    <p className="text-xs text-muted-foreground">
                      {[t.role, t.company].filter(Boolean).join(", ")}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
