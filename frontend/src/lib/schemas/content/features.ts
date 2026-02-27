import { z } from "zod";

const FeatureItemSchema = z.object({
  icon: z.string().optional(),
  title: z.string(),
  description: z.string(),
  image: z
    .object({
      src: z.string(),
      alt: z.string(),
    })
    .optional(),
});

export const FeaturesContentSchema = z.object({
  tagline: z.string().optional(),
  headline: z.string(),
  description: z.string().optional(),
  features: z.array(FeatureItemSchema).min(1),
});

export type FeaturesContent = z.infer<typeof FeaturesContentSchema>;
