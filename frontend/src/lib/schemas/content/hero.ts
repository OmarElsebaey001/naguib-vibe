import { z } from "zod";

export const HeroContentSchema = z.object({
  headline: z.string(),
  subheadline: z.string().optional(),
  primaryCta: z
    .object({
      label: z.string(),
      href: z.string(),
    })
    .optional(),
  secondaryCta: z
    .object({
      label: z.string(),
      href: z.string(),
    })
    .optional(),
  image: z
    .object({
      src: z.string(),
      alt: z.string(),
    })
    .optional(),
  badge: z.string().optional(),
});

export type HeroContent = z.infer<typeof HeroContentSchema>;
