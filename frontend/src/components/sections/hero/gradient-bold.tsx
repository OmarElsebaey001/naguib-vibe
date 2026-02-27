import { type HeroContent } from "./schema";

export const metadata = {
  type: "hero" as const,
  variant: "gradient-bold",
  description: "Bold headline over a gradient background. High-impact, eye-catching above-fold section.",
  tags: ["above-fold", "gradient", "bold"],
  supportedModes: ["light", "dark"] as const,
};

export function HeroGradientBold({
  content,
}: {
  content: HeroContent;
  mode: "light" | "dark";
}) {
  return (
    <section className="relative overflow-hidden bg-primary text-primary-foreground">
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-accent opacity-90" />
      <div className="relative mx-auto max-w-4xl px-4 py-24 sm:py-36 text-center">
        {content.badge && (
          <span className="inline-block rounded-full bg-primary-foreground/10 border border-primary-foreground/20 px-4 py-1.5 text-sm font-medium mb-8">
            {content.badge}
          </span>
        )}
        <h1
          className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {content.headline}
        </h1>
        {content.subheadline && (
          <p className="mt-8 text-lg sm:text-xl opacity-85 max-w-2xl mx-auto">
            {content.subheadline}
          </p>
        )}
        <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
          {content.primaryCta && (
            <a
              href={content.primaryCta.href}
              className="rounded-[var(--radius)] bg-background text-foreground px-8 py-3.5 text-base font-semibold hover:opacity-90 transition-opacity"
            >
              {content.primaryCta.label}
            </a>
          )}
          {content.secondaryCta && (
            <a
              href={content.secondaryCta.href}
              className="rounded-[var(--radius)] border border-primary-foreground/30 px-8 py-3.5 text-base font-medium hover:bg-primary-foreground/10 transition-colors"
            >
              {content.secondaryCta.label}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
