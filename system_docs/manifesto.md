# Naguib

## The Idea

A website is not generated — it is **assembled** from pre-built, tested, responsive components.

AI doesn't write code. It picks components, arranges them, applies a theme, and fills in content. Every output is guaranteed to work because nothing is invented at runtime.

Once the user has a working site, they can eject any component and customize it freely with an LLM. The system gives them a solid foundation — then gets out of the way.

---

## Core Principles

1. **Components are the product.** Each one is hand-built, responsive across desktop/tablet/mobile, and self-contained. The library is the moat.

2. **Sections stack vertically.** A page is an ordered list of full-width sections. Nothing more.

3. **Each component owns its responsiveness.** The system doesn't handle breakpoints. Each component variant defines its own behavior across all three screen states (desktop, tablet, mobile). That's the quality bar to enter the library.

4. **Theme is ambient, not injected.** A theme is a set of CSS variables set at the root level. Components reference token names, never hardcoded values. Changing the theme changes everything instantly.

5. **The output is a config, not code.** The AI produces a JSON describing which sections, which variants, which theme, and what content. A renderer turns that config into a page.

6. **No generation, only selection.** The AI is a configurator. It selects from a finite, tested set. This is what makes it reliable.

---

## The Universal Contract

Every section in the system receives exactly four things:

| Field | What it is | Who decides it |
|---|---|---|
| **type** | Section family — `"hero"`, `"features"`, `"faq"`, etc. | AI picks based on what the user needs |
| **variant** | Which layout within that type — a meaningful slug like `"split-image-right"`, `"centered"`, `"cards-grid"` | AI picks from the component catalog |
| **content** | The actual data — text, images, links. Schema is defined per type, same shape across all variants of that type | AI generates or asks the user for this |
| **mode** | `"light"` or `"dark"` — tells the component which surface it's on | AI assigns this per section to create visual rhythm |

**Theme is NOT part of the contract.** Theme is set once at the page level as CSS variables. Components read from `var(--token-name)` and never know the actual values. Mode (light/dark) flips a few variables at the section wrapper level.

### Key rules:

- **All variants of a type accept the same content shape.** A `"centered"` hero and a `"split-image-right"` hero both accept the same hero content schema. Some variants may ignore optional fields, but the shape is always consistent. The AI can swap variants without touching content.
- **Components know nothing about each other.** No section knows what's above or below it. The AI is the one with the full picture.
- **Content is pure data.** No styling hints, no layout instructions. Just text, URLs, and image references. The variant decides how to present it.

---

## The Component Manifest

Every component in the library ships with three things:

```
Component = Visual Description + Content Schema + Code
                    ↑                    ↑            ↑
              AI reads this       AI fills this    Renderer uses this
```

### 1. Visual Description

A meaningful id and a human-readable description. The AI reads this to decide which variant fits the user's needs. It never sees the actual component visually — it shops by reading descriptions.

```
type: "hero"
id: "split-image-right"
description: "Headline and CTA on the left, large image on the right. Image stacks below text on mobile."
```

```
I need a hero for a SaaS product with a product screenshot...

→ "centered"           — Large centered headline with subtitle and CTA. Clean, minimal.
→ "split-image-right"  — Headline and CTA on the left, large image on the right.
→ "video-bg"           — Full-width background video with overlay text and CTA.
→ "gradient-bold"      — Bold headline over a gradient background. No image.

Pick: "split-image-right" ✓
```

### 2. Content Schema

A structured definition of what data the component needs. The AI reads this to know exactly what to provide.

```
type: "social_proof"
content_schema:
  title:        string, required
  subtitle:     string, optional
  items:        array, min 2, max 8
    text:       string, required
    author:     string, required
    role:       string, optional
    image:      url, optional
```

The AI knows: "I need a title and at least 2 testimonial items, each with text and an author."

### 3. The Actual Code

The responsive, theme-aware component. The renderer uses this. The AI never sees it, never touches it, never generates it.

