import { type LogosContent } from "./schema";

export const metadata = {
  type: "logos" as const,
  variant: "grid",
  description: "Grid of logos with even spacing. Good for many logos.",
  tags: ["trust", "grid", "logos"],
  supportedModes: ["light", "dark"] as const,
};

export function LogosGrid({
  content,
}: {
  content: LogosContent;
  mode: "light" | "dark";
}) {
  return (
    <section className="bg-background text-foreground py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {content.title && (
          <p className="text-center text-sm text-muted-foreground mb-10">
            {content.title}
          </p>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8 items-center justify-items-center">
          {content.logos.map((logo, i) => (
            <div key={i} className="flex items-center justify-center p-4">
              {logo.href ? (
                <a href={logo.href}>
                  <img
                    src={logo.src}
                    alt={logo.name}
                    className="h-8 opacity-60 hover:opacity-100 transition-opacity grayscale hover:grayscale-0"
                  />
                </a>
              ) : (
                <img
                  src={logo.src}
                  alt={logo.name}
                  className="h-8 opacity-60 grayscale"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
