"use client";

import React from "react";
import { type PageConfig, type Section } from "@/lib/schemas/page-config";
import { getComponent } from "@/lib/registry";
import { themeToStyleObject } from "@/lib/theme/engine";

interface PageRendererProps {
  config: PageConfig;
}

function SectionErrorFallback({ section }: { section: Section }) {
  return (
    <div className="bg-destructive/10 border border-destructive/20 p-8 text-center">
      <p className="text-destructive font-medium">
        Failed to render section: {section.type}/{section.variant}
      </p>
      <p className="text-muted-foreground text-sm mt-2">
        This component may not be registered or has an error.
      </p>
    </div>
  );
}

function SectionWrapper({
  section,
}: {
  section: Section;
}) {
  const entry = getComponent(section.type, section.variant);

  if (!entry) {
    return <SectionErrorFallback section={section} />;
  }

  const Component = entry.component;

  return (
    <ErrorBoundary fallback={<SectionErrorFallback section={section} />}>
      <div className={section.mode === "dark" ? "dark" : ""}>
        <Component
          content={section.content as Record<string, unknown>}
          mode={section.mode as "light" | "dark"}
        />
      </div>
    </ErrorBoundary>
  );
}

export function PageRenderer({ config }: PageRendererProps) {
  const themeStyles = themeToStyleObject(config.theme);

  return (
    <div style={themeStyles}>
      {config.sections.map((section) => (
        <SectionWrapper key={section.id} section={section} />
      ))}
      {config.sections.length === 0 && (
        <div className="flex items-center justify-center min-h-[50vh] text-muted-foreground">
          <div className="text-center">
            <p className="text-lg font-medium">No sections yet</p>
            <p className="text-sm mt-1">Describe your landing page to get started</p>
          </div>
        </div>
      )}
    </div>
  );
}

// Simple error boundary for per-section isolation
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}
