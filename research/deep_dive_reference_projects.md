# Deep Dive: Reference Projects for Naguib

Comprehensive analysis of every project from our research. What they do, how they work internally, and what Naguib should steal (or avoid) from each.

---

## 1. Puck — The Closest Match to Naguib's Architecture

**Repo:** github.com/puckeditor/puck | **Stars:** 12.2k | **License:** MIT

### What It Is

Puck is a modular visual editor for React. You register your own components with a `config` object, and Puck provides a drag-and-drop editor UI. When a user builds a page and hits Publish, Puck outputs **a JSON data payload** — not code. A separate `<Render>` component takes that JSON + config and renders the page.

This is the exact same "config, not code" philosophy as Naguib.

### How The Component Contract Works

```tsx
const config = {
  components: {
    HeadingBlock: {
      fields: {
        title: { type: "text" },
      },
      defaultProps: {
        title: "Hello, world",
      },
      render: ({ title }) => <h1>{title}</h1>,
    },
  },
};
```

Key observations:
- **Config = fields + render function.** Fields define the editable schema. Render defines visual output. This is Naguib's "content schema + code" split.
- **Data payload is JSON.** When published, Puck outputs: `{ content: [{ type: "HeadingBlock", props: { id: "...", title: "Hello" } }], root: {} }`
- **`<Render config={config} data={data} />`** — That's the entire rendering contract. Config + JSON data = page.
- **TypeScript-first.** You define `type Components = { HeadingBlock: { title: string } }` and get full type checking on fields and render props.

### How Puck AI Works (v0.21+, Cloud Beta)

Puck recently launched AI page generation as a **cloud service** (not open source):
- **AI Plugin:** Generates pages from within the Puck editor using your existing config
- **Headless Generation API:** Generate pages programmatically (not just through the editor)
- **AI Configuration:** Fine-tune how the AI agent treats each component
- **Business Context:** Inject tone of voice, brand guidelines, business logic
- **Tools:** Let the AI agent query your systems/databases for content

The AI is constrained to your registered components — it cannot invent new ones. This is exactly Naguib's "no generation, only selection" principle.

### What Naguib Should Steal

1. **The `config` → `data` → `<Render>` contract.** It works. Proven at scale. Clean separation.
2. **Fields as schema definition.** Instead of separate Zod schemas, Puck defines the schema inline with the component. Simpler for V1.
3. **AI Configuration per component.** The idea of telling the AI *how* to use each component (not just *what* it is) is powerful.
4. **Data migration support.** Puck has built-in migration utilities for when component schemas change. We'll need this too.
5. **Viewport preview.** Puck renders in a same-origin iframe for responsive preview. Smart for our desktop/tablet/mobile preview.

### What Naguib Should NOT Copy

1. **Puck is a visual editor first, AI second.** Naguib is AI-first. We don't need the drag-drop editor for V1.
2. **Puck's AI is proprietary cloud.** We need to build our own AI configurator.
3. **Puck doesn't have a "type + variant" concept.** Each component is flat — "HeadingBlock", "HeroWithImage". No hierarchical type/variant organization. Naguib's type/variant split is better for AI shopping because the AI can first pick the *type* then the *variant*.
4. **No built-in theme system.** Puck leaves theming entirely to the developer. Naguib's CSS variable theme layer is a first-class feature.
5. **No mode (light/dark) per section.** Again, Naguib's section-level mode is a differentiator.

---

## 2. GrapesJS — The OG Block Builder

**Repo:** github.com/GrapesJS/grapesjs | **Stars:** 25k+ | **License:** BSD-3

### What It Is

GrapesJS is a mature, framework-agnostic web builder framework (not React-specific). It's been around for years and is used in production by large companies. You define **Blocks** (reusable chunks of HTML/components) and **Components** (the underlying element types with behavior).

### Architecture: Block → Component → DOM

```js
// Define a component type
editor.Components.addType('card', {
  isComponent: el => el.classList?.contains('card'),
  model: {
    defaults: {
      tagName: 'div',
      attributes: { class: 'card' },
      components: [
        { type: 'image', ... },
        { tagName: 'p', content: 'Card text' },
      ],
      styles: '.card { padding: 20px; }',
    },
  },
});

// Create a block that uses it
editor.Blocks.add('card-block', {
  label: 'Card',
  category: 'My Components',
  content: { type: 'card' },
});
```

