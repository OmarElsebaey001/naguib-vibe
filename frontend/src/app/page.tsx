"use client";

import { useState } from "react";
import { ensureRegistered } from "@/components/sections/register";
import { PageRenderer } from "@/lib/renderer/page-renderer";
import { type PageConfig, type Section } from "@/lib/schemas/page-config";
import { themePresets } from "@/lib/theme/presets";
import { getVariantsForType } from "@/lib/registry";

// Register all components at module load time (before first render)
ensureRegistered();

// Available variants per section type (used for variant switcher UI)
const VARIANT_SWITCHABLE_TYPES = ["header", "hero", "features", "social-proof", "stats", "pricing", "faq", "cta", "footer", "logos"];

// Hand-written test page config for smoke testing
const testConfig: PageConfig = {
  id: "00000000-0000-0000-0000-000000000001",
  name: "Acme AI Writing Assistant",
  theme: themePresets.corporate,
  sections: [
    {
      id: "00000000-0000-0000-0000-000000000010",
      type: "header",
      variant: "simple-with-cta",
      mode: "light",
      content: {
        logo: { text: "Acme AI", href: "/" },
        navItems: [
          { label: "Features", href: "#features" },
          { label: "Pricing", href: "#pricing" },
          { label: "FAQ", href: "#faq" },
        ],
        cta: { label: "Get Started", href: "#signup" },
      },
    },
    {
      id: "00000000-0000-0000-0000-000000000011",
      type: "hero",
      variant: "centered",
      mode: "light",
      content: {
        badge: "Now in public beta",
        headline: "Write 10x faster with AI that understands your voice",
        subheadline:
          "Acme AI learns your writing style and helps you create compelling content in seconds. From blog posts to marketing copy, we've got you covered.",
        primaryCta: { label: "Start Writing Free", href: "#signup" },
        secondaryCta: { label: "See How It Works", href: "#demo" },
        image: { src: "https://placehold.co/1200x600/e2e8f0/64748b?text=App+Screenshot", alt: "Acme AI app screenshot" },
      },
    },
    {
      id: "00000000-0000-0000-0000-000000000012",
      type: "logos",
      variant: "simple-row",
      mode: "light",
      content: {
        title: "Trusted by 10,000+ writers worldwide",
        logos: [
          { name: "TechCrunch", src: "https://placehold.co/120x40/e2e8f0/64748b?text=TechCrunch" },
          { name: "Forbes", src: "https://placehold.co/120x40/e2e8f0/64748b?text=Forbes" },
          { name: "Wired", src: "https://placehold.co/120x40/e2e8f0/64748b?text=Wired" },
          { name: "The Verge", src: "https://placehold.co/120x40/e2e8f0/64748b?text=The+Verge" },
          { name: "Product Hunt", src: "https://placehold.co/120x40/e2e8f0/64748b?text=Product+Hunt" },
        ],
      },
    },
    {
      id: "00000000-0000-0000-0000-000000000013",
      type: "features",
      variant: "cards-grid",
      mode: "light",
      content: {
        tagline: "Features",
        headline: "Everything you need to write better",
        description: "Our AI-powered tools help you create, edit, and optimize content faster than ever.",
        features: [
          { icon: "✍️", title: "Smart Drafting", description: "Start with a prompt and get a complete first draft in seconds. Our AI understands context and tone.", image: { src: "https://placehold.co/600x400/e2e8f0/64748b?text=Smart+Drafting", alt: "Smart Drafting" } },
          { icon: "🎯", title: "Style Matching", description: "Upload your previous writing and our AI learns your unique voice, ensuring consistent brand messaging.", image: { src: "https://placehold.co/600x400/e2e8f0/64748b?text=Style+Matching", alt: "Style Matching" } },
          { icon: "📊", title: "SEO Optimization", description: "Built-in SEO analysis scores your content and suggests improvements for better search rankings.", image: { src: "https://placehold.co/600x400/e2e8f0/64748b?text=SEO+Optimization", alt: "SEO Optimization" } },
          { icon: "🔄", title: "One-Click Repurpose", description: "Turn a blog post into tweets, newsletters, or LinkedIn posts with a single click." },
          { icon: "🌍", title: "40+ Languages", description: "Write and translate content in over 40 languages while maintaining natural tone and cultural nuance." },
          { icon: "🔒", title: "Enterprise Security", description: "SOC 2 compliant with end-to-end encryption. Your content never trains our models." },
        ],
      },
    },
    {
      id: "00000000-0000-0000-0000-000000000014",
      type: "stats",
      variant: "inline-row",
      mode: "dark",
      content: {
        tagline: "By the numbers",
        headline: "Trusted by thousands",
        stats: [
          { value: "10K+", label: "Active writers", description: "Professionals using Acme AI daily" },
          { value: "2M+", label: "Articles created", description: "And counting every day" },
          { value: "98%", label: "Customer satisfaction", description: "Based on post-trial surveys" },
          { value: "50%", label: "Time saved on average", description: "Compared to writing from scratch" },
        ],
      },
    },
    {
      id: "00000000-0000-0000-0000-000000000015",
      type: "social-proof",
      variant: "cards-grid",
      mode: "light",
      content: {
        tagline: "Testimonials",
        headline: "Loved by writers everywhere",
        testimonials: [
          { quote: "Acme AI cut my content creation time in half. The style matching is scarily accurate.", author: "Sarah Chen", role: "Content Director", company: "Notion", rating: 5 },
          { quote: "Finally an AI tool that doesn't sound like a robot. My team uses it for everything.", author: "Marcus Rivera", role: "Head of Marketing", company: "Stripe", rating: 5 },
          { quote: "The SEO optimization alone pays for itself. Our organic traffic is up 140% since we started.", author: "Emily Zhang", role: "Growth Lead", company: "Vercel", rating: 4 },
        ],
      },
    },
    {
      id: "00000000-0000-0000-0000-000000000016",
      type: "pricing",
      variant: "three-tier",
      mode: "light",
      content: {
        tagline: "Pricing",
        headline: "Simple, transparent pricing",
        description: "Start free and scale as you grow. No hidden fees.",
        plans: [
          {
            name: "Starter",
            description: "Perfect for individuals",
            price: "$0",
            period: "/month",
            features: [
              { text: "5,000 words/month", included: true },
              { text: "3 writing styles", included: true },
              { text: "Basic SEO tools", included: true },
              { text: "Team collaboration", included: false },
              { text: "API access", included: false },
            ],
            cta: { label: "Get Started", href: "#signup" },
            highlighted: false,
          },
          {
            name: "Pro",
            description: "For professional writers",
            price: "$29",
            period: "/month",
            features: [
              { text: "Unlimited words", included: true },
              { text: "Unlimited styles", included: true },
              { text: "Advanced SEO suite", included: true },
              { text: "Team collaboration", included: true },
              { text: "API access", included: false },
            ],
            cta: { label: "Start Pro Trial", href: "#signup-pro" },
            highlighted: true,
            badge: "Most Popular",
          },
          {
            name: "Enterprise",
            description: "For teams at scale",
            price: "$99",
            period: "/month",
            features: [
              { text: "Everything in Pro", included: true },
              { text: "Custom AI training", included: true },
              { text: "Full API access", included: true },
              { text: "SSO & admin controls", included: true },
              { text: "Dedicated support", included: true },
            ],
            cta: { label: "Contact Sales", href: "#contact" },
            highlighted: false,
          },
        ],
      },
    },
    {
      id: "00000000-0000-0000-0000-000000000017",
      type: "faq",
      variant: "accordion",
      mode: "light",
      content: {
        headline: "Frequently asked questions",
        description: "Can't find what you're looking for? Reach out to our support team.",
        items: [
          { question: "How does the AI learn my writing style?", answer: "Upload 3-5 samples of your writing and our AI analyzes your tone, vocabulary, sentence structure, and formatting preferences. It continuously improves as you use the tool.", category: "Product" },
          { question: "Is my content private?", answer: "Absolutely. We're SOC 2 compliant and your content is encrypted end-to-end. We never use customer content to train our models.", category: "Security" },
          { question: "Can I cancel anytime?", answer: "Yes, you can cancel your subscription at any time with no penalties. Your content remains accessible for 30 days after cancellation.", category: "Billing" },
          { question: "Do you support languages other than English?", answer: "Yes! We support over 40 languages including Spanish, French, German, Chinese, Japanese, and many more. Our AI maintains natural tone across all supported languages.", category: "Product" },
        ],
      },
    },
    {
      id: "00000000-0000-0000-0000-000000000018",
      type: "cta",
      variant: "bold-centered",
      mode: "dark",
      content: {
        headline: "Ready to write 10x faster?",
        description: "Join 10,000+ writers who are already creating better content with Acme AI. Start free today.",
        primaryCta: { label: "Start Writing Free", href: "#signup" },
        secondaryCta: { label: "Book a Demo", href: "#demo" },
        image: { src: "https://placehold.co/600x400/e2e8f0/64748b?text=CTA+Image", alt: "Get started" },
      },
    },
    {
      id: "00000000-0000-0000-0000-000000000019",
      type: "footer",
      variant: "columns-with-socials",
      mode: "light",
      content: {
        logo: { text: "Acme AI", href: "/" },
        columns: [
          {
            title: "Product",
            links: [
              { label: "Features", href: "#features" },
              { label: "Pricing", href: "#pricing" },
              { label: "Changelog", href: "#changelog" },
            ],
          },
          {
            title: "Company",
            links: [
              { label: "About", href: "#about" },
              { label: "Blog", href: "#blog" },
              { label: "Careers", href: "#careers" },
            ],
          },
          {
            title: "Legal",
            links: [
              { label: "Privacy", href: "#privacy" },
              { label: "Terms", href: "#terms" },
            ],
          },
        ],
        socialLinks: [
          { platform: "Twitter", href: "#twitter" },
          { platform: "GitHub", href: "#github" },
          { platform: "LinkedIn", href: "#linkedin" },
        ],
        copyright: "© 2026 Acme AI. All rights reserved.",
        newsletter: {
          title: "Stay updated",
          description: "Get the latest news and product updates.",
          placeholder: "Enter your email",
          buttonLabel: "Subscribe",
        },
      },
    },
  ],
  metadata: { title: "Acme AI - Write 10x Faster", description: "AI-powered writing assistant" },
  version: 1,
};

