# Naguib — User Stories (V1)

> Every user-facing capability supported in V1, organized by journey phase.
> Each story follows the format: **As a [user], I want to [action], so that [outcome].**
> Stories are tagged with the plan(s) that implement them.

---

## 1. Onboarding & Authentication

| # | Story | Plan |
|---|---|---|
| 1.1 | As a visitor, I want to see a landing page explaining what Naguib does, so that I understand the product before signing up. | 07 |
| 1.2 | As a visitor, I want to register with a username and password, so that I can create an account. | 06 |
| 1.3 | As a visitor, I want to log in with my credentials, so that I can access my projects. | 06 |
| 1.4 | As a logged-in user, I want to be automatically redirected to my dashboard, so that I skip the landing page. | 06, 07 |
| 1.5 | As a user with an expired session, I want to be redirected to the login page, so that I can re-authenticate. | 06 |
| 1.6 | As a logged-in user, I want to log out, so that I can secure my account. | 06 |

---

## 2. Dashboard & Project Management

| # | Story | Plan |
|---|---|---|
| 2.1 | As a user, I want to see a dashboard listing all my projects, so that I can manage them in one place. | 06 |
| 2.2 | As a user, I want to create a new project from the dashboard, so that I can start building a new landing page. | 06 |
| 2.3 | As a user, I want to see each project's name, thumbnail, and last modified date, so that I can identify them at a glance. | 06 |
| 2.4 | As a user, I want to click on a project card to open it in the console, so that I can continue editing. | 06 |
| 2.5 | As a user, I want to delete a project (with confirmation), so that I can remove projects I no longer need. | 06 |
| 2.6 | As a user, I want my projects to be private, so that other users cannot see or access them. | 06 |

---

## 3. Page Generation (First Prompt)

| # | Story | Plan |
|---|---|---|
| 3.1 | As a user, I want to describe my landing page in natural language (e.g., "Build me a landing page for my AI writing tool"), so that the AI assembles a complete page for me. | 03, 04 |
| 3.2 | As a user, I want the AI to ask 1–2 clarifying questions before generating (target audience, key features, tone), so that the result matches my intent. | 03 |
| 3.3 | As a user, I want to see a fully assembled, responsive landing page appear in the preview within seconds, so that I have a working starting point immediately. | 03, 04 |
| 3.4 | As a user, I want the AI to generate realistic, relevant content for my business (not lorem ipsum), so that the page feels ready to use. | 03 |
| 3.5 | As a user, I want the AI to pick an appropriate theme (colors, fonts, radius) that matches my described product, so that the page looks professional without manual tweaking. | 03 |
| 3.6 | As a user, I want the AI to assign light/dark modes to sections to create visual rhythm, so that the page has good visual flow out of the box. | 03 |
| 3.7 | As a user, I want the AI to confirm before replacing my entire page (if I already have one), so that I don't accidentally lose work. | 03, 04 |

---

## 4. Chat-Based Editing

### 4a. Section Operations

| # | Story | Plan |
|---|---|---|
| 4a.1 | As a user, I want to ask the AI to add a section (e.g., "Add a pricing section"), so that I can expand my page. | 03, 04 |
| 4a.2 | As a user, I want to ask the AI to remove a section (e.g., "Remove the FAQ"), so that I can simplify my page. | 03, 04 |
| 4a.3 | As a user, I want to ask the AI to reorder sections (e.g., "Move pricing above the FAQ"), so that the page flow matches my preference. | 03, 04 |
| 4a.4 | As a user, I want to ask the AI to swap a section's variant (e.g., "Try a centered hero instead"), so that I can explore different layouts without losing content. | 03, 04 |
| 4a.5 | As a user, I want to ask the AI to change a section's mode (e.g., "Make the features section dark"), so that I can control the visual rhythm. | 03, 04 |

### 4b. Content Editing

