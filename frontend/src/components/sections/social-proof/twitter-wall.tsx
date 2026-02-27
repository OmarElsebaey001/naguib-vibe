import { type SocialProofContent } from "./schema";

export const metadata = {
  type: "social-proof" as const,
  variant: "twitter-wall",
  description: "Social media-style wall of testimonials. Masonry-like layout for many short quotes.",
  tags: ["testimonials", "wall", "social-media"],
  supportedModes: ["light", "dark"] as const,
};

export function SocialProofTwitterWall({
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
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
          {content.testimonials.map((t, i) => (
            <div
              key={i}
              className="break-inside-avoid rounded-[var(--radius)] border border-border p-5 bg-background"
            >
              <div className="flex items-center gap-3 mb-3">
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
              <p className="text-sm text-foreground">{t.quote}</p>
              {t.rating && (
                <div className="mt-3 text-sm text-primary">
                  {"★".repeat(t.rating)}{"☆".repeat(5 - t.rating)}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
