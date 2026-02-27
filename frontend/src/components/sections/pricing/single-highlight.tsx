import { type PricingContent } from "./schema";

export const metadata = {
  type: "pricing" as const,
  variant: "single-highlight",
  description: "One featured plan with full details. Use when there's a clear recommended option.",
  tags: ["pricing", "featured", "single"],
  supportedModes: ["light", "dark"] as const,
};

export function PricingSingleHighlight({
  content,
}: {
  content: PricingContent;
  mode: "light" | "dark";
}) {
  const plan = content.plans.find((p) => p.highlighted) || content.plans[0];
  if (!plan) return null;

  return (
    <section className="bg-background text-foreground py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
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
        <div className="rounded-[var(--radius)] border-2 border-primary p-8 sm:p-12 relative">
          {plan.badge && (
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-medium px-4 py-1 rounded-full">
              {plan.badge}
            </span>
          )}
          <div className="text-center">
            <h3
              className="text-2xl font-bold"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {plan.name}
            </h3>
            {plan.description && (
              <p className="mt-2 text-muted-foreground">{plan.description}</p>
            )}
            <div className="mt-6 flex items-baseline justify-center gap-1">
              <span className="text-5xl sm:text-6xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
                {plan.price}
              </span>
              <span className="text-muted-foreground text-lg">{plan.period}</span>
            </div>
          </div>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {plan.features.map((f, j) => (
              <div key={j} className="flex items-center gap-2 text-sm">
                <span className={f.included ? "text-primary" : "text-muted-foreground"}>
                  {f.included ? "✓" : "—"}
                </span>
                <span className={f.included ? "" : "text-muted-foreground"}>{f.text}</span>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <a
              href={plan.cta.href}
              className="inline-block rounded-[var(--radius)] bg-primary text-primary-foreground px-10 py-3.5 text-base font-medium hover:opacity-90 transition-opacity"
            >
              {plan.cta.label}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