const presetNames = Object.keys(themePresets);

export default function SmokeTestPage() {
  const [currentPreset, setCurrentPreset] = useState("corporate");
  const [config, setConfig] = useState<PageConfig>(testConfig);

  function switchTheme(name: string) {
    setCurrentPreset(name);
    setConfig((prev) => ({
      ...prev,
      theme: themePresets[name],
    }));
  }

  function switchVariant(sectionIndex: number, variant: string) {
    setConfig((prev) => {
      const sections = [...prev.sections];
      sections[sectionIndex] = { ...sections[sectionIndex], variant };
      return { ...prev, sections };
    });
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="sticky top-0 z-50 bg-white border-b shadow-sm px-4 py-2">
        {/* Theme row */}
        <div className="flex items-center gap-4 mb-2">
          <span className="text-sm font-medium text-gray-700">Theme:</span>
          <div className="flex gap-2 flex-wrap">
            {presetNames.map((name) => (
              <button
                key={name}
                onClick={() => switchTheme(name)}
                className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                  currentPreset === name
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-600 border-gray-300 hover:border-gray-400"
                }`}
              >
                {name}
              </button>
            ))}
          </div>
        </div>
        {/* Variant switcher row */}
        <div className="flex items-start gap-4 overflow-x-auto pb-1">
          <span className="text-sm font-medium text-gray-700 flex-shrink-0 pt-1">Variants:</span>
          <div className="flex gap-4 flex-wrap">
            {config.sections.map((section, idx) => {
              if (!VARIANT_SWITCHABLE_TYPES.includes(section.type)) return null;
              const variants = getVariantsForType(section.type);
              if (variants.length <= 1) return null;
              return (
                <div key={section.id} className="flex items-center gap-1">
                  <span className="text-xs text-gray-500 font-medium">{section.type}:</span>
                  <select
                    value={section.variant}
                    onChange={(e) => switchVariant(idx, e.target.value)}
                    className="text-xs border border-gray-300 rounded px-1 py-0.5"
                  >
                    {variants.map((v) => (
                      <option key={v.metadata.variant} value={v.metadata.variant}>
                        {v.metadata.variant}
                      </option>
                    ))}
                  </select>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Rendered page */}
      <PageRenderer config={config} />
    </div>
  );
}
