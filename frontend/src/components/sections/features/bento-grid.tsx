import { type FeaturesContent } from "./schema";

export const metadata = {
  type: "features" as const,
  variant: "bento-grid",
  description: "Asymmetric bento-style grid layout. First two features are large, rest are smaller.",
  tags: ["features", "bento", "modern"],
  supportedModes: ["light", "dark"] as const,
};

export function FeaturesBentoGrid({
  content,
}: {
  content: FeaturesContent;
  mode: "light" | "dark";
}) {
  const features = content.features;

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, i) => {
            const isLarge = i < 2;
            return (
              <div
                key={i}
                className={`rounded-[var(--radius)] border border-border bg-muted/30 p-6 sm:p-8 ${
                  isLarge && i === 0 ? "lg:col-span-2 lg:row-span-2" : ""
                } ${isLarge && i === 1 ? "lg:row-span-1" : ""}`}
              >
                {feature.icon && (
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-[var(--radius)] bg-primary/10 text-primary text-xl">
                    {feature.icon}
                  </div>
                )}
                <h3
                  className={`font-semibold ${isLarge && i === 0 ? "text-xl sm:text-2xl" : "text-lg"}`}
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {feature.title}
                </h3>
                <p className="mt-2 text-muted-foreground text-sm">{feature.description}</p>
                {feature.image && (
                  <img
                    src={feature.image.src}
                    alt={feature.image.alt}
                    className="mt-4 rounded-[var(--radius)] w-full"
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
