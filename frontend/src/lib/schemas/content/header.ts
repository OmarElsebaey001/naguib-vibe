import { z } from "zod";

const NavItemSchema = z.object({
  label: z.string(),
  href: z.string(),
});

export const HeaderContentSchema = z.object({
  logo: z.object({
    text: z.string(),
    href: z.string().default("/"),
  }),
  navItems: z.array(NavItemSchema).default([]),
  cta: z
    .object({
      label: z.string(),
      href: z.string(),
    })
    .optional(),
});

export type HeaderContent = z.infer<typeof HeaderContentSchema>;
