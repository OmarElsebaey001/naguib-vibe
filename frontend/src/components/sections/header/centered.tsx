import { type HeaderContent } from "./schema";

export const metadata = {
  type: "header" as const,
  variant: "centered",
  description: "Centered logo with navigation links below. Clean and symmetrical.",
  tags: ["navigation", "centered", "clean"],
  supportedModes: ["light", "dark"] as const,
};

export function HeaderCentered({
  content,
}: {
  content: HeaderContent;
  mode: "light" | "dark";
}) {
  return (
    <header className="bg-background text-foreground border-b border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col items-center gap-4">
          <a
            href={content.logo.href}
            className="text-xl font-bold"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {content.logo.text}
          </a>
          <nav className="flex items-center gap-6">
            {content.navItems.map((item, i) => (
              <a
                key={i}
                href={item.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.label}
              </a>
            ))}
            {content.cta && (
              <a
                href={content.cta.href}
                className="rounded-[var(--radius)] bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
              >
                {content.cta.label}
              </a>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
