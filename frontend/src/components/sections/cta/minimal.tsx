import { type CtaContent } from "./schema";

export const metadata = {
  type: "cta" as const,
  variant: "minimal",
  description: "Simple text and button, minimal styling. Understated and clean.",
  tags: ["cta", "minimal", "simple"],
  supportedModes: ["light", "dark"] as const,
};

export function CtaMinimal({
  content,
}: {
  content: CtaContent;
  mode: "light" | "dark";
}) {
  return (
    <section className="bg-background text-foreground py-20">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 text-center">
        <h2
          className="text-2xl sm:text-3xl font-bold tracking-tight"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {content.headline}
        </h2>
        {content.description && (
          <p className="mt-4 text-muted-foreground">{content.description}</p>
        )}
        <div className="mt-8">
          <a
            href={content.primaryCta.href}
            className="inline-block rounded-[var(--radius)] bg-primary px-8 py-3 text-base font-medium text-primary-foreground hover:opacity-90 transition-opacity"
          >
            {content.primaryCta.label}
          </a>
        </div>
      </div>
    </section>
  );
}
