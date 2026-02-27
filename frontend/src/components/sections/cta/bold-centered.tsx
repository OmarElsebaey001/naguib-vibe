import { type CtaContent } from "./schema";

export const metadata = {
  type: "cta" as const,
  variant: "bold-centered",
  description: "Bold centered call-to-action with large headline and prominent button.",
  tags: ["cta", "centered", "conversion"],
  supportedModes: ["light", "dark"] as const,
};

export function CtaBoldCentered({
  content,
}: {
  content: CtaContent;
  mode: "light" | "dark";
}) {
  return (
    <section className="bg-primary text-primary-foreground py-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        <h2
          className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {content.headline}
        </h2>
        {content.description && (
          <p className="mt-6 text-lg opacity-90 max-w-2xl mx-auto">{content.description}</p>
        )}
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href={content.primaryCta.href}
            className="rounded-[var(--radius)] bg-background text-foreground px-8 py-3 text-base font-medium hover:opacity-90 transition-opacity"
          >
            {content.primaryCta.label}
          </a>
          {content.secondaryCta && (
            <a
              href={content.secondaryCta.href}
              className="rounded-[var(--radius)] border border-primary-foreground/30 px-8 py-3 text-base font-medium hover:bg-primary-foreground/10 transition-colors"
            >
              {content.secondaryCta.label}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
