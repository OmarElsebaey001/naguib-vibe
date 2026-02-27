import { type SocialProofContent } from "./schema";

export const metadata = {
  type: "social-proof" as const,
  variant: "single-quote",
  description: "One large featured testimonial quote. High impact, minimal layout.",
  tags: ["testimonials", "featured", "minimal"],
  supportedModes: ["light", "dark"] as const,
};

export function SocialProofSingleQuote({
  content,
}: {
  content: SocialProofContent;
  mode: "light" | "dark";
}) {
  const t = content.testimonials[0];
  if (!t) return null;

  return (
    <section className="bg-background text-foreground py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        {content.tagline && (
          <p className="text-sm font-medium text-primary mb-6">{content.tagline}</p>
        )}
        <div className="text-4xl text-primary mb-6">&ldquo;</div>
        <blockquote
          className="text-2xl sm:text-3xl lg:text-4xl font-medium leading-snug tracking-tight"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {t.quote}
        </blockquote>
        <div className="mt-10 flex items-center justify-center gap-4">
          {t.avatar && (
            <img src={t.avatar} alt={t.author} className="h-14 w-14 rounded-full object-cover" />
          )}
          <div className="text-left">
            <p className="font-semibold text-lg">{t.author}</p>
            {(t.role || t.company) && (
              <p className="text-muted-foreground">
                {[t.role, t.company].filter(Boolean).join(", ")}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
