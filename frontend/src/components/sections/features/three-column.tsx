import { type FeaturesContent } from "./schema";

export const metadata = {
  type: "features" as const,
  variant: "three-column",
  description: "Three columns with icons and descriptions. Clean and balanced layout.",
  tags: ["features", "columns", "balanced"],
  supportedModes: ["light", "dark"] as const,
};

export function FeaturesThreeColumn({
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {content.features.map((feature, i) => (
            <div key={i} className="text-center">
              {feature.icon && (
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary text-2xl">
                  {feature.icon}
                </div>
              )}
              <h3
                className="text-lg font-semibold"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {feature.title}
              </h3>
              <p className="mt-3 text-muted-foreground text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