---

## Two Phases

The system operates in two distinct phases. Phase 1 guarantees a working site. Phase 2 gives the user full creative control.

### Phase 1: Assembly (Deterministic)

The AI is a personal shopper. It browses the component catalog, picks sections, fills in content, assigns themes and modes, and arranges them into a page.

```
User: "I need a landing page for my IoT platform"
        ↓
AI browses the catalog:
  "Hero — split-image-right with a dashboard screenshot"
  "Features — cards-grid, three key capabilities"
  "Social proof — logo-bar, partner logos"
  "Pricing — three-tier with a highlighted plan"
  "FAQ — standard accordion"
  "CTA — bold, dark mode, last push"
  "Footer — columns with socials"
        ↓
AI assigns modes: light, dark, light, light, dark, dark, dark
        ↓
AI fills content for each section using content schemas
        ↓
AI picks a theme (tech = clean, blue primary, sans-serif)
        ↓
Outputs a page config JSON → Renderer assembles → done.
```

The AI doesn't generate code. It doesn't invent layouts. It reads descriptions, picks from a tested catalog, fills schemas, and outputs a config. Every page is guaranteed to work because every block was pre-built and tested.

**The user gets a complete, responsive, working site in seconds.** No blank page anxiety. No broken CSS. No debugging.

### Phase 2: Customization (Generative)

This is where the ceiling disappears.

The user now has a working site — a real, solid foundation. If they want to tweak something, they **eject** a specific component and hand it to an LLM for freeform modification.

```
User: "I love this hero, but make the image circular and add a 'New' badge above the headline"
        ↓
LLM receives the isolated component code (~50 lines)
        ↓
LLM modifies it
        ↓
Modified component replaces the original in the page
```

**Why this works:**

- **LLMs are great at small, scoped edits.** They struggle with generating an entire page from scratch, but modifying a single 50-line component has a near-perfect success rate.
- **The blast radius is contained.** If the user breaks something, they broke one section — not the whole page, not the theme, not the layout.
- **Customization starts from confidence.** The user isn't staring at a blank canvas or debugging a hallucinated mess. They're refining something that already works.

Phase 1 gets them 90% there with zero risk. Phase 2 handles the last 10% with full flexibility. The user is never stuck.

---

## V1 Scope: Landing Pages

A landing page is a solved problem. The section types are finite:

- Header
- Hero
- Features
- Social Proof
- Pricing
- FAQ
- CTA
- Footer

Each type has a small number of variants (3–8). The total library for V1 is roughly 30–50 components.

That covers 95% of all landing pages.

### Example Page Config

