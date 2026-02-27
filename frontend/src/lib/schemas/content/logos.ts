import { z } from "zod";

const LogoItemSchema = z.object({
  name: z.string(),
  src: z.string(),
  href: z.string().optional(),
});

export const LogosContentSchema = z.object({
  title: z.string().optional(),
  logos: z.array(LogoItemSchema).default([]),
});

export type LogosContent = z.infer<typeof LogosContentSchema>;
