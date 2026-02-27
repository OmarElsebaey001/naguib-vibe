import { z } from "zod";

const TestimonialSchema = z.object({
  quote: z.string(),
  author: z.string(),
  role: z.string().optional(),
  company: z.string().optional(),
  avatar: z.string().optional(),
  rating: z.number().min(1).max(5).optional(),
});

export const SocialProofContentSchema = z.object({
  tagline: z.string().optional(),
  headline: z.string().optional(),
  testimonials: z.array(TestimonialSchema).min(1),
});

export type SocialProofContent = z.infer<typeof SocialProofContentSchema>;
