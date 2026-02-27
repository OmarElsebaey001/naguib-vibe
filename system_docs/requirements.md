# Naguib — Requirements

> This is the engineering requirements document. The manifesto explains the "what and why". This document explains the "how, exactly".

---

## Product Definition

Naguib is a web application where users describe a landing page in natural language, and the system assembles a complete, responsive, working page in seconds by selecting from a pre-built component library — not by generating code.

The experience mirrors Lovable.dev: chat on the left, live preview on the right. But the engine underneath is fundamentally different. Lovable generates code from scratch on every prompt. Naguib assembles from a finite, tested catalog. Every output is guaranteed to work.

### Target User

Non-technical founders, indie hackers, marketers, and early-stage teams who need a professional landing page fast — without writing code, without debugging, without hiring a developer.

### V1 Scope

**Landing pages only.** One page, vertical stack of sections, downloadable as a React project. No multi-page apps, no backend, no auth, no database. Just landing pages — done extremely well.

---

## System Architecture

### High-Level Flow

```
User prompt
    ↓
AI Configurator (server-side)
    ↓
Reads component catalog (types, variants, descriptions, content schemas)
    ↓
Outputs page config JSON (validated against Zod schemas)
    ↓
Renderer (client-side) takes config → renders live preview
    ↓
User iterates via chat (swap variants, change content, reorder sections, change theme)
    ↓
When satisfied → download as React project / deploy
```

### Stack

| Layer | Technology | Rationale |
|---|---|---|
| Framework | Next.js 15 (App Router) | SSR for the console, RSC where useful, established ecosystem |
| Language | TypeScript (strict) | Type safety end-to-end, Zod integration |
| Styling | Tailwind CSS v4 | Industry standard, CSS variable theming, Launch UI / shadcn compatibility |
| Component variants | `cva` (class-variance-authority) | Variant management pattern used by shadcn, Page UI, Launch UI |
| Class composition | `clsx` + `tailwind-merge` | Conditional classes without conflicts |
| UI primitives | shadcn/ui | For the console UI (buttons, dialogs, inputs) — NOT for section components |
| Schema validation | Zod | Runtime validation, TypeScript inference, JSON Schema generation for AI |
| AI provider | Anthropic Claude (server-side) | Structured output, strong instruction following |
| Database | Supabase (Postgres + Auth + Storage) | User accounts, saved projects, image uploads |
| Deployment | Vercel | Next.js native, edge functions, preview deployments |

### What We Build vs. What We Use

| We build | We use off-the-shelf |
|---|---|
| Section component library (the product) | shadcn/ui for console UI |
| Component registry + catalog | Zod for schemas |
| AI configurator (prompt + structured output + validation) | Anthropic API |
| Page renderer | Tailwind CSS |
| Theme engine | Supabase for persistence |
| Project export pipeline | Vercel for hosting |
| The console (chat + preview + controls) | Next.js framework |

---

## The Console (Web App)

### Layout

```
┌──────────────────────────────────────────────────────┐
│  Logo    Project Name    [Theme] [Export] [Deploy]    │
├──────────────┬───────────────────────────────────────┤
│              │                                        │
│   Chat       │         Live Preview                   │
│   Panel      │                                        │
│              │   ┌────────────────────────────┐       │
│  [user msg]  │   │                            │       │
│  [ai msg]    │   │    Rendered Page            │       │
│  [user msg]  │   │                            │       │
│              │   │                            │       │
│              │   └────────────────────────────┘       │
│              │                                        │
│              │   [Desktop] [Tablet] [Mobile]          │
│              │                                        │
│  ┌────────┐  │   Section list (sidebar or overlay):   │
│  │ input  │  │   - Reorder (drag)                     │
│  └────────┘  │   - Delete section                     │
│              │   - Toggle mode (light/dark)            │
├──────────────┴───────────────────────────────────────┤
│                    Status bar                         │
└──────────────────────────────────────────────────────┘
```

### Chat Panel (Left)

The primary interface. This is where the user talks to Naguib.

**New project flow:**
1. User lands on empty project
2. Types a description: "I need a landing page for my AI writing tool"
3. AI asks 1-2 clarifying questions (target audience, key features, tone)
4. AI assembles a complete page config — full page appears in preview instantly
5. User iterates: "Make the hero darker", "Add a pricing section", "Change the headline"

