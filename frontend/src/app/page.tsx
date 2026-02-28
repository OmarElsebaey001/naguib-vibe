"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth/context";
import {
  Sparkles,
  Zap,
  Download,
  Palette,
  MessageSquare,
  Shield,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export default function LandingPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.replace("/dashboard");
    }
  }, [user, isLoading, router]);

  if (isLoading || user) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Sparkles className="w-6 h-6 text-violet-400 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <Nav />
      <Hero />
      <LogoBar />
      <Features />
      <HowItWorks />
      <Pricing />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  );
}

/* ───────── NAV ───────── */
function Nav() {
  return (
    <nav className="sticky top-0 z-50 border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-violet-400" />
          <span className="text-sm font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
            naguib
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-6 text-sm text-zinc-400">
          <a href="#features" className="hover:text-zinc-200 transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-zinc-200 transition-colors">How It Works</a>
          <a href="#pricing" className="hover:text-zinc-200 transition-colors">Pricing</a>
          <a href="#faq" className="hover:text-zinc-200 transition-colors">FAQ</a>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors">
            Sign in
          </Link>
          <Link
            href="/register"
            className="text-sm px-4 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-medium transition-colors"
          >
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
}

/* ───────── HERO ───────── */
function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-violet-950/20 via-transparent to-transparent" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-violet-600/10 rounded-full blur-[128px]" />

      <div className="relative max-w-4xl mx-auto px-4 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-500/20 bg-violet-500/10 text-violet-300 text-xs font-medium mb-8">
          <Zap className="w-3 h-3" />
          AI-powered landing page builder
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-6">
          Describe your page.
          <br />
          <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-violet-400 bg-clip-text text-transparent">
            Watch it build itself.
          </span>
        </h1>
        <p className="text-lg text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Naguib assembles beautiful, responsive landing pages from a curated component library.
          No code generation. No broken layouts. Every page works perfectly — guaranteed.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold transition-colors"
          >
            Start Building Free
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="#how-it-works"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-zinc-700 text-zinc-300 hover:border-zinc-600 hover:text-white font-medium transition-colors"
          >
            See How It Works
          </a>
        </div>

        {/* Mock screenshot */}
        <div className="mt-16 mx-auto max-w-3xl rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden shadow-2xl shadow-violet-500/5">
          <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-zinc-800 bg-zinc-900/80">
            <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
            <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
            <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
            <div className="flex-1 text-center text-[10px] text-zinc-600">naguib console</div>
          </div>
          <div className="flex h-[320px]">
            {/* Chat side */}
            <div className="w-1/3 border-r border-zinc-800 p-4 flex flex-col gap-3">
              <div className="rounded-lg bg-zinc-800 p-2.5 text-xs text-zinc-300">
                Build me a SaaS landing page for an AI writing tool called Acme
              </div>
              <div className="rounded-lg bg-violet-600/20 border border-violet-500/20 p-2.5 text-xs text-violet-200">
                I&apos;ll create a complete landing page with a hero section, features, pricing...
              </div>
              <div className="flex items-center gap-2 text-[10px] text-zinc-500 mt-auto">
                <Zap className="w-3 h-3 text-violet-400" />
                Assembling sections...
              </div>
            </div>
            {/* Preview side */}
            <div className="flex-1 bg-zinc-950 p-4 flex flex-col items-center justify-center gap-3">
              <div className="w-full h-8 rounded bg-zinc-800/50" />
              <div className="w-3/4 h-12 rounded bg-gradient-to-r from-violet-600/20 to-fuchsia-600/20 border border-violet-500/10" />
              <div className="w-2/3 h-4 rounded bg-zinc-800/50" />
              <div className="flex gap-2 mt-2">
                <div className="w-20 h-6 rounded bg-violet-600/30" />
                <div className="w-20 h-6 rounded bg-zinc-800/50" />
              </div>
              <div className="grid grid-cols-3 gap-2 w-full mt-4">
                <div className="h-16 rounded bg-zinc-800/30" />
                <div className="h-16 rounded bg-zinc-800/30" />
                <div className="h-16 rounded bg-zinc-800/30" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────── LOGO BAR ───────── */
function LogoBar() {
  return (
    <section className="border-y border-zinc-800/50 py-8">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <p className="text-xs text-zinc-500 uppercase tracking-wider mb-6">Built with proven technologies</p>
        <div className="flex items-center justify-center gap-8 sm:gap-12 text-zinc-600 text-sm font-medium flex-wrap">
          <span>React</span>
          <span>Tailwind CSS</span>
          <span>TypeScript</span>
          <span>Vite</span>
          <span>Responsive</span>
        </div>
      </div>
    </section>
  );
}

/* ───────── FEATURES ───────── */
const features = [
  {
    icon: MessageSquare,
    title: "Chat to build",
    description: "Describe what you want in plain language. The AI selects and assembles the right components.",
  },
  {
    icon: Palette,
    title: "Theme in one click",
    description: "Switch between polished theme presets — corporate, startup, minimal, bold — instantly.",
  },
  {
    icon: Zap,
    title: "40+ hand-built components",
    description: "Every section is hand-crafted, responsive, and tested. Heroes, features, pricing, FAQs, and more.",
  },
  {
    icon: Download,
    title: "Export & own your code",
    description: "Download a clean Vite + React project. No lock-in, no runtime dependency on Naguib.",
  },
  {
    icon: Shield,
    title: "Always works",
    description: "No code generation means no broken layouts. Every combination is tested and guaranteed to render.",
  },
  {
    icon: Sparkles,
    title: "Iterate with AI",
    description: "Swap sections, edit copy, change themes — all through the chat. Your page evolves with you.",
  },
];

function Features() {
  return (
    <section id="features" className="py-24">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <p className="text-xs text-violet-400 uppercase tracking-wider font-medium mb-3">Features</p>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Everything you need to ship fast</h2>
          <p className="text-zinc-400 max-w-xl mx-auto">
            From idea to published landing page in minutes, not days.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 hover:border-zinc-700 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-violet-600/10 flex items-center justify-center mb-4">
                <f.icon className="w-5 h-5 text-violet-400" />
              </div>
              <h3 className="text-sm font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────── HOW IT WORKS ───────── */
const steps = [
  { step: "1", title: "Describe your page", description: "Tell the AI what you're building — a SaaS landing page, portfolio, agency site — in plain language." },
  { step: "2", title: "AI assembles it", description: "Naguib picks from 40+ tested components and arranges them into a complete, responsive page." },
  { step: "3", title: "Iterate & refine", description: "Swap sections, edit copy, change themes — all through the chat. See changes in the live preview." },
  { step: "4", title: "Export & ship", description: "Download a clean React + Tailwind project. Deploy to Vercel, Netlify, or anywhere." },
];

function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 border-t border-zinc-800/50">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-16">
          <p className="text-xs text-violet-400 uppercase tracking-wider font-medium mb-3">How It Works</p>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Four steps to a finished page</h2>
        </div>
        <div className="space-y-8">
          {steps.map((s) => (
            <div key={s.step} className="flex gap-6 items-start">
              <div className="w-10 h-10 rounded-full bg-violet-600 flex items-center justify-center flex-shrink-0 text-sm font-bold">
                {s.step}
              </div>
              <div>
                <h3 className="text-base font-semibold mb-1">{s.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{s.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────── PRICING ───────── */
const plans = [
  {
    name: "Free",
    price: "$0",
    description: "Get started and explore",
    features: ["1 project", "20 AI messages/day", "All components", "Export to code"],
    cta: "Start Free",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$19",
    period: "/month",
    description: "For professionals shipping fast",
    features: ["Unlimited projects", "200 AI messages/day", "All components", "Export to code", "Priority support"],
    cta: "Upgrade to Pro",
    highlighted: true,
    badge: "Most Popular",
  },
];

function Pricing() {
  return (
    <section id="pricing" className="py-24 border-t border-zinc-800/50">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-16">
          <p className="text-xs text-violet-400 uppercase tracking-wider font-medium mb-3">Pricing</p>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Simple, transparent pricing</h2>
          <p className="text-zinc-400">Start free. Upgrade when you need more.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-xl border p-6 ${
                plan.highlighted
                  ? "border-violet-500/50 bg-violet-600/5 ring-1 ring-violet-500/20"
                  : "border-zinc-800 bg-zinc-900/30"
              }`}
            >
              {plan.badge && (
                <span className="inline-block text-[10px] uppercase tracking-wider font-medium text-violet-300 bg-violet-600/20 px-2 py-0.5 rounded-full mb-4">
                  {plan.badge}
                </span>
              )}
              <h3 className="text-lg font-semibold">{plan.name}</h3>
              <p className="text-sm text-zinc-400 mt-1 mb-4">{plan.description}</p>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-3xl font-bold">{plan.price}</span>
                {plan.period && <span className="text-sm text-zinc-500">{plan.period}</span>}
              </div>
              <ul className="space-y-2 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-zinc-300">
                    <Check className="w-4 h-4 text-violet-400 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className={`block text-center py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  plan.highlighted
                    ? "bg-violet-600 hover:bg-violet-500 text-white"
                    : "bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────── FAQ ───────── */
const faqs = [
  { q: "How is this different from Lovable or v0?", a: "Those tools generate code from scratch — which can break or produce inconsistent results. Naguib assembles from a curated, tested component library. Every combination is guaranteed to work." },
  { q: "Do I own the exported code?", a: "Yes, 100%. The export is a clean React + Tailwind project with no runtime dependency on Naguib. You can edit it, deploy it, and use it however you want." },
  { q: "What sections are available?", a: "We have 40+ components across 10 section types: header, hero, features, stats, social proof, pricing, FAQ, CTA, logos, and footer — each with multiple layout variants." },
  { q: "Can I use my own branding?", a: "Yes. The theme system uses CSS variables — change colors, fonts, and border radius through theme presets or by editing the exported code." },
  { q: "Is there a free plan?", a: "Yes! The free plan includes 1 project, 20 AI messages per day, and full export capability. No credit card required." },
];

function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" className="py-24 border-t border-zinc-800/50">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-12">
          <p className="text-xs text-violet-400 uppercase tracking-wider font-medium mb-3">FAQ</p>
          <h2 className="text-3xl font-bold">Frequently asked questions</h2>
        </div>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="rounded-xl border border-zinc-800 bg-zinc-900/30 overflow-hidden">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left"
              >
                <span className="text-sm font-medium pr-4">{faq.q}</span>
                {open === i ? (
                  <ChevronUp className="w-4 h-4 text-zinc-500 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-zinc-500 flex-shrink-0" />
                )}
              </button>
              {open === i && (
                <div className="px-5 pb-4 text-sm text-zinc-400 leading-relaxed">{faq.a}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────── CTA ───────── */
function CTA() {
  return (
    <section className="py-24">
      <div className="max-w-4xl mx-auto px-4">
        <div className="rounded-2xl border border-zinc-800 bg-gradient-to-br from-violet-600/10 via-zinc-900 to-fuchsia-600/10 p-12 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to build your landing page?</h2>
          <p className="text-zinc-400 max-w-lg mx-auto mb-8">
            Stop spending days on landing pages. Describe what you need and ship in minutes.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-lg transition-colors"
          >
            Start Building Free
            <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="text-xs text-zinc-500 mt-4">No credit card required</p>
        </div>
      </div>
    </section>
  );
}

/* ───────── FOOTER ───────── */
function Footer() {
  return (
    <footer className="border-t border-zinc-800/50 py-8">
      <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-violet-400" />
          <span className="text-xs font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
            naguib
          </span>
        </div>
        <p className="text-xs text-zinc-500">&copy; 2026 Naguib. All rights reserved.</p>
      </div>
    </footer>
  );
}
