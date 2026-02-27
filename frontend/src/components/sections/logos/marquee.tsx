"use client";

import { type LogosContent } from "./schema";

export const metadata = {
  type: "logos" as const,
  variant: "marquee",
  description: "Auto-scrolling infinite logo strip. Creates a sense of momentum and trust.",
  tags: ["trust", "animated", "infinite-scroll"],
  supportedModes: ["light", "dark"] as const,
};

export function LogosMarquee({
  content,
}: {
  content: LogosContent;
  mode: "light" | "dark";
}) {
  const logos = content.logos;
  if (logos.length === 0) return null;

  // Double the logos for seamless infinite scroll
  const doubled = [...logos, ...logos];

  return (
    <section className="bg-background text-foreground py-12 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {content.title && (
          <p className="text-center text-sm text-muted-foreground mb-8">
            {content.title}
          </p>
        )}
      </div>
      <div className="relative">
        <div className="flex animate-[marquee_30s_linear_infinite] gap-12 sm:gap-16">
          {doubled.map((logo, i) => (
            <div key={i} className="flex-shrink-0 flex items-center">
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
      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
}
