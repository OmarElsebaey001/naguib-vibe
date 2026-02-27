import { type FooterContent } from "./schema";

export const metadata = {
  type: "footer" as const,
  variant: "minimal",
  description: "One-line footer with copyright only. Minimal footprint.",
  tags: ["footer", "minimal", "compact"],
  supportedModes: ["light", "dark"] as const,
};

export function FooterMinimal({
  content,
}: {
  content: FooterContent;
  mode: "light" | "dark";
}) {
  return (
    <footer className="bg-background text-foreground border-t border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {content.logo && (
              <a
                href={content.logo.href}
                className="text-sm font-semibold"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {content.logo.text}
              </a>
            )}
            {content.copyright && (
              <p className="text-sm text-muted-foreground">{content.copyright}</p>
            )}
          </div>
          {content.socialLinks.length > 0 && (
            <div className="flex gap-4">
              {content.socialLinks.map((link, i) => (
                <a
                  key={i}
                  href={link.href}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={link.platform}
                >
                  {link.icon || link.platform}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
