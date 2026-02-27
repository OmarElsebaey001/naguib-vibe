import { getAllEntries } from "./index";
import { contentSchemaMap, type SectionType, ThemeSchema } from "@/lib/schemas/page-config";
import { themePresets } from "@/lib/theme/presets";

interface CatalogType {
  type: string;
  variants: {
    variant: string;
    description: string;
    tags: string[];
    supportedModes: readonly string[];
  }[];
  contentSchema: Record<string, unknown>;
}

interface Catalog {
  types: CatalogType[];
  themePresets: { name: string; description: string }[];
  themeSchema: Record<string, unknown>;
}

export function generateCatalog(): Catalog {
  const entries = getAllEntries();
  const typeMap = new Map<string, CatalogType>();

  for (const entry of entries) {
    const { type, variant, description, tags, supportedModes } = entry.metadata;
    if (!typeMap.has(type)) {
      typeMap.set(type, {
        type,
        variants: [],
        contentSchema: describeSchema(type as SectionType),
      });
    }
    typeMap.get(type)!.variants.push({ variant, description, tags, supportedModes });
  }

  return {
    types: Array.from(typeMap.values()),
    themePresets: Object.entries(themePresets).map(([name, preset]) => ({
      name,
      description: preset.description,
    })),
    themeSchema: describeThemeSchema(),
  };
}

function describeSchema(type: SectionType): Record<string, unknown> {
  const schema = contentSchemaMap[type];
  if (!schema) return {};
  // Simple description of the schema shape for the AI
  try {
    // Use Zod's built-in JSON schema if available, otherwise describe fields
    if ("shape" in schema && typeof schema.shape === "object") {
      const shape = schema.shape as Record<string, { _def?: { typeName?: string } }>;
      const fields: Record<string, string> = {};
      for (const [key, value] of Object.entries(shape)) {
        fields[key] = value?._def?.typeName ?? "unknown";
      }
      return fields;
    }
  } catch {
    // fallback
  }
  return {};
}

function describeThemeSchema(): Record<string, unknown> {
  if ("shape" in ThemeSchema && typeof ThemeSchema.shape === "object") {
    const shape = ThemeSchema.shape as Record<string, unknown>;
    return Object.fromEntries(Object.keys(shape).map((k) => [k, "string (HSL value or font name)"]));
  }
  return {};
}
