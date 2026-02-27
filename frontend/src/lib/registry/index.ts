import { type ComponentType } from "react";
import { type SectionType } from "@/lib/schemas/page-config";

export interface ComponentMetadata {
  type: SectionType;
  variant: string;
  description: string;
  tags: string[];
  supportedModes: readonly ("light" | "dark")[];
}

export interface RegistryEntry {
  component: ComponentType<{ content: Record<string, unknown>; mode: "light" | "dark" }>;
  metadata: ComponentMetadata;
}

const registry = new Map<string, RegistryEntry>();

function makeKey(type: string, variant: string): string {
  return `${type}:${variant}`;
}

export function registerComponent(entry: RegistryEntry): void {
  const key = makeKey(entry.metadata.type, entry.metadata.variant);
  registry.set(key, entry);
}

export function getComponent(type: string, variant: string): RegistryEntry | undefined {
  return registry.get(makeKey(type, variant));
}

export function getAllEntries(): RegistryEntry[] {
  return Array.from(registry.values());
}

export function getVariantsForType(type: string): RegistryEntry[] {
  return getAllEntries().filter((e) => e.metadata.type === type);
}

export function getRegistry(): Map<string, RegistryEntry> {
  return registry;
}
