import { type CtaContent } from "./schema";

export const metadata = {
  type: "cta" as const,
  variant: "with-image",
  description: "CTA section with a supporting image alongside the text and button.",
  tags: ["cta", "image", "visual"],
  supportedModes: ["light", "dark"] as const,
};

export function CtaWithImage({
  content,
}: {
  content: CtaContent;
  mode: "light" | "dark";
}) {
  return (
    <section className="bg-background text-foreground py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2
              className="text-3xl sm:text-4xl font-bold tracking-tight"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {content.headline}
            </h2>
            {content.description && (
              <p className="mt-4 text-lg text-muted-foreground">{content.description}</p>
            )}
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <a
                href={content.primaryCta.href}
                className="rounded-[var(--radius)] bg-primary px-8 py-3 text-base font-medium text-primary-foreground hover:opacity-90 transition-opacity text-center"
              >
                {content.primaryCta.label}
              </a>
              {content.secondaryCta && (
                <a
                  href={content.secondaryCta.href}
                  className="rounded-[var(--radius)] border border-border px-8 py-3 text-base font-medium text-foreground hover:bg-muted transition-colors text-center"
                >
                  {content.secondaryCta.label}
                </a>
              )}
            </div>
          </div>
          {content.image && (
            <div>
              <img
                src={content.image.src}
                alt={content.image.alt}
                className="rounded-[var(--radius)] shadow-lg w-full"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
