import { type CtaContent } from "./schema";

export const metadata = {
  type: "cta" as const,
  variant: "split",
  description: "Text on one side, prominent CTA button on the other. Clean horizontal layout.",
  tags: ["cta", "split", "horizontal"],
  supportedModes: ["light", "dark"] as const,
};

export function CtaSplit({
  content,
}: {
  content: CtaContent;
  mode: "light" | "dark";
}) {
  return (
    <section className="bg-muted text-foreground py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          <div className="flex-1">
            <h2
              className="text-2xl sm:text-3xl font-bold tracking-tight"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {content.headline}
            </h2>
            {content.description && (
              <p className="mt-2 text-muted-foreground">{content.description}</p>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
            <a
              href={content.primaryCta.href}
              className="rounded-[var(--radius)] bg-primary px-8 py-3 text-base font-medium text-primary-foreground hover:opacity-90 transition-opacity text-center"
            >
              {content.primaryCta.label}
            </a>
            {content.secondaryCta && (
              <a
                href={content.secondaryCta.href}
                className="rounded-[var(--radius)] border border-border px-8 py-3 text-base font-medium text-foreground hover:bg-background transition-colors text-center"
              >
                {content.secondaryCta.label}
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