| # | Story | Plan |
|---|---|---|
| 4b.1 | As a user, I want to ask the AI to change specific text (e.g., "Change the headline to 'Ship faster with AI'"), so that I can refine the copy. | 03, 04 |
| 4b.2 | As a user, I want to ask the AI to rewrite an entire section's content (e.g., "Rewrite the features for a healthcare audience"), so that I can repurpose the page for a different market. | 03, 04 |
| 4b.3 | As a user, I want to ask the AI to update CTA labels and links, so that buttons point to the right destinations. | 03, 04 |
| 4b.4 | As a user, I want to ask the AI to update pricing plan details (names, prices, features), so that my pricing section reflects my actual offering. | 03, 04 |
| 4b.5 | As a user, I want to ask the AI to add or edit FAQ items, so that the FAQ answers my customers' real questions. | 03, 04 |
| 4b.6 | As a user, I want to ask the AI to update testimonials/social proof, so that I can showcase my actual customers. | 03, 04 |
| 4b.7 | As a user, I want to ask the AI to change navigation links and footer links, so that the header and footer reflect my site's structure. | 03, 04 |

### 4c. Theme Editing via Chat

| # | Story | Plan |
|---|---|---|
| 4c.1 | As a user, I want to ask the AI to change the color scheme (e.g., "Use warmer colors"), so that the theme matches my brand. | 03, 04 |
| 4c.2 | As a user, I want to ask the AI to apply a theme preset (e.g., "Make it more corporate"), so that I can quickly shift the visual tone. | 03, 04 |
| 4c.3 | As a user, I want to ask the AI to change fonts (e.g., "Use a more modern font"), so that the typography fits my brand. | 03, 04 |

### 4d. Informational Queries

| # | Story | Plan |
|---|---|---|
| 4d.1 | As a user, I want to ask the AI what sections I currently have, so that I can understand the page structure. | 03, 04 |
| 4d.2 | As a user, I want to ask the AI what variants are available for a type (e.g., "What hero layouts do you have?"), so that I can make informed choices. | 03, 04 |
| 4d.3 | As a user, I want to ask the AI what theme presets are available, so that I can explore options. | 03, 04 |

---

## 5. Chat Experience

| # | Story | Plan |
|---|---|---|
| 5.1 | As a user, I want to see the AI's response stream in real-time (word by word), so that I know it's working and don't stare at a blank screen. | 03, 04 |
| 5.2 | As a user, I want to see activity indicators while the AI is working (e.g., "Selecting components...", "Applying changes..."), so that I understand what's happening behind the scenes. | 03, 04 |
| 5.3 | As a user, I want the AI to respond conversationally AND apply changes (not just silently change the page), so that I understand what was done. | 03, 04 |
| 5.4 | As a user, I want my conversation history to persist when I leave and return to a project, so that I can continue where I left off. | 04, 06 |
| 5.5 | As a user, I want to see a clear error message if the AI fails (e.g., invalid config, network error), so that I know something went wrong and can retry. | 03, 04 |
| 5.6 | As a user, I want a retry option if the AI connection drops, so that I can recover without losing my page or chat history. | 04 |
| 5.7 | As a user, I want to submit messages by pressing Enter (and use Shift+Enter for newlines), so that chatting feels natural. | 04 |
| 5.8 | As a user, I want the chat to auto-scroll to the latest message, so that I always see the newest response. | 04 |

---

## 6. Live Preview

| # | Story | Plan |
|---|---|---|
| 6.1 | As a user, I want to see a live preview of my page that updates within 1 second of any change, so that I get instant visual feedback. | 04 |
| 6.2 | As a user, I want to toggle the preview between Desktop (1280px), Tablet (768px), and Mobile (375px) viewports, so that I can verify responsiveness. | 04 |
| 6.3 | As a user, I want to scroll through the full page in the preview, so that I can see all sections. | 04 |
| 6.4 | As a user, I want the preview to render actual components (not mockups), so that what I see is what I get. | 01, 04 |
| 6.5 | As a user, I want zoom/fit-to-width controls on the preview, so that I can see the page at a comfortable size. | 04 |

---

## 7. Section Panel (Direct Manipulation)