**What the user can do via chat:**
- Describe a new page from scratch
- Add / remove / reorder sections
- Swap a section's variant ("try a different hero layout")
- Edit content ("change the headline to...")
- Change theme ("make it more corporate", "use warm colors")
- Toggle section modes ("make the features section dark")
- Ask questions ("what sections do I have?", "what hero variants are available?")

**What the AI does on each message:**
1. Reads the current page config (full state)
2. Reads the component catalog (all types, variants, descriptions, schemas)
3. Determines intent (new page / edit content / swap variant / add section / etc.)
4. Outputs an updated page config JSON (or a partial patch)
5. Config is validated (Zod) before being applied
6. Preview updates instantly

**Chat behavior:**
- AI responds conversationally AND applies changes (not just one or the other)
- When AI makes changes, the chat shows a summary: "I updated the hero headline and switched the features section to a bento grid layout."
- AI can show what it changed (diff-style or plain description)
- Undo: user can say "undo that" or use version history

### Live Preview (Right)

An iframe rendering the current page config in real time.

**Requirements:**
- Renders the actual components (not a mockup or screenshot)
- Updates within 500ms of config change
- Viewport toggle: Desktop (1280px) / Tablet (768px) / Mobile (375px)
- Scrollable — full page preview
- Click-to-select: clicking a section in the preview highlights it and shows quick actions (move up/down, delete, toggle mode, swap variant)
- Zoom control (fit-to-width by default)

**How it renders:**
- The preview is a same-origin iframe (or sandboxed React root)
- It receives the page config JSON + theme as props/context
- It imports the component registry and renders `<PageRenderer config={config} />`
- Theme is injected as CSS variables on the iframe's `:root`
- Section-level `mode` applies `.dark` class on the section wrapper

### Section Management Panel

A lightweight sidebar or overlay (not a full editor). Visible alongside the preview.

**Per section:**
- Drag handle for reorder
- Section type + variant label
- Light/dark mode toggle
- "Swap variant" dropdown (shows available variants for this type with descriptions)
- Delete button
- "Edit content" opens a simple form (auto-generated from the content schema)

**Adding sections:**
- "Add section" button shows categorized list of available types
- Each type shows available variants with descriptions
- Selecting one inserts it with default/placeholder content
- AI can also add sections via chat

### Theme Controls

A panel (popover or sidebar) for visual theme editing.

**Controls:**
- Primary color picker
- Secondary color picker  
- Background color
- Text color
- Font selection (heading + body) — curated list, not arbitrary
- Border radius preset (none / small / medium / large / pill)
- Spacing scale (compact / default / spacious)

**Under the hood:**
- Each control maps to a CSS variable
- Changes apply instantly to the preview
- AI can also change theme via chat: "make it more playful" → AI adjusts colors, radius, fonts

### Theme Presets

Pre-built theme configurations the user (or AI) can pick from:

Examples:
- **Corporate** — Blue primary, Inter font, small radius
- **Startup** — Purple/gradient, modern sans-serif, medium radius
- **Minimal** — Black/white, serif headings, no radius
- **Bold** — Saturated colors, large text, large radius
- **Warm** — Earth tones, rounded, friendly
- **Tech** — Dark background, neon accent, monospace headings

Each preset is a complete set of CSS variable values.

---

## Component System

### The Registry

A single source of truth for all available components.

```typescript
// registry.ts
type ComponentRegistryEntry = {
  type: string;               // "hero", "features", "pricing", etc.
  variant: string;            // "split-image-right", "centered", "cards-grid"
  description: string;        // Human-readable, AI reads this to pick variants
  tags: string[];             // For search/filtering: ["above-fold", "image-heavy"]
  supportedModes: ("light" | "dark")[];
  contentSchema: ZodSchema;   // Zod schema for content validation
  component: ComponentType;   // The actual React component
  thumbnail?: string;         // Preview image for the section picker UI
};
```

The registry is built at startup by scanning the component directory. Each component file exports metadata alongside the component.

### Section Types (V1)

Based on research (Launch UI catalog + manifesto + industry patterns):

