import { type StatsContent } from "./schema";

export const metadata = {
  type: "stats" as const,
  variant: "large-centered",
  description: "Big centered numbers with labels. Maximum visual impact for key metrics.",
  tags: ["metrics", "large", "centered"],
  supportedModes: ["light", "dark"] as const,
};

export function StatsLargeCentered({
  content,
}: {
  content: StatsContent;
  mode: "light" | "dark";
}) {
  return (
    <section className="bg-background text-foreground py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        {content.headline && (
          <h2
            className="text-2xl sm:text-3xl font-bold mb-16"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {content.headline}
          </h2>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
          {content.stats.map((stat, i) => (
            <div key={i}>
              <p
                className="text-5xl sm:text-6xl font-extrabold text-primary"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {stat.value}
              </p>
              <p className="mt-3 text-muted-foreground font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
