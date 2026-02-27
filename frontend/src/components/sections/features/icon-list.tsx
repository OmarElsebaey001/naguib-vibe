import { type FeaturesContent } from "./schema";

export const metadata = {
  type: "features" as const,
  variant: "icon-list",
  description: "Vertical list of features with icons. Scannable and compact.",
  tags: ["features", "list", "vertical"],
  supportedModes: ["light", "dark"] as const,
};

export function FeaturesIconList({
  content,
}: {
  content: FeaturesContent;
  mode: "light" | "dark";
}) {
  return (
    <section className="bg-background text-foreground py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <div>
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
          <div className="space-y-8">
            {content.features.map((feature, i) => (
              <div key={i} className="flex gap-4">
                {feature.icon && (
                  <div className="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-[var(--radius)] bg-primary/10 text-primary text-lg">
                    {feature.icon}
                  </div>
                )}
                <div>
                  <h3
                    className="font-semibold"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {feature.title}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
