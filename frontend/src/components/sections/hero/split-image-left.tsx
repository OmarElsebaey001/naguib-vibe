import { type HeroContent } from "./schema";

export const metadata = {
  type: "hero" as const,
  variant: "split-image-left",
  description: "Image on the left, text on the right. Stacks on mobile. Mirror of split-image-right.",
  tags: ["above-fold", "split", "image"],
  supportedModes: ["light", "dark"] as const,
};

export function HeroSplitImageLeft({
  content,
}: {
  content: HeroContent;
  mode: "light" | "dark";
}) {
  return (
    <section className="bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {content.image && (
            <div className="relative order-2 lg:order-1">
              <img
                src={content.image.src}
                alt={content.image.alt}
                className="rounded-[var(--radius)] shadow-2xl w-full"
              />
            </div>
          )}
          <div className="order-1 lg:order-2">
            {content.badge && (
              <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6">
                {content.badge}
              </span>
            )}
            <h1
              className="text-4xl sm:text-5xl font-bold tracking-tight"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {content.headline}
            </h1>
            {content.subheadline && (
              <p className="mt-6 text-lg text-muted-foreground">
                {content.subheadline}
              </p>
            )}
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              {content.primaryCta && (
                <a
                  href={content.primaryCta.href}
                  className="rounded-[var(--radius)] bg-primary px-8 py-3 text-base font-medium text-primary-foreground hover:opacity-90 transition-opacity text-center"
                >
                  {content.primaryCta.label}
                </a>
              )}
              {content.secondaryCta && (
                <a
                  href={content.secondaryCta.href}
                  className="rounded-[var(--radius)] border border-border px-8 py-3 text-base font-medium text-foreground hover:bg-muted transition-colors text-center"
                >
                  {content.secondaryCta.label}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
