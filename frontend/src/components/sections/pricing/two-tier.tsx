import { type PricingContent } from "./schema";

export const metadata = {
  type: "pricing" as const,
  variant: "two-tier",
  description: "Two pricing plans side by side. Simple choice between free and paid.",
  tags: ["pricing", "plans", "simple"],
  supportedModes: ["light", "dark"] as const,
};

export function PricingTwoTier({
  content,
}: {
  content: PricingContent;
  mode: "light" | "dark";
}) {
  const plans = content.plans.slice(0, 2);

  return (
    <section className="bg-background text-foreground py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {plans.map((plan, i) => (
            <div
              key={i}
              className={`rounded-[var(--radius)] border p-8 flex flex-col ${
                plan.highlighted
                  ? "border-primary ring-2 ring-primary/20 relative"
                  : "border-border"
              }`}
            >
              {plan.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">
                  {plan.badge}
                </span>
              )}
              <h3 className="text-xl font-semibold" style={{ fontFamily: "var(--font-heading)" }}>
                {plan.name}
              </h3>
              {plan.description && (
                <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
              )}
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-5xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
                  {plan.price}
                </span>
                <span className="text-muted-foreground">{plan.period}</span>
              </div>
              <ul className="mt-8 space-y-3 flex-1">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-2 text-sm">
                    <span className={f.included ? "text-primary" : "text-muted-foreground"}>
                      {f.included ? "✓" : "—"}
                    </span>
                    <span className={f.included ? "" : "text-muted-foreground"}>{f.text}</span>
                  </li>
                ))}
              </ul>
              <a
                href={plan.cta.href}
                className={`mt-8 block text-center rounded-[var(--radius)] px-6 py-3 text-sm font-medium transition-opacity hover:opacity-90 ${
                  plan.highlighted
                    ? "bg-primary text-primary-foreground"
                    : "border border-border text-foreground hover:bg-muted"
                }`}
              >
                {plan.cta.label}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
