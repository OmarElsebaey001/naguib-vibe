import { z } from "zod";

export const CtaContentSchema = z.object({
  headline: z.string(),
  description: z.string().optional(),
  primaryCta: z.object({
    label: z.string(),
    href: z.string(),
  }),
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
});

export type CtaContent = z.infer<typeof CtaContentSchema>;