| # | Story | Plan |
|---|---|---|
| 7.1 | As a user, I want to see a list of all current sections (type, variant, mode), so that I can understand the page structure at a glance. | 04 |
| 7.2 | As a user, I want to drag-and-drop sections to reorder them, so that I can rearrange the page without typing. | 04 |
| 7.3 | As a user, I want to toggle a section's mode (light/dark) with a click, so that I can quickly adjust visual rhythm. | 04 |
| 7.4 | As a user, I want to swap a section's variant via a dropdown (with descriptions), so that I can try different layouts. | 04 |
| 7.5 | As a user, I want to delete a section from the section panel, so that I can remove it without typing. | 04 |
| 7.6 | As a user, I want an "Add section" button that opens a categorized section picker, so that I can browse and add sections visually. | 04 |
| 7.7 | As a user, I want the section picker to show descriptions and thumbnails for each variant, so that I can make informed choices. | 04 |

---

## 8. Theme Controls (Direct Manipulation)

| # | Story | Plan |
|---|---|---|
| 8.1 | As a user, I want to pick a theme preset from a grid of preset cards (with preview swatches), so that I can quickly set a visual direction. | 04 |
| 8.2 | As a user, I want to adjust the primary color via a color picker, so that I can match my brand color. | 04 |
| 8.3 | As a user, I want to adjust the secondary color, background, and foreground colors individually, so that I have fine-grained control. | 04 |
| 8.4 | As a user, I want to choose heading and body fonts from a curated dropdown, so that I can set typography without guessing. | 04 |
| 8.5 | As a user, I want to pick a border radius preset (none / small / medium / large / pill), so that I can control the roundness of elements. | 04 |
| 8.6 | As a user, I want theme changes to apply instantly to the live preview, so that I get immediate visual feedback. | 04 |

---

## 9. Undo / Redo

| # | Story | Plan |
|---|---|---|
| 9.1 | As a user, I want to undo my last change (Ctrl+Z / Cmd+Z), so that I can recover from mistakes. | 04 |
| 9.2 | As a user, I want to redo an undone change (Ctrl+Shift+Z / Cmd+Shift+Z), so that I can re-apply something I accidentally undid. | 04 |
| 9.3 | As a user, I want undo to work for both AI changes and my direct manipulation changes, so that the history is unified. | 04 |
| 9.4 | As a user, I want an undo button in the UI (not just keyboard shortcuts), so that I can undo without memorizing hotkeys. | 04 |
| 9.5 | As a user, I want the undo stack to hold at least 50 states, so that I can go back far enough to recover. | 04 |

---

## 10. Tool Interactions (AI ↔ Frontend)

| # | Story | Plan |
|---|---|---|
| 10.1 | As a user, I want to see a confirmation dialog when the AI is about to replace my entire page, so that I can prevent accidental data loss. | 03, 04 |
| 10.2 | As a user, I want the AI to open a section picker for me to choose from when adding a section, so that I have control over what gets added. | 03, 04 |
| 10.3 | As a user, I want the AI to validate the page config before applying it, so that broken states never reach my preview. | 03, 04 |

---

## 11. Persistence & Auto-Save

| # | Story | Plan |
|---|---|---|
| 11.1 | As a user, I want my project to auto-save as I work (debounced, every 2 seconds of inactivity), so that I never lose progress. | 04, 06 |
| 11.2 | As a user, I want my page config and conversation history to be saved together, so that when I return, both are intact. | 06 |
| 11.3 | As a user, I want to rename my project, so that I can identify it later. | 04, 06 |

---

## 12. Image Uploads

| # | Story | Plan |
|---|---|---|
| 12.1 | As a user, I want to upload images (JPG, PNG, WebP, SVG, up to 5MB) for use in my landing page, so that I can include my own visuals. | 06 |
| 12.2 | As a user, I want uploaded images to persist across sessions, so that they don't disappear when I return. | 06 |
| 12.3 | As a user, I want uploaded images to render correctly in both the preview and the exported project, so that my visuals carry through. | 05, 06 |

---

## 13. Export

