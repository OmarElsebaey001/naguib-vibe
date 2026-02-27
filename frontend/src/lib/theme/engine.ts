import { type Theme, DarkThemeOverrides } from "@/lib/schemas/page-config";

const COLOR_TOKENS: (keyof Theme)[] = [
  "primary",
  "primaryForeground",
  "secondary",
  "secondaryForeground",
  "background",
  "foreground",
  "muted",
  "mutedForeground",
  "accent",
  "accentForeground",
  "border",
  "ring",
  "destructive",
  "destructiveForeground",
];

const TOKEN_MAP: Record<keyof Theme, string> = {
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

function isColorToken(key: keyof Theme): boolean {
  return COLOR_TOKENS.includes(key);
}

function formatValue(key: keyof Theme, value: string): string {
  if (key === "fontHeading" || key === "fontBody") {
    return `"${value}", sans-serif`;
  }
  if (key === "radius") {
    return value;
  }
  // Color tokens: wrap HSL values in hsl()
  if (isColorToken(key)) {
    return `hsl(${value})`;
  }
  return value;
}

export function themeToCSS(theme: Theme): string {
  const lines: string[] = [];

  for (const [key, cssVar] of Object.entries(TOKEN_MAP)) {
    const value = theme[key as keyof Theme];
    if (value !== undefined) {
      lines.push(`  ${cssVar}: ${formatValue(key as keyof Theme, value)};`);
    }
  }

  return `:root {\n${lines.join("\n")}\n}`;
}

export function darkThemeToCSS(): string {
  const lines: string[] = [];

  for (const [key, cssVar] of Object.entries(TOKEN_MAP)) {
    const value = DarkThemeOverrides[key as keyof Theme];
    if (value !== undefined) {
      lines.push(`  ${cssVar}: ${formatValue(key as keyof Theme, value)};`);
    }
  }

  return `.dark {\n${lines.join("\n")}\n}`;
}

export function themeToStyleObject(theme: Theme): Record<string, string> {
  const styles: Record<string, string> = {};

  for (const [key, cssVar] of Object.entries(TOKEN_MAP)) {
    const value = theme[key as keyof Theme];
    if (value !== undefined) {
      styles[cssVar] = formatValue(key as keyof Theme, value);
    }
  }

  return styles;
}
