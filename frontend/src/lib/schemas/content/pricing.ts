import { z } from "zod";

const PricingFeatureSchema = z.object({
  text: z.string(),
  included: z.boolean().default(true),
});

const PricingPlanSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  price: z.string(),
  period: z.string().default("/month"),
  features: z.array(PricingFeatureSchema).default([]),
  cta: z.object({
    label: z.string(),
    href: z.string(),
  }),
  highlighted: z.boolean().default(false),
  badge: z.string().optional(),
});

export const PricingContentSchema = z.object({
  tagline: z.string().optional(),
  headline: z.string(),
  description: z.string().optional(),
  plans: z.array(PricingPlanSchema).min(1),
});

export type PricingContent = z.infer<typeof PricingContentSchema>;
