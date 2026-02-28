/**
 * Static template files for the exported Vite + React project.
 */

export function getPackageJson(projectName: string): string {
  const slug = projectName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    || "landing-page";

  return JSON.stringify(
    {
      name: slug,
      private: true,
      version: "1.0.0",
      type: "module",
      scripts: {
        dev: "vite",
        build: "vite build",
        preview: "vite preview",
      },
      dependencies: {
        react: "^19.0.0",
        "react-dom": "^19.0.0",
      },
      devDependencies: {
        "@types/react": "^19",
        "@types/react-dom": "^19",
        "@vitejs/plugin-react": "^4.3.0",
        tailwindcss: "^4",
        "@tailwindcss/vite": "^4",
        typescript: "^5",
        vite: "^6",
      },
    },
    null,
    2
  );
}

export const VITE_CONFIG = `import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
`;

export const TSCONFIG = JSON.stringify(
  {
    compilerOptions: {
      target: "ES2020",
      useDefineForClassFields: true,
      lib: ["ES2020", "DOM", "DOM.Iterable"],
      module: "ESNext",
      skipLibCheck: true,
      moduleResolution: "bundler",
      allowImportingTsExtensions: true,
      isolatedModules: true,
      moduleDetection: "force",
      noEmit: true,
      jsx: "react-jsx",
      strict: true,
      noUnusedLocals: false,
      noUnusedParameters: false,
      noFallthroughCasesInSwitch: true,
      forceConsistentCasingInFileNames: true,
    },
    include: ["src"],
  },
  null,
  2
);

export const VITE_ENV_DTS = `/// <reference types="vite/client" />
`;

export const INDEX_HTML = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>__TITLE__</title>
    <meta name="description" content="__DESCRIPTION__" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`;

export const MAIN_TSX = `import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import "./globals.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`;

export const GITIGNORE = `node_modules
dist
.vite
*.local
`;

export function getReadme(projectName: string): string {
  return `# ${projectName}

A landing page built with [Naguib](https://naguib.dev).

## Getting Started

\`\`\`bash
npm install
npm run dev
\`\`\`

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Build for Production

\`\`\`bash
npm run build
\`\`\`

The static files are output to \`dist/\`. Deploy them to any static hosting provider.

## Deploy

**Vercel:**
\`\`\`bash
npx vercel
\`\`\`

**Netlify:**
\`\`\`bash
npx netlify deploy --prod --dir=dist
\`\`\`

## Project Structure

\`\`\`
src/
├── components/     # Landing page section components
├── App.tsx         # Main page (edit sections here)
├── globals.css     # Theme variables (edit colors/fonts here)
├── main.tsx        # React entry point
└── vite-env.d.ts   # Vite types
\`\`\`

## Customization

- **Content**: Edit the data objects in \`src/App.tsx\`
- **Theme**: Edit CSS variables in \`src/globals.css\` (colors are HSL values)
- **Components**: Each file in \`src/components/\` is self-contained and editable
`;
}
