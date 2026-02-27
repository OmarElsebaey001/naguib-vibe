import { type StatsContent } from "./schema";

export const metadata = {
  type: "stats" as const,
  variant: "with-description",
  description: "Stats with supporting descriptions below each number. More context per metric.",
  tags: ["metrics", "detailed", "descriptive"],
  supportedModes: ["light", "dark"] as const,
};

export function StatsWithDescription({
  content,
}: {
  content: StatsContent;
  mode: "light" | "dark";
}) {
  return (
    <section className="bg-background text-foreground py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {(content.headline || content.tagline) && (
          <div className="text-center max-w-3xl mx-auto mb-16">
            {content.tagline && (
              <p className="text-sm font-medium text-primary mb-2">{content.tagline}</p>
            )}
            {content.headline && (
              <h2
                className="text-2xl sm:text-3xl font-bold"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {content.headline}
              </h2>
            )}
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {content.stats.map((stat, i) => (
            <div key={i} className="border-l-2 border-primary pl-6">
              <p
                className="text-3xl font-bold text-primary"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {stat.value}
              </p>
              <p className="mt-1 font-semibold text-sm">{stat.label}</p>
              {stat.description && (
                <p className="mt-2 text-sm text-muted-foreground">{stat.description}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
