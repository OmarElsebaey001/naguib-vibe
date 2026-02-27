import { type FooterContent } from "./schema";

export const metadata = {
  type: "footer" as const,
  variant: "columns-with-socials",
  description: "Multi-column footer with link groups, social icons, and copyright.",
  tags: ["footer", "navigation", "social"],
  supportedModes: ["light", "dark"] as const,
};

export function FooterColumnsWithSocials({
  content,
}: {
  content: FooterContent;
  mode: "light" | "dark";
}) {
  return (
    <footer className="bg-background text-foreground border-t border-border py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            {content.logo && (
              <a
                href={content.logo.href}
                className="text-xl font-bold"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {content.logo.text}
              </a>
            )}
            {content.socialLinks.length > 0 && (
              <div className="mt-4 flex gap-4">
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
          </div>
          {content.columns.map((col, i) => (
            <div key={i}>
              <h4 className="font-semibold text-sm mb-4">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((link, j) => (
                  <li key={j}>
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        {content.copyright && (
          <div className="mt-12 pt-8 border-t border-border">
            <p className="text-sm text-muted-foreground text-center">{content.copyright}</p>
          </div>
        )}
      </div>
    </footer>
  );
}
