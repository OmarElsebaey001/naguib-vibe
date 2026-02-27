import { type LogosContent } from "./schema";

export const metadata = {
  type: "logos" as const,
  variant: "simple-row",
  description: "Single row of logos with optional title. Clean trust signal.",
  tags: ["trust", "social-proof", "minimal"],
  supportedModes: ["light", "dark"] as const,
};

export function LogosSimpleRow({
  content,
}: {
  content: LogosContent;
  mode: "light" | "dark";
}) {
  return (
    <section className="bg-background text-foreground py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {content.title && (
          <p className="text-center text-sm text-muted-foreground mb-8">{content.title}</p>
        )}
        <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12">
          {content.logos.map((logo, i) => (
            <div key={i} className="flex items-center">
              {logo.href ? (
                <a href={logo.href}>
                  <img src={logo.src} alt={logo.name} className="h-8 opacity-60 hover:opacity-100 transition-opacity grayscale hover:grayscale-0" />
                </a>
              ) : (
                <img src={logo.src} alt={logo.name} className="h-8 opacity-60 grayscale" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
