# Vibe Builders

A how-to guide for non-developers to build AI agents using Claude Code.

## Project overview

- **What**: A multi-page website teaching complete beginners how to build AI agents
- **Audience**: Curious non-technical people (Mac users only)
- **Stack taught**: Claude Code → Terminal → GitHub → Cloudflare Pages
- **Hosting**: Cloudflare Pages with Pages Functions for API routes
- **Format**: Self-contained HTML/CSS/JS files — no build step, no framework

## Site structure

- `index.html` — Workshop 1: Build your first agent locally
- `workshop-2.html` — Workshop 2: Deploy to the internet
- `showcase.html` — Gallery of all 6 demo agents
- `advisor/index.html` — Live Advisor demo
- `archivist/index.html` — Live Archivist demo
- `interviewer/index.html` — Live Interviewer demo
- `explainer/index.html` — Live Explainer demo
- `curator/index.html` — Live Curator demo
- `character/index.html` — Live Character demo
- `functions/api/{name}/chat.js` — Cloudflare Pages Functions (API routes)

## Design system

- **Typography**: Geist (CDN via jsdelivr), Inter (Google Fonts fallback), JetBrains Mono for code
- **Main pages** (index, workshop-2, showcase): Light theme — `--bg: #f6f5f2`, `--fg: #2a2a2a`
- **Demo pages**: Dark theme — `--bg: #0a0a0a`, `--fg: #fafafa`
- **Accent color**: `--red: #c4651a` (used across all pages)
- **Style**: Clean, functional, grid-based — no decoration
- **Tone**: Direct, practical, zero jargon. Written for people who've never used a terminal.
- **Mac only**: All instructions assume macOS

## Key conventions

- No build step, no framework, no bundler — each page is self-contained
- CSS variables defined in `:root` on every page — use variables, not hardcoded colors
- Terminal examples use `.terminal` class with `code` blocks, comments use `.c` class
- Warning boxes use `.warning` class
- All instructions should be step-by-step, assuming zero prior knowledge
- Purely practical — no marketing, no personal narrative, no promotional language
- Demo pages have a 6-message limit per session, with countdown hint at 3 remaining
- Analytics via Cabin (cookieless) — custom events for key interactions
- Forms via Formspree