| Type | Description | Target Variants |
|---|---|---|
| `header` | Top navigation bar | 4-5 (simple, with-cta, centered, transparent, floating) |
| `hero` | Above-the-fold hero section | 5-6 (centered, split-image-right, split-image-left, video-bg, gradient-bold, with-app-screenshot) |
| `logos` | Trusted-by logo bar | 3-4 (simple-row, marquee, grid, with-title) |
| `features` | Feature highlights | 5-6 (cards-grid, bento-grid, icon-list, alternating, with-large-image, three-column) |
| `social-proof` | Testimonials | 4-5 (cards-grid, carousel, single-quote, twitter-wall, with-stats) |
| `stats` | Key numbers/metrics | 3-4 (inline-row, cards, large-centered, with-description) |
| `pricing` | Pricing plans | 3-4 (two-tier, three-tier, comparison-table, single-highlight) |
| `faq` | FAQ section | 3-4 (accordion, two-column, simple-list, with-categories) |
| `cta` | Call to action | 3-4 (bold-centered, with-image, split, minimal) |
| `footer` | Page footer | 3-4 (columns-with-socials, simple-centered, minimal, mega-footer) |

**Total: ~10 types × ~4 variants = ~40 components for V1**

### Content Schema Contract

Every type defines ONE content schema. All variants of that type accept the same schema shape. This is the rule that makes variant-swapping work without touching content.

```typescript
// Example: Hero content schema
const HeroContentSchema = z.object({
  headline: z.string(),
  subtitle: z.string().optional(),
  cta_primary: z.object({
    label: z.string(),
    href: z.string(),
  }).optional(),
  cta_secondary: z.object({
    label: z.string(),
    href: z.string(),
  }).optional(),
  image: z.string().url().optional(),
  video: z.string().url().optional(),
  badge: z.string().optional(),
});

// Both "centered" and "split-image-right" accept HeroContent.
// "centered" might ignore `image`. "split-image-right" uses it prominently.
// But the SHAPE is always the same.
```

### Component File Convention

```
src/
  components/
    sections/
      hero/
        index.ts              # Re-exports all variants + metadata
        schema.ts             # HeroContentSchema (Zod)
        centered.tsx          # Variant component + metadata export
        split-image-right.tsx
        gradient-bold.tsx
      features/
        index.ts
        schema.ts
        cards-grid.tsx
        bento-grid.tsx
      ...
```

Each variant file:

```typescript
// hero/split-image-right.tsx
import { type HeroContent } from "./schema";

export const metadata = {
  type: "hero",
  variant: "split-image-right",
  description: "Headline and CTA on the left, large product image on the right. Image stacks below text on mobile. Best for SaaS products with a visual demo.",
  tags: ["above-fold", "image-heavy", "saas"],
  supportedModes: ["light", "dark"] as const,
};

export function HeroSplitImageRight({ content, mode }: { content: HeroContent; mode: "light" | "dark" }) {
  return (
    <section className={mode === "dark" ? "dark" : ""}>
      <div className="bg-background text-foreground ...">
        {/* Component implementation */}
      </div>
    </section>
  );
}
```

### Theme System

**Global theme** = CSS variables on `:root`

```css
:root {
  --background: 0 0% 100%;
  --foreground: 240 10% 3.9%;
  --primary: 221.2 83.2% 53.3%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96.1%;
  --secondary-foreground: 222.2 47.4% 11.2%;
  --muted: 210 40% 96.1%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --accent: 210 40% 96.1%;
  --accent-foreground: 222.2 47.4% 11.2%;
  --border: 214.3 31.8% 91.4%;
  --ring: 221.2 83.2% 53.3%;
  --radius: 0.5rem;
  --font-heading: "Inter", sans-serif;
  --font-body: "Inter", sans-serif;
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --primary: 217.2 91.2% 59.8%;
  /* ... dark overrides */
}
```

- Components reference `hsl(var(--primary))`, `hsl(var(--background))`, etc.
- HSL format (shadcn-compatible) — allows opacity modifiers: `hsl(var(--primary) / 0.5)`
- Section-level `mode` = wrapper `<div>` gets `.dark` class → CSS variables flip for that section's subtree
- Theme changes = update `:root` variables → everything re-paints instantly, zero re-render

---

## AI Configurator

### How It Works

The AI configurator is a server-side process. It receives the user's message + current page state, and outputs an updated page config.

```
Inputs:
  - User message (string)
  - Current page config (JSON) — or null for first message
  - Component catalog (auto-generated from registry)
  - Conversation history

Output:
  - Updated page config (JSON, validated against PageConfigSchema)
  - Chat response (string — what to show the user)
```