Key architecture points:
- **Components are DOM-based.** Everything is tagName + attributes + children. No React, no virtual DOM.
- **Blocks connect to Components.** A Block is just a UI element in the sidebar that, when dragged, creates a Component instance on the canvas.
- **Component Type Stack.** When HTML is parsed, GrapesJS iterates through registered component types (top to bottom) to determine what type each element is. Custom types go on top.
- **Modular system:** ~15+ modules — BlockManager, StyleManager, TraitManager, SelectorManager, StorageManager, etc.
- **Scripts run in iframe.** Component scripts execute inside the canvas iframe (isolated), not in the editor context.

### Storage Model

GrapesJS stores everything as a **component tree** — each component has `tagName`, `attributes`, `classes`, `styles`, and `children`. It's basically a serializable DOM representation. This is fundamentally different from Naguib's approach (structured content data).

### What Naguib Should Steal

1. **Block categorization system.** GrapesJS groups blocks by category ("Basic", "Layout", "Forms"). Good UX pattern for organizing our component catalog for the AI.
2. **The concept of a "Block Manager" with events.** `block:add`, `block:drag:start`, `block:drag:stop` — well-thought-out lifecycle. If we add a visual editor later.
3. **Maturity of the plugin system.** Years of real-world plugins. Study how they keep the core extensible.

### What Naguib Should NOT Copy

1. **DOM-based component model.** GrapesJS thinks in HTML elements, not structured data. Naguib's "content is pure data" principle is fundamentally better for AI consumption.
2. **Style management complexity.** GrapesJS has a full CSS editor with selectors, rules, properties. Way too complex for our "theme is ambient" approach.
3. **Framework-agnostic = lowest common denominator.** GrapesJS works everywhere but excels nowhere. We should commit to React + Tailwind.
4. **No AI-native design.** GrapesJS was built for humans dragging blocks. Bolting AI onto it is possible but not natural.

**Verdict:** Study for block management and plugin patterns. Don't use as a foundation.

---

## 3. ChaiBuilder — The Lightweight React+Tailwind Builder

**Repo:** github.com/chaibuilder/sdk | **License:** MIT

### What It Is

ChaiBuilder is an open-source React + Tailwind CSS visual builder. It renders a full-fledged visual editor as a React component. It has two packages:
- **`@chaibuilder/sdk`** — Core builder, backend-agnostic, drops into any React app
- **Next.js starter** — SSG + ISR implementation for marketing sites

### How Components Work

```tsx
import { ChaiBuilderEditor } from "@chaibuilder/sdk";
import { loadWebBlocks } from "@chaibuilder/sdk/web-blocks";

loadWebBlocks(); // Registers built-in blocks

<ChaiBuilderEditor
  blocks={[{
    _type: 'Heading',
    _id: 'a',
    content: 'This is a heading',
    styles: '#styles:,text-3xl font-bold'
  }]}
  onSave={async ({ blocks, providers, brandingOptions }) => {
    // blocks = the page data (JSON)
    return true;
  }}
/>
```

Key observations:
- **Blocks store Tailwind classes as strings** in a `styles` field. This is a different philosophy from Naguib where components are pre-styled.
- **Custom component injection** — Register your own React components and make them editable.
- **Tailwind config integration** — Uses a dedicated `tailwind.chaibuilder.config.ts` for builder-specific styles.
- **Global branding** — Has primary/secondary colors and font options at the project level.

### What Naguib Should Steal

1. **The "drop into any React app" simplicity.** Single React component, single import. Our renderer should be this clean.
2. **`loadWebBlocks()` pattern.** A single function call to register all built-in components. Clean initialization.
3. **`onSave` contract.** Simple callback with the complete page data. No complex persistence layer forced on you.

### What Naguib Should NOT Copy

1. **Styles as Tailwind class strings.** This couples the data to Tailwind and makes theme-swapping hard. Naguib's CSS variable approach is better.
2. **Visual-editor-first.** ChaiBuilder is designed around drag-and-drop. We need AI-first.
3. **Limited component metadata.** No rich descriptions for AI to shop from.

**Verdict:** Good reference for "how to make a builder embeddable." Too visual-editor-focused for our AI-first approach.

---

## 4. Webstudio — The Open-Source Webflow

**Repo:** github.com/webstudio-is/webstudio | **Stars:** 8.3k | **License:** AGPL-3.0

### What It Is

Webstudio is a full visual development platform — the most ambitious project on this list. It's essentially an open-source Webflow with every CSS property exposed, headless CMS integration, and hosting anywhere (including Cloudflare Workers edge deployment).

