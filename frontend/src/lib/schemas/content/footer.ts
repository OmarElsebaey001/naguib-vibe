import { z } from "zod";

const FooterLinkSchema = z.object({
  label: z.string(),
  href: z.string(),
});

const FooterColumnSchema = z.object({
  title: z.string(),
  links: z.array(FooterLinkSchema).default([]),
});

const SocialLinkSchema = z.object({
  platform: z.string(),
  href: z.string(),
  icon: z.string().optional(),
});

export const FooterContentSchema = z.object({
  logo: z
    .object({
      text: z.string(),
      href: z.string().default("/"),
    })
    .optional(),
  columns: z.array(FooterColumnSchema).default([]),
  socialLinks: z.array(SocialLinkSchema).default([]),
  copyright: z.string().optional(),
  newsletter: z
    .object({
      title: z.string(),
      description: z.string().optional(),
      placeholder: z.string().default("Enter your email"),
      buttonLabel: z.string().default("Subscribe"),
    })
    .optional(),
});

export type FooterContent = z.infer<typeof FooterContentSchema>;
