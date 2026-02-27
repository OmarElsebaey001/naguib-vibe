import { type PricingContent } from "./schema";

export const metadata = {
  type: "pricing" as const,
  variant: "comparison-table",
  description: "Feature comparison table across all plans. Detailed side-by-side comparison.",
  tags: ["pricing", "table", "comparison"],
  supportedModes: ["light", "dark"] as const,
};

export function PricingComparisonTable({
  content,
}: {
  content: PricingContent;
  mode: "light" | "dark";
}) {
  const plans = content.plans;
  // Collect all unique feature texts across all plans
  const allFeatures: string[] = [];
  for (const plan of plans) {
    for (const f of plan.features) {
      if (!allFeatures.includes(f.text)) allFeatures.push(f.text);
    }
  }

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
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-4 pr-6 font-medium text-muted-foreground text-sm">
                  Features
                </th>
                {plans.map((plan, i) => (
                  <th key={i} className="text-center py-4 px-4 min-w-[140px]">
                    <div className="font-semibold" style={{ fontFamily: "var(--font-heading)" }}>
                      {plan.name}
                    </div>
                    <div className="mt-1">
                      <span className="text-2xl font-bold">{plan.price}</span>
                      <span className="text-muted-foreground text-sm">{plan.period}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allFeatures.map((featureText, fi) => (
                <tr key={fi} className="border-b border-border">
                  <td className="py-3 pr-6 text-sm">{featureText}</td>
                  {plans.map((plan, pi) => {
                    const feature = plan.features.find((f) => f.text === featureText);
                    const included = feature?.included ?? false;
                    return (
                      <td key={pi} className="text-center py-3 px-4">
                        <span className={included ? "text-primary" : "text-muted-foreground"}>
                          {included ? "✓" : "—"}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td className="py-6" />
                {plans.map((plan, i) => (
                  <td key={i} className="text-center py-6 px-4">
                    <a
                      href={plan.cta.href}
                      className={`inline-block rounded-[var(--radius)] px-6 py-2.5 text-sm font-medium transition-opacity hover:opacity-90 ${
                        plan.highlighted
                          ? "bg-primary text-primary-foreground"
                          : "border border-border text-foreground hover:bg-muted"
                      }`}
                    >
                      {plan.cta.label}
                    </a>
                  </td>
                ))}
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </section>
  );
}