### The Catalog (What AI Reads)

Auto-generated from the component registry at build time:

```json
{
  "types": [
    {
      "type": "hero",
      "description": "The main above-the-fold section. First thing visitors see.",
      "contentSchema": { /* JSON Schema from Zod */ },
      "variants": [
        {
          "variant": "centered",
          "description": "Large centered headline with subtitle and CTA buttons. Clean and minimal. No image.",
          "tags": ["minimal", "text-focused"]
        },
        {
          "variant": "split-image-right",
          "description": "Headline and CTA on the left, large product image on the right. Image stacks below text on mobile. Best for SaaS with a visual demo.",
          "tags": ["image-heavy", "saas"]
        }
      ]
    }
  ],
  "themePresets": [ ... ],
  "availableFonts": [ ... ]
}
```

### AI Call Flow

```
1. Build system prompt:
   - Role: "You are a landing page configurator..."
   - Rules: Only use types/variants from the catalog. Follow content schemas exactly.
   - The full component catalog (JSON)
   - Current page config (if exists)

2. User message → append to conversation

3. Call Anthropic API with structured output:
   - Response schema: { chatResponse: string, pageConfig: PageConfig }
   - Or for edits: { chatResponse: string, operations: Operation[] }

4. Validate output against Zod schemas

5. If validation fails → retry (max 2 retries) with error context

6. Apply validated config → update preview
```

### Operation Types (for edits)

Instead of sending the full config every time, the AI can send operations:

```typescript
type Operation =
  | { op: "set_theme"; theme: ThemeConfig }
  | { op: "add_section"; index: number; section: SectionConfig }
  | { op: "remove_section"; index: number }
  | { op: "move_section"; from: number; to: number }
  | { op: "update_content"; index: number; content: Record<string, any> }
  | { op: "swap_variant"; index: number; newVariant: string }
  | { op: "set_mode"; index: number; mode: "light" | "dark" }
  | { op: "replace_all"; config: PageConfig };  // Full replacement for new pages
```

This keeps token usage low and makes changes precise.

---

## Page Config Schema

The single JSON object that fully describes a page:

```typescript
const PageConfigSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  theme: ThemeSchema,
  sections: z.array(SectionSchema),
  metadata: z.object({
    title: z.string(),
    description: z.string(),
    ogImage: z.string().url().optional(),
    favicon: z.string().url().optional(),
  }),
  version: z.number(),  // For future migrations
});

const ThemeSchema = z.object({
  preset: z.string().optional(),        // "corporate", "startup", etc.
  primary: z.string(),                   // HSL: "221.2 83.2% 53.3%"
  secondary: z.string(),
  background: z.string(),
  foreground: z.string(),
  muted: z.string(),
  mutedForeground: z.string(),
  accent: z.string(),
  accentForeground: z.string(),
  border: z.string(),
  ring: z.string(),
  radius: z.string(),                    // "0.5rem"
  fontHeading: z.string(),               // "Inter"
  fontBody: z.string(),                  // "Inter"
});

const SectionSchema = z.object({
  id: z.string().uuid(),                 // Stable ID for reordering/targeting
  type: z.string(),                      // "hero", "features", etc.
  variant: z.string(),                   // "split-image-right", "cards-grid"
  mode: z.enum(["light", "dark"]),
  content: z.record(z.any()),            // Validated per-type at application time
});
```

---

## Project Export

When the user clicks "Download" or "Export", they get a complete, standalone React project.

### What's in the export:

```
my-landing-page/
├── package.json              # Dependencies: react, tailwindcss, etc.
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts            # Or vite.config.ts (TBD)
├── public/
│   └── images/               # Any uploaded images
├── src/
│   ├── app/
│   │   ├── layout.tsx        # Theme CSS variables injected here
│   │   ├── page.tsx          # Imports and renders all sections in order
│   │   └── globals.css       # Theme variables + Tailwind imports
│   └── components/
│       └── sections/
│           ├── hero-split-image-right.tsx    # Only the variants used
│           ├── features-cards-grid.tsx
│           ├── pricing-three-tier.tsx
│           └── ...
├── README.md                 # Explains the project structure
└── .gitignore
```

### Export rules:

