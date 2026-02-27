import { type FooterContent } from "./schema";

export const metadata = {
  type: "footer" as const,
  variant: "mega-footer",
  description: "Large footer with newsletter signup, columns, social links, and legal info.",
  tags: ["footer", "mega", "newsletter"],
  supportedModes: ["light", "dark"] as const,
};

export function FooterMegaFooter({
  content,
}: {
  content: FooterContent;
  mode: "light" | "dark";
}) {
  return (
    <footer className="bg-muted text-foreground pt-16 pb-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Brand + Newsletter */}
          <div className="lg:col-span-4">
            {content.logo && (
              <a
                href={content.logo.href}
                className="text-xl font-bold"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {content.logo.text}
              </a>
            )}
            {content.newsletter && (
              <div className="mt-6">
                <p className="font-semibold text-sm">{content.newsletter.title}</p>
                {content.newsletter.description && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {content.newsletter.description}
                  </p>
                )}
                <form className="mt-4 flex gap-2" onSubmit={(e) => e.preventDefault()}>
                  <input
                    type="email"
                    placeholder={content.newsletter.placeholder}
                    className="flex-1 rounded-[var(--radius)] border border-border bg-background px-4 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <button
                    type="submit"
                    className="rounded-[var(--radius)] bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
                  >
                    {content.newsletter.buttonLabel}
                  </button>
                </form>
              </div>
            )}
            {content.socialLinks.length > 0 && (
              <div className="mt-6 flex gap-4">
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

          {/* Link Columns */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-8">
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