```json
{
  "theme": {
    "primary": "#2563EB",
    "secondary": "#1E40AF",
    "background": "#FFFFFF",
    "text": "#111827",
    "font_heading": "Inter",
    "font_body": "Inter",
    "radius": "8px",
    "spacing_unit": "8px"
  },
  "sections": [
    {
      "type": "header",
      "variant": "simple-with-cta",
      "mode": "light",
      "content": {
        "logo": "url-to-logo",
        "nav": [
          { "label": "Features", "href": "#features" },
          { "label": "Pricing", "href": "#pricing" },
          { "label": "FAQ", "href": "#faq" }
        ],
        "cta": { "label": "Get Started", "href": "/signup" }
      }
    },
    {
      "type": "hero",
      "variant": "split-image-right",
      "mode": "light",
      "content": {
        "headline": "Monitor your entire fleet in real time",
        "subtitle": "The IoT platform built for operations teams",
        "cta_primary": { "label": "Start Free Trial", "href": "/signup" },
        "cta_secondary": { "label": "Book a Demo", "href": "/demo" },
        "image": "url-to-dashboard-screenshot"
      }
    },
    {
      "type": "features",
      "variant": "cards-grid",
      "mode": "dark",
      "content": {
        "title": "Everything you need",
        "subtitle": "Built for scale from day one",
        "items": [
          { "icon": "satellite", "title": "Real-time Tracking", "description": "Track every asset live on a single dashboard." },
          { "icon": "bell", "title": "Smart Alerts", "description": "Get notified before problems happen." },
          { "icon": "chart", "title": "Analytics", "description": "Insights that drive decisions." }
        ]
      }
    },
    {
      "type": "social_proof",
      "variant": "logo-bar",
      "mode": "light",
      "content": {
        "title": "Trusted by industry leaders",
        "items": [
          { "image": "url-to-logo-1" },
          { "image": "url-to-logo-2" },
          { "image": "url-to-logo-3" }
        ]
      }
    },
    {
      "type": "pricing",
      "variant": "three-tier",
      "mode": "light",
      "content": {
        "title": "Simple pricing",
        "subtitle": "No hidden fees",
        "toggle": true,
        "plans": [
          {
            "name": "Starter",
            "price_monthly": 29,
            "price_yearly": 290,
            "features": ["Up to 50 devices", "Email support", "Basic analytics"],
            "cta": { "label": "Start Free", "href": "/signup?plan=starter" },
            "highlighted": false
          },
          {
            "name": "Pro",
            "price_monthly": 99,
            "price_yearly": 990,
            "features": ["Unlimited devices", "Priority support", "Advanced analytics", "API access"],
            "cta": { "label": "Start Free", "href": "/signup?plan=pro" },
            "highlighted": true
          },
          {
            "name": "Enterprise",
            "price_monthly": null,
            "price_yearly": null,
            "features": ["Custom everything", "Dedicated support", "SLA", "On-prem option"],
            "cta": { "label": "Contact Sales", "href": "/contact" },
            "highlighted": false
          }
        ]
      }
    },
    {
      "type": "faq",
      "variant": "accordion",
      "mode": "dark",
      "content": {
        "title": "Frequently asked questions",
        "items": [
          { "question": "How does the free trial work?", "answer": "14 days, full access, no credit card." },
          { "question": "Can I cancel anytime?", "answer": "Yes, cancel with one click." }
        ]
      }
    },
    {
      "type": "cta",
      "variant": "bold-centered",
      "mode": "dark",
      "content": {
        "headline": "Ready to take control?",
        "subtitle": "Start your free trial today",
        "cta": { "label": "Get Started", "href": "/signup" }
      }
    },
    {
      "type": "footer",
      "variant": "columns-with-socials",
      "mode": "dark",
      "content": {
        "logo": "url-to-logo",
        "columns": [
          {
            "title": "Product",
            "links": [
              { "label": "Features", "href": "#features" },
              { "label": "Pricing", "href": "#pricing" }
            ]
          },
          {
            "title": "Company",
            "links": [
              { "label": "About", "href": "/about" },
              { "label": "Blog", "href": "/blog" }
            ]
          }
        ],
        "socials": [
          { "platform": "twitter", "href": "https://twitter.com/..." },
          { "platform": "linkedin", "href": "https://linkedin.com/..." }
        ],
        "copyright": "© 2025 FleetIO. All rights reserved."
      }
    }
  ]
}
```

---

## What Comes Next

Landing pages prove the concept. The same architecture extends to:

- Dashboards
- Admin panels
- PWAs
- Full platforms (frontend + backend)

The component library grows. The assembly model stays the same.

---

## Why This Wins

| Current AI builders | This system |
|---|---|
| Generate code on the fly | Assemble from tested blocks |
| Inconsistent quality | Every combination works |
| Breaks on edge cases | No edge cases — finite set |
| Slow (LLM generates everything) | Fast (just config + render) |
| Can't guarantee responsive | Responsive is built into every block |
| Users hit a customization ceiling | Eject any component, customize freely with an LLM |
| Blank page anxiety | Instant working V1, then refine |

---

*This document will be enriched progressively as the concept develops.*