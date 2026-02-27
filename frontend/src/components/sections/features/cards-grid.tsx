import { type FeaturesContent } from "./schema";

export const metadata = {
  type: "features" as const,
  variant: "cards-grid",
  description: "Grid of feature cards with icons, titles, and descriptions. Versatile 2-3 column layout.",
  tags: ["features", "cards", "grid"],
  supportedModes: ["light", "dark"] as const,
};

export function FeaturesCardsGrid({
  content,
}: {
  content: FeaturesContent;
  mode: "light" | "dark";
}) {
  return (
    <section className="bg-background text-foreground py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {content.features.map((feature, i) => (
            <div key={i} className="rounded-[var(--radius)] border border-border bg-background p-6">
              {feature.icon && (
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-[var(--radius)] bg-primary/10 text-primary text-xl">
                  {feature.icon}
                </div>
              )}
              <h3 className="text-lg font-semibold" style={{ fontFamily: "var(--font-heading)" }}>
                {feature.title}
              </h3>
              <p className="mt-2 text-muted-foreground text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
