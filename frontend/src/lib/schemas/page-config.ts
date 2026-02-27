import { z } from "zod";
import { HeaderContentSchema } from "./content/header";
import { HeroContentSchema } from "./content/hero";
import { LogosContentSchema } from "./content/logos";
import { FeaturesContentSchema } from "./content/features";
import { SocialProofContentSchema } from "./content/social-proof";
import { StatsContentSchema } from "./content/stats";
import { PricingContentSchema } from "./content/pricing";
import { FaqContentSchema } from "./content/faq";
import { CtaContentSchema } from "./content/cta";
import { FooterContentSchema } from "./content/footer";

// --- Section types ---

export const SECTION_TYPES = [
  "header",
  "hero",
  "logos",
  "features",
  "social-proof",
  "stats",
  "pricing",
  "faq",
  "cta",
  "footer",
] as const;

export type SectionType = (typeof SECTION_TYPES)[number];

// Map section types to their content schemas
export const contentSchemaMap: Record<SectionType, z.ZodType> = {
  header: HeaderContentSchema,
  hero: HeroContentSchema,
  logos: LogosContentSchema,
  features: FeaturesContentSchema,
  "social-proof": SocialProofContentSchema,
  stats: StatsContentSchema,
  pricing: PricingContentSchema,
  faq: FaqContentSchema,
  cta: CtaContentSchema,
  footer: FooterContentSchema,
};

// --- Theme ---

export const ThemeSchema = z.object({
  primary: z.string().default("221.2 83.2% 53.3%"),
  primaryForeground: z.string().default("210 40% 98%"),
  secondary: z.string().default("210 40% 96.1%"),
  secondaryForeground: z.string().default("222.2 47.4% 11.2%"),
  background: z.string().default("0 0% 100%"),
  foreground: z.string().default("240 10% 3.9%"),
  muted: z.string().default("210 40% 96.1%"),
  mutedForeground: z.string().default("215.4 16.3% 46.9%"),
  accent: z.string().default("210 40% 96.1%"),
  accentForeground: z.string().default("222.2 47.4% 11.2%"),
  border: z.string().default("214.3 31.8% 91.4%"),
  ring: z.string().default("221.2 83.2% 53.3%"),
  destructive: z.string().default("0 84.2% 60.2%"),
  destructiveForeground: z.string().default("210 40% 98%"),
  radius: z.string().default("0.5rem"),
  fontHeading: z.string().default("Inter"),
  fontBody: z.string().default("Inter"),
});

export type Theme = z.infer<typeof ThemeSchema>;

// --- Dark theme overrides (used for .dark class) ---

export const DarkThemeOverrides: Partial<Theme> = {
  background: "222.2 84% 4.9%",
  foreground: "210 40% 98%",
  secondary: "217.2 32.6% 17.5%",
  secondaryForeground: "210 40% 98%",
  muted: "217.2 32.6% 17.5%",
  mutedForeground: "215 20.2% 65.1%",
  accent: "217.2 32.6% 17.5%",
  accentForeground: "210 40% 98%",
  border: "217.2 32.6% 17.5%",
};

// --- Section ---

export const ModeSchema = z.enum(["light", "dark"]);
export type Mode = z.infer<typeof ModeSchema>;

export const SectionSchema = z.object({
  id: z.string().uuid(),
  type: z.enum(SECTION_TYPES),
  variant: z.string(),
  mode: ModeSchema.default("light"),
  content: z.record(z.string(), z.unknown()),
});

export type Section = z.infer<typeof SectionSchema>;

// --- Page Metadata ---

export const PageMetadataSchema = z.object({
  title: z.string().default(""),
  description: z.string().default(""),
  ogImage: z.string().optional(),
  favicon: z.string().optional(),
});

export type PageMetadata = z.infer<typeof PageMetadataSchema>;

// --- Page Config (top-level) ---

export const PageConfigSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  theme: ThemeSchema.default(() => ThemeSchema.parse({})),
  sections: z.array(SectionSchema).default([]),
  metadata: PageMetadataSchema.default(() => PageMetadataSchema.parse({})),
  version: z.number().int().default(1),
});

export type PageConfig = z.infer<typeof PageConfigSchema>;
