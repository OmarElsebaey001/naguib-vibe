import { type FaqContent } from "./schema";

export const metadata = {
  type: "faq" as const,
  variant: "simple-list",
  description: "Plain list of questions and answers. No accordion, everything visible at once.",
  tags: ["faq", "list", "simple"],
  supportedModes: ["light", "dark"] as const,
};

export function FaqSimpleList({
  content,
}: {
  content: FaqContent;
  mode: "light" | "dark";
}) {
  return (
    <section className="bg-background text-foreground py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
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
        <div className="space-y-10">
          {content.items.map((item, i) => (
            <div key={i}>
              <h3 className="text-lg font-semibold" style={{ fontFamily: "var(--font-heading)" }}>
                {item.question}
              </h3>
              <p className="mt-2 text-muted-foreground leading-relaxed">
                {item.answer}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
