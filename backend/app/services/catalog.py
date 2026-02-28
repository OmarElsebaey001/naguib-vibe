"""Component catalog for AI consumption. Describes all available section types, variants, and content schemas."""

CATALOG = {
    "types": [
        {
            "type": "header",
            "variants": [
                {"variant": "simple-with-cta", "description": "Simple navigation bar with logo, nav links, and a CTA button on the right."},
                {"variant": "centered", "description": "Centered logo with navigation links below. Clean and symmetrical."},
                {"variant": "transparent", "description": "Transparent header that overlays the hero section. Great for full-bleed hero images."},
                {"variant": "floating", "description": "Floating header with rounded corners, backdrop blur, and shadow. Modern pill shape."},
            ],
            "contentSchema": {
                "logo": {"text": "string (brand name)", "href": "string (default '/')"},
                "navItems": "[{label: string, href: string}] (navigation links)",
                "cta": "{label: string, href: string} | null (call-to-action button)",
            },
        },
        {
            "type": "hero",
            "variants": [
                {"variant": "centered", "description": "Large centered headline with subtitle and CTA buttons. Clean and impactful. No image required."},
                {"variant": "split-image-right", "description": "Text on the left, image on the right. Stacks on mobile. Classic SaaS layout."},
                {"variant": "split-image-left", "description": "Image on the left, text on the right. Stacks on mobile. Mirror of split-image-right."},
                {"variant": "gradient-bold", "description": "Bold headline over a gradient background using primary→accent colors. High-impact, eye-catching."},
                {"variant": "with-app-screenshot", "description": "Centered text above a large app screenshot. Perfect for showcasing product UI."},
            ],
            "contentSchema": {
                "headline": "string (required, main headline)",
                "subheadline": "string | null (supporting text)",
                "primaryCta": "{label: string, href: string} | null",
                "secondaryCta": "{label: string, href: string} | null",
                "image": "{src: string, alt: string} | null (hero image or screenshot)",
                "badge": "string | null (small badge text above headline, e.g. 'Now in beta')",
            },
        },
        {
            "type": "logos",
            "variants": [
                {"variant": "simple-row", "description": "Single row of logos with optional title. Clean trust signal."},
                {"variant": "marquee", "description": "Auto-scrolling infinite logo strip. Creates a sense of momentum."},
                {"variant": "grid", "description": "Grid of logos with even spacing. Good for many logos."},
                {"variant": "with-title", "description": "Prominent title above a row of logos on a muted background."},
            ],
            "contentSchema": {
                "title": "string | null (e.g. 'Trusted by 10,000+ companies')",
                "logos": "[{name: string, src: string (image URL), href: string | null}]",
            },
        },
        {
            "type": "features",
            "variants": [
                {"variant": "cards-grid", "description": "Grid of feature cards with icons, titles, and descriptions. Versatile 2-3 column layout."},
                {"variant": "bento-grid", "description": "Asymmetric bento-style grid. First feature is large, rest are smaller cards."},
                {"variant": "icon-list", "description": "Split layout: headline left, vertical list of features with icons on the right."},
                {"variant": "alternating", "description": "Alternating left/right rows of image + text. Great for detailed feature explanations."},
                {"variant": "three-column", "description": "Three centered columns with icons and descriptions. Clean and balanced."},
            ],
            "contentSchema": {
                "tagline": "string | null (small text above headline, e.g. 'Features')",
                "headline": "string (required)",
                "description": "string | null (supporting paragraph)",
                "features": "[{icon: string | null (emoji), title: string, description: string, image: {src, alt} | null}] (min 1)",
            },
        },
        {
            "type": "social-proof",
            "variants": [
                {"variant": "cards-grid", "description": "Grid of testimonial cards with quotes, author names, and optional avatars."},
                {"variant": "carousel", "description": "Sliding testimonial carousel with navigation arrows. One testimonial at a time."},
                {"variant": "single-quote", "description": "One large featured testimonial quote. High impact, minimal layout."},
                {"variant": "twitter-wall", "description": "Social media-style masonry wall of testimonials. Good for many short quotes."},
            ],
            "contentSchema": {
                "tagline": "string | null",
                "headline": "string | null",
                "testimonials": "[{quote: string, author: string, role: string | null, company: string | null, avatar: string | null, rating: 1-5 | null}] (min 1)",
            },
        },
        {
            "type": "stats",
            "variants": [
                {"variant": "inline-row", "description": "Numbers in a horizontal row. Compact trust-building metrics."},
                {"variant": "cards", "description": "Each stat in its own bordered card. Structured and formal."},
                {"variant": "large-centered", "description": "Extra-large centered numbers. Maximum visual impact."},
                {"variant": "with-description", "description": "Stats with left border accent and supporting descriptions."},
            ],
            "contentSchema": {
                "tagline": "string | null",
                "headline": "string | null",
                "stats": "[{value: string (e.g. '10K+'), label: string, description: string | null}] (min 1)",
            },
        },
        {
            "type": "pricing",
            "variants": [
                {"variant": "three-tier", "description": "Three plans side by side, middle highlighted. Classic SaaS pricing."},
                {"variant": "two-tier", "description": "Two plans side by side. Simple choice between free and paid."},
                {"variant": "comparison-table", "description": "Feature comparison table across all plans. Detailed side-by-side."},
                {"variant": "single-highlight", "description": "One featured plan with full details. Use when there's a clear recommended option."},
            ],
            "contentSchema": {
                "tagline": "string | null",
                "headline": "string (required)",
                "description": "string | null",
                "plans": "[{name: string, description: string | null, price: string (e.g. '$29'), period: string (default '/month'), features: [{text: string, included: bool}], cta: {label, href}, highlighted: bool (default false), badge: string | null}] (min 1)",
            },
        },
        {
            "type": "faq",
            "variants": [
                {"variant": "accordion", "description": "Expandable accordion. Click to reveal answers. Classic and space-efficient."},
                {"variant": "two-column", "description": "Questions laid out in two columns. Good for many questions."},
                {"variant": "simple-list", "description": "Plain list of Q&A. No accordion, everything visible at once."},
                {"variant": "with-categories", "description": "FAQ grouped by category with tab-like filtering. Great for large FAQ sets."},
            ],
            "contentSchema": {
                "tagline": "string | null",
                "headline": "string (required)",
                "description": "string | null",
                "items": "[{question: string, answer: string, category: string | null}] (min 1)",
            },
        },
        {
            "type": "cta",
            "variants": [
                {"variant": "bold-centered", "description": "Bold headline + buttons on primary-colored background. High-impact conversion section."},
                {"variant": "with-image", "description": "CTA with a supporting image alongside the text and buttons."},
                {"variant": "split", "description": "Text on one side, buttons on the other. Clean horizontal layout on muted background."},
                {"variant": "minimal", "description": "Simple centered text and button. Understated and clean."},
            ],
            "contentSchema": {
                "headline": "string (required)",
                "description": "string | null",
                "primaryCta": "{label: string, href: string} (required)",
                "secondaryCta": "{label: string, href: string} | null",
                "image": "{src: string, alt: string} | null",
            },
        },
        {
            "type": "footer",
            "variants": [
                {"variant": "columns-with-socials", "description": "Multi-column footer with link groups, social icons, and copyright."},
                {"variant": "simple-centered", "description": "Centered logo with links below. Clean and simple."},
                {"variant": "minimal", "description": "One-line footer with logo, copyright, and social links."},
                {"variant": "mega-footer", "description": "Large footer with newsletter signup form, columns, social links, and legal info."},
            ],
            "contentSchema": {
                "logo": "{text: string, href: string} | null",
                "columns": "[{title: string, links: [{label: string, href: string}]}]",
                "socialLinks": "[{platform: string, href: string}]",
                "copyright": "string | null (e.g. '© 2026 Company. All rights reserved.')",
                "newsletter": "{title: string, description: string | null, placeholder: string, buttonLabel: string} | null",
            },
        },
    ],
    "themePresets": [
        {"name": "corporate", "description": "Professional blue tones with Inter font. Clean and trustworthy."},
        {"name": "startup", "description": "Vibrant purple/indigo with modern feel. Energetic and innovative."},
        {"name": "minimal", "description": "Near-monochrome with subtle grays. Understated elegance."},
        {"name": "bold", "description": "High-contrast red/pink with Impact-style heading. Attention-grabbing."},
        {"name": "warm", "description": "Orange/amber tones with rounded corners. Friendly and approachable."},
        {"name": "tech", "description": "Dark background with cyan/blue accents. Developer-focused, modern."},
    ],
    "themeTokens": [
        "primary", "primaryForeground", "secondary", "secondaryForeground",
        "background", "foreground", "muted", "mutedForeground",
        "accent", "accentForeground", "border", "ring",
        "destructive", "destructiveForeground", "radius", "fontHeading", "fontBody",
    ],
}


def get_catalog_text() -> str:
    """Return catalog as a formatted string for the system prompt."""
    import json
    return json.dumps(CATALOG, indent=2)