| # | Story | Plan |
|---|---|---|
| 13.1 | As a user, I want to download my landing page as a standalone Vite + React + Tailwind project, so that I can run it independently. | 05 |
| 13.2 | As a user, I want to run `npm install && npm run dev` on the exported project and see my page, so that the export works out of the box. | 05 |
| 13.3 | As a user, I want to run `npm run build` to get static HTML I can deploy anywhere, so that I'm not locked into any platform. | 05 |
| 13.4 | As a user, I want the exported page to look identical to the console preview, so that there are no visual surprises. | 05 |
| 13.5 | As a user, I want the export to include only the components I used (not the entire library), so that the project is lean. | 05 |
| 13.6 | As a user, I want each exported component to be self-contained (~50–150 lines), so that I (or an LLM) can easily modify it later. | 05 |
| 13.7 | As a user, I want the theme to be in a `globals.css` file as CSS variables, so that I can tweak colors and fonts by editing one file. | 05 |
| 13.8 | As a user, I want a README in the export explaining the project structure, how to run/build/deploy, and how to edit content, so that I'm not lost. | 05 |
| 13.9 | As a user, I want zero references to Naguib in my exported project, so that it's fully mine. | 05 |

---

## 14. Responsive Console

| # | Story | Plan |
|---|---|---|
| 14.1 | As a user on desktop, I want to see a two-panel layout (chat left ~35%, preview right ~65%), so that I can chat and see results side by side. | 04 |
| 14.2 | As a user on mobile, I want chat and preview to be separate tabs, so that the interface is usable on small screens. | 04 |
| 14.3 | As a user, I want a top bar showing the logo, project name, theme button, and export button, so that key actions are always accessible. | 04 |

---

## 15. Billing & Usage Limits

| # | Story | Plan |
|---|---|---|
| 15.1 | As a free user, I want to create 1 project and send a limited number of AI messages per day, so that I can try the product. | 07 |
| 15.2 | As a free user, I want to see a clear message when I hit a limit (project count or daily messages), so that I understand why I'm blocked. | 07 |
| 15.3 | As a user, I want to upgrade to Pro for unlimited projects, more messages, and export capability, so that I can use the full product. | 07 |
| 15.4 | As a Pro user, I want to manage my subscription (upgrade, cancel), so that I control my billing. | 07 |
| 15.5 | As a user, I want rate limiting to be per-account (not just IP), so that limits are fair and consistent. | 07 |

---

## 16. Error Recovery & Edge Cases

| # | Story | Plan |
|---|---|---|
| 16.1 | As a user, I want the AI to retry automatically (up to 2 times) if it generates an invalid config, so that transient failures are invisible to me. | 03 |
| 16.2 | As a user, I want to see a helpful error in the chat if the AI ultimately fails after retries, so that I can try rephrasing. | 03, 04 |
| 16.3 | As a user, I want the preview to never show a broken page (even if the AI sends bad data), so that my experience isn't disrupted. | 04 |
| 16.4 | As a user with an empty project (no sections yet), I want to see a helpful empty state with suggestions, so that I know what to do. | 04 |
| 16.5 | As a user, I want SSE connection drops to show a retry option (not lose my work), so that I can recover gracefully. | 04 |
| 16.6 | As a user, I want the page config to be validated on both backend (Pydantic) and frontend (Zod), so that invalid states are caught at every layer. | 03, 04 |

---

## Summary

| Category | Stories |
|---|---|
| Onboarding & Auth | 6 |
| Dashboard & Projects | 6 |
| Page Generation | 7 |
| Chat-Based Editing | 17 |
| Chat Experience | 8 |
| Live Preview | 5 |
| Section Panel | 7 |
| Theme Controls | 6 |
| Undo / Redo | 5 |
| Tool Interactions | 3 |
| Persistence & Auto-Save | 3 |
| Image Uploads | 3 |
| Export | 9 |
| Responsive Console | 3 |
| Billing & Usage | 5 |
| Error Recovery | 6 |
| **Total** | **99** |

---

## Out of Scope for V1

These are explicitly NOT supported. Documented here to prevent scope creep.

- Eject & LLM customization of individual components (Phase 2)
- Multi-page sites
- Visual drag-drop editing in the preview (click-to-select is a nice-to-have, not a story)
- Custom component uploads
- Collaboration / multi-user projects
- Version control / branching (only simple undo stack)
- Animations or interactions in sections
- CMS integration
- A/B testing
- Analytics
- OAuth social login (Google, GitHub) — only username/password in V1
- Custom domain deployment
- Backend / API / database generation

---

*This document is the definitive list of what a V1 user can do. If it's not here, it's not in V1.*