- **Only include components that are used.** Don't ship the entire library.
- **Inline the content.** Each component file has its content as a const, not imported from JSON.
- **Zero runtime dependencies on Naguib.** The export is a pure Next.js (or Vite) project.
- **Each component is self-contained.** A user can open any single file and understand it.
- **Theme is in `globals.css`** as CSS variables — user can edit them directly.
- **Components are ~50-100 lines each.** Small enough for an LLM to modify confidently.

### Export format decision (TBD):

Option A: **Next.js project** (App Router) — SEO-friendly, static export possible
Option B: **Vite + React project** — Simpler, faster builds, no framework overhead

Leaning toward **Vite for V1** — lighter export, no SSR complexity, user just runs `npm run build` and gets static HTML. Can add Next.js export as option later.

---

## User Accounts & Persistence

### What's stored per user:

- **Projects:** Each project = one page config + metadata + conversation history
- **Images:** Uploaded images stored in Supabase Storage
- **Preferences:** Last used theme, etc.

### What's stored per project:

```typescript
{
  id: string;
  userId: string;
  name: string;
  config: PageConfig;          // The current page config JSON
  conversationHistory: Message[];
  createdAt: Date;
  updatedAt: Date;
  thumbnail: string;           // Auto-generated screenshot for project list
  version: number;
  history: PageConfig[];       // Version history for undo (last N states)
}
```

### Auth:

- Supabase Auth (email + OAuth: Google, GitHub)
- Free tier: 1 project, limited messages/day
- Paid tier: Unlimited projects, more messages, custom domain deployment

---

## Non-Functional Requirements

### Performance
- First page assembly: < 5 seconds from first prompt to rendered preview
- Subsequent edits: < 2 seconds from message to updated preview
- Preview render: < 500ms from config change to visual update
- Export generation: < 10 seconds

### Quality
- Every component is responsive across Desktop (1280px+), Tablet (768px), Mobile (375px)
- Every component works in both light and dark mode
- Every component passes WCAG 2.0 AA accessibility
- Lighthouse score > 90 for exported pages

### Reliability
- AI output validation: 100% of configs validated before rendering
- Retry on validation failure: up to 2 retries with error context
- Graceful fallback: if AI returns invalid config, show error in chat, don't break preview

### Security
- No user code execution in the console (Phase 1 — no eject yet in V1)
- All AI calls server-side (API keys never exposed)
- Rate limiting on AI calls per user
- Image uploads: size limits, type validation

---

## What V1 Does NOT Include

- **Phase 2 (Eject + LLM customization)** — V2 feature
- **Multi-page sites** — V2
- **Backend / API / database** — Not in scope
- **Custom components** — Users can't upload their own components
- **Collaboration** — Single user per project
- **Version control / branching** — Simple undo only
- **Animation / interaction** — Static pages only for V1
- **CMS integration** — Content is in the config
- **A/B testing** — Not in scope
- **Analytics** — Not in scope
- **Visual drag-drop editing** — Chat + section panel only. No Figma-like visual editor.

---

## Development Phases

### Phase 0: Foundation (Week 1-2)
- Set up Next.js project with TypeScript, Tailwind v4, shadcn/ui
- Define all Zod schemas (theme, sections, page config)
- Build component registry system
- Build 2-3 components per type (minimum viable catalog ~20 components)
- Build PageRenderer (config → rendered page)
- Build theme engine (CSS variable injection + mode switching)

### Phase 1: AI + Console (Week 3-4)
- Build AI configurator (system prompt, catalog injection, structured output, validation)
- Build console layout (chat panel + preview iframe + section panel)
- Chat ↔ AI ↔ config ↔ preview loop working end-to-end
- Theme controls UI
- Viewport toggle (desktop/tablet/mobile)

### Phase 2: Polish + Export (Week 5-6)
- Project export pipeline (config → standalone React project)
- User auth + project persistence (Supabase)
- Project dashboard (list, create, delete projects)
- Remaining components (fill out to ~40 total)
- Error handling, loading states, edge cases
- Mobile responsiveness of the console itself

### Phase 3: Launch Prep (Week 7-8)
- Landing page for Naguib itself (built with Naguib, obviously)
- Pricing + billing (Stripe)
- Rate limiting + usage tracking
- Bug fixes, performance tuning
- Beta launch

---

*This document is the engineering source of truth. The manifesto explains the vision. This explains the build.*