### Key Architecture Concepts

1. **Style Sources (not classes).** Instead of CSS classes, Webstudio uses "Style Sources" — there are three types:
   - **Design Tokens** — Named reusable styles (like classes, based on the W3C design tokens standard)
   - **Local styles** — One-off tweaks on individual elements
   - **Component styles** — Inherited from the component definition
   
   This solves Webflow's biggest pain point (unmanageable class explosion).

2. **Component System with Properties.** You create reusable components with customizable properties — e.g., a Card component where you can change title/description while keeping styles in sync.

3. **Every CSS property exposed.** Transforms, transitions, Grid, Flexbox — all available in the visual UI. No CSS abstraction layer.

4. **Any CMS integration.** Headless architecture — connect to Strapi, Contentful, Sanity, Airtable, etc.

5. **Edge deployment.** Sites deploy to Cloudflare Workers for global edge performance.

### What Naguib Should Steal

1. **Style Sources pattern.** The three-tier styling model (tokens + local + component) is elegant. For Naguib, this maps to: theme tokens (global CSS vars) + mode overrides (section-level) + component defaults (built into each variant).
2. **Design tokens based on W3C standard.** Future-proofing our theme system by aligning with the emerging standard.
3. **The "show exactly what code is generated" philosophy.** Transparency builds trust. When users eject components, show them exactly what they're getting.

### What Naguib Should NOT Copy

1. **Full Webflow-class visual builder.** Massively complex. Not our V1.
2. **Every-CSS-property-exposed approach.** Our components are pre-built. Users don't need to tweak `transform: perspective(400em)`.
3. **AGPL license.** Restrictive for a commercial product.
4. **CMS integration complexity.** V1 doesn't need headless CMS support.

**Verdict:** The most technically impressive project on the list, but it's solving a different problem (visual development platform vs. AI assembly). Steal the style/token architecture. Ignore the visual editor complexity.

---

## 5. Page UI — The Landing Page Component Library

**Repo:** github.com/danmindru/page-ui | **Stars:** 1.6k | **License:** MIT

### What It Is

Page UI is the closest thing to what Naguib's component *library* should look like. It's a collection of landing page UI components for React + Next.js, built on Tailwind CSS, inspired by shadcn/ui's copy-paste philosophy.

### Component Organization

```
components/
├── landing/          # Section-level components
│   ├── LandingBandSection
│   ├── LandingFaqSection
│   ├── LandingFeatureList
│   ├── LandingHero
│   ├── LandingPricing
│   ├── LandingSocialProof
│   ├── LandingTestimonialGrid
│   └── ...
├── shared/           # Reusable primitives
│   ├── Button
│   ├── VideoPlayer
│   └── ...
templates/
├── landing-page-templates/
│   ├── specta/       # Complete template
│   ├── gnomie-ai/    # Complete template
│   └── ...
```

### Key Technical Details

- **Tailwind v3** (not yet v4). Uses `@tailwindcss/forms`, `@tailwindcss/typography`, `tailwindcss-animate`.
- **`class-variance-authority` (cva)** for variant management.
- **`clsx` + `tailwind-merge`** for conditional class composition.
- **CSS variables for theming.** Uses shadcn-compatible `--background`, `--foreground`, `--primary-foreground`, etc. Dark mode via `.dark` class.
- **Radix UI primitives** for accessible interactive elements (accordion, etc.).
- **CLI wizard:** `npx @page-ui/wizard@latest init` scaffolds everything.

### Theming Approach

```css
:root {
  --background: 0 0% 100%;
  --foreground: 240 10% 3.9%;
  --primary-foreground: 355.7 100% 97.3%;
  --secondary: 240 4.8% 95.9%;
  --muted: 240 4.8% 95.9%;
  --border: 240 5.9% 90%;
  --radius: 0.5rem;
}
.dark {
  --background: 20 14.3% 4.1%;
  --foreground: 0 0% 95%;
  /* ... */
}
```

This is HSL values stored as CSS variables — components reference `hsl(var(--background))`. **This is exactly Naguib's theme model.**

### What Naguib Should Steal

