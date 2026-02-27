import { type HeaderContent } from "./schema";

export const metadata = {
  type: "header" as const,
  variant: "floating",
  description: "Floating header with rounded corners and shadow. Fixed at the top with a modern pill shape.",
  tags: ["navigation", "floating", "modern"],
  supportedModes: ["light", "dark"] as const,
};

export function HeaderFloating({
  content,
}: {
  content: HeaderContent;
  mode: "light" | "dark";
}) {
  return (
    <header className="sticky top-0 z-40 py-3 px-4">
      <div className="mx-auto max-w-5xl rounded-full border border-border bg-background/80 backdrop-blur-md shadow-sm px-6">
        <div className="flex h-14 items-center justify-between">
          <a
            href={content.logo.href}
            className="text-lg font-bold text-foreground"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {content.logo.text}
          </a>
          <nav className="hidden md:flex items-center gap-6">
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
              className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
            >
              {content.cta.label}
            </a>
          )}
        </div>
      </div>
    </header>
  );
}
