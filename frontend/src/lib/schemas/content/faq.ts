import { z } from "zod";

const FaqItemSchema = z.object({
  question: z.string(),
  answer: z.string(),
  category: z.string().optional(),
});

export const FaqContentSchema = z.object({
  tagline: z.string().optional(),
  headline: z.string(),
  description: z.string().optional(),
  items: z.array(FaqItemSchema).min(1),
});

export type FaqContent = z.infer<typeof FaqContentSchema>;
