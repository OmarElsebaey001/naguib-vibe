"use client";

import { useState, useEffect } from "react";

const LOADING_MESSAGES = [
  "Picking the perfect layout...",
  "Choosing components...",
  "Writing your copy...",
  "Applying the theme...",
  "Almost there...",
  "Making it beautiful...",
  "Assembling your page...",
  "Fine-tuning the details...",
];

const SKELETON_SECTIONS = [
  { name: "header", delay: 0 },
  { name: "hero", delay: 200 },
  { name: "features", delay: 400 },
  { name: "testimonials", delay: 600 },
  { name: "cta", delay: 800 },
  { name: "footer", delay: 1000 },
] as const;

const shimmerClass =
  "bg-gradient-to-r from-zinc-200 via-zinc-100 to-zinc-200 bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite] rounded";

function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`${shimmerClass} ${className}`} />;
}

function HeaderSkeleton() {
  return (
    <div className="flex items-center justify-between px-6 py-4">
      <SkeletonBlock className="h-6 w-24" />
      <div className="flex items-center gap-4">
        <SkeletonBlock className="h-3 w-14" />
        <SkeletonBlock className="h-3 w-14" />
        <SkeletonBlock className="h-3 w-14" />
        <SkeletonBlock className="h-8 w-20 rounded-md" />
      </div>
    </div>
  );
}

function HeroSkeleton() {
  return (
    <div className="px-6 py-16">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center max-w-5xl mx-auto">
        <div className="space-y-4">
          <SkeletonBlock className="h-8 w-full" />
          <SkeletonBlock className="h-8 w-3/4" />
          <SkeletonBlock className="h-4 w-full mt-2" />
          <SkeletonBlock className="h-4 w-2/3" />
          <div className="flex gap-3 mt-4">
            <SkeletonBlock className="h-10 w-28 rounded-md" />
            <SkeletonBlock className="h-10 w-28 rounded-md" />
          </div>
        </div>
        <SkeletonBlock className="h-56 w-full rounded-lg" />
      </div>
    </div>
  );
}

function FeaturesSkeleton() {
  return (
    <div className="px-6 py-14">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col items-center mb-8">
          <SkeletonBlock className="h-6 w-48 mb-2" />
          <SkeletonBlock className="h-3 w-64" />
        </div>
        <div className="grid grid-cols-3 gap-6">
          {[0, 1, 2].map((i) => (
            <div key={i} className="space-y-3 p-4">
              <SkeletonBlock className="h-10 w-10 rounded-md" />
              <SkeletonBlock className="h-4 w-24" />
              <SkeletonBlock className="h-3 w-full" />
              <SkeletonBlock className="h-3 w-3/4" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TestimonialsSkeleton() {
  return (
    <div className="px-6 py-14">
      <div className="max-w-5xl mx-auto">
        <SkeletonBlock className="h-6 w-40 mx-auto mb-8" />
        <div className="grid grid-cols-3 gap-6">
          {[0, 1, 2].map((i) => (
            <div key={i} className="space-y-3 p-4">
              <SkeletonBlock className="h-16 w-full" />
              <div className="flex items-center gap-2 mt-2">
                <SkeletonBlock className="h-8 w-8 rounded-full" />
                <SkeletonBlock className="h-3 w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CtaSkeleton() {
  return (
    <div className="px-6 py-14">
      <div className="flex flex-col items-center max-w-2xl mx-auto">
        <SkeletonBlock className="h-7 w-64 mb-3" />
        <SkeletonBlock className="h-4 w-80 mb-5" />
        <SkeletonBlock className="h-10 w-32 rounded-md" />
      </div>
    </div>
  );
}

function FooterSkeleton() {
  return (
    <div className="px-6 py-10">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-4 gap-6 mb-6">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <SkeletonBlock className="h-3 w-16 mb-3" />
              <SkeletonBlock className="h-2.5 w-20" />
              <SkeletonBlock className="h-2.5 w-24" />
              <SkeletonBlock className="h-2.5 w-18" />
            </div>
          ))}
        </div>
        <SkeletonBlock className="h-px w-full mb-4" />
        <SkeletonBlock className="h-3 w-48 mx-auto" />
      </div>
    </div>
  );
}

const SECTION_COMPONENTS: Record<
  (typeof SKELETON_SECTIONS)[number]["name"],
  () => React.JSX.Element
> = {
  header: HeaderSkeleton,
  hero: HeroSkeleton,
  features: FeaturesSkeleton,
  testimonials: TestimonialsSkeleton,
  cta: CtaSkeleton,
  footer: FooterSkeleton,
};

export function GenerationSkeleton() {
  const [messageIndex, setMessageIndex] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFadeIn(false);
      setTimeout(() => {
        setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
        setFadeIn(true);
      }, 300);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-[60vh]">
      {/* CSS keyframes */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Playful text */}
      <div className="sticky top-0 z-10 flex justify-center pt-8 pb-4">
        <span
          className={`text-sm font-medium text-zinc-400 transition-all duration-300 ${
            fadeIn
              ? "opacity-100 translate-y-0"
              : "opacity-0 -translate-y-1"
          }`}
        >
          {LOADING_MESSAGES[messageIndex]}
        </span>
      </div>

      {/* Skeleton sections */}
      <div className="pb-8">
        {SKELETON_SECTIONS.map(({ name, delay }) => {
          const Component = SECTION_COMPONENTS[name];
          return (
            <div
              key={name}
              className="opacity-0"
              style={{
                animation: `fadeSlideIn 500ms ease-out ${delay}ms forwards`,
              }}
            >
              <Component />
            </div>
          );
        })}
      </div>
    </div>
  );
}
