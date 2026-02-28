/**
 * Orchestrates the full export: template + components + theme + page assembly.
 * Returns a flat map of filepath → content (ready for zip packaging).
 */

import { type PageConfig } from "@/lib/schemas/page-config";
import { extractAllComponents } from "./extract";
import {
  getPackageJson,
  VITE_CONFIG,
  TSCONFIG,
  VITE_ENV_DTS,
  INDEX_HTML,
  MAIN_TSX,
  GITIGNORE,
  getReadme,
} from "./template";

// ─── Theme CSS Generation ─────────────────────────────────────────────

interface ThemeTokens {
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  background: string;
  foreground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  border: string;
  ring: string;
  destructive: string;
  destructiveForeground: string;
  radius: string;
  fontHeading: string;
  fontBody: string;
}

const TOKEN_CSS_MAP: Record<keyof ThemeTokens, string> = {
  primary: "--primary",
  primaryForeground: "--primary-foreground",
  secondary: "--secondary",
  secondaryForeground: "--secondary-foreground",
  background: "--background",
  foreground: "--foreground",
  muted: "--muted",
  mutedForeground: "--muted-foreground",
  accent: "--accent",
  accentForeground: "--accent-foreground",
  border: "--border",
  ring: "--ring",
  destructive: "--destructive",
  destructiveForeground: "--destructive-foreground",
  radius: "--radius",
  fontHeading: "--font-heading",
  fontBody: "--font-body",
};

const COLOR_KEYS = new Set<string>([
  "primary", "primaryForeground", "secondary", "secondaryForeground",
  "background", "foreground", "muted", "mutedForeground",
  "accent", "accentForeground", "border", "ring",
  "destructive", "destructiveForeground",
]);

// Dark theme overrides (matching DarkThemeOverrides from page-config.ts)
const DARK_OVERRIDES: Partial<ThemeTokens> = {
  background: "222.2 84% 4.9%",
  foreground: "210 40% 98%",
  secondary: "217.2 32.6% 17.5%",
  secondaryForeground: "210 40% 98%",
  muted: "217.2 32.6% 17.5%",
  mutedForeground: "215 20.2% 65.1%",
  accent: "217.2 32.6% 17.5%",
  accentForeground: "210 40% 98%",
  border: "217.2 32.6% 17.5%",
};

function formatCSSValue(key: string, value: string): string {
  if (key === "fontHeading" || key === "fontBody") {
    return `"${value}", sans-serif`;
  }
  if (COLOR_KEYS.has(key)) {
    return `hsl(${value})`;
  }
  return value;
}

function buildGlobalsCSS(theme: ThemeTokens): string {
  // Build :root block
  const rootLines: string[] = [];
  for (const [key, cssVar] of Object.entries(TOKEN_CSS_MAP)) {
    const value = theme[key as keyof ThemeTokens];
    if (value !== undefined) {
      rootLines.push(`  ${cssVar}: ${formatCSSValue(key, value)};`);
    }
  }

  // Build .dark block
  const darkLines: string[] = [];
  for (const [key, cssVar] of Object.entries(TOKEN_CSS_MAP)) {
    const value = DARK_OVERRIDES[key as keyof ThemeTokens];
    if (value !== undefined) {
      darkLines.push(`  ${cssVar}: ${formatCSSValue(key, value)};`);
    }
  }

  return `@import "tailwindcss";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-border: var(--border);
  --color-ring: var(--ring);
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
}

:root {
${rootLines.join("\n")}
}

.dark {
${darkLines.join("\n")}
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
`;
}

// ─── Page Assembly ────────────────────────────────────────────────────

interface SectionInfo {
  id: string;
  type: string;
  variant: string;
  mode: string;
  content: Record<string, unknown>;
}

function componentImportName(type: string, variant: string): string {
  // hero/centered → HeroCentered
  const parts = [type, ...variant.split("-")];
  return parts
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join("");
}

function buildAppTsx(sections: SectionInfo[]): string {
  // Determine unique components to import
  const seen = new Set<string>();
  const imports: string[] = [];
  const componentNames: Map<string, string> = new Map();

  for (const s of sections) {
    const key = `${s.type}/${s.variant}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const name = componentImportName(s.type, s.variant);
    const filename = `${s.type}--${s.variant}`;
    componentNames.set(key, name);
    imports.push(`import ${name} from "./components/${filename}";`);
  }

  // Build section data as inline constants
  const sectionBlocks: string[] = [];
  for (let i = 0; i < sections.length; i++) {
    const s = sections[i];
    sectionBlocks.push(
      `const section${i}Content = ${JSON.stringify(s.content, null, 2)} as const;`
    );
  }

  // Build JSX
  const jsxParts: string[] = [];
  for (let i = 0; i < sections.length; i++) {
    const s = sections[i];
    const key = `${s.type}/${s.variant}`;
    const name = componentNames.get(key)!;
    const wrapperClass = s.mode === "dark" ? ' className="dark"' : "";

    if (wrapperClass) {
      jsxParts.push(
        `        <div${wrapperClass}>
          <${name} content={section${i}Content} mode="${s.mode}" />
        </div>`
      );
    } else {
      jsxParts.push(
        `        <${name} content={section${i}Content} mode="${s.mode}" />`
      );
    }
  }

  return `${imports.join("\n")}

// ─── Section Content ────────────────────────────────────────────────

${sectionBlocks.join("\n\n")}

// ─── App ────────────────────────────────────────────────────────────

export function App() {
  return (
    <div>
${jsxParts.join("\n")}
    </div>
  );
}
`;
}

// ─── Main Export ──────────────────────────────────────────────────────

export async function buildExportProject(
  config: PageConfig
): Promise<Map<string, string>> {
  const files = new Map<string, string>();

  const projectName = config.name || "Landing Page";
  const title = config.metadata?.title || projectName;
  const description = config.metadata?.description || "";

  // 1. Template files
  files.set("package.json", getPackageJson(projectName));
  files.set("vite.config.ts", VITE_CONFIG);
  files.set("tsconfig.json", TSCONFIG);
  files.set(".gitignore", GITIGNORE);
  files.set("README.md", getReadme(projectName));
  files.set(
    "index.html",
    INDEX_HTML.replace("__TITLE__", title).replace("__DESCRIPTION__", description)
  );
  files.set("src/main.tsx", MAIN_TSX);
  files.set("src/vite-env.d.ts", VITE_ENV_DTS);

  // 2. Theme → globals.css
  files.set("src/globals.css", buildGlobalsCSS(config.theme as ThemeTokens));

  // 3. Extract components
  const components = await extractAllComponents(
    config.sections.map((s) => ({ type: s.type, variant: s.variant }))
  );
  for (const [filename, source] of components) {
    files.set(`src/components/${filename}`, source);
  }

  // 4. Page assembly → App.tsx
  const sectionInfos: SectionInfo[] = config.sections.map((s) => ({
    id: s.id,
    type: s.type,
    variant: s.variant,
    mode: s.mode || "light",
    content: s.content as Record<string, unknown>,
  }));
  files.set("src/App.tsx", buildAppTsx(sectionInfos));

  return files;
}
