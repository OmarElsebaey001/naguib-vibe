/**
 * Component extraction and import rewriting for export.
 *
 * Reads component source files, strips Naguib-internal imports
 * (registry, schema re-exports, metadata), and converts the type
 * import into a local interface declaration.
 */

import fs from "fs/promises";
import path from "path";

const SECTIONS_DIR = path.join(
  process.cwd(),
  "src/components/sections"
);

/** Map section type to subdirectory name (they match 1:1). */
function typeDir(type: string): string {
  return type; // e.g. "hero", "social-proof", "faq"
}

/**
 * Read a component source file and rewrite it for standalone export.
 *
 * Transformations:
 * 1. Remove `import { type XxxContent } from "./schema"` line
 * 2. Remove the `export const metadata = { ... };` block
 * 3. Remove `"use client";` (not needed in plain Vite React)
 * 4. Add the content type as a plain TS interface (inlined from schema)
 * 5. Make the component the default export
 */
export async function extractComponent(
  type: string,
  variant: string
): Promise<{ filename: string; source: string }> {
  const filePath = path.join(SECTIONS_DIR, typeDir(type), `${variant}.tsx`);
  let source = await fs.readFile(filePath, "utf-8");

  // 1. Extract type name from schema import, then remove the import
  const importMatch = source.match(
    /import\s*\{\s*type\s+(\w+)\s*\}\s*from\s*["']\.\/schema["'];?/
  );
  const contentTypeName = importMatch?.[1];

  source = source.replace(
    /import\s*\{[^}]*\}\s*from\s*["']\.\/schema["'];?\s*\n?/g,
    ""
  );

  // 2. Replace the content type reference with Record<string, any>
  if (contentTypeName) {
    source = source.replace(
      new RegExp(`:\\s*${contentTypeName}`, "g"),
      ": Record<string, any>"
    );
  }

  // 3. Remove metadata export block (handles multi-line)
  source = source.replace(
    /export\s+const\s+metadata\s*=\s*\{[\s\S]*?\};\s*\n?/,
    ""
  );

  // 4. Remove "use client" directive
  source = source.replace(/["']use client["'];?\s*\n?/, "");

  // 5. Change `export function` to `export default function`
  source = source.replace(
    /export\s+function\s+/,
    "export default function "
  );

  // 6. Clean up leading whitespace
  source = source.replace(/^\s*\n/, "");

  // Build filename: type--variant.tsx (e.g. hero--centered.tsx)
  const filename = `${type}--${variant}.tsx`;

  return { filename, source };
}

/**
 * Extract all components used in a page config.
 * Returns a map of filename → source code.
 */
export async function extractAllComponents(
  sections: Array<{ type: string; variant: string }>
): Promise<Map<string, string>> {
  // Deduplicate by type+variant
  const seen = new Set<string>();
  const unique: Array<{ type: string; variant: string }> = [];

  for (const s of sections) {
    const key = `${s.type}/${s.variant}`;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(s);
    }
  }

  const result = new Map<string, string>();

  for (const { type, variant } of unique) {
    const { filename, source } = await extractComponent(type, variant);
    result.set(filename, source);
  }

  return result;
}
