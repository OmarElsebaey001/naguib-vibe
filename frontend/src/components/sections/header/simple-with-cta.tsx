import { type HeaderContent } from "./schema";

export const metadata = {
  type: "header" as const,
  variant: "simple-with-cta",
  description: "Simple navigation bar with logo, nav links, and a CTA button on the right.",
  tags: ["navigation", "minimal"],
  supportedModes: ["light", "dark"] as const,
};

export function HeaderSimpleWithCta({
  content,
}: {
  content: HeaderContent;
  mode: "light" | "dark";
}) {
  return (
    <header className="bg-background text-foreground border-b border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <a href={content.logo.href} className="text-xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
            {content.logo.text}
          </a>
          <nav className="hidden md:flex items-center gap-8">
            {content.navItems.map((item, i) => (
              <a
                key={i}
                href={item.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.label}
              </a>
            ))}
          </nav>
          {content.cta && (
            <a
              href={content.cta.href}
              className="rounded-[var(--radius)] bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
            >
              {content.cta.label}
            </a>
          )}
        </div>
      </div>
    </header>
  );
}
