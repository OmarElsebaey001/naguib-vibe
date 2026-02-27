import { type HeroContent } from "./schema";

export const metadata = {
  type: "hero" as const,
  variant: "with-app-screenshot",
  description: "Centered text above a large app screenshot. Perfect for showcasing product UI.",
  tags: ["above-fold", "screenshot", "product"],
  supportedModes: ["light", "dark"] as const,
};

export function HeroWithAppScreenshot({
  content,
}: {
  content: HeroContent;
  mode: "light" | "dark";
}) {
  return (
    <section className="bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 sm:pt-28 pb-0">
        <div className="text-center max-w-3xl mx-auto">
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
        </div>
        {content.image && (
          <div className="mt-16 relative">
            <div className="rounded-t-[var(--radius)] border border-b-0 border-border overflow-hidden shadow-2xl">
              <img
                src={content.image.src}
                alt={content.image.alt}
                className="w-full"
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
