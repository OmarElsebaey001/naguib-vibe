import { z } from "zod";

const StatItemSchema = z.object({
  value: z.string(),
  label: z.string(),
  description: z.string().optional(),
});

export const StatsContentSchema = z.object({
  tagline: z.string().optional(),
  headline: z.string().optional(),
  stats: z.array(StatItemSchema).min(1),
});

export type StatsContent = z.infer<typeof StatsContentSchema>;
