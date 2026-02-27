import { type LogosContent } from "./schema";

export const metadata = {
  type: "logos" as const,
  variant: "with-title",
  description: "Prominent 'Trusted by' title above a row of logos. Strong social proof signal.",
  tags: ["trust", "titled", "social-proof"],
  supportedModes: ["light", "dark"] as const,
};

export function LogosWithTitle({
  content,
}: {
  content: LogosContent;
  mode: "light" | "dark";
}) {
  return (
    <section className="bg-muted text-foreground py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {content.title && (
          <h3
            className="text-center text-lg font-semibold mb-10"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {content.title}
          </h3>
        )}
        <div className="flex flex-wrap items-center justify-center gap-10 sm:gap-14">
          {content.logos.map((logo, i) => (
            <div key={i} className="flex items-center">
              {logo.href ? (
                <a href={logo.href}>
                  <img
                    src={logo.src}
                    alt={logo.name}
                    className="h-10 opacity-70 hover:opacity-100 transition-opacity grayscale hover:grayscale-0"
                  />
                </a>
              ) : (
                <img
                  src={logo.src}
                  alt={logo.name}
                  className="h-10 opacity-70 grayscale"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
