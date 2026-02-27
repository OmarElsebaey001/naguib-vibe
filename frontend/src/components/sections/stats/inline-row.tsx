import { type StatsContent } from "./schema";

export const metadata = {
  type: "stats" as const,
  variant: "inline-row",
  description: "Horizontal row of key metrics. Compact trust-building numbers.",
  tags: ["metrics", "numbers", "minimal"],
  supportedModes: ["light", "dark"] as const,
};

export function StatsInlineRow({
  content,
}: {
  content: StatsContent;
  mode: "light" | "dark";
}) {
  return (
    <section className="bg-background text-foreground py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {content.headline && (
          <h2
            className="text-center text-2xl sm:text-3xl font-bold mb-12"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {content.headline}
          </h2>
        )}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {content.stats.map((stat, i) => (
            <div key={i}>
              <p
                className="text-3xl sm:text-4xl font-bold text-primary"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {stat.value}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
