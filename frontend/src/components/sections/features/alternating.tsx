import { type FeaturesContent } from "./schema";

export const metadata = {
  type: "features" as const,
  variant: "alternating",
  description: "Alternating left/right rows of image + text. Great for detailed feature explanations.",
  tags: ["features", "alternating", "detailed"],
  supportedModes: ["light", "dark"] as const,
};

export function FeaturesAlternating({
  content,
}: {
  content: FeaturesContent;
  mode: "light" | "dark";
}) {
  return (
    <section className="bg-background text-foreground py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-20">
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
        <div className="space-y-24">
          {content.features.map((feature, i) => {
            const isReversed = i % 2 === 1;
            return (
              <div
                key={i}
                className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${
                  isReversed ? "lg:direction-rtl" : ""
                }`}
              >
                <div className={isReversed ? "lg:order-2" : ""}>
                  {feature.icon && (
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-[var(--radius)] bg-primary/10 text-primary text-xl">
                      {feature.icon}
                    </div>
                  )}
                  <h3
                    className="text-2xl font-bold"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {feature.title}
                  </h3>
                  <p className="mt-4 text-muted-foreground">{feature.description}</p>
                </div>
                <div className={isReversed ? "lg:order-1" : ""}>
                  {feature.image ? (
                    <img
                      src={feature.image.src}
                      alt={feature.image.alt}
                      className="rounded-[var(--radius)] shadow-lg w-full"
                    />
                  ) : (
                    <div className="aspect-video rounded-[var(--radius)] bg-muted flex items-center justify-center">
                      {feature.icon && (
                        <span className="text-6xl opacity-20">{feature.icon}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
