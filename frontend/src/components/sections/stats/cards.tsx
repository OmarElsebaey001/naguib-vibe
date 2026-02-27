import { type StatsContent } from "./schema";

export const metadata = {
  type: "stats" as const,
  variant: "cards",
  description: "Stat cards with labels and optional descriptions. Each stat in its own bordered card.",
  tags: ["metrics", "cards", "structured"],
  supportedModes: ["light", "dark"] as const,
};

export function StatsCards({
  content,
}: {
  content: StatsContent;
  mode: "light" | "dark";
}) {
  return (
    <section className="bg-background text-foreground py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {content.headline && (
          <h2
            className="text-center text-2xl sm:text-3xl font-bold mb-12"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {content.headline}
          </h2>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {content.stats.map((stat, i) => (
            <div
              key={i}
              className="rounded-[var(--radius)] border border-border p-6 text-center"
            >
              <p
                className="text-3xl sm:text-4xl font-bold text-primary"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {stat.value}
              </p>
              <p className="mt-2 font-medium text-sm">{stat.label}</p>
              {stat.description && (
                <p className="mt-1 text-xs text-muted-foreground">{stat.description}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
