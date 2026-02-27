import { type FooterContent } from "./schema";

export const metadata = {
  type: "footer" as const,
  variant: "simple-centered",
  description: "Centered logo with links below. Clean and simple footer.",
  tags: ["footer", "centered", "simple"],
  supportedModes: ["light", "dark"] as const,
};

export function FooterSimpleCentered({
  content,
}: {
  content: FooterContent;
  mode: "light" | "dark";
}) {
  // Flatten all column links into a single row
  const allLinks = content.columns.flatMap((col) => col.links);

  return (
    <footer className="bg-background text-foreground border-t border-border py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        {content.logo && (
          <a
            href={content.logo.href}
            className="text-xl font-bold"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {content.logo.text}
          </a>
        )}
        {allLinks.length > 0 && (
          <nav className="mt-6 flex flex-wrap justify-center gap-6">
            {allLinks.map((link, i) => (
              <a
                key={i}
                href={link.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>
        )}
        {content.socialLinks.length > 0 && (
          <div className="mt-6 flex justify-center gap-4">
            {content.socialLinks.map((link, i) => (
              <a
                key={i}
                href={link.href}
                className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                aria-label={link.platform}
              >
                {link.icon || link.platform}
              </a>
            ))}
          </div>
        )}
        {content.copyright && (
          <p className="mt-8 text-sm text-muted-foreground">{content.copyright}</p>
        )}
      </div>
    </footer>
  );
}
