# Component Guide

How to build and register section components in Naguib.

## Architecture

Every section component follows the **Universal Component Contract**:

```
{ type, variant, content, mode }
```

- **type**: Section family (`"hero"`, `"features"`, `"pricing"`, etc.)
- **variant**: Layout within the type (`"centered"`, `"cards-grid"`, `"three-tier"`, etc.)
- **content**: Data matching the type's content schema (same shape for all variants of a type)
- **mode**: `"light"` or `"dark"` for visual rhythm

**Key rule**: All variants of a type accept the **same content schema**. Swapping variants never requires content changes.

## File Structure

Each section type lives in `src/components/sections/<type>/`:

```
sections/hero/
  schema.ts              # Re-exports content schema from lib/schemas/content
  centered.tsx           # Variant: component + metadata export
  split-image-right.tsx  # Variant: component + metadata export
  gradient-bold.tsx      # Variant: component + metadata export
  index.ts               # Re-exports all variants
```

## Creating a New Variant

### 1. Create the component file

`sections/<type>/<variant-name>.tsx`:

```tsx
import { type HeroContent } from "./schema";

export const metadata = {
  type: "hero" as const,
  variant: "my-new-variant",
  description: "Short description for the AI catalog.",
  tags: ["relevant", "tags"],
  supportedModes: ["light", "dark"] as const,
};

export function HeroMyNewVariant({
  content,
}: {
  content: HeroContent;
  mode: "light" | "dark";
}) {
  return (
    <section className="bg-background text-foreground py-20">
      {/* Component JSX */}
    </section>
  );
}
```

### 2. Export from index.ts

```ts
export { HeroMyNewVariant, metadata as myNewVariantMetadata } from "./my-new-variant";
```

### 3. Register in `register.ts`

Add the import and entry to `sections/register.ts`:

```ts
import { HeroMyNewVariant, myNewVariantMetadata } from "./hero";

// In the entries array:
{ component: HeroMyNewVariant as RegistryEntry["component"], metadata: myNewVariantMetadata },
```

### 4. Done

The component is now available in the registry and will appear in the AI catalog.

## Conventions

### Styling

- Use **CSS variable tokens** for all colors: `bg-background`, `text-foreground`, `bg-primary`, `text-primary-foreground`, `border-border`, `bg-muted`, `text-muted-foreground`
- Use `var(--font-heading)` for headings via `style={{ fontFamily: "var(--font-heading)" }}`
- Use `var(--radius)` for border radius via `rounded-[var(--radius)]`
- Never hardcode colors — always reference tokens so themes work

### Responsiveness

- Desktop (1280px): full layout
- Tablet (768px): use `md:` prefix
- Mobile (375px): single column, stacked
- Use `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` pattern

### Light/Dark Mode

- Components **don't** need to read the `mode` prop directly
- The `SectionWrapper` in `page-renderer.tsx` adds `.dark` class to the parent `<div>` when `mode === "dark"`
- CSS variables automatically flip under `.dark` via `DarkThemeOverrides`
- Just use token classes (`bg-background`, `text-foreground`) and it works

### Content Handling

- Always handle optional fields with `{field && <element>}` pattern
- Never assume arrays are non-empty; handle gracefully
- Content schema is defined per-type, not per-variant
- All variants of the same type get the same content shape

### Interactive Components

- Add `"use client"` directive only when using `useState`/`useEffect`
- Keep interactivity minimal (accordion toggle, carousel navigation)
- No external state management — each component is self-contained

## Metadata for AI Catalog

The `metadata` export drives the AI configurator:

```ts
{
  type: "hero",           // Section type
  variant: "centered",    // Variant identifier
  description: "...",     // Natural language description for AI
  tags: ["..."],          // Semantic tags for AI selection
  supportedModes: ["light", "dark"],
}
```

The registry's `generateCatalog()` function (in `lib/registry/catalog.ts`) collects all metadata for AI consumption.

## Component Count

| Type         | Variants |
|-------------|----------|
| header      | 4        |
| hero        | 5        |
| logos       | 4        |
| features    | 5        |
| social-proof| 4        |
| stats       | 4        |
| pricing     | 4        |
| faq         | 4        |
| cta         | 4        |
| footer      | 4        |
| **Total**   | **42**   |