1. **The section taxonomy.** Page UI has already solved "what types of landing page sections exist": hero, features, FAQ, pricing, social proof, testimonials, CTA, band sections, etc. Study their list.
2. **The CSS variable theming pattern.** HSL values as CSS variables with `.dark` class override. Battle-tested, shadcn-compatible.
3. **`cva` for variant management.** This is the right pattern for managing Tailwind variant classes cleanly.
4. **`clsx` + `tailwind-merge`** for class composition. Industry standard.
5. **Template organization.** Complete templates as compositions of section components. Good reference for our "assembled pages."

### What Naguib Should NOT Copy

1. **Copy-paste distribution.** Page UI expects you to copy component source code. Naguib's components should be registered, not copied (until eject).
2. **No structured content schema.** Components accept React props, but there's no formal schema definition. We need explicit schemas for AI consumption.
3. **No type/variant hierarchy.** `LandingHero` is one component, not `type: "hero", variant: "split-image-right"`. We need the hierarchical organization.
4. **Tailwind v3 only.** We should build on Tailwind v4.

### Also Discovered: Launch UI

**Repo:** github.com/launch-ui/launch-ui | **License:** Mixed (free + paid)

Similar concept but already on **Tailwind v4 + React 19 + Next.js 15**. Has multiple variants per section type: Hero (illustration, glowing, mobile app), Navbar (static, floating), Testimonials (grid, carousel, static), Footer (default, minimal, multi-column). Also has Bento Grid, Social Proof with masonry, and CTA with beam effects.

**Key difference:** Launch UI explicitly separates data from components — "All the data is separate from components so you can edit it in seconds or make it dynamic." This aligns with Naguib's content-as-data principle.

**Worth studying both** — Page UI for section taxonomy and theming patterns, Launch UI for variant organization and data separation.

---

## 6. Magic UI — The Animation Layer

**Repo:** github.com/magicuidesign/magicui | **Stars:** 19k+ | **License:** MIT

### What It Is

150+ animated components and effects for React. TypeScript, Tailwind CSS, Framer Motion. Perfect companion for shadcn/ui. Copy-paste philosophy.

### Key Categories

Not full sections — these are **effects and primitives**:
- Animated backgrounds (particles, grids, aurora)
- Text effects (typing, morphing, blur)
- Interactive cards (tilt, flip, glow)
- Transitions and scroll animations
- Marquees and infinite scrollers
- Number/counter animations

### What Naguib Should Steal

1. **The "polish layer" concept.** Our base components handle layout and content. Magic UI-style animations could be a future enhancement layer — add particle backgrounds to a hero, add text morphing to a headline.
2. **shadcn registry compatibility.** Magic UI publishes to the shadcn registry. Our components could too.
3. **MCP integration.** Magic UI has an MCP server (`magicuidesign/mcp`) for AI-driven component generation. Worth studying their approach.

### What Naguib Should NOT Copy

1. **These are effects, not sections.** Magic UI doesn't have "hero sections" or "pricing tables." Different abstraction level.
2. **Framer Motion dependency.** Adds bundle size. For V1, our components should be CSS-only for performance.

**Verdict:** Not useful for V1 component library. Very useful as a future "premium effects" layer.

---

## 7. shadcn/ui — The Distribution Pattern

**Repo:** github.com/shadcn-ui/ui | **Stars:** 100k+ | **License:** MIT

### What It Is

shadcn/ui is NOT a component library — it's a **distribution system for code.** Instead of installing a package, you copy component source files into your project. You own the code completely.

### The Registry System (Most Relevant for Naguib)

shadcn/ui's registry is how components are distributed. This is the pattern Naguib should study most carefully.

#### registry.json — The Catalog

```json
{
  "$schema": "https://ui.shadcn.com/schema/registry.json",
  "name": "acme",
  "homepage": "https://acme.com",
  "items": [
    {
      "name": "login-form",
      "type": "registry:component",
      "title": "Login Form",
      "description": "A login form component.",
      "files": [
        {
          "path": "registry/new-york/auth/login-form.tsx",
          "type": "registry:component"
        }
      ]
    }
  ]
}
```

#### Registry Item — Individual Component Definition

```json
{
  "$schema": "https://ui.shadcn.com/schema/registry-item.json",
  "name": "metric-card",
  "type": "registry:ui",
  "description": "A customizable metric display card with trend indicators.",
  "categories": ["data-visualization", "metrics", "dashboard"],
  "dependencies": ["class-variance-authority", "lucide-react"],
  "registryDependencies": ["card", "badge"],
  "cssVars": {
    "theme": { "--animate-wiggle": "wiggle 1s ease-in-out infinite" }
  },
  "files": [
    {
      "path": "ui/metric-card.tsx",
      "type": "registry:component",
      "content": "..."
    }
  ]
}
```

