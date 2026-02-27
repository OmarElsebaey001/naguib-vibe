import { type HeaderContent } from "./schema";

export const metadata = {
  type: "header" as const,
  variant: "transparent",
  description: "Transparent header that overlays the hero section. Great for full-bleed hero images.",
  tags: ["navigation", "overlay", "transparent"],
  supportedModes: ["light", "dark"] as const,
};

export function HeaderTransparent({
  content,
}: {
  content: HeaderContent;
  mode: "light" | "dark";
}) {
  return (
    <header className="absolute inset-x-0 top-0 z-40 text-foreground">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <a
            href={content.logo.href}
            className="text-xl font-bold"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {content.logo.text}
          </a>
          <nav className="hidden md:flex items-center gap-8">
            {content.navItems.map((item, i) => (
              <a
                key={i}
                href={item.href}
                className="text-sm opacity-80 hover:opacity-100 transition-opacity"
              >
                {item.label}
              </a>
            ))}
          </nav>
          {content.cta && (
            <a
              href={content.cta.href}
              className="rounded-[var(--radius)] border border-current/30 px-4 py-2 text-sm font-medium hover:bg-foreground/10 transition-colors"
            >
              {content.cta.label}
            </a>
          )}
        </div>
      </div>
    </header>
  );
}
