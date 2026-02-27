# Plan 02 — Component Library

> Status: `NOT STARTED`

---

## Goal

Build ~40 production-quality section components across 10 types. Every component is responsive (desktop/tablet/mobile), supports light and dark mode, uses CSS variable tokens for theming, and accepts content via the shared schema for its type.

---

## Tasks

### 2.1 Reference Implementation
- [ ] Build ONE component fully to production quality as the reference:
  - Suggested: `hero/split-image-right`
  - Must demonstrate: cva usage, tailwind-merge, CSS variables, responsive, light/dark mode, content schema compliance
- [ ] Document the component pattern in a short `COMPONENT_GUIDE.md`
- [ ] Include in COMPONENT_GUIDE.md: how metadata is exported for the AI catalog (registry integration, schema mapping)
- [ ] All subsequent components follow this pattern exactly

### 2.2 Header Components
- [ ] `header/simple-with-cta` — Logo, nav links, CTA button
- [ ] `header/centered` — Centered logo, nav below
- [ ] `header/transparent` — Transparent background, overlays hero
- [ ] `header/floating` — Fixed, shrinks on scroll

### 2.3 Hero Components
- [ ] `hero/centered` — Large centered headline, subtitle, CTAs. No image.
- [ ] `hero/split-image-right` — Text left, image right. Stacks on mobile.
- [ ] `hero/split-image-left` — Image left, text right. Stacks on mobile.
- [ ] `hero/gradient-bold` — Bold headline over gradient background.
- [ ] `hero/with-app-screenshot` — Centered text, large app screenshot below.

### 2.4 Logos Components
- [ ] `logos/simple-row` — Single row of logos
- [ ] `logos/marquee` — Auto-scrolling infinite logo strip
- [ ] `logos/grid` — Grid of logos with title
- [ ] `logos/with-title` — "Trusted by" title + logo row

### 2.5 Features Components
- [ ] `features/cards-grid` — Grid of feature cards with icons
- [ ] `features/bento-grid` — Asymmetric bento-style layout
- [ ] `features/icon-list` — Vertical list with icons
- [ ] `features/alternating` — Alternating image + text rows
- [ ] `features/three-column` — Three columns with icons and descriptions

### 2.6 Social Proof Components
- [ ] `social-proof/cards-grid` — Grid of testimonial cards
- [ ] `social-proof/carousel` — Sliding testimonial carousel
- [ ] `social-proof/single-quote` — One large featured quote
- [ ] `social-proof/twitter-wall` — Social media style testimonial wall

### 2.7 Stats Components
- [ ] `stats/inline-row` — Numbers in a horizontal row
- [ ] `stats/cards` — Stat cards with labels
- [ ] `stats/large-centered` — Big numbers, centered
- [ ] `stats/with-description` — Stats with supporting descriptions

### 2.8 Pricing Components
- [ ] `pricing/three-tier` — Three plans side by side, middle highlighted
- [ ] `pricing/two-tier` — Two plans side by side
- [ ] `pricing/comparison-table` — Feature comparison table
- [ ] `pricing/single-highlight` — One featured plan with details

### 2.9 FAQ Components
- [ ] `faq/accordion` — Expandable accordion
- [ ] `faq/two-column` — Questions in two columns
- [ ] `faq/simple-list` — Plain list, no accordion
- [ ] `faq/with-categories` — Grouped by category

### 2.10 CTA Components
- [ ] `cta/bold-centered` — Bold headline + button, centered
- [ ] `cta/with-image` — CTA with supporting image
- [ ] `cta/split` — Text on one side, form/button on other
- [ ] `cta/minimal` — Simple text + button, minimal styling

### 2.11 Footer Components
- [ ] `footer/columns-with-socials` — Multi-column links + social icons
- [ ] `footer/simple-centered` — Logo + links centered
- [ ] `footer/minimal` — Copyright only, one line
- [ ] `footer/mega-footer` — Large footer with newsletter, columns, legal

---

## Quality Checklist (Per Component)

Every component must pass before being marked done:

- [ ] Responsive: looks correct at 1280px, 768px, 375px
- [ ] Light mode: correct colors using CSS variable tokens
- [ ] Dark mode: correct colors when `.dark` class is on wrapper
- [ ] Content: accepts the full schema for its type, handles optional fields gracefully
- [ ] Accessibility: semantic HTML, proper heading hierarchy, alt text, focus states
- [ ] Self-contained: no dependencies on other sections or global state
- [ ] Code size: ~50-150 lines for component JSX (excludes imports/types; total with schema ~200 lines max — keeps it LLM-editable for future eject)

---

## Exit Criteria

- [ ] All ~40 components built and passing quality checklist
- [ ] A full test page using one of each type renders correctly
- [ ] Variant swapping works: test page demonstrates switching variants within at least 3 types without losing content or breaking layout
- [ ] COMPONENT_GUIDE.md written for future contributors

---

## Dependencies

- Plan 01 (Foundation): schemas, registry, theme engine must exist

## Blocks

- 03 AI Configurator (needs real components to test catalog against)
