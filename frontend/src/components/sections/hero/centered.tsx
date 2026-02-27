import { type HeroContent } from "./schema";

export const metadata = {
  type: "hero" as const,
  variant: "centered",
  description: "Large centered headline with subtitle and CTA buttons. Clean and impactful.",
  tags: ["above-fold", "centered", "versatile"],
  supportedModes: ["light", "dark"] as const,
};

export function HeroCentered({
  content,
}: {
  content: HeroContent;
  mode: "light" | "dark";
}) {
  return (
    <section className="bg-background text-foreground">
      <div className="mx-auto max-w-4xl px-4 py-20 sm:py-32 text-center">
        {content.badge && (
          <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6">
            {content.badge}
          </span>
        )}
        <h1
          className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {content.headline}
        </h1>
        {content.subheadline && (
          <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            {content.subheadline}
          </p>
        )}
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          {content.primaryCta && (
            <a
              href={content.primaryCta.href}
              className="rounded-[var(--radius)] bg-primary px-8 py-3 text-base font-medium text-primary-foreground hover:opacity-90 transition-opacity"
            >
              {content.primaryCta.label}
            </a>
          )}
          {content.secondaryCta && (
            <a
              href={content.secondaryCta.href}
              className="rounded-[var(--radius)] border border-border px-8 py-3 text-base font-medium text-foreground hover:bg-muted transition-colors"
            >
              {content.secondaryCta.label}
            </a>
          )}
        </div>
        {content.image && (
          <div className="mt-16">
            <img
              src={content.image.src}
              alt={content.image.alt}
              className="mx-auto rounded-[var(--radius)] shadow-2xl max-w-full"
            />
          </div>
        )}
      </div>
    </section>
  );
}