Key registry concepts:
- **Item types:** `registry:component`, `registry:block`, `registry:page`, `registry:style`, `registry:file`, etc.
- **Registry dependencies:** Inter-component dependencies (e.g., "this component needs `button` and `card`")
- **Package dependencies:** npm packages needed (e.g., `lucide-react`, `cva`)
- **CSS variables:** Per-component CSS variable definitions
- **Namespaced registries:** `@acme/my-component` — third-party registries via `components.json`
- **Build command:** `npx shadcn build` reads `registry.json` and outputs individual item JSON files

#### The Code Transformation Pipeline

When `shadcn add` installs a component, it transforms the code:
- Import paths are rewritten to match your project structure (`@/components/ui/...`)
- CSS variables are injected into your stylesheet
- Dependencies are auto-installed
- TypeScript types are preserved

This is essentially what Naguib's "eject" flow needs — take a component from the library and transform it into user-owned code.

### What Naguib Should Steal

1. **The registry pattern itself.** A JSON manifest of all components with descriptions, dependencies, and categories. This IS our component catalog for AI shopping.
2. **`description` and `categories` on every item.** This is what the AI reads. Put rich semantic descriptions here.
3. **`registryDependencies` for inter-component dependencies.** When the AI picks a hero, it needs to know if that hero depends on a Button component.
4. **`cssVars` per component.** Components can declare what CSS variables they need. The theme system provides them.
5. **The code transformation pipeline for eject.** When a user ejects, we need to rewrite imports and inject the component into their project. shadcn already solves this.
6. **Namespaced registries.** Down the road, third parties could publish Naguib component registries (`@premium-pack/hero-animated`).
7. **Build command pattern.** `npx shadcn build` generates distributable JSON. We could use a similar pattern to build our component catalog.

### What Naguib Should NOT Copy

1. **Copy-paste as the primary mode.** shadcn expects developers to own all code immediately. Naguib's V1 keeps components encapsulated — eject is optional.
2. **No runtime rendering.** shadcn has no `<Render>` component. It's purely a distribution system. We need the Puck-like runtime rendering.
3. **Individual component granularity.** shadcn distributes at the `Button`, `Card`, `Input` level. Naguib distributes at the section level (hero, pricing, FAQ). Different abstraction.

---

## Summary: What Each Project Teaches Us

| Project | Key Lesson for Naguib |
|---|---|
| **Puck** | The `config → data → render` contract works. Proven architecture for component-constrained page building. |
| **GrapesJS** | Block categorization and plugin lifecycle events. Don't use DOM-based component model. |
| **ChaiBuilder** | How to make a builder embeddable as a single React component. `onSave` simplicity. |
| **Webstudio** | Style Sources pattern (tokens + local + component). Design tokens aligned with W3C standard. |
| **Page UI** | Landing page section taxonomy. CSS variable theming with HSL values. `cva` for variants. |
| **Launch UI** | Multi-variant per section type. Data separated from components. Already on Tailwind v4. |
| **Magic UI** | Future "effects layer" potential. MCP server for AI integration. Not V1. |
| **shadcn/ui** | The registry pattern for component distribution. Rich metadata for AI. Code transformation for eject. |

---

## Synthesis: Naguib's Ideal Architecture (Informed by Research)

Based on everything above, here's what the ideal V1 architecture looks like:

**Component contract:** Puck-style `config → data → <Render>`, but with Naguib's `type/variant/content/mode` hierarchy on top.

**Component library structure:** Page UI's section taxonomy + Launch UI's multi-variant organization + shadcn's registry metadata (descriptions, categories, dependencies).

**Theme system:** Page UI / shadcn's CSS variable pattern (HSL values) with Naguib's section-level `mode` switching.

**Schema layer:** Zod schemas (like the Next.js architecture path suggested) that can auto-generate JSON Schema for AI prompts, but also informed by Puck's inline field definitions for simplicity.

**AI configurator:** Uses the shadcn-style registry (with rich descriptions + categories) as its catalog. Structured output + validation + retry loop.

**Eject flow:** shadcn's code transformation pipeline — rewrite imports, inject CSS vars, hand ownership to the user.

**Variant styling:** `cva` (class-variance-authority) + `clsx` + `tailwind-merge`, as used by Page UI and shadcn.

---

*This document is a research artifact. Architecture decisions are not yet finalized.*
